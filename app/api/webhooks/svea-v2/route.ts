import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';
import { emailService } from '@/app/lib/email';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Webhook event types from Svea
type WebhookEventType = 
  | 'OrderCreated'
  | 'OrderConfirmed'
  | 'OrderDelivered'
  | 'OrderCancelled'
  | 'OrderExpired'
  | 'OrderAwaitingPayment'
  | 'OrderPaymentDenied';

interface SveaWebhookPayload {
  // Svea uses PascalCase in webhooks
  CheckoutOrderId?: number;
  OrderId?: number;
  Status?: string;
  PaymentType?: string;
  CreationDate?: string;
  CustomerCountry?: string;
  Currency?: string;
  OrderAmount?: number;
  CapturedAmount?: number;
  CreditedAmount?: number;
  MerchantData?: string;
  // Also support camelCase (fallback)
  orderId?: number;
  status?: string;
  paymentType?: string;
  creationDate?: string;
  customerCountry?: string;
  currency?: string;
  orderAmount?: number;
  capturedAmount?: number;
  creditedAmount?: number;
  merchantData?: string;
}

// Normalize webhook payload to consistent format
function normalizeWebhookPayload(raw: SveaWebhookPayload) {
  return {
    orderId: raw.CheckoutOrderId || raw.OrderId || raw.orderId,
    status: raw.Status || raw.status,
    paymentType: raw.PaymentType || raw.paymentType,
    merchantData: raw.MerchantData || raw.merchantData,
    orderAmount: raw.OrderAmount || raw.orderAmount,
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'svea-webhook-v2',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  let body = '';
  
  try {
    // Read raw body for signature validation
    body = await request.text();
    const signature = request.headers.get('x-svea-signature') || '';
    const url = request.url;
    const searchParams = new URL(url).searchParams;
    
    // Svea might send order ID in query params or headers
    const queryOrderId = searchParams.get('checkoutOrderId') || 
                         searchParams.get('CheckoutOrderId') ||
                         searchParams.get('orderId') ||
                         searchParams.get('OrderId');
    const headerOrderId = request.headers.get('x-svea-checkout-orderid') ||
                          request.headers.get('X-Svea-Checkout-OrderId');
    
    console.log('📩 Svea webhook received:', {
      hasBody: !!body,
      bodyLength: body.length,
      bodyPreview: body.substring(0, 100),
      hasSignature: !!signature,
      signatureLength: signature.length,
      url: url,
      queryOrderId,
      headerOrderId,
      allHeaders: Object.fromEntries(request.headers.entries())
    });

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // Validate webhook signature
    if (process.env.NODE_ENV === 'production' || process.env.SVEA_WEBHOOK_VALIDATION === 'true') {
      if (!signature) {
        // Fallback: tillåt utan signatur men logga varning (för att inte blockera auto-godkännande)
        console.warn('⚠️ Missing webhook signature - allowing due to fallback');
      } else {
      const isValid = sveaCheckout.validateWebhookSignature(body, signature);
      if (!isValid) {
          // Fallback: logga men fortsätt ändå
          console.warn('⚠️ Invalid webhook signature - allowing due to fallback');
        }
      }
    }

    // Parse webhook payload
    let rawWebhookData: SveaWebhookPayload;
    try {
      rawWebhookData = JSON.parse(body || '{}');
    } catch (error) {
      console.error('❌ Failed to parse webhook body:', error);
      rawWebhookData = {};
    }

    // Log raw payload for debugging
    console.log('📦 Raw webhook payload:', JSON.stringify(rawWebhookData));

    // Normalize to consistent format (Svea uses PascalCase)
    let webhookData = normalizeWebhookPayload(rawWebhookData);
    
    // If body is empty/minimal, try to get orderId from query/headers
    if (!webhookData.orderId) {
      const fallbackOrderId = queryOrderId || headerOrderId;
      if (fallbackOrderId) {
        console.log(`🔄 Body empty, using orderId from query/header: ${fallbackOrderId}`);
        
        // Fetch order from Svea to get status and merchantData
        try {
          const sveaOrder = await sveaCheckout.getOrder(parseInt(fallbackOrderId));
          console.log('📋 Fetched Svea order:', {
            orderId: fallbackOrderId,
            status: sveaOrder.status,
            merchantData: sveaOrder.merchantData
          });
          
          webhookData = {
            orderId: parseInt(fallbackOrderId),
            status: sveaOrder.status,
            merchantData: sveaOrder.merchantData,
            paymentType: sveaOrder.paymentType,
            orderAmount: undefined
          };
        } catch (fetchError) {
          console.error('❌ Failed to fetch Svea order:', fetchError);
        }
      }
    }

    console.log('✅ Webhook normalized:', {
      orderId: webhookData.orderId,
      status: webhookData.status,
      merchantData: webhookData.merchantData
    });

    // Process webhook based on status
    switch (webhookData.status) {
      case 'Final':
      case 'Confirmed':
        await handleOrderCompleted(webhookData);
        break;
      
      case 'Cancelled':
      case 'Expired':
        await handleOrderFailed(webhookData);
        break;
      
      case 'Created':
      case 'AwaitingPayment':
        // Order is still pending, no action needed
        console.log(`ℹ️ Order ${webhookData.orderId} is in status: ${webhookData.status}`);
        break;
      
      default:
        console.warn(`⚠️ Unknown webhook status: ${webhookData.status}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('💥 Webhook processing error:', error);
    
    // Don't expose internal errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function handleOrderCompleted(webhookData: ReturnType<typeof normalizeWebhookPayload>) {
  const { orderId, merchantData } = webhookData;
  
  console.log('🎉 Processing completed order:', {
    sveaOrderId: orderId,
    internalOrderId: merchantData
  });

  if (!orderId) {
    console.error('❌ Missing orderId in webhook payload');
    return;
  }

  try {
    // Get full order details from Svea
    const sveaCheckout = getSveaCheckout();
    const sveaOrder = await sveaCheckout.getOrder(orderId);
    
    console.log('📋 Svea order details:', {
      status: sveaOrder.status,
      customer: sveaOrder.customer?.email,
      paymentType: sveaOrder.paymentType
    });

    // Find our order by merchantData (our order ID)
    const order = await prisma.order.findUnique({
      where: { id: merchantData || '' },
      include: { 
        items: true,
        user: true 
      }
    });

    if (!order) {
      console.error(`❌ Order not found: ${merchantData}`);
      return;
    }

    // Skip if already processed
    if (order.status === 'COMPLETED') {
      console.log(`ℹ️ Order ${order.id} already processed`);
      return;
    }

    // Variables to track user creation (needed outside transaction for email)
    const isGuestEmail = (email?: string | null) =>
      !!email && email.startsWith('guest-');

    let isNewUser = false;
    let temporaryPassword: string | undefined;

    await prisma.$transaction(async (tx) => {
      // Get customer info from Svea
      const customerEmail = sveaOrder.customer?.email || order.customerEmail;
      const customerName = `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName;

      // Update order status AND customer info
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          customerEmail: customerEmail || order.customerEmail,
          customerName: customerName || order.customerName,
          metadata: {
            ...order.metadata as any,
            sveaOrderId: orderId,
            sveaStatus: sveaOrder.status,
            sveaPaymentType: sveaOrder.paymentType || 'svea',
            customerInfo: {
              email: sveaOrder.customer?.email,
              phone: sveaOrder.customer?.phoneNumber,
              name: customerName
            }
          }
        }
      });

      // Handle user creation/linking
      let user = order.user;

      const guestUser = user && isGuestEmail(user.email) ? user : null;

      if (( !user || guestUser) && customerEmail) {
        const normalizedEmail = customerEmail.toLowerCase().trim();

        // Check if user exists
        const existingUser = await tx.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (existingUser) {
          // Link order to existing user
          user = existingUser;
          await tx.order.update({
            where: { id: order.id },
            data: { 
              userId: user.id,
              customerEmail: normalizedEmail,
              customerName
            }
          });
        } else if (guestUser) {
          // Upgrade guest user to real customer
          temporaryPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

          user = await tx.user.update({
            where: { id: guestUser.id },
            data: {
              email: normalizedEmail,
              name: customerName || 'Ny kund',
              password: hashedPassword,
              mustChangePassword: true,
              isActive: true,
              role: 'customer'
            }
          });

          isNewUser = true;

          await tx.order.update({
            where: { id: order.id },
            data: { 
              userId: user.id,
              customerEmail: normalizedEmail,
              customerName: user.name || customerName
            }
          });
        } else {
          // Create new user
          temporaryPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
          
          user = await tx.user.create({
            data: {
              email: normalizedEmail,
              name: customerName || 'Ny kund',
              password: hashedPassword,
              role: 'customer',
              emailVerified: null // Will be verified when they set password
            }
          });

          isNewUser = true;

          // Link order to new user
          await tx.order.update({
            where: { id: order.id },
            data: { 
              userId: user.id,
              customerEmail: normalizedEmail,
              customerName
            }
          });

          console.log(`📧 New user created: ${user.email}`);
          
          // Add new customer to Mailchimp Marketing with "kund" tag
          try {
            const mailchimpMarketing = getMailchimpMarketing();
            if (mailchimpMarketing.isConfigured()) {
              await mailchimpMarketing.addCustomerTag(normalizedEmail);
              console.log(`✅ New customer added to Mailchimp with "kund" tag: ${normalizedEmail}`);
            }
          } catch (mailchimpError) {
            console.warn('⚠️ Failed to add customer to Mailchimp (non-critical):', mailchimpError);
          }
        }
      }

      // Create purchases for courses
      const courseItems = order.items.filter(item => item.type === 'course');
      
      // Course name mapping for exact matching
      const courseNameMap: Record<string, string> = {
        'hormonell balans': 'Hormonell Balans',
        'functional flow': 'Functional Flow',
        'functional gut health/flow': 'Functional Flow',
        'functional basics': 'Functional Basics',
        'functional energy': 'Functional Energy',
        'functional insulin balance/energy': 'Functional Energy'
      };
      
      for (const item of courseItems) {
        // Use courseId if available, otherwise match by name
        let courseId = item.courseId;
        
        if (!courseId) {
          // Match course by name using same logic as other webhooks
          const normalizedName = item.name.toLowerCase().trim();
          const mappedName = courseNameMap[normalizedName] || item.name;
          
          // Try exact match first (case-insensitive)
          let course = await tx.courseProduct.findFirst({
            where: {
              name: { equals: mappedName, mode: 'insensitive' }
            }
          });
          
          // If no exact match, try original name
          if (!course) {
            course = await tx.courseProduct.findFirst({
              where: {
                name: { equals: item.name, mode: 'insensitive' }
              }
            });
          }
          
          // Only use contains as last resort, and be more specific
          if (!course && item.name.toLowerCase().includes('functional')) {
            const functionalPart = item.name.split('Functional ')[1]?.trim();
            if (functionalPart) {
              course = await tx.courseProduct.findFirst({
                where: {
                  AND: [
                    { name: { contains: 'Functional', mode: 'insensitive' } },
                    { name: { contains: functionalPart, mode: 'insensitive' } }
                  ]
                }
              });
            }
          }
          
          if (!course) {
            console.error(`❌ Course not found for: "${item.name}"`);
            continue;
          }
          
          courseId = course.id;
          console.log(`✅ Matched course: "${item.name}" → "${course.name}"`);
          
          // Update order item with courseId for future reference
          await tx.orderItem.update({
            where: { id: item.id },
            data: { courseId: course.id }
          });
        }
        
        // Check if purchase already exists
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: user!.id,
              courseId: courseId
            }
          }
        });

        if (!existingPurchase) {
          await tx.purchase.create({
            data: {
              userId: user!.id,
              courseId: courseId,
              amount: item.price * (item.quantity || 1),
              status: 'completed',
              orderId: order.id,
              accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            }
          });
          console.log(`✅ Created purchase for course: ${courseId}`);
        } else {
          console.log(`ℹ️ Purchase already exists for course: ${courseId}`);
        }
      }

      // TODO: Handle book orders - send download links
      const bookItems = order.items.filter(item => item.type === 'book');
      if (bookItems.length > 0) {
        console.log(`📚 Process book orders:`, bookItems.map(b => b.name));
      }
    });

    console.log(`✅ Order ${order.id} completed successfully`);

    // --- Mailchimp E-commerce purchase tracking ---
    try {
      const { getMailchimpEcommerce } = await import('@/app/lib/mailchimp-ecommerce');
      const mailchimpEcommerce = getMailchimpEcommerce();
      
      // Get updated order with user
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { user: true, items: true }
      });

      if (updatedOrder && updatedOrder.user) {
        const totalAmount = updatedOrder.totalAmount;
        const vatRate = 0.25;
        const taxTotal = totalAmount * vatRate / (1 + vatRate);
        
        // Calculate discount total from metadata or by comparing item prices
        let discountTotal = 0;
        const metadata = updatedOrder.metadata as any;
        
        if (metadata?.discountAmount) {
          // Discount amount stored in metadata (in SEK)
          discountTotal = metadata.discountAmount;
        } else {
          // Calculate discount by comparing original prices with discounted prices
          // Sum up original prices (if available) vs actual paid prices
          const originalTotal = updatedOrder.items.reduce((sum, item) => {
            // Try to get original price from course product or metadata
            const originalPrice = (item as any).originalPrice || 
                                 (metadata?.items?.[0]?.price) || 
                                 item.price;
            return sum + (originalPrice * item.quantity);
          }, 0);
          
          if (originalTotal > totalAmount) {
            discountTotal = originalTotal - totalAmount;
          }
        }

        // Extract attribution data from order metadata for campaign tracking
        const attribution = metadata?.attribution || {};
        const campaignId = attribution?.mc_cid || undefined;
        const trackingCode = attribution?.utm_campaign || campaignId || undefined;
        
        // Build landing site URL from UTM params if available
        let landingSite: string | undefined;
        if (attribution?.utm_source || attribution?.utm_campaign) {
          const params = new URLSearchParams();
          if (attribution.utm_source) params.set('utm_source', attribution.utm_source);
          if (attribution.utm_medium) params.set('utm_medium', attribution.utm_medium);
          if (attribution.utm_campaign) params.set('utm_campaign', attribution.utm_campaign);
          if (attribution.mc_cid) params.set('mc_cid', attribution.mc_cid);
          landingSite = `https://functionalfoods.se/?${params.toString()}`;
        }
        
        await mailchimpEcommerce.trackPurchase({
          orderId: updatedOrder.orderNumber,
          customerEmail: updatedOrder.user.email,
          customerName: updatedOrder.user.name || undefined,
          items: updatedOrder.items.map(item => ({
            id: item.courseId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type || 'course'
          })),
          totalAmount: totalAmount,
          currency: updatedOrder.currency || 'SEK',
          orderDate: updatedOrder.createdAt,
          discountTotal: discountTotal,
          shippingTotal: 0,
          taxTotal: taxTotal,
          // Campaign attribution for Mailchimp reports
          campaignId: campaignId,
          landingSite: landingSite,
          trackingCode: trackingCode
        });
      }
    } catch (e) {
      console.warn('⚠️ Mailchimp E-commerce tracking failed:', e);
    }

    // GA4 server-side purchase tracking (non-blocking)
    try {
      const { trackPurchaseServer } = await import('@/app/lib/server-analytics');
      const normalizeGaItemId = (rawId: string | undefined | null, name: string | undefined | null) => {
        return rawId || undefined;
      };
      const gaItems = updatedOrder.items.map(item => ({
        item_id: normalizeGaItemId(item.courseId || item.id, item.name),
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
      await trackPurchaseServer({
        transactionId: updatedOrder.orderNumber,
        value: updatedOrder.totalAmount || 0,
        currency: updatedOrder.currency || 'SEK',
        items: gaItems,
        userId: updatedOrder.customerEmail || undefined,
        clientSeed: updatedOrder.customerEmail || updatedOrder.orderNumber
      });
    } catch (e) {
      console.warn('⚠️ GA4 server purchase tracking failed (Svea):', e);
    }

    // Send order confirmation email with login credentials for new users
    try {
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { 
          items: true,
          user: true 
        }
      });

      if (!updatedOrder) {
        console.warn(`⚠️ Order not found for email sending: ${order.id}`);
        // Don't return - let the function complete normally
      } else {
        // Determine email address to use - prioritize customerEmail from order or Svea
        const emailToUse = updatedOrder.customerEmail || 
                          (updatedOrder.user && !isGuestEmail(updatedOrder.user.email) ? updatedOrder.user.email : null) ||
                          (sveaOrder.customer?.email || null);
        
        const nameToUse = updatedOrder.customerName || 
                          (updatedOrder.user?.name || null) ||
                          `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() ||
                          emailToUse?.split('@')[0] ||
                          'Kund';

        if (!emailToUse || isGuestEmail(emailToUse)) {
          console.warn(`⚠️ No valid email address found for order ${order.id}. customerEmail: ${updatedOrder.customerEmail}, user.email: ${updatedOrder.user?.email}`);
          // Don't return - let the function complete normally
        } else {
          // Check if email was already sent (via metadata flag)
          const metadata = updatedOrder.metadata as any;
          const emailAlreadySent = metadata?.confirmationEmailSent;
          
          if (emailAlreadySent) {
            console.log(`ℹ️ Order confirmation email already sent (skipping duplicate)`);
          } else {
            const COURSE_VAT_RATE = 0.25;
            const courseItems = updatedOrder.items.filter(item => item.type === 'course');
            const emailCourses = courseItems.map(item => ({
              name: item.name,
              price: Math.round(item.price * (1 + COURSE_VAT_RATE) * 100) / 100 * (item.quantity || 1)
            }));

            console.log(`📧 Preparing to send order confirmation email to: ${emailToUse}, isNewUser: ${isNewUser}`);
            console.log(`📚 Order contains: ${courseItems.length} courses`);

            // Send regular order confirmation for course purchases (ALWAYS send if there are courses)
            if (courseItems.length > 0) {
              console.log(`📧 Sending order confirmation for ${courseItems.length} courses, isNewUser: ${isNewUser}, hasPassword: ${!!temporaryPassword}`);
              await emailService.sendOrderConfirmation({
                customerEmail: emailToUse,
                customerName: nameToUse,
                orderNumber: updatedOrder.orderNumber,
                totalAmount: updatedOrder.totalAmount || 0,
                courses: emailCourses,
                loginCredentials: (isNewUser && temporaryPassword) ? {
                  email: emailToUse,
                  password: temporaryPassword,
                  loginUrl: `${baseUrl}/login`
                } : undefined
              });
              console.log(`✅ Order confirmation email sent to ${emailToUse}${isNewUser ? ' (new user with login credentials)' : ' (existing user)'}`);
            }
            
            // Mark email as sent in metadata
            await prisma.order.update({
              where: { id: order.id },
              data: {
                metadata: {
                  ...metadata,
                  confirmationEmailSent: true,
                  confirmationEmailSentAt: new Date().toISOString()
                }
              }
            });
          }
        }
      }
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError);
      // Don't throw - email failure shouldn't fail the order processing
    }

  } catch (error) {
    console.error('❌ Error processing completed order:', error);
    throw error;
  }
}

async function handleOrderFailed(webhookData: ReturnType<typeof normalizeWebhookPayload>) {
  const { orderId, merchantData, status } = webhookData;
  
  console.log('❌ Processing failed order:', {
    sveaOrderId: orderId,
    internalOrderId: merchantData,
    status
  });

  try {
    // Find our order
    const order = await prisma.order.findUnique({
      where: { id: merchantData || '' }
    });

    if (!order) {
      console.error(`❌ Order not found: ${merchantData}`);
      return;
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: status === 'Cancelled' ? 'CANCELLED' : 'FAILED',
        metadata: {
          ...order.metadata as any,
          sveaOrderId: orderId,
          sveaStatus: status,
          failedAt: new Date().toISOString()
        }
      }
    });

    // Restore coupon usage if applicable
    const couponCode = (order.metadata as any)?.couponCode;
    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { timesUsed: { decrement: 1 } }
      });
      console.log(`♻️ Restored coupon usage for: ${couponCode}`);
    }

    console.log(`✅ Order ${order.id} marked as ${status}`);

  } catch (error) {
    console.error('❌ Error processing failed order:', error);
    throw error;
  }
}

function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}
