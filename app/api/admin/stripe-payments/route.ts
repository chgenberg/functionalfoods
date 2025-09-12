import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';

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
      expand: ['data.customer']
    });

    // Format payments data
    const payments = paymentIntents.data.map((pi: any) => ({
      id: pi.id,
      amount: pi.amount / 100, // Convert from cents
      currency: pi.currency.toUpperCase(),
      status: pi.status,
      created: new Date(pi.created * 1000).toISOString(),
      description: pi.description || 'No description',
      customer: {
        email: pi.receipt_email || pi.customer?.email || 'No email',
        name: pi.customer?.name || 'No name'
      },
      paymentMethod: pi.payment_method_types?.[0] ? {
        type: pi.payment_method_types[0],
        card: null // Card details would need separate API call
      } : undefined,
      metadata: pi.metadata,
      refunded: false,
      refundAmount: 0
    }));

    // Calculate summary statistics
    const summary = {
      totalAmount: payments
        .filter((p: any) => p.status === 'succeeded')
        .reduce((sum: number, p: any) => sum + p.amount, 0),
      successful: payments.filter((p: any) => p.status === 'succeeded').length,
      pending: payments.filter((p: any) => p.status === 'processing' || p.status === 'requires_action').length,
      failed: payments.filter((p: any) => p.status === 'failed' || p.status === 'canceled').length
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