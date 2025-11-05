import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const doStripeCheck = url.searchParams.get('check') === 'stripe';

  const swishEnvEnabled = process.env.ENABLE_SWISH === 'true' || process.env.STRIPE_ENABLE_SWISH === 'true';
  const stripeKeyPresent = !!process.env.STRIPE_SECRET_KEY;

  const result: any = {
    swishEnvEnabled,
    stripeKeyPresent,
    checkoutCurrency: 'sek',
  };

  if (doStripeCheck) {
    if (!stripeKeyPresent) {
      return NextResponse.json({ ...result, stripeSwish: { ok: false, reason: 'missing_stripe_key' } }, { status: 200 });
    }

    try {
      // Lazy require to avoid bundling in edge
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      // Create a lightweight PaymentIntent to test if Swish is enabled for the account.
      const pi = await stripe.paymentIntents.create({
        amount: 2000, // 20 SEK
        currency: 'sek',
        payment_method_types: ['swish'],
        description: 'Swish capability health check (no charge)',
      });

      // Immediately cancel for cleanliness
      try { await stripe.paymentIntents.cancel(pi.id); } catch {}

      result.stripeSwish = { ok: true };
      return NextResponse.json(result, { status: 200 });
    } catch (e: any) {
      const message = e?.message || 'Unknown error';
      // Common error if Swish is not enabled: payment_method_type_invalid
      const notEnabled = /payment method type.*swish/i.test(message) || /payment_method_type/i.test(message);
      result.stripeSwish = { ok: false, reason: notEnabled ? 'not_enabled' : 'error', message };
      return NextResponse.json(result, { status: 200 });
    }
  }

  return NextResponse.json(result, { status: 200 });
}


