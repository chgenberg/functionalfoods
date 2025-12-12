import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { getSveaCheckout } from '@/app/lib/svea-checkout-service';
import bcrypt from 'bcryptjs';
import { emailService } from '@/app/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

function generateSecurePassword(): string {
  const length = 16;
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * POST /api/admin/orders/sync-svea
 * Manually sync pending orders with Svea to update their status
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Find all pending orders that might be paid in Svea
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: true,
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    console.log(`Found ${pendingOrders.length} pending orders to sync`);

    const sveaCheckout = getSveaCheckout();
    let syncedCount = 0;
    const results: Array<{ orderId: string; status: string; error?: string }> = [];

    for (const order of pendingOrders) {
      try {
        // Check if order has Svea order ID - can be in metadata OR checkoutOrderId field
        const metadata = order.metadata as any;
        const sveaOrderId = metadata?.sveaOrderId || order.checkoutOrderId;

        if (!sveaOrderId) {
          results.push({ orderId: order.id, status: 'skipped', error: 'No Svea order ID' });
          continue;
        }

        // Get order status from Svea
        const sveaOrder = await sveaCheckout.getOrder(sveaOrderId);

        if (sveaOrder.status === 'Final' || sveaOrder.status === 'Confirmed') {
          // Order is paid in Svea - update our status
          console.log(`Order ${order.orderNumber} is paid in Svea - updating...`);

          // Get customer email from Svea
          const customerEmail = sveaOrder.customer?.email || order.customerEmail;
          const customerName = `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName;

          let isNewUser = false;
          let temporaryPassword: string | undefined;
          let user = order.user;

          await prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'COMPLETED',
                customerEmail: customerEmail || order.customerEmail,
                customerName: customerName || order.customerName,
                metadata: {
                  ...metadata,
                  sveaStatus: sveaOrder.status,
                  sveaPaymentType: sveaOrder.paymentType || 'svea',
                  syncedAt: new Date().toISOString(),
                  manuallySynced: true
                }
              }
            });

            // Handle user creation if needed
            if (!user && customerEmail) {
              const normalizedEmail = customerEmail.toLowerCase().trim();
              const existingUser = await tx.user.findUnique({
                where: { email: normalizedEmail }
              });

              if (existingUser) {
                user = existingUser;
                await tx.order.update({
                  where: { id: order.id },
                  data: { userId: user.id }
                });
              } else {
                temporaryPassword = generateSecurePassword();
                const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
                
                user = await tx.user.create({
                  data: {
                    email: normalizedEmail,
                    name: customerName || 'Ny kund',
                    password: hashedPassword,
                    role: 'customer'
                  }
                });

                isNewUser = true;

                await tx.order.update({
                  where: { id: order.id },
                  data: { userId: user.id }
                });
              }
            }

            // Create purchases for courses
            const courseNameMap: Record<string, string> = {
              'functional energy': 'Functional Energy',
              'functional basics': 'Functional Basics',
              'functional flow': 'Functional Flow',
              'hormonell balans': 'Hormonell Balans'
            };

            for (const item of order.items) {
              if (item.type === 'course' && user) {
                let courseId = item.courseId;
                
                // If no courseId, try to match by name
                if (!courseId) {
                  const normalizedName = item.name.toLowerCase().trim();
                  const mappedName = courseNameMap[normalizedName] || item.name;
                  
                  const course = await tx.courseProduct.findFirst({
                    where: {
                      OR: [
                        { name: { equals: mappedName, mode: 'insensitive' } },
                        { name: { equals: item.name, mode: 'insensitive' } },
                        { name: { contains: normalizedName.split(' ').pop() || '', mode: 'insensitive' } }
                      ]
                    }
                  });
                  
                  if (course) {
                    courseId = course.id;
                    // Update order item with courseId
                    await tx.orderItem.update({
                      where: { id: item.id },
                      data: { courseId: course.id }
                    });
                    console.log(`✅ Matched course: "${item.name}" → "${course.name}"`);
                  } else {
                    console.error(`❌ Could not match course: "${item.name}"`);
                    continue;
                  }
                }

                const existingPurchase = await tx.purchase.findUnique({
                  where: {
                    userId_courseId: {
                      userId: user.id,
                      courseId: courseId
                    }
                  }
                });

                if (!existingPurchase) {
                  await tx.purchase.create({
                    data: {
                      userId: user.id,
                      courseId: courseId,
                      amount: item.price * (item.quantity || 1),
                      status: 'completed',
                      orderId: order.id,
                      accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    }
                  });
                  console.log(`✅ Created purchase for user ${user.email}, course ${courseId}`);
                }
              }
            }
          });

          // Send confirmation email
          if (customerEmail && !metadata?.confirmationEmailSent) {
            try {
              const VAT_RATE = 0.25;
              const emailCourses = order.items
                .filter(item => item.type === 'course')
                .map(item => ({
                  name: item.name,
                  price: Math.round(item.price * (1 + VAT_RATE) * 100) / 100 * (item.quantity || 1)
                }));

              await emailService.sendOrderConfirmation({
                customerEmail: customerEmail,
                customerName: customerName || 'Kund',
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount || 0,
                courses: emailCourses,
                loginCredentials: (isNewUser && temporaryPassword) ? {
                  email: customerEmail,
                  password: temporaryPassword,
                  loginUrl: 'https://www.functionalfoods.se/login'
                } : undefined
              });

              // Mark email as sent
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

              console.log(`Email sent for order ${order.orderNumber}`);
            } catch (emailError) {
              console.error(`Failed to send email for order ${order.orderNumber}:`, emailError);
            }
          }

          syncedCount++;
          results.push({ orderId: order.id, status: 'synced' });
        } else {
          results.push({ orderId: order.id, status: 'still_pending', error: `Svea status: ${sveaOrder.status}` });
        }
      } catch (orderError) {
        console.error(`Error syncing order ${order.id}:`, orderError);
        results.push({ 
          orderId: order.id, 
          status: 'error', 
          error: orderError instanceof Error ? orderError.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      total: pendingOrders.length,
      results
    });

  } catch (error) {
    console.error('Error syncing Svea orders:', error);
    return NextResponse.json(
      { error: 'Failed to sync orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

