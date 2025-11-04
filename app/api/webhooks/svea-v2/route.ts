import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';
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
  orderId: number;
  status: string;
  paymentType?: string;
  creationDate: string;
  customerCountry?: string;
  currency?: string;
  orderAmount?: number;
  capturedAmount?: number;
  creditedAmount?: number;
  merchantData?: string;
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
    
    console.log('📩 Svea webhook received:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      signatureLength: signature.length
    });

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // Validate webhook signature
    if (process.env.NODE_ENV === 'production' || process.env.SVEA_WEBHOOK_VALIDATION === 'true') {
      if (!signature) {
        console.error('❌ Missing webhook signature');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      const isValid = sveaCheckout.validateWebhookSignature(body, signature);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse webhook payload
    let webhookData: SveaWebhookPayload;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('❌ Failed to parse webhook body:', error);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('✅ Webhook validated:', {
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

async function handleOrderCompleted(webhookData: SveaWebhookPayload) {
  const { orderId, merchantData } = webhookData;
  
  console.log('🎉 Processing completed order:', {
    sveaOrderId: orderId,
    internalOrderId: merchantData
  });

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

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          paymentMethod: sveaOrder.paymentType || 'svea',
          metadata: {
            ...order.metadata as any,
            sveaOrderId: orderId,
            sveaStatus: sveaOrder.status,
            paymentType: sveaOrder.paymentType,
            customerInfo: {
              email: sveaOrder.customer?.email,
              phone: sveaOrder.customer?.phoneNumber,
              name: `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim()
            }
          }
        }
      });

      // Handle user creation/linking
      let user = order.user;
      const customerEmail = sveaOrder.customer?.email || order.customerEmail;
      const customerName = `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName;

      if (!user && customerEmail) {
        // Check if user exists
        const existingUser = await tx.user.findUnique({
          where: { email: customerEmail }
        });

        if (existingUser) {
          // Link order to existing user
          user = existingUser;
          await tx.order.update({
            where: { id: order.id },
            data: { 
              userId: user.id,
              customerEmail,
              customerName
            }
          });
        } else {
          // Create new user
          const temporaryPassword = generateSecurePassword();
          const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
          
          user = await tx.user.create({
            data: {
              email: customerEmail,
              name: customerName || 'Ny kund',
              password: hashedPassword,
              role: 'customer',
              emailVerified: null // Will be verified when they set password
            }
          });

          // Link order to new user
          await tx.order.update({
            where: { id: order.id },
            data: { 
              userId: user.id,
              customerEmail,
              customerName
            }
          });

          // TODO: Queue welcome email with password reset link
          console.log(`📧 New user created: ${user.email} - Send welcome email`);
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
          discountTotal: 0,
          shippingTotal: 0,
          taxTotal: taxTotal
        });
      }
    } catch (e) {
      console.warn('⚠️ Mailchimp E-commerce tracking failed:', e);
    }

    // TODO: Send order confirmation email
    // TODO: Send course access email
    // TODO: Update inventory if applicable

  } catch (error) {
    console.error('❌ Error processing completed order:', error);
    throw error;
  }
}

async function handleOrderFailed(webhookData: SveaWebhookPayload) {
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
