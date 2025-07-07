import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '../../../lib/payment';

const prisma = new PrismaClient();
const paymentService = new PaymentService();

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('signature') || '';
    const provider = request.headers.get('x-payment-provider') || '';

    // Verify webhook signature (implementation depends on provider)
    if (!await verifyWebhookSignature(body, signature, provider)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Process webhook based on provider
    switch (provider) {
      case 'klarna':
        return await handleKlarnaWebhook(payload);
      case 'stripe':
        return await handleStripeWebhook(payload);
      case 'swish':
        return await handleSwishWebhook(payload);
      default:
        console.warn(`Unknown payment provider: ${provider}`);
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

async function handleStripeWebhook(payload: any): Promise<NextResponse> {
  try {
    const { id, type, data } = payload;

    if (type === 'payment_intent.succeeded') {
      const paymentIntent = data.object;
      
      const payment = await prisma.payment.findFirst({
        where: { externalId: paymentIntent.id },
        include: { order: { include: { items: true } } }
      });

      if (payment) {
        await completePayment(payment.id, payload);
      }
    } else if (type === 'payment_intent.payment_failed') {
      const paymentIntent = data.object;
      
      const payment = await prisma.payment.findFirst({
        where: { externalId: paymentIntent.id }
      });

      if (payment) {
        await failPayment(payment.id, payload);
      }
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
      include: { order: { include: { items: true } } }
    });

    // Update order
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED' }
    });

    // Create purchases for courses
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
          await tx.purchase.create({
            data: {
              userId: payment.order.userId,
              courseId: item.courseId,
              amount: item.price * item.quantity,
              status: 'completed',
              orderId: payment.order.id
            }
          });
        }
      }
    }

    // TODO: Send confirmation email
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