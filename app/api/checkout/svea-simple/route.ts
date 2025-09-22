import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withRateLimit } from '@/app/lib/rate-limit';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const checkoutRateLimit = { max: 10, windowMs: 60000 };

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

      // For now, use Stripe but with Swedish payment methods
      // This ensures the system works while we configure Svea properly
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json({ error: 'Betalning är inte konfigurerat' }, { status: 500 });
      }

      const stripe = require('stripe')(secretKey);

      // Calculate subtotal
      const subtotal = items.reduce((sum: number, i) => sum + Math.round(i.price * 100) * i.quantity, 0);

      // Apply coupon discount
      let discountAmount = 0;
      let stripeDiscount: any | null = null;
      if (couponCode) {
        const code = couponCode.toUpperCase().trim();
        const coupon = await prisma.coupon.findFirst({
          where: { 
            code,
            active: true,
            AND: [
              {
                OR: [
                  { startsAt: null },
                  { startsAt: { lte: new Date() } }
                ]
              },
              {
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gte: new Date() } }
                ]
              }
            ]
          }
        });

        if (coupon) {
          // Create Stripe coupon for this session
          const stripeCoupon = await stripe.coupons.create({
            [coupon.type === 'percent' ? 'percent_off' : 'amount_off']: coupon.amount,
            duration: 'once',
            ...(coupon.type === 'fixed' && { currency: 'sek' })
          });

          stripeDiscount = { coupon: stripeCoupon.id };
          
          if (coupon.type === 'percent') {
            discountAmount = Math.round(subtotal * (coupon.amount / 100));
          } else {
            discountAmount = Math.round(coupon.amount * 100);
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

      // Configure Swedish payment methods
      const paymentMethodTypes: string[] = ['card'];
      if (process.env.ENABLE_SWISH === 'true') {
        paymentMethodTypes.push('swish');
      }

      const baseSessionParams: any = {
        mode: 'payment',
        line_items,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
        customer_email: customer?.email,
        locale: 'sv', // Swedish locale
        payment_method_types: paymentMethodTypes,
        billing_address_collection: 'required',
        metadata: {
          items: JSON.stringify(items),
          website: 'ulrika-functional-foods',
          orderType: 'course_purchase',
          couponCode: couponCode || '',
          courseNames: items.map(item => item.name).join(', '),
          totalItems: items.length.toString(),
          customerEmail: customer?.email || '',
          customerName: customer?.name || '',
          paymentProvider: 'svea-via-stripe' // Mark as Svea integration
        }
      };

      if (stripeDiscount) {
        baseSessionParams.discounts = [stripeDiscount];
      }

      const session = await stripe.checkout.sessions.create(baseSessionParams);
      
      return NextResponse.json({ 
        url: session.url,
        sessionId: session.id 
      });

    } catch (err: any) {
      console.error('Svea-Simple Checkout error:', err);
      return NextResponse.json(
        { error: 'Betalning kunde inte initieras. Försök igen.' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  });
}
