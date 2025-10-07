import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '../../../lib/payment';
import { emailService } from '../../../lib/email';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const paymentService = new PaymentService();

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const providerHeader = request.headers.get('x-payment-provider') || '';
    const stripeSig = request.headers.get('stripe-signature');

    // If this is a Stripe webhook, handle it directly using Stripe's signature
    if (stripeSig) {
      return await handleStripeWebhook(body, stripeSig);
    }

    const provider = providerHeader.toLowerCase();

    const payload = JSON.parse(body);

    // Process webhook based on provider (non-Stripe)
    switch (provider) {
      case 'klarna':
        return await handleKlarnaWebhook(payload);
      case 'swish':
        return await handleSwishWebhook(payload);
      default:
        console.warn(`Unknown or missing payment provider header: ${providerHeader}`);
        return NextResponse.json({ received: true });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyWebhookSignature(
  body: string, 
  signature: string, 
  provider: string
): Promise<boolean> {
  // In development, skip signature verification
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // TODO: Implement signature verification for each provider
  switch (provider) {
    case 'klarna':
      // Implement Klarna signature verification
      // return verifyKlarnaSignature(body, signature);
      break;
    case 'stripe':
      // Implement Stripe signature verification
      // return verifyStripeSignature(body, signature);
      break;
    case 'swish':
      // Implement Swish signature verification
      // return verifySwishSignature(body, signature);
      break;
  }

  return false;
}

async function handleKlarnaWebhook(payload: any): Promise<NextResponse> {
  try {
    const { order_id, event_type } = payload;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Find payment by external ID
    const payment = await prisma.payment.findFirst({
      where: { externalId: order_id },
      include: { order: { include: { items: true } } }
    });

    if (!payment) {
      console.warn(`Payment not found for Klarna order: ${order_id}`);
      return NextResponse.json({ received: true });
    }

    switch (event_type) {
      case 'checkout.order.completed':
      case 'order.captured':
        await completePayment(payment.id, payload);
        break;
      case 'order.cancelled':
      case 'order.expired':
        await cancelPayment(payment.id, payload);
        break;
      default:
        console.log(`Unhandled Klarna event: ${event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Klarna webhook error:', error);
    return NextResponse.json(
      { error: 'Klarna webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleStripeWebhook(body: string, signature: string): Promise<NextResponse> {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event;

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Stripe webhook event received:', event.type);

    // Hantera olika typer av Stripe-events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      case 'payment_intent.processing':
        await handlePaymentProcessing(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Stripe webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  console.log('💰 Payment succeeded:', paymentIntent.id);
  
  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id },
    include: { order: { include: { items: true } } }
  });

  if (payment) {
    // Verify amount matches
    const expectedAmountInOre = Math.round(payment.order.totalAmount * 100);
    const actualAmountInOre = paymentIntent.amount;
    
    console.log('🔍 Amount Verification:', {
      orderNumber: payment.order.orderNumber,
      expectedInSEK: payment.order.totalAmount,
      expectedInOre: expectedAmountInOre,
      actualInOre: actualAmountInOre,
      actualInSEK: actualAmountInOre / 100,
      match: Math.abs(expectedAmountInOre - actualAmountInOre) <= 1,
      difference: actualAmountInOre - expectedAmountInOre
    });
    
    if (Math.abs(expectedAmountInOre - actualAmountInOre) > 1) {
      console.error('❌ AMOUNT MISMATCH DETECTED!', {
        expected: expectedAmountInOre,
        actual: actualAmountInOre,
        difference: actualAmountInOre - expectedAmountInOre,
        orderNumber: payment.order.orderNumber
      });
    }
    
    await completePayment(payment.id, paymentIntent);
  } else {
    console.error('❌ Payment not found for PaymentIntent:', paymentIntent.id);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);
  
  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id }
  });

  if (payment) {
    await failPayment(payment.id, paymentIntent);
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  console.log('Payment canceled:', paymentIntent.id);
  
  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id }
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
        gatewayResponse: paymentIntent,
        processedAt: new Date()
      }
    });
  }
}

async function handlePaymentProcessing(paymentIntent: any) {
  console.log('Payment processing:', paymentIntent.id);
  
  const payment = await prisma.payment.findFirst({
    where: { externalId: paymentIntent.id }
  });

  if (payment && payment.status !== 'PROCESSING') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PROCESSING',
        gatewayResponse: paymentIntent
      }
    });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log('🎉 Checkout session completed:', {
      sessionId: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      payment_status: session.payment_status,
      has_payment_intent: !!session.payment_intent
    });

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Handle free orders (0 kr with coupon) - no payment_intent is created
    if (session.amount_total === 0 || !session.payment_intent) {
      console.log('💰 Free order detected (0 kr) - processing without payment_intent');
      await handleFreeOrder(session);
      return;
    }

    // Handle paid orders with payment_intent
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await handlePaymentSuccess(paymentIntent);
  } catch (error) {
    console.error('Failed to handle checkout.session.completed:', error);
  }
}

async function handleFreeOrder(session: any) {
  console.log('📦 Processing free order from session:', session.id);
  
  try {
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = session.customer_details?.name || customerEmail?.split('@')[0] || 'Kund';
    
    if (!customerEmail) {
      console.error('❌ No customer email in session');
      return;
    }

    // Parse metadata to get items
    const metadata = session.metadata || {};
    let items: any[] = [];
    
    try {
      if (metadata.items) {
        items = JSON.parse(metadata.items);
      }
    } catch (e) {
      console.error('Failed to parse session metadata items:', e);
      return;
    }

    if (items.length === 0) {
      console.error('❌ No items in session metadata');
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Get or create user
      let user = await tx.user.findUnique({
        where: { email: customerEmail }
      });

      const isNewUser = !user;
      let temporaryPassword = '';

      if (!user) {
        // Create new user with temporary password
        const bcrypt = require('bcryptjs');
        temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        
        user = await tx.user.create({
          data: {
            email: customerEmail,
            name: customerName,
            password: hashedPassword,
            role: 'customer',
            mustChangePassword: true
          }
        });
        console.log(`✅ New user created: ${user.email}`);
      } else {
        console.log(`✅ Existing user found: ${user.email}`);
      }

      // Create order
      const orderNumber = `STRIPE-FREE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: 'COMPLETED',
          totalAmount: 0,
          currency: 'SEK',
          items: {
            create: items.map((item: any) => ({
              courseId: null, // Will be set when we find the course
              name: item.name,
              price: 0,
              quantity: item.quantity || 1,
              type: item.type || 'course'
            }))
          }
        },
        include: { items: true }
      });

      console.log(`✅ Order created: ${order.orderNumber}`);

      // Increment coupon usage if applicable (only once in webhook, not in verify endpoint)
      if (metadata.couponCode) {
        try {
          const couponCode = metadata.couponCode.toUpperCase().trim();
          await tx.coupon.update({
            where: { code: couponCode },
            data: { timesUsed: { increment: 1 } }
          });
          console.log(`✅ Incremented usage for coupon: ${couponCode}`);
        } catch (couponError) {
          console.warn('⚠️ Failed to increment coupon usage:', couponError);
        }
      }

      // Create purchases for courses
      const purchasedCourses = [];
      for (const item of items.filter((i: any) => i.type === 'course')) {
        // Find course by name
        const course = await tx.courseProduct.findFirst({
          where: { 
            name: {
              in: [
                item.name,
                item.name.replace('Functional Insulin balance/Energy', 'Functional Energy'),
                item.name.replace('Functional Gut Health/Flow', 'Functional Flow')
              ]
            }
          }
        });

        if (!course) {
          console.warn(`⚠️ Course not found: ${item.name}`);
          continue;
        }

        // Check if purchase already exists
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id
            }
          }
        });

        if (!existingPurchase) {
          const purchase = await tx.purchase.create({
            data: {
              userId: user.id,
              courseId: course.id,
              amount: 0,
              status: 'completed',
              orderId: order.id,
              accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
          });
          purchasedCourses.push(course);
          console.log(`✅ Purchase created for: ${course.name}`);
        }
      }

      // Send order confirmation email to ALL users (new and existing)
      try {
        await emailService.sendOrderConfirmation({
          customerEmail: user.email,
          customerName: user.name || user.email,
          orderNumber: order.orderNumber,
          totalAmount: 0,
          courses: purchasedCourses.map(c => ({ name: c.name, price: 0 })),
          // Only include login credentials for NEW users
          loginCredentials: (isNewUser && temporaryPassword) ? {
            email: user.email,
            password: temporaryPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se'}/login`
          } : undefined
        });
        console.log(`✅ Order confirmation email sent to: ${user.email} (${isNewUser ? 'new user' : 'existing user'})`);
      } catch (emailError) {
        console.error('❌ Failed to send order confirmation email:', emailError);
      }
    });

    console.log('✅ Free order processed successfully');
  } catch (error) {
    console.error('❌ Error processing free order:', error);
  }
}

async function handleSwishWebhook(payload: any): Promise<NextResponse> {
  try {
    const { id, status } = payload;

    const payment = await prisma.payment.findFirst({
      where: { externalId: id },
      include: { order: { include: { items: true } } }
    });

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    switch (status) {
      case 'PAID':
        await completePayment(payment.id, payload);
        break;
      case 'DECLINED':
      case 'ERROR':
        await failPayment(payment.id, payload);
        break;
      case 'CANCELLED':
        await cancelPayment(payment.id, payload);
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Swish webhook error:', error);
    return NextResponse.json(
      { error: 'Swish webhook processing failed' },
      { status: 500 }
    );
  }
}

async function completePayment(paymentId: string, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        gatewayResponse: webhookData
      },
      include: { 
        order: { 
          include: { 
            items: true,
            user: true
          } 
        } 
      }
    });

    // Update order
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED' }
    });

    // Get user and check if they need login credentials
    const user = payment.order.user;
    let needsLoginCredentials = false;
    let temporaryPassword = '';

    // Check if user was created recently (within last hour) - indicates new user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.createdAt > oneHourAgo) {
      needsLoginCredentials = true;
      // Generate temporary password
      temporaryPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      
      // Update user with temporary password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, mustChangePassword: true }
      });
    }

    // Create purchases for courses
    const purchasedCourses = [];
    for (const item of payment.order.items) {
      if (item.type === 'course' && item.courseId) {
        // Check if purchase already exists
        const existingPurchase = await tx.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: payment.order.userId,
              courseId: item.courseId
            }
          }
        });

        if (!existingPurchase) {
          const purchase = await tx.purchase.create({
            data: {
              userId: payment.order.userId,
              courseId: item.courseId,
              amount: item.price * item.quantity,
              status: 'completed',
              orderId: payment.order.id,
              accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            },
            include: {
              course: true
            }
          });
          purchasedCourses.push(purchase.course);
        }
      }
    }

    // Send order confirmation email with login credentials if needed
    try {
      const emailData = {
        customerEmail: user.email,
        customerName: user.name || user.email.split('@')[0],
        orderNumber: payment.order.orderNumber,
        totalAmount: payment.order.totalAmount,
        courses: purchasedCourses.map(course => ({
          name: course.name,
          price: course.price
        })),
        ...(needsLoginCredentials && {
          loginCredentials: {
            email: user.email,
            password: temporaryPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se'}/login`
          }
        })
      };

      await emailService.sendOrderConfirmation(emailData);
      console.log('Order confirmation email sent with login credentials:', user.email);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    console.log(`Payment completed for order ${payment.order.orderNumber}`);
  });
}

async function failPayment(paymentId: string, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        gatewayResponse: webhookData,
        failureReason: webhookData.error?.message || 'Payment failed'
      }
    });

    // Update order
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (payment) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' }
      });

      console.log(`Payment failed for order ${payment.order.orderNumber}`);
    }
  });
}

async function cancelPayment(paymentId: string, webhookData: any) {
  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CANCELLED',
        gatewayResponse: webhookData
      }
    });

    // Update order
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (payment) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' }
      });

      console.log(`Payment cancelled for order ${payment.order.orderNumber}`);
    }
  });
} 