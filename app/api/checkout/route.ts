import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, checkoutRateLimit } from '@/app/lib/rate-limit';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  return withRateLimit(req, checkoutRateLimit, async () => {
  try {
    const body = await req.json();
    const { items, customer, couponCode } = body as {
      items: Array<{ id: string; name: string; price: number; quantity: number; type: 'course'|'book' }>
      customer?: { email?: string; name?: string; id?: string }
      couponCode?: string
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Inga varor i varukorgen' }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe är inte konfigurerat' }, { status: 500 });
    }

    const stripe = require('stripe')(secretKey);

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, i) => sum + Math.round(i.price * 100) * i.quantity, 0);

    // Optional: validate coupon and compute discount amount in öre
    let discountAmount = 0;
    let stripeDiscount: any | null = null;
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      const coupon = await prisma.coupon.findUnique({ where: { code } });
      const now = new Date();
      if (coupon && coupon.active && (!coupon.startsAt || now >= coupon.startsAt) && (!coupon.expiresAt || now <= coupon.expiresAt) && (coupon.usageLimit == null || coupon.timesUsed < coupon.usageLimit)) {
        const applicableIds = coupon.applicableCourseIds && Array.isArray(coupon.applicableCourseIds) ? coupon.applicableCourseIds as string[] : null;
        const applicableItems = applicableIds && applicableIds.length > 0 ? items.filter(i => applicableIds.includes(i.id)) : items;
        const applicableSubtotal = applicableItems.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
        if (applicableSubtotal > 0) {
          if (coupon.type === 'percent') {
            discountAmount = Math.floor(applicableSubtotal * (coupon.amount / 100));
          } else {
            discountAmount = Math.floor(coupon.amount * 100);
          }
          if (discountAmount > applicableSubtotal) discountAmount = applicableSubtotal;

          // Create a one-time Stripe coupon for the exact amount off if fixed, or percent_off if percent
          if (discountAmount > 0) {
            if (coupon.type === 'percent') {
              const createdCoupon = await stripe.coupons.create({ percent_off: coupon.amount, duration: 'once' });
              stripeDiscount = { coupon: createdCoupon.id };
            } else {
              const createdCoupon = await stripe.coupons.create({ amount_off: discountAmount, currency: 'sek', duration: 'once' });
              stripeDiscount = { coupon: createdCoupon.id };
            }
          }
        }
      }
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'sek',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const sessionParams: any = {
      mode: 'payment',
      payment_method_types: ['card', 'swish'],
      line_items,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: customer?.email,
      metadata: {
        items: JSON.stringify(items),
        website: 'ulrika-functional-foods',
        orderType: 'course_purchase',
        couponCode: couponCode || ''
      }
    };

    if (stripeDiscount) {
      sessionParams.discounts = [stripeDiscount];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Create Checkout Session error:', err);
    return NextResponse.json({ error: err?.message || 'Kunde inte skapa betalning' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
  });
} 