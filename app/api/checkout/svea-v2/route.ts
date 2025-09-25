import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';
import type { SveaCartItem, CreateCheckoutOrderRequest } from '@/app/lib/svea-checkout-service';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'course' | 'book';
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customer?: {
    email?: string;
    name?: string;
    id?: string;
  };
  couponCode?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CheckoutRequest;
    const { items, customer, couponCode } = body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Inga produkter i varukorgen' },
        { status: 400 }
      );
    }

    // If payments are simulated/disabled, short-circuit and create a completed order locally
    if (process.env.PAYMENTS_SIMULATE === 'true') {
      // Calculate order totals (öre)
      let subtotal = 0;
      for (const item of items) {
        subtotal += SveaCheckoutService.formatPriceToMinorUnits(item.price) * item.quantity;
      }

      // Handle coupon (optional)
      let discountAmount = 0;
      let appliedCoupon = null as any;
      if (couponCode) {
        try {
          const coupon = await prisma.coupon.findFirst({
            where: {
              code: couponCode.toUpperCase().trim(),
              active: true,
              OR: [ { expiresAt: null }, { expiresAt: { gt: new Date() } } ]
            }
          });
          if (coupon) {
            if (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) {
              if (coupon.type === 'PERCENTAGE') {
                discountAmount = Math.round(subtotal * (coupon.amount / 100));
              } else if (coupon.type === 'FIXED') {
                discountAmount = SveaCheckoutService.formatPriceToMinorUnits(coupon.amount);
              }
              appliedCoupon = coupon;
            }
          }
        } catch {}
      }

      const totalAmountKr = SveaCheckoutService.formatPriceFromMinorUnits(subtotal - discountAmount);

      // Generate order ID
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 9);
      const orderId = `FF-${timestamp}-${randomPart}`;

      // Map cart item ids to CourseProduct ids when possible
      async function resolveCourseIdFromItemId(itemId: string): Promise<string | null> {
        const id = itemId.toLowerCase();
        let keyword = '';
        if (id.includes('energy') || id.includes('insulin')) keyword = 'Energy';
        else if (id.includes('basic')) keyword = 'Basics';
        else if (id.includes('flow') || id.includes('gut')) keyword = 'Flow';
        if (!keyword) return null;
        const cp = await prisma.courseProduct.findFirst({ where: { name: { contains: keyword, mode: 'insensitive' } }, select: { id: true } });
        return cp?.id || null;
      }

      // Create order + payment + purchases in one transaction
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            id: orderId,
            orderNumber: orderId,
            status: 'COMPLETED',
            totalAmount: totalAmountKr,
            currency: 'SEK',
            userId: customer?.id || null,
            customerEmail: customer?.email || null,
            customerName: customer?.name || null,
            items: {
              create: await Promise.all(items.map(async (item) => ({
                productId: item.id,
                productName: item.name,
                productType: item.type,
                quantity: item.quantity,
                price: item.price,
                courseId: await resolveCourseIdFromItemId(item.id)
              })))
            },
            metadata: {
              simulated: true,
              couponCode: appliedCoupon?.code || null,
              discountAmount: discountAmount > 0 ? SveaCheckoutService.formatPriceFromMinorUnits(discountAmount) : null
            }
          }
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentMethod: 'SIMULATED',
            status: 'COMPLETED',
            amount: order.totalAmount,
            currency: 'SEK',
            externalId: `SIM-${orderId}`,
            processedAt: new Date(),
          }
        });

        if (customer?.id) {
          const orderWithItems = await tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
          for (const it of orderWithItems?.items || []) {
            if (it.productType === 'course' && it.courseId) {
              const exists = await tx.purchase.findUnique({
                where: { userId_courseId: { userId: customer.id!, courseId: it.courseId } }
              });
              if (!exists) {
                await tx.purchase.create({
                  data: {
                    userId: customer.id!,
                    courseId: it.courseId,
                    amount: it.price * it.quantity,
                    status: 'completed',
                    orderId: order.id,
                    accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                  }
                });
              }
            }
          }
        }
      });

      // Simple embedded GUI snippet with a continue button
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrika-functional-foods-production.up.railway.app';
      const snippet = `
        <div style="padding:24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
          <h2 style="margin:0 0 8px 0;color:#014421">Simulerad betalning är PÅ</h2>
          <p style="margin:0 0 16px 0;color:#334155">Inga pengar dras. Klicka för att slutföra köpet.</p>
          <a href="${origin}/checkout/success/svea-v2?checkoutOrderId=SIMULATED&orderId=${orderId}"
             style="display:inline-block;background:#014421;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Slutför köp</a>
        </div>`;

      return NextResponse.json({
        success: true,
        checkoutOrderId: 'SIMULATED',
        orderId,
        gui: { snippet }
      });
    }

    // Initialize Svea service
    let sveaCheckout: SveaCheckoutService;
    try {
      sveaCheckout = getSveaCheckout();
    } catch (error) {
      console.error('❌ Failed to initialize Svea:', error);
      return NextResponse.json(
        { error: 'Betalningssystemet är inte konfigurerat. Kontakta support.' },
        { status: 500 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    const sveaItems: SveaCartItem[] = [];

    for (const item of items) {
      const priceInOre = SveaCheckoutService.formatPriceToMinorUnits(item.price);
      subtotal += priceInOre * item.quantity;

      sveaItems.push({
        articleNumber: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: priceInOre,
        vatPercent: 2500, // 25% VAT (in basis points)
        unit: 'st',
        discountPercent: 0
      });
    }

    // Handle coupon if provided
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const coupon = await prisma.coupon.findFirst({
          where: {
            code: couponCode.toUpperCase().trim(),
            active: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        });

        if (coupon) {
          // Check usage limit
          if (!coupon.usageLimit || coupon.timesUsed < coupon.usageLimit) {
            if (coupon.type === 'PERCENTAGE') {
              discountAmount = Math.round(subtotal * (coupon.amount / 100));
            } else if (coupon.type === 'FIXED') {
              discountAmount = SveaCheckoutService.formatPriceToMinorUnits(coupon.amount);
            }
            appliedCoupon = coupon;
          }
        }
      } catch (error) {
        console.warn('⚠️ Coupon lookup failed:', error);
        // Continue without discount
      }
    }

    // Add discount as negative item if applicable
    if (discountAmount > 0 && appliedCoupon) {
      sveaItems.push({
        articleNumber: 'DISCOUNT',
        name: `Rabatt (${appliedCoupon.code})`,
        quantity: 1,
        unitPrice: -discountAmount,
        vatPercent: 2500,
        unit: 'st'
      });
    }

    // Generate order ID
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 9);
    const orderId = `FF-${timestamp}-${randomPart}`;

    // Get site URLs
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrikafunctionalfoods.com';

    // Create Svea checkout order
    const checkoutRequest: CreateCheckoutOrderRequest = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: orderId,
      merchantSettings: {
        termsUri: `${origin}/anvandarvillkor`,
        checkoutUri: `${origin}/checkout`,
        confirmationUri: `${origin}/checkout/success/svea?checkoutOrderId={checkout.order.id}&orderId=${orderId}`,
        pushUri: `${origin}/api/webhooks/svea-v2`
      },
      cart: {
        items: sveaItems
      },
      merchantData: orderId
    };

    // Add customer email if available
    if (customer?.email) {
      checkoutRequest.presetValues = [{
        typeName: 'emailAddress',
        value: customer.email,
        isReadonly: false
      }];
    }

    console.log('📤 Creating Svea checkout order:', {
      orderId,
      itemCount: sveaItems.length,
      totalAmount: SveaCheckoutService.formatPriceFromMinorUnits(subtotal - discountAmount),
      hasCustomer: !!customer?.email
    });

    // Create order in Svea
    console.log('📤 Sending request to Svea with items:', sveaItems);
    const sveaResponse = await sveaCheckout.createOrder(checkoutRequest);

    console.log('✅ Svea order created successfully:', {
      checkoutOrderId: sveaResponse.orderId,
      status: sveaResponse.status
    });

    // Store order in database
    const totalAmount = SveaCheckoutService.formatPriceFromMinorUnits(subtotal - discountAmount);
    
    await prisma.order.create({
      data: {
        id: orderId,
        orderNumber: orderId,
        status: 'PENDING',
        totalAmount,
        currency: 'SEK',
        checkoutOrderId: sveaResponse.orderId.toString(),
        userId: customer?.id || null,
        customerEmail: customer?.email || null,
        customerName: customer?.name || null,
        metadata: {
          items: items,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount > 0 ? SveaCheckoutService.formatPriceFromMinorUnits(discountAmount) : null
        },
        items: {
          create: items.map(item => ({
            productId: item.id,
            productName: item.name,
            productType: item.type,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // Update coupon usage
    if (appliedCoupon) {
      await prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { timesUsed: { increment: 1 } }
      });
    }

    return NextResponse.json({
      success: true,
      checkoutOrderId: sveaResponse.orderId,
      orderId: orderId,
      gui: sveaResponse.gui
    });

  } catch (error) {
    console.error('💥 Checkout error details:', {
      error,
      message: error instanceof Error ? error.message : 'Okänt fel',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
    const isConfigError = errorMessage.includes('credentials not configured');
    const isSveaError = errorMessage.includes('Svea API Error');
    
    return NextResponse.json(
      { 
        error: isConfigError 
          ? 'Betalningssystemet är inte konfigurerat. Kontakta support.'
          : isSveaError
            ? `SVEA fel: ${errorMessage}`
            : 'Ett fel uppstod vid skapande av beställning. Försök igen.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        fullError: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: isConfigError ? 503 : 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
