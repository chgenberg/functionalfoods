import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sveaPayment } from '@/app/lib/svea-payment';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET method for testing webhook endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Svea webhook endpoint is active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    merchantId: process.env.SVEA_MERCHANT_ID ? 'configured' : 'missing'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-svea-signature') || '';
    
    console.log('📩 Svea webhook received:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Skip signature validation in development for testing
    if (process.env.NODE_ENV === 'production' && signature) {
      if (!sveaPayment.validateWebhookSignature(body, signature)) {
        console.error('❌ Invalid Svea webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('✅ Svea webhook parsed:', {
      eventType: webhookData.eventType,
      orderId: webhookData.orderId,
      status: webhookData.orderStatus
    });

    // Process different webhook events
    switch (webhookData.eventType) {
      case 'ORDER_COMPLETED':
      case 'PAYMENT_COMPLETED':
        await handlePaymentCompleted(webhookData);
        break;
      case 'ORDER_CANCELLED':
      case 'PAYMENT_FAILED':
        await handlePaymentFailed(webhookData);
        break;
      default:
        console.log(`ℹ️ Unhandled Svea event type: ${webhookData.eventType}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('💥 Svea webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function handlePaymentCompleted(webhookData: any) {
  try {
    const processedPayment = await sveaPayment.processWebhook(webhookData);
    
    if (processedPayment.status !== 'completed') {
      console.warn('Payment not completed, skipping processing');
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      const order = await tx.order.update({
        where: { id: processedPayment.orderId },
        data: { 
          status: 'COMPLETED',
          processedAt: new Date()
        },
        include: { 
          items: true,
          user: true
        }
      });

      // Get or create user
      let user = order.user;
      if (!user && processedPayment.customer.email) {
        // Check if user exists
        const existingUser = await tx.user.findUnique({
          where: { email: processedPayment.customer.email }
        });

        if (existingUser) {
          user = existingUser;
          // Link order to existing user
          await tx.order.update({
            where: { id: order.id },
            data: { userId: user.id }
          });
        } else {
          // Create new user
          const temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
          const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
          
          user = await tx.user.create({
            data: {
              email: processedPayment.customer.email,
              name: processedPayment.customer.name || 'Ny kund',
              password: hashedPassword,
              role: 'customer'
            }
          });

          // Link order to new user
          await tx.order.update({
            where: { id: order.id },
            data: { userId: user.id }
          });

          // TODO: Send welcome email with login credentials
          console.log(`New user created: ${user.email} with temp password: ${temporaryPassword}`);
        }
      }

      // Create purchases for courses
      const purchasedCourses = [];
      for (const item of order.items) {
        if (item.productId && item.productId.startsWith('course-')) {
          const courseId = item.productId.replace('course-', '');
          
          const purchase = await tx.purchase.create({
            data: {
              userId: user?.id || '',
              courseId: courseId,
              orderId: order.id,
              status: 'ACTIVE',
              purchaseDate: new Date(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              metadata: {
                paymentProvider: 'svea',
                sveaOrderId: processedPayment.orderId
              }
            }
          });

          purchasedCourses.push({
            courseId,
            purchaseId: purchase.id
          });
        }
      }

      console.log(`✅ Payment completed for order ${order.id}, created ${purchasedCourses.length} course purchases`);
    });

  } catch (error) {
    console.error('Failed to process completed payment:', error);
    throw error;
  }
}

async function handlePaymentFailed(webhookData: any) {
  try {
    const processedPayment = await sveaPayment.processWebhook(webhookData);
    
    // Update order status to failed
    await prisma.order.update({
      where: { id: processedPayment.orderId },
      data: { 
        status: 'FAILED',
        processedAt: new Date()
      }
    });

    console.log(`❌ Payment failed for order ${processedPayment.orderId}`);

  } catch (error) {
    console.error('Failed to process failed payment:', error);
  }
}
