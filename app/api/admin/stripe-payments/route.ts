import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, apiRateLimit } from '@/app/lib/rate-limit';
import { logInfo, logError } from '@/app/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stripe-payments - Get real Stripe payment data
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ payments: [] });
  }

  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const startingAfter = searchParams.get('starting_after');
      const status = searchParams.get('status'); // succeeded, pending, failed, etc.

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      logInfo('Fetching Stripe payments', { limit, status });

      // Fetch payment intents from Stripe
      const paymentIntentsParams: any = {
        limit: Math.min(limit, 100), // Stripe max is 100
        expand: ['data.customer', 'data.invoice']
      };

      if (startingAfter) {
        paymentIntentsParams.starting_after = startingAfter;
      }

      const paymentIntents = await stripe.paymentIntents.list(paymentIntentsParams);

      // Fetch charges for more detailed payment info
      const charges = await stripe.charges.list({
        limit: Math.min(limit, 100),
        expand: ['data.customer', 'data.payment_method']
      });

      // Combine and format data
      const payments = paymentIntents.data.map((pi: any) => {
        // Find corresponding charge
        const charge = charges.data.find((c: any) => c.payment_intent === pi.id);
        
        return {
          id: pi.id,
          amount: pi.amount / 100, // Convert from cents
          currency: pi.currency.toUpperCase(),
          status: pi.status,
          created: new Date(pi.created * 1000).toISOString(),
          description: pi.description,
          customer: {
            email: pi.receipt_email || charge?.billing_details?.email || 'Ingen email',
            name: charge?.billing_details?.name || 'Ingen namn'
          },
          paymentMethod: {
            type: charge?.payment_method_details?.type || 'Okänd',
            card: charge?.payment_method_details?.card ? {
              brand: charge.payment_method_details.card.brand,
              last4: charge.payment_method_details.card.last4,
              exp_month: charge.payment_method_details.card.exp_month,
              exp_year: charge.payment_method_details.card.exp_year
            } : null
          },
          metadata: pi.metadata,
          receiptUrl: charge?.receipt_url,
          refunded: charge?.refunded || false,
          refundAmount: charge?.amount_refunded ? charge.amount_refunded / 100 : 0,
          failureCode: pi.last_payment_error?.code,
          failureMessage: pi.last_payment_error?.message
        };
      });

      // Filter by status if requested
      const filteredPayments = status 
        ? payments.filter((p: any) => p.status === status)
        : payments;

      // Get summary statistics
      const summary = {
        total: paymentIntents.data.length,
        successful: payments.filter((p: any) => p.status === 'succeeded').length,
        pending: payments.filter((p: any) => p.status === 'processing' || p.status === 'requires_action').length,
        failed: payments.filter((p: any) => p.status === 'failed' || p.status === 'canceled').length,
        totalAmount: payments
          .filter((p: any) => p.status === 'succeeded')
          .reduce((sum: number, p: any) => sum + p.amount, 0),
        refundedAmount: payments.reduce((sum: number, p: any) => sum + p.refundAmount, 0)
      };

      logInfo('Stripe payments fetched successfully', { 
        count: filteredPayments.length,
        summary 
      });

      return NextResponse.json({
        payments: filteredPayments,
        summary,
        hasMore: paymentIntents.has_more,
        nextCursor: paymentIntents.data.length > 0 ? paymentIntents.data[paymentIntents.data.length - 1].id : null
      });

    } catch (error) {
      logError('Failed to fetch Stripe payments', { error });
      
      return NextResponse.json({
        error: 'Failed to fetch payment data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  });
}

/**
 * POST /api/admin/stripe-payments - Refund a payment
 */
export async function POST(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: false, error: 'Not available during build' });
  }

  return withRateLimit(request, apiRateLimit, async () => {
    try {
      // TODO: Add admin authentication check
      
      const { paymentIntentId, amount, reason = 'requested_by_customer' } = await request.json();

      if (!paymentIntentId) {
        return NextResponse.json({
          error: 'Payment Intent ID is required'
        }, { status: 400 });
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      logInfo('Processing refund request', { paymentIntentId, amount, reason });

      // Create refund
      const refundParams: any = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundParams);

      logInfo('Refund processed successfully', {
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
      logError('Refund processing failed', { error });

      return NextResponse.json({
        error: 'Failed to process refund',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  });
} 