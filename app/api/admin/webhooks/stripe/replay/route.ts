import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId krävs' }, { status: 400 });

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: 'Stripe saknas' }, { status: 500 });
    const stripe = require('stripe')(secretKey);

    // Re-fetch session and trigger our verify-fallback path by returning it to caller
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({ ok: true, session: {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      customer_email: session.customer_details?.email || session.customer_email || null
    }});
  } catch (e) {
    console.error('Webhook replay error:', e);
    return NextResponse.json({ error: 'Replay failed' }, { status: 500 });
  }
}


