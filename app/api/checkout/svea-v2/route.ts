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
    console.error('💥 Checkout error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Okänt fel';
    const isConfigError = errorMessage.includes('credentials not configured');
    
    return NextResponse.json(
      { 
        error: isConfigError 
          ? 'Betalningssystemet är inte konfigurerat. Kontakta support.'
          : 'Ett fel uppstod vid skapande av beställning. Försök igen.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: isConfigError ? 503 : 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
