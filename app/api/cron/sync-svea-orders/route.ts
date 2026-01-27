import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSveaCheckout } from '@/app/lib/svea-checkout-service';
import { emailService } from '@/app/lib/email';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for this endpoint

const prisma = new PrismaClient();

// Secret key to authorize cron calls (set in Railway env vars)
const CRON_SECRET = process.env.CRON_SECRET;

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
 * GET /api/cron/sync-svea-orders
 * Automatically syncs pending Svea orders every few minutes
 * Called by Railway cron or external cron service
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret (skip in development)
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || 
                          request.nextUrl.searchParams.get('secret');
    
    if (process.env.NODE_ENV === 'production' && CRON_SECRET && providedSecret !== CRON_SECRET) {
      console.log('⚠️ Cron sync: Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting automatic Svea order sync...');

    // Find pending orders with Svea checkout ID (created in last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        checkoutOrderId: { not: null },
        createdAt: { gte: twentyFourHoursAgo }
      },
      include: {
        items: true,
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Process max 20 orders per run
    });

    console.log(`📋 Found ${pendingOrders.length} pending Svea orders to check`);

    if (pendingOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending orders to sync',
        processed: 0,
        duration: Date.now() - startTime
      });
    }

    const sveaCheckout = getSveaCheckout();
    const results: Array<{ orderNumber: string; action: string; error?: string }> = [];

    for (const order of pendingOrders) {
      try {
        const sveaOrderId = parseInt(order.checkoutOrderId!);
        
        // Get order status from Svea
        const sveaOrder = await sveaCheckout.getOrder(sveaOrderId);
        
        console.log(`🔍 Order ${order.orderNumber}: Svea status = ${sveaOrder.status}`);

        if (sveaOrder.status === 'Final' || sveaOrder.status === 'Confirmed') {
          // Order is paid in Svea but not completed in our system
          console.log(`✅ Completing order ${order.orderNumber}...`);
          
          await completeOrder(order, sveaOrder);
          
          results.push({ orderNumber: order.orderNumber, action: 'completed' });
        } else if (sveaOrder.status === 'Cancelled' || sveaOrder.status === 'Expired') {
          // Order failed in Svea
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: sveaOrder.status === 'Cancelled' ? 'CANCELLED' : 'FAILED',
              metadata: {
                ...(order.metadata as any),
                sveaStatus: sveaOrder.status,
                syncedAt: new Date().toISOString(),
                autoSynced: true
              }
            }
          });
          
          results.push({ orderNumber: order.orderNumber, action: sveaOrder.status.toLowerCase() });
        } else {
          // Order still pending in Svea
          results.push({ orderNumber: order.orderNumber, action: 'still_pending' });
        }
      } catch (error: any) {
        console.error(`❌ Error syncing order ${order.orderNumber}:`, error.message);
        results.push({ 
          orderNumber: order.orderNumber, 
          action: 'error', 
          error: error.message 
        });
      }
    }

    const completed = results.filter(r => r.action === 'completed').length;
    const failed = results.filter(r => r.action === 'error').length;
    
    console.log(`🏁 Sync complete: ${completed} completed, ${failed} errors`);

    return NextResponse.json({
      success: true,
      processed: pendingOrders.length,
      completed,
      failed,
      results,
      duration: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('💥 Cron sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function completeOrder(order: any, sveaOrder: any) {
  const metadata = order.metadata as any || {};
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
          autoSynced: true
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
        
        console.log(`📧 Created new user: ${normalizedEmail}`);
      }
    }

    // Create purchases for courses
    const courseItems = order.items.filter((item: any) => item.type === 'course');
    for (const item of courseItems) {
      if (item.courseId && user) {
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: { userId: user.id, courseId: item.courseId }
          }
        });

        if (!existingPurchase) {
          await tx.purchase.create({
            data: {
              userId: user.id,
              courseId: item.courseId,
              amount: item.price * (item.quantity || 1),
              status: 'completed',
              orderId: order.id,
              accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }
    }
  });

  // Send emails
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
  const courseItems = order.items.filter((item: any) => item.type === 'course');

  // Send course confirmation email
  if (courseItems.length > 0 && customerEmail) {
    const COURSE_VAT_RATE = 0.25;
    const emailCourses = courseItems.map((item: any) => ({
      name: item.name,
      price: Math.round(item.price * (1 + COURSE_VAT_RATE) * 100) / 100 * (item.quantity || 1)
    }));

    await emailService.sendOrderConfirmation({
      customerEmail,
      customerName,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount || 0,
      courses: emailCourses,
      loginCredentials: (isNewUser && temporaryPassword) ? {
        email: customerEmail,
        password: temporaryPassword,
        loginUrl: `${baseUrl}/login`
      } : undefined,
      isExistingUser: !isNewUser
    });
    
    console.log(`📧 Order confirmation sent to ${customerEmail}`);
  }

  // Update metadata to mark email as sent
  await prisma.order.update({
    where: { id: order.id },
    data: {
      metadata: {
        ...metadata,
        sveaStatus: sveaOrder.status,
        sveaPaymentType: sveaOrder.paymentType || 'svea',
        syncedAt: new Date().toISOString(),
        autoSynced: true,
        confirmationEmailSent: true,
        confirmationEmailSentAt: new Date().toISOString()
      }
    }
  });
}

