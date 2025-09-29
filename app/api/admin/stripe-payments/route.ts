import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stripe-payments - Get real Stripe payment data
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ 
      payments: [],
      summary: { totalAmount: 0, successful: 0, pending: 0, failed: 0 }
    });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('Stripe not configured, returning mock data');
      return NextResponse.json({
        payments: [],
        summary: { totalAmount: 0, successful: 0, pending: 0, failed: 0 }
      });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    console.log('Fetching Stripe payments...');

    // Fetch payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: Math.min(limit, 100),
      expand: ['data.customer', 'data.payment_method']
    });

    // Fetch orders from database for additional information
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { course: true } },
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Format payments data
    const payments = await Promise.all(paymentIntents.data.map(async (pi: any) => {
      // Find matching order by amount or metadata
      const matchingOrder = orders.find(order => 
        Math.abs(order.totalAmount - (pi.amount / 100)) < 0.01 || // Match by amount
        pi.metadata?.orderId === order.id || // Match by order ID in metadata
        pi.metadata?.orderNumber === order.orderNumber // Match by order number
      );

      // Get product description from order items or Stripe metadata
      let productDescription = pi.description || 'Ingen beskrivning';
      
      // First try to get from Stripe metadata (for newer orders)
      if (pi.metadata?.courseNames) {
        productDescription = pi.metadata.courseNames;
      } 
      // Fallback to database order items (for older orders)
      else if (matchingOrder && matchingOrder.items.length > 0) {
        const courseNames = matchingOrder.items
          .map((item: any) => item.course?.name || item.name)
          .filter((name: string) => name)
          .join(', ');
        productDescription = courseNames || productDescription;
      }

      // Get payment method details
      let paymentMethodDetails = undefined;
      if (pi.payment_method) {
        const pm = pi.payment_method;
        paymentMethodDetails = {
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year
          } : null
        };
      } else if (pi.payment_method_types?.[0]) {
        paymentMethodDetails = {
          type: pi.payment_method_types[0],
          card: null
        };
      }

      return {
        id: pi.id,
        amount: pi.amount, // Keep in cents for consistency
        currency: pi.currency.toUpperCase(),
        status: pi.status,
        created: new Date(pi.created * 1000).toISOString(),
        description: productDescription,
        customer: {
          email: pi.receipt_email || pi.customer?.email || pi.metadata?.customerEmail || matchingOrder?.user?.email || 'Ingen e-post',
          name: pi.customer?.name || pi.metadata?.customerName || matchingOrder?.user?.name || 'Inget namn',
          metadata: {
            country: pi.customer?.address?.country || 'SE',
            course: pi.metadata?.courseNames || matchingOrder?.items?.[0]?.course?.name,
            userId: matchingOrder?.userId,
            totalItems: pi.metadata?.totalItems
          }
        },
        paymentMethod: paymentMethodDetails,
        receiptUrl: pi.charges?.data?.[0]?.receipt_url,
        refunded: pi.amount_refunded > 0,
        refundAmount: pi.amount_refunded,
        failureCode: pi.last_payment_error?.code,
        failureMessage: pi.last_payment_error?.message,
        metadata: pi.metadata,
        orderInfo: matchingOrder ? {
          orderNumber: matchingOrder.orderNumber,
          items: matchingOrder.items.map(item => ({
            name: item.course?.name || item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type
          }))
        } : null
      };
    }));

    // Calculate summary statistics
    const successfulPayments = payments.filter((p: any) => p.status === 'succeeded');
    const totalAmountCents = successfulPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    
    const summary = {
      totalAmount: totalAmountCents, // Keep in cents
      successful: successfulPayments.length,
      pending: payments.filter((p: any) => p.status === 'processing' || p.status === 'requires_action').length,
      failed: payments.filter((p: any) => p.status === 'failed' || p.status === 'canceled').length,
      total: payments.length,
      avgOrderValue: successfulPayments.length > 0 ? totalAmountCents / successfulPayments.length : 0,
      refundedAmount: payments.reduce((sum: number, p: any) => sum + (p.refundAmount || 0), 0),
      conversionRate: payments.length > 0 ? Math.round((successfulPayments.length / payments.length) * 100) : 0,
      topCourse: 'Functional Basics' // This could be calculated from order data
    };

    console.log('Stripe payments fetched successfully:', { count: payments.length });

    return NextResponse.json({
      payments,
      summary
    });

  } catch (error) {
    console.error('Failed to fetch Stripe payments:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch payment data',
      payments: [],
      summary: { totalAmount: 0, successful: 0, pending: 0, failed: 0 }
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/stripe-payments - Refund a payment
 */
export async function POST(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: false, error: 'Not available during build' });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({
        error: 'Payment Intent ID is required'
      }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'Stripe not configured'
      }, { status: 500 });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    console.log('Processing refund request:', { paymentIntentId, amount, reason });

    // Create refund
    const refundParams: any = {
      payment_intent: paymentIntentId,
      reason
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);

    console.log('Refund processed successfully:', {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
        status: refund.status,
        created: new Date(refund.created * 1000).toISOString(),
        reason: refund.reason
      },
      message: `Återbetalning på ${refund.amount / 100} ${refund.currency.toUpperCase()} har skapats`
    });

  } catch (error) {
    console.error('Refund processing failed:', error);

    return NextResponse.json({
      error: 'Failed to process refund',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 