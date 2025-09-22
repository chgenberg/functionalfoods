import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, couponCode } = body as {
      items: Array<{ id: string; name: string; price: number; quantity: number; type: 'course'|'book' }>
      customer?: { email?: string; name?: string; id?: string }
      couponCode?: string
    };

    console.log('🛒 Svea checkout request:', { 
      itemCount: items?.length, 
      customerEmail: customer?.email 
    });

    // Check environment variables
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    
    console.log('🔑 Svea credentials check:', {
      hasMerchantId: !!merchantId,
      hasSecretWord: !!secretWord,
      merchantIdLength: merchantId?.length,
      secretWordLength: secretWord?.length
    });
    
    if (!merchantId || !secretWord) {
      console.error('❌ Missing Svea credentials');
      return NextResponse.json(
        { error: 'Betalningskonfiguration saknas' },
        { status: 500 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    
    // Handle coupon if provided
    let discountAmount = 0;
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
        
        if (coupon && coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
          // Coupon usage limit reached
        } else if (coupon) {
          if (coupon.type === 'PERCENTAGE') {
            discountAmount = Math.round(subtotal * (coupon.amount / 100));
          } else if (coupon.type === 'FIXED') {
            discountAmount = Math.round(coupon.amount * 100); // Convert to öre
          }
        }
      } catch (couponError) {
        console.warn('Coupon lookup failed:', couponError);
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // Create Svea order items
    const sveaItems = items.map(item => ({
      articleNumber: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: Math.round(item.price * 100), // Convert to öre
      vatPercent: 25,
      unit: 'st'
    }));

    // Add discount item if applicable
    if (discountAmount > 0) {
      sveaItems.push({
        articleNumber: 'DISCOUNT',
        name: `Rabatt (${couponCode})`,
        quantity: 1,
        unitPrice: -discountAmount,
        vatPercent: 25,
        unit: 'st'
      });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrika-functional-foods-production.up.railway.app';
    const orderId = `FF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const sveaPayload = {
      merchantSettings: {
        termsUri: `${origin}/anvandarvillkor`,
        checkoutUri: `${origin}/checkout`,
        confirmationUri: `${origin}/checkout/success/svea?checkoutOrderId={checkout.order.id}&orderId=${orderId}`,
        pushUri: `${origin}/api/webhooks/svea`
      },
      cart: { items: sveaItems },
      presetValues: customer?.email ? [{
        typeName: 'emailAddress',
        value: customer.email,
        isReadonly: false
      }] : [],
      currency: 'SEK',
      countryCode: 'SE',
      locale: 'sv-SE',
      merchantData: orderId
    };

    console.log('📡 Creating Svea order:', {
      orderId,
      totalAmount: totalAmount / 100,
      itemCount: sveaItems.length
    });

    // Call Svea API - använd staging för testing
    const auth = Buffer.from(`${merchantId}:${secretWord}`).toString('base64');
    const endpoint = 'https://checkoutapistage.svea.com/api/orders'; // Använd staging för nu
    
    console.log('🔐 Auth details:', {
      merchantId: merchantId,
      authLength: auth.length,
      endpoint
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(sveaPayload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ Svea API error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });
      throw new Error(`Svea API Error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    console.log('✅ Svea order created:', {
      checkoutOrderId: result.orderId,
      hasGui: !!result.gui
    });

    // Store order in database
    await prisma.order.create({
      data: {
        id: orderId,
        orderNumber: orderId,
        status: 'PENDING',
        totalAmount: totalAmount / 100, // Convert back to kr
        currency: 'SEK',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: items.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    return NextResponse.json({
      checkoutUrl: result.gui?.snippet || result.checkoutUrl || result.redirectUrl,
      orderId: orderId,
      checkoutOrderId: result.orderId
    });

  } catch (error: any) {
    console.error('💥 Svea checkout error:', error);
    return NextResponse.json(
      { error: 'Betalning kunde inte initieras. Försök igen.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
