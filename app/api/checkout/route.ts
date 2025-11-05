import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, checkoutRateLimit } from '@/app/lib/rate-limit';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return withRateLimit(req, checkoutRateLimit, async () => {
  try {
    const body = await req.json();
    const { items, customer, couponCode, attribution } = body as {
      items: Array<{ id: string; name: string; price: number; quantity: number; type: 'course'|'book' }>
      customer?: { email?: string; name?: string; id?: string }
      couponCode?: string
      attribution?: {
        gclid?: string; gbraid?: string; wbraid?: string;
        utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_term?: string; utm_content?: string;
        ref?: string; ts?: number;
      }
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Inga varor i varukorgen' }, { status: 400 });
    }

    // --- SECURITY FIX: Fetch product data from database ---
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
      productMap.set(key1, p);
      productMap.set(key2, p);
      productMap.set(p.id, p); // allow using DB id directly
      productMap.set(p.name.toLowerCase(), p); // exact name match (case-insensitive)
      productMap.set(p.name, p); // exact name match (case-sensitive)
    }

    // Validate and enrich items with server-side data
    const now = new Date();
    const validatedItems = items.map(item => {
      let product = productMap.get(item.id);
      // Fallback: try to match by name if ID didn't match
      if (!product && item.name) {
        product = productMap.get(item.name.toLowerCase()) || 
                  productMap.get(item.name) ||
                  courseProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
      }
      if (!product) {
        throw new Error(`Produkten med id "${item.id}" och namn "${item.name}" hittades inte.`);
      }
      // Determine effective price (excl. VAT) using campaign if active
      const basePrice = typeof product.basePrice === 'number' ? product.basePrice : product.price;
      const saleActive = product.salePrice && (
        (!product.saleStartsAt || new Date(product.saleStartsAt) <= now) &&
        (!product.saleEndsAt || new Date(product.saleEndsAt) >= now)
      );
      const effectivePrice = saleActive ? (product.salePrice as number) : basePrice;
      return {
        ...item,
        price: effectivePrice, // Use dynamic price (campaign-aware), excl. VAT
        name: product.name,   // Use name from database
      };
    });
    // --- END SECURITY FIX ---

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe är inte konfigurerat' }, { status: 500 });
    }

    const stripe = require('stripe')(secretKey);

    // Calculate subtotal using price INCLUDING VAT (25%) for Stripe display
    const VAT_RATE = 0.25;
    const subtotal = validatedItems.reduce((sum: number, i) => {
      const grossInOre = Math.round(i.price * (1 + VAT_RATE) * 100);
      return sum + grossInOre * i.quantity;
    }, 0);

    // Optional: validate coupon and compute discount amount in öre
    let discountAmount = 0;
    let stripeDiscount: any | null = null;
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      const coupon = await prisma.coupon.findUnique({ where: { code } });
      const now = new Date();
      if (coupon && coupon.active && (!coupon.startsAt || now >= coupon.startsAt) && (!coupon.expiresAt || now <= coupon.expiresAt) && (coupon.usageLimit == null || coupon.timesUsed < coupon.usageLimit)) {
        const applicableIds = coupon.applicableCourseIds && Array.isArray(coupon.applicableCourseIds) ? (coupon.applicableCourseIds as string[]) : null;
        const applicableItems = applicableIds && applicableIds.length > 0 ? validatedItems.filter(i => applicableIds.includes(i.id)) : validatedItems;
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

    const line_items = validatedItems.map((item) => {
      const grossUnitAmount = Math.round(item.price * (1 + VAT_RATE) * 100);
      return {
        price_data: {
          currency: 'sek',
          product_data: { name: item.name },
          // Charge price including VAT so Checkout shows 2295 kr instead of 1836 kr
          unit_amount: grossUnitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Log checkout details for verification
    console.log('🔍 Stripe Checkout Debug (gross incl. VAT):', {
      items: validatedItems.map(i => ({
        name: i.name,
        priceExVatSEK: i.price,
        priceInclVatSEK: Math.round(i.price * (1 + VAT_RATE)),
        quantity: i.quantity,
        stripeUnitAmount: Math.round(i.price * (1 + VAT_RATE) * 100),
        totalInOre: Math.round(i.price * (1 + VAT_RATE) * 100) * i.quantity,
        totalInSEK: Math.round(i.price * (1 + VAT_RATE)) * i.quantity
      })),
      subtotalInOre: subtotal,
      subtotalInSEK: subtotal / 100,
      discountInOre: discountAmount,
      discountInSEK: discountAmount / 100,
      finalInOre: subtotal - discountAmount,
      finalInSEK: (subtotal - discountAmount) / 100,
      couponCode: couponCode || 'none'
    });

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Configure allowed payment methods explicitly (Stripe Checkout does not support automatic_payment_methods)
    // Swish is available via Stripe for Swedish customers when currency is SEK
    // Enable it in Stripe Dashboard: Settings > Payment methods > Swish
    const paymentMethodTypes: string[] = ['card'];
    
    // Enable Swish for Swedish customers (SEK currency required)
    // Swish will automatically appear for Swedish customers in Stripe Checkout
    if (process.env.ENABLE_SWISH === 'true' || process.env.STRIPE_ENABLE_SWISH === 'true') {
      paymentMethodTypes.push('swish');
      console.log('✅ Swish payment method enabled for checkout');
    }

    const baseSessionParams: any = {
      mode: 'payment',
      line_items,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: customer?.email,
      metadata: {
        items: JSON.stringify(validatedItems), // Use validated items in metadata
        website: 'ulrika-functional-foods',
        orderType: 'course_purchase',
        couponCode: couponCode || '',
        courseNames: validatedItems.map(item => item.name).join(', '),
        totalItems: validatedItems.length.toString(),
        customerEmail: customer?.email || '',
        customerName: customer?.name || '',
        // Attribution (flattened for Stripe metadata limits)
        gclid: attribution?.gclid || '',
        gbraid: attribution?.gbraid || '',
        wbraid: attribution?.wbraid || '',
        utm_source: attribution?.utm_source || '',
        utm_medium: attribution?.utm_medium || '',
        utm_campaign: attribution?.utm_campaign || '',
        utm_term: attribution?.utm_term || '',
        utm_content: attribution?.utm_content || ''
      }
    };

    if (stripeDiscount) {
      baseSessionParams.discounts = [stripeDiscount];
    }

    // Try with configured methods first
    try {
      const session = await stripe.checkout.sessions.create({
        ...baseSessionParams,
        payment_method_types: paymentMethodTypes
      });
      return NextResponse.json({ url: session.url });
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();
      const isSwishInvalid = msg.includes('payment method type') && msg.includes('swish');
      if (isSwishInvalid && paymentMethodTypes.includes('swish')) {
        console.warn('Swish not available. Retrying Checkout Session with card only.');
        const session = await stripe.checkout.sessions.create({
          ...baseSessionParams,
          payment_method_types: ['card']
        });
        return NextResponse.json({ url: session.url });
      }
      throw err;
    }
  } catch (err: any) {
    console.error('Create Checkout Session error:', err);
    return NextResponse.json({ error: err?.message || 'Kunde inte skapa betalning' }, { status: 500 });
  }
  });
} 