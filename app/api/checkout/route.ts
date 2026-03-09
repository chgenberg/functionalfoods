import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, checkoutRateLimit } from '@/app/lib/rate-limit';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return withRateLimit(req, checkoutRateLimit, async () => {
    try {
      const body = await req.json();
      const { items, customer, couponCode, attribution } = body as {
        items: Array<{ id: string; name: string; price: number; quantity: number; type: 'course' | 'book' }>;
        customer?: { email?: string; name?: string; id?: string };
        couponCode?: string;
        attribution?: {
          gclid?: string; gbraid?: string; wbraid?: string;
          fbclid?: string;
          mc_cid?: string; mc_eid?: string;
          utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string;
          ref?: string; ts?: number;
        };
      };

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'Inga varor i varukorgen' }, { status: 400 });
      }

      const customerName = (customer?.name || '').trim();
      const customerEmail = (customer?.email || '').trim();

      if (!customerName) {
        return NextResponse.json({ error: 'Namn är obligatoriskt' }, { status: 400 });
      }
      if (!customerEmail) {
        return NextResponse.json({ error: 'E-postadress är obligatorisk' }, { status: 400 });
      }

      // --- hämta produkter och validera items som du redan gör ---
      const courseProducts = await prisma.courseProduct.findMany();

      const slugify = (s: string) => s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]+/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const productMap = new Map<string, any>();

      for (const p of courseProducts) {
        const key1 = p.name.toLowerCase().replace(/\s+/g, '-');
        const key2 = slugify(p.name);
        productMap.set(key1, { ...p, type: 'course', vatRate: 0.25 });
        productMap.set(key2, { ...p, type: 'course', vatRate: 0.25 });
        productMap.set(p.id, { ...p, type: 'course', vatRate: 0.25 });
        productMap.set(p.name.toLowerCase(), { ...p, type: 'course', vatRate: 0.25 });
        productMap.set(p.name, { ...p, type: 'course', vatRate: 0.25 });
      }

      const bookProducts = [
        {
          id: 'brodboken-2026',
          name: 'Baka Glutenfritt – E-bok',
          price: 65.09,
          basePrice: 65.09,
          type: 'book' as const,
          vatRate: 0.06,
        },
      ];

      for (const p of bookProducts) {
        productMap.set(p.id, p);
        productMap.set(p.name.toLowerCase(), p);
        productMap.set(p.name, p);
        productMap.set(slugify(p.name), p);
      }

      const now = new Date();

      const validatedItems = items.map(item => {
        let product = productMap.get(item.id);

        if (!product && item.name) {
          product =
            productMap.get(item.name.toLowerCase()) ||
            productMap.get(item.name) ||
            courseProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());

          if (product && !product.vatRate) {
            product = { ...product, type: 'course', vatRate: 0.25 };
          }
        }

        if (!product) {
          throw new Error(`Produkten med id "${item.id}" och namn "${item.name}" hittades inte.`);
        }

        const basePrice = typeof product.basePrice === 'number' ? product.basePrice : product.price;
        const saleActive = product.salePrice && (
          (!product.saleStartsAt || new Date(product.saleStartsAt) <= now) &&
          (!product.saleEndsAt || new Date(product.saleEndsAt) >= now)
        );

        const effectivePrice = saleActive ? product.salePrice as number : basePrice;

        return {
          ...item,
          id: product.id,
          name: product.name,
          type: product.type || 'course',
          price: effectivePrice, // ex moms
          vatRate: product.vatRate || 0.25,
        };
      });

      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json({ error: 'Stripe är inte konfigurerat' }, { status: 500 });
      }

      const stripe = require('stripe')(secretKey);

      const subtotal = validatedItems.reduce((sum: number, i) => {
        const vatRate = i.vatRate || 0.25;
        const grossInOre = Math.round(i.price * (1 + vatRate) * 100);
        return sum + grossInOre * i.quantity;
      }, 0);

      let discountAmount = 0;
      let stripeDiscount: any | null = null;
      let appliedCouponCode: string | null = null;

      if (couponCode) {
        const code = couponCode.toUpperCase().trim();
        const coupon = await prisma.coupon.findUnique({ where: { code } });
        const now = new Date();

        if (
          coupon &&
          coupon.active &&
          (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.expiresAt || now <= coupon.expiresAt) &&
          (coupon.usageLimit == null || coupon.timesUsed < coupon.usageLimit)
        ) {
          const applicableIds = coupon.applicableCourseIds && Array.isArray(coupon.applicableCourseIds)
            ? coupon.applicableCourseIds as string[]
            : null;

          const applicableItems = applicableIds && applicableIds.length > 0
            ? validatedItems.filter(i => applicableIds.includes(i.id))
            : validatedItems;

          const applicableSubtotalExVat = applicableItems.reduce(
            (sum, i) => sum + Math.round(i.price * 100) * i.quantity,
            0
          );

          const applicableSubtotalGross = applicableItems.reduce((sum, i) => {
            const vatRate = i.vatRate || 0.25;
            const grossInOre = Math.round(i.price * (1 + vatRate) * 100);
            return sum + grossInOre * i.quantity;
          }, 0);

          if (applicableSubtotalGross > 0) {
            if (coupon.type === 'percent') {
              discountAmount = Math.floor(applicableSubtotalGross * (coupon.amount / 100));
            } else {
              const vatMultiplier = applicableSubtotalExVat > 0
                ? applicableSubtotalGross / applicableSubtotalExVat
                : 1;
              discountAmount = Math.floor(coupon.amount * 100 * vatMultiplier);
            }

            if (discountAmount > applicableSubtotalGross) {
              discountAmount = applicableSubtotalGross;
            }

            if (discountAmount > 0) {
              appliedCouponCode = code;

              if (coupon.type === 'percent') {
                const createdCoupon = await stripe.coupons.create({
                  percent_off: coupon.amount,
                  duration: 'once',
                });
                stripeDiscount = { coupon: createdCoupon.id };
              } else {
                const createdCoupon = await stripe.coupons.create({
                  amount_off: discountAmount,
                  currency: 'sek',
                  duration: 'once',
                });
                stripeDiscount = { coupon: createdCoupon.id };
              }
            }
          }
        }
      }

      const finalAmount = subtotal - discountAmount;
      const orderId = `FF-STRIPE-${Date.now()}-${randomUUID().slice(0, 8)}`;

      // Skapa intern pending order först
      const order = await prisma.order.create({
        data: {
          id: orderId,
          status: 'PENDING',
          paymentProvider: 'stripe',
          totalAmount: finalAmount / 100, // lagra gross i SEK om det matchar er övriga modell
          customerEmail,
          customerName,
          couponCode: appliedCouponCode || '',
          metadata: {
            attribution: attribution || {},
            source: 'stripe_checkout',
            subtotalInOre: subtotal,
            discountInOre: discountAmount,
            finalInOre: finalAmount,
          },
          items: {
            create: validatedItems.map(item => ({
              productId: item.id,
              productName: item.name,
              productType: item.type,
              quantity: item.quantity,
              price: item.price, // ex moms SEK
              vatRate: item.vatRate,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      const line_items = validatedItems.map((item) => {
        const vatRate = item.vatRate || 0.25;
        const grossUnitAmount = Math.round(item.price * (1 + vatRate) * 100);

        return {
          price_data: {
            currency: 'sek',
            product_data: {
              name: item.name,
              metadata: {
                productId: item.id,
                productType: item.type,
                vatRate: String(item.vatRate),
              },
            },
            unit_amount: grossUnitAmount,
          },
          quantity: item.quantity,
        };
      });

      const origin =
        req.headers.get('origin') ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'http://localhost:3000';

      const sessionParams: any = {
        mode: 'payment',
        line_items,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
        customer_email: customerEmail,
        payment_method_types: ['card'],
        metadata: {
          orderId: order.id,
          website: 'ulrika-functional-foods',
          orderType: 'course_purchase',
          couponCode: appliedCouponCode || '',
          customerEmail,
          customerName,
          courseNames: validatedItems.map(item => item.name).join(', '),
          totalLines: String(validatedItems.length),
          totalQuantity: String(validatedItems.reduce((sum, i) => sum + i.quantity, 0)),
          gclid: attribution?.gclid || '',
          gbraid: attribution?.gbraid || '',
          wbraid: attribution?.wbraid || '',
          fbclid: attribution?.fbclid || '',
          mc_cid: attribution?.mc_cid || '',
          mc_eid: attribution?.mc_eid || '',
          utm_source: attribution?.utm_source || '',
          utm_medium: attribution?.utm_medium || '',
          utm_campaign: attribution?.utm_campaign || '',
          utm_term: attribution?.utm_term || '',
          utm_content: attribution?.utm_content || '',
        },
      };

      if (stripeDiscount) {
        sessionParams.discounts = [stripeDiscount];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripeSessionId: session.id,
          checkoutOrderId: session.id,
        },
      });

      return NextResponse.json({ url: session.url });
    } catch (err: any) {
      console.error('Create Checkout Session error:', err);
      return NextResponse.json(
        { error: err?.message || 'Kunde inte skapa betalning' },
        { status: 500 }
      );
    }
  });
}
