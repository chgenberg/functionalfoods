import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { sveaPayment, SveaOrderItem } from '@/app/lib/svea-payment';
// import { withRateLimit, checkoutRateLimit } from '@/app/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Temporärt inaktiverad rate limiting för debugging
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

      // Calculate subtotal in öre (1 kr = 100 öre)
      const subtotal = items.reduce((sum: number, i) => sum + Math.round(i.price * 100) * i.quantity, 0);

      // Apply coupon discount if provided
      let discountAmount = 0;
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
          if (coupon.type === 'percent') {
            discountAmount = Math.round(subtotal * (coupon.amount / 100));
          } else {
            discountAmount = Math.round(coupon.amount * 100); // Convert to öre
          }
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);

      // Convert items to Svea format
      const sveaItems: SveaOrderItem[] = items.map(item => ({
        articleNumber: item.id,
        description: item.name,
        pricePerUnit: Math.round(item.price * 100), // Convert to öre
        quantity: item.quantity,
        unit: 'st',
        vatPercent: 25, // 25% moms för kurser i Sverige
        discountPercent: 0
      }));

      // Add discount as separate line item if applicable
      if (discountAmount > 0) {
        sveaItems.push({
          articleNumber: 'DISCOUNT',
          description: `Rabatt: ${couponCode}`,
          pricePerUnit: -discountAmount,
          quantity: 1,
          unit: 'st',
          vatPercent: 25,
          discountPercent: 0
        });
      }

      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const orderId = `FF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create Svea checkout order
      const sveaOrder = {
        orderId,
        merchantSettings: {
          termsUri: `${origin}/anvandarvillkor`,
          checkoutUri: `${origin}/checkout`,
          confirmationUri: `${origin}/checkout/success/svea?checkoutOrderId={checkout.order.id}&orderId=${orderId}`,
          pushUri: `${origin}/api/webhooks/svea`
        },
        cart: { items: sveaItems },
        customer: customer ? {
          email: customer.email || '',
          firstName: customer.name?.split(' ')[0] || '',
          lastName: customer.name?.split(' ').slice(1).join(' ') || ''
        } : undefined,
        currency: 'SEK',
        countryCode: 'SE',
        locale: 'sv-SE'
      };

      const result = await sveaPayment.createCheckoutOrder(sveaOrder);

      // Respond without DB write (experimental route)
      return NextResponse.json({ 
        checkoutUrl: result.checkoutUrl,
        orderId,
        checkoutOrderId: result.checkoutOrderId
      });

    } catch (err: any) {
      console.error('Svea Checkout error:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        sveaSecretConfigured: !!process.env.SVEA_SECRET_WORD,
        merchantIdConfigured: !!process.env.SVEA_MERCHANT_ID
      });
      
      return NextResponse.json(
        { error: 'Betalning kunde inte initieras. Försök igen.' },
        { status: 500 }
      );
  }
}
