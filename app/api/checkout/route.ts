import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer } = body as {
      items: Array<{ id: string; name: string; price: number; quantity: number; type: 'course'|'book' }>
      customer?: { email?: string; name?: string; id?: string }
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Inga varor i varukorgen' }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe är inte konfigurerat' }, { status: 500 });
    }

    const stripe = require('stripe')(secretKey);

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'sek',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
      // metadata per item kan läggas på product/price i Dashboard eller som metadata på sessionen
    }));

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: customer?.email,
      metadata: {
        items: JSON.stringify(items),
        website: 'ulrika-functional-foods',
        orderType: 'course_purchase'
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Create Checkout Session error:', err);
    return NextResponse.json({ error: err?.message || 'Kunde inte skapa betalning' }, { status: 500 });
  }
} 