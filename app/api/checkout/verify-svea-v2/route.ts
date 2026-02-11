import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';
import { emailService } from '@/app/lib/email';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

interface VerifyRequest {
  checkoutOrderId: string;
  orderId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutOrderId, orderId: clientOrderId } = body;

    if (!checkoutOrderId || !clientOrderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // If simulation is enabled, treat as completed without contacting Svea
    if (process.env.PAYMENTS_SIMULATE === 'true' || checkoutOrderId === 'SIMULATED') {
      const order = await prisma.order.findUnique({
        where: { id: clientOrderId },
        include: { items: true, user: true }
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        paymentCompleted: true,
        orderStatus: 'COMPLETED',
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          items: order.items.map(i => ({ productId: i.courseId || i.id, productName: i.name, productType: i.type, quantity: i.quantity, price: i.price }))
        }
      });
    }

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // Get order from Svea
    const sveaOrder = await sveaCheckout.getOrder(parseInt(checkoutOrderId));
    
    console.log('🔍 Verifying Svea order:', {
      checkoutOrderId,
      orderId: clientOrderId,
      sveaStatus: sveaOrder.status
    });

    // Check if payment is completed
    const isCompleted = SveaCheckoutService.isOrderCompleted(sveaOrder.status);

    // Get our order from database
    let order = await prisma.order.findUnique({
      where: { id: clientOrderId },
      include: {
        items: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate actual paid amount from SVEA order (includes discounts)
    // SVEA cart.items contains all items including discount items (negative unitPrice)
    let actualPaidAmount = 0;
    const sveaItemsMap = new Map<string, any>();
    
    if (sveaOrder.cart?.items) {
      for (const sveaItem of sveaOrder.cart.items) {
        // Skip discount items for item mapping, but include in total
        if (sveaItem.articleNumber !== 'DISCOUNT') {
          sveaItemsMap.set(sveaItem.articleNumber, sveaItem);
        }
        // All items (including negative discount) contribute to total
        actualPaidAmount += (sveaItem.unitPrice || 0) * (sveaItem.quantity || 1);
      }
    }
    
    // Convert from öre to SEK
    // Svea API should return unitPrice in öre (minor units), but let's be safe
    let actualPaidAmountSEK = actualPaidAmount / 100;
    
    // Safety check: if calculated amount is way larger than DB amount (more than 10x),
    // it might be that the amount is already in SEK or there's a calculation error
    // In that case, use the original DB amount or recalculate
    if (order.totalAmount > 0) {
      const ratio = actualPaidAmountSEK / order.totalAmount;
      if (ratio > 10) {
        // Amount is likely already in SEK (not öre), or there's an error
        // Try using the amount as-is (assuming it's already in SEK)
        actualPaidAmountSEK = actualPaidAmount;
        console.warn('⚠️ Detected amount might already be in SEK. Using as-is:', {
          original: actualPaidAmount,
          divided: actualPaidAmount / 100,
          dbAmount: order.totalAmount,
          ratio,
          using: actualPaidAmountSEK
        });
        
        // If still way off, use DB amount as fallback
        if (Math.abs(actualPaidAmountSEK - order.totalAmount) > order.totalAmount * 0.5) {
          console.warn('⚠️ Calculated amount still seems wrong, using DB amount as fallback');
          actualPaidAmountSEK = order.totalAmount;
        }
      } else if (ratio < 0.1 && actualPaidAmountSEK > 0) {
        // Amount is way too small, might be double-divided
        console.warn('⚠️ Amount seems too small, might be double-divided');
      }
    }
    
    // Final sanity check: ensure amount is reasonable (between 0 and 100000 SEK)
    if (actualPaidAmountSEK < 0 || actualPaidAmountSEK > 100000) {
      console.warn('⚠️ Calculated amount is outside reasonable range, using DB amount:', {
        calculated: actualPaidAmountSEK,
        dbAmount: order.totalAmount
      });
      actualPaidAmountSEK = order.totalAmount;
    }
    
    console.log('💰 Calculated actual paid amount from SVEA:', {
      actualPaidAmountOre: actualPaidAmount,
      actualPaidAmountSEK,
      dbTotalAmount: order.totalAmount,
      itemCount: sveaOrder.cart?.items?.length || 0,
      sveaItems: sveaOrder.cart?.items?.map((item: any) => ({
        articleNumber: item.articleNumber,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: (item.unitPrice || 0) * (item.quantity || 1)
      }))
    });

    // ALWAYS use actual paid amount from SVEA if available (it's the source of truth)
    // Only fallback to DB if SVEA doesn't return cart items
    const displayTotalAmount = sveaOrder.cart?.items && sveaOrder.cart.items.length > 0 
      ? actualPaidAmountSEK 
      : order.totalAmount;
    
    // Map items with actual prices from SVEA if available
    const displayItems = order.items.map(item => {
      // Try to find matching SVEA item
      let displayPrice = item.price;
      
      // Determine VAT rate based on item type (6% for books, 25% for courses)
      const vatRate = item.type === 'book' ? 1.06 : 1.25;
      
      // Try to match by article number or name
      for (const [articleNumber, sveaItem] of sveaItemsMap.entries()) {
        const itemIdLower = item.id?.toLowerCase() || '';
        const articleLower = articleNumber.toLowerCase();
        
        if (itemIdLower.includes(articleLower) || 
            articleLower.includes(itemIdLower) ||
            item.name.toLowerCase().includes(articleLower) ||
            articleLower.includes(item.name.toLowerCase())) {
          // Found matching SVEA item - use its price
          // SVEA price is in öre, inkl. moms - convert to SEK, then to exkl. moms for display
          const priceInclVAT = (sveaItem.unitPrice || 0) / 100;
          displayPrice = priceInclVAT / vatRate; // Convert to exkl. moms using correct VAT rate
          break;
        }
      }
      
      return {
        productId: item.courseId || item.id,
        productName: item.name,
        productType: item.type,
        quantity: item.quantity,
        price: Math.round(displayPrice * 100) / 100 // Round to 2 decimals
      };
    });
    
    const response = {
      success: true,
      paymentCompleted: isCompleted,
      orderStatus: sveaOrder.status,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: displayTotalAmount,
        customerEmail: sveaOrder.customer?.email || order.customerEmail,
        customerName: `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName,
        items: displayItems
      }
    };

    // If payment is completed, process the order (create purchases, send email, etc.)
    // Process even if cart.items is missing (Svea may not return it after payment is final)
    if (isCompleted) {
      // Update order with actual paid amount from SVEA (even if already COMPLETED)
      await prisma.order.update({
        where: { id: order.id },
        data: {
          totalAmount: displayTotalAmount, // Use calculated display amount (from SVEA)
          metadata: {
            ...order.metadata as any,
            sveaOrderId: sveaOrder.id,
            sveaStatus: sveaOrder.status,
            sveaPaymentType: sveaOrder.paymentType,
            verifiedAt: new Date().toISOString(),
            actualPaidAmount: actualPaidAmountSEK // Store for reference
          }
        }
      });
      
      // Also update status if it was PENDING
      let orderJustCompleted = false;
      let isNewUser = false;
      let temporaryPassword: string | undefined;
      
      const isGuestEmail = (email?: string | null) =>
        !!email && email.startsWith('guest-');

      if (order.status === 'PENDING') {
        orderJustCompleted = true;
        
        // Handle user creation/linking if needed
        const customerEmail = sveaOrder.customer?.email || order.customerEmail;
        const customerName = `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName;
        
        const hasGuestUser = isGuestEmail(order.user?.email);

        if (( !order.userId || hasGuestUser) && customerEmail) {
          // Check if user exists
          const normalizedEmail = customerEmail.toLowerCase().trim();
          const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
          });

          if (existingUser) {
            // Link order to existing user
            await prisma.order.update({
              where: { id: order.id },
              data: { 
                userId: existingUser.id,
                customerEmail: normalizedEmail,
                customerName
              }
            });
            
            // Reload order to get updated user relation
            const updatedOrder = await prisma.order.findUnique({
              where: { id: order.id },
              include: { items: true, user: true }
            });
            if (updatedOrder) {
              order = updatedOrder;
            }
          } else {
            // Create new user
            temporaryPassword = generateSecurePassword();
            const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
            
            if (order.userId && hasGuestUser) {
              // Upgrade guest user to real customer
              const updatedUser = await prisma.user.update({
                where: { id: order.userId },
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

              await prisma.order.update({
                where: { id: order.id },
                data: { 
                  customerEmail: normalizedEmail,
                  customerName: updatedUser.name || customerName
                }
              });

              const refreshedOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: true, user: true }
              });
              if (refreshedOrder) {
                order = refreshedOrder;
              }

              console.log(`📧 Guest user upgraded via verify: ${updatedUser.email}`);
              
              // Add to Mailchimp Marketing with "kund" tag + course tags
              try {
                const mailchimpMarketing = getMailchimpMarketing();
                if (mailchimpMarketing.isConfigured()) {
                  const courseNames = order.items
                    .filter(item => item.type === 'course')
                    .map(item => item.name);
                  const nameParts = (customerName || '').split(' ');
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.slice(1).join(' ') || '';
                  await mailchimpMarketing.addCustomerWithCourseTags(normalizedEmail, courseNames, firstName, lastName);
                  console.log(`✅ Customer added to Mailchimp with course tags: ${normalizedEmail}`);
                }
              } catch (mailchimpError) {
                console.warn('⚠️ Failed to add to Mailchimp (non-critical):', mailchimpError);
              }
            } else {
              const newUser = await prisma.user.create({
                data: {
                  email: normalizedEmail,
                  name: customerName || 'Ny kund',
                  password: hashedPassword,
                  role: 'customer',
                  emailVerified: null
                }
              });

              isNewUser = true;

              // Link order to new user
              await prisma.order.update({
                where: { id: order.id },
                data: { 
                  userId: newUser.id,
                  customerEmail: normalizedEmail,
                  customerName
                }
              });
              
              // Reload order to get user
              const updatedOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: { items: true, user: true }
              });
              if (updatedOrder) order = updatedOrder;
              
              console.log(`📧 New user created via verify: ${newUser.email}`);
              
              // Add to Mailchimp Marketing with "kund" tag + course tags
              try {
                const mailchimpMarketing = getMailchimpMarketing();
                if (mailchimpMarketing.isConfigured()) {
                  const courseNames = order.items
                    .filter(item => item.type === 'course')
                    .map(item => item.name);
                  const nameParts = (customerName || '').split(' ');
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.slice(1).join(' ') || '';
                  await mailchimpMarketing.addCustomerWithCourseTags(normalizedEmail, courseNames, firstName, lastName);
                  console.log(`✅ Customer added to Mailchimp with course tags: ${normalizedEmail}`);
                }
              } catch (mailchimpError) {
                console.warn('⚠️ Failed to add to Mailchimp (non-critical):', mailchimpError);
              }
            }
          }
        }
        
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            customerEmail: sveaOrder.customer?.email || order.customerEmail,
            customerName: `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName,
            metadata: {
              ...order.metadata as any,
              processedAt: new Date().toISOString()
            }
          }
        });
        console.log('⚡ Fast-tracking order completion from verification');
      }
      
      // Update item prices if they differ from SVEA (only if cart.items is available)
      if (actualPaidAmountSEK > 0 && sveaOrder.cart?.items && sveaOrder.cart.items.length > 0) {
        for (const orderItem of order.items) {
          // Find matching SVEA item
          for (const sveaItem of sveaOrder.cart.items) {
            if (sveaItem.articleNumber === 'DISCOUNT') continue;
            
            const itemIdLower = orderItem.id?.toLowerCase() || '';
            const articleLower = sveaItem.articleNumber.toLowerCase();
            
            if (itemIdLower.includes(articleLower) || 
                articleLower.includes(itemIdLower) ||
                orderItem.name.toLowerCase().includes(articleLower)) {
              // Update item price to match SVEA (convert from öre to SEK, then to exkl. VAT)
              // Use correct VAT rate: 6% for books, 25% for courses
              const vatRate = orderItem.type === 'book' ? 1.06 : 1.25;
              const priceInclVAT = (sveaItem.unitPrice || 0) / 100;
              const priceExclVAT = priceInclVAT / vatRate; // Remove VAT using correct rate
              
              if (Math.abs(orderItem.price - priceExclVAT) > 0.01) {
                await prisma.orderItem.update({
                  where: { id: orderItem.id },
                  data: { price: Math.round(priceExclVAT * 100) / 100 }
                });
                console.log(`✅ Updated item price: ${orderItem.name} from ${orderItem.price} to ${priceExclVAT}`);
              }
              break;
            }
          }
        }
      }

      // Create purchases for courses if user exists
      if (order.userId) {
        const courseItems = order.items.filter(item => item.type === 'course');
        
        // Course name mapping for exact matching
        const courseNameMap: Record<string, string> = {
          'hormonell balans': 'Hormonell Balans',
          'functional flow': 'Functional Flow',
          'functional gut health/flow': 'Functional Flow',
          'functional basics': 'Functional Basics',
          'functional energy': 'Functional Energy',
          'functional insulin balance/energy': 'Functional Energy',
          'prova på vecka med functional foods!': 'Prova på vecka med Functional Foods!',
          'prova på vecka': 'Prova på vecka med Functional Foods!'
        };
        
        for (const item of courseItems) {
          // Use courseId if available, otherwise match by name
          let courseId = item.courseId;
          
          if (!courseId) {
            // Match course by name using same logic as other webhooks
            const normalizedName = item.name.toLowerCase().trim();
            const mappedName = courseNameMap[normalizedName] || item.name;
            
            // Try exact match first (case-insensitive)
            let course = await prisma.courseProduct.findFirst({
              where: {
                name: { equals: mappedName, mode: 'insensitive' }
              }
            });
            
            // If no exact match, try original name
            if (!course) {
              course = await prisma.courseProduct.findFirst({
                where: {
                  name: { equals: item.name, mode: 'insensitive' }
                }
              });
            }
            
            // Only use contains as last resort, and be more specific
            if (!course && item.name.toLowerCase().includes('functional')) {
              const functionalPart = item.name.split('Functional ')[1]?.trim();
              if (functionalPart) {
                course = await prisma.courseProduct.findFirst({
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
            await prisma.orderItem.update({
              where: { id: item.id },
              data: { courseId: course.id }
            });
          }
          
          // Check if purchase already exists
          const existingPurchase = await prisma.purchase.findUnique({
            where: {
              userId_courseId: {
                userId: order.userId,
                courseId: courseId
              }
            }
          });

          if (!existingPurchase) {
            await prisma.purchase.create({
              data: {
                userId: order.userId,
                courseId: courseId,
                amount: item.price * (item.quantity || 1),
                status: 'completed',
                orderId: order.id,
                accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
              }
            });
            console.log(`✅ Created purchase for course: ${courseId}`);
          }
        }
      }

      response.order.status = 'COMPLETED';
      response.order.totalAmount = displayTotalAmount; // Use calculated display amount
      response.paymentCompleted = true; // Force to true after fast-tracking
      
      // Send order confirmation email if order was just completed (webhook might not have fired yet)
      if (orderJustCompleted) {
        try {
          const updatedOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: true, user: true }
          });

          if (!updatedOrder) {
            console.warn(`⚠️ Order not found for email sending: ${order.id}`);
          } else {
            // Determine email address to use - prioritize customerEmail from order or Svea
            const emailToUse =
              updatedOrder.customerEmail ||
              (updatedOrder.user && !isGuestEmail(updatedOrder.user.email) ? updatedOrder.user.email : null) ||
              (sveaOrder.customer?.email || null);

            const nameToUse =
              updatedOrder.customerName ||
              updatedOrder.user?.name ||
              `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() ||
              emailToUse?.split('@')[0] ||
              'Kund';

            if (!emailToUse || isGuestEmail(emailToUse)) {
              console.warn(
                `⚠️ No valid email address found for order ${order.id}. customerEmail: ${updatedOrder.customerEmail}, user.email: ${updatedOrder.user?.email}`
              );
            } else {
              const COURSE_VAT_RATE = 0.25;
              const courseItems = updatedOrder.items.filter((item) => item.type === 'course');
              const emailCourses = courseItems.map((item) => ({
                name: item.name,
                price: (Math.round(item.price * (1 + COURSE_VAT_RATE) * 100) / 100) * (item.quantity || 1)
              }));

              const metadata = (updatedOrder.metadata as any) || {};
              const emailAlreadySent = metadata.confirmationEmailSent;

              if (emailAlreadySent) {
                console.log('ℹ️ Order confirmation email already sent (skipping duplicate)');
              } else {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';

                if (courseItems.length > 0) {
                  await emailService.sendOrderConfirmation({
                    customerEmail: emailToUse,
                    customerName: nameToUse,
                    orderNumber: updatedOrder.orderNumber,
                    totalAmount: displayTotalAmount,
                    courses: emailCourses,
                    loginCredentials:
                      isNewUser && temporaryPassword
                        ? {
                            email: emailToUse,
                            password: temporaryPassword,
                            loginUrl: `${baseUrl}/login`
                          }
                        : undefined,
                    isExistingUser: !isNewUser
                  });

                  console.log(
                    `✅ Order confirmation email sent via verify to ${emailToUse}${
                      isNewUser ? ' (new user with login credentials)' : ' (existing user)'
                    }`
                  );
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
          console.error('❌ Failed to send order confirmation email via verify:', emailError);
          // Don't throw - email failure shouldn't fail verification
        }
      }

      // --- Mailchimp E-commerce purchase tracking (run from verify to avoid webhook dependency) ---
      try {
        // Reload latest order state incl user + items (important after linking/creating user above)
        const updatedOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: { user: true, items: true }
        });

        if (!updatedOrder) {
          console.warn('⚠️ Mailchimp E-commerce: order not found after completion:', order.id);
        } else {
          // Prefer user.email, but fall back to order.customerEmail so tracking still works
          // even if the user relation isn't linked yet in this verify-call.
          const emailForTracking =
            updatedOrder.user?.email && !updatedOrder.user.email.startsWith('guest-')
              ? updatedOrder.user.email
              : updatedOrder.customerEmail && !updatedOrder.customerEmail.startsWith('guest-')
                ? updatedOrder.customerEmail
                : null;

          if (!emailForTracking) {
            console.warn('⚠️ Mailchimp E-commerce: missing email (cannot track):', {
              orderId: updatedOrder.id,
              userId: updatedOrder.userId,
              userEmail: updatedOrder.user?.email,
              customerEmail: updatedOrder.customerEmail
            });
          } else {
            const metadata = (updatedOrder.metadata as any) || {};

            // Idempotency guard (avoid double tracking on repeated verify calls)
            if (metadata.mailchimpEcommerceTrackedAt) {
              console.log('ℹ️ Mailchimp E-commerce already tracked (skipping):', {
                orderId: updatedOrder.orderNumber,
                trackedAt: metadata.mailchimpEcommerceTrackedAt
              });
            } else {
              const { getMailchimpEcommerce } = await import('@/app/lib/mailchimp-ecommerce');
              const mailchimpEcommerce = getMailchimpEcommerce();

              // Amounts
              const totalAmount = updatedOrder.totalAmount || 0; // SEK
              const vatRate = 0.25;
              const taxTotal = totalAmount * vatRate / (1 + vatRate);

              // Discount total (prefer your stored metadata.discountAmount)
              let discountTotal = 0;
              if (typeof metadata.discountAmount === 'number') {
                discountTotal = metadata.discountAmount;
              } else if (typeof metadata.discountAmount === 'string') {
                const parsed = Number(metadata.discountAmount);
                if (!Number.isNaN(parsed)) discountTotal = parsed;
              }

              // Attribution → campaign tracking
              const attribution = metadata.attribution || {};
              const campaignId = attribution?.mc_cid || undefined;
              const trackingCode = attribution?.utm_campaign || campaignId || undefined;

              let landingSite: string | undefined;
              if (attribution?.utm_source || attribution?.utm_campaign || attribution?.mc_cid) {
                const params = new URLSearchParams();
                if (attribution.utm_source) params.set('utm_source', attribution.utm_source);
                if (attribution.utm_medium) params.set('utm_medium', attribution.utm_medium);
                if (attribution.utm_campaign) params.set('utm_campaign', attribution.utm_campaign);
                if (attribution.mc_cid) params.set('mc_cid', attribution.mc_cid);
                landingSite = `https://functionalfoods.se/?${params.toString()}`;
              }

              await mailchimpEcommerce.trackPurchase({
                orderId: updatedOrder.orderNumber,
                customerEmail: emailForTracking, // ✅ fallback-enabled
                customerName: updatedOrder.user?.name || updatedOrder.customerName || undefined,
                items: updatedOrder.items.map((it) => ({
                  id: it.courseId || it.id,
                  name: it.name,
                  price: it.price, // SEK (exkl moms enligt din DB)
                  quantity: it.quantity,
                  type: (it.type as any) || 'course'
                })),
                totalAmount,
                currency: updatedOrder.currency || 'SEK',
                orderDate: updatedOrder.createdAt,
                discountTotal,
                shippingTotal: 0,
                taxTotal,
                campaignId,
                landingSite,
                trackingCode
              });

              console.log('✅ Mailchimp E-commerce purchase tracked (via verify):', {
                orderId: updatedOrder.orderNumber,
                email: emailForTracking,
                totalAmount,
                itemsCount: updatedOrder.items.length
              });

              // Mark as tracked (idempotency)
              await prisma.order.update({
                where: { id: updatedOrder.id },
                data: {
                  metadata: {
                    ...metadata,
                    mailchimpEcommerceTrackedAt: new Date().toISOString()
                  }
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Mailchimp E-commerce tracking failed (verify, non-critical):', e);
      }
    } 

    console.log('✅ Returning verification response:', {
      success: response.success,
      paymentCompleted: response.paymentCompleted,
      orderStatus: response.orderStatus,
      orderDbStatus: response.order.status
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
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
