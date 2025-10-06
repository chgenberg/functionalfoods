import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const session_id = req.nextUrl.searchParams.get('session_id');
    if (!session_id) return NextResponse.json({ error: 'session_id saknas' }, { status: 400 });

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe är inte konfigurerat' }, { status: 500 });
    }

    const stripe = require('stripe')(secretKey);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // NOTE: Coupon usage is incremented in webhook, not here
    // to avoid double-counting if this endpoint is called multiple times

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      customer_email: session.customer_details?.email || session.customer_email || null,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata
    });
  } catch (err: any) {
    console.error('Verify Checkout Session error:', err);
    return NextResponse.json({ error: err?.message || 'Kunde inte verifiera session' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 