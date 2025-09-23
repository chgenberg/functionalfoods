import { NextRequest, NextResponse } from 'next/server';
import { getSveaCheckout } from '@/app/lib/svea-checkout-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing SVEA authentication...');
    
    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();
    
    // Create a minimal test order
    const testRequest = {
      countryCode: 'SE' as const,
      currency: 'SEK' as const,
      locale: 'sv-SE' as const,
      clientOrderNumber: `TEST-${Date.now()}`,
      merchantSettings: {
        termsUri: 'https://ulrikafunctionalfoods.com/anvandarvillkor',
        checkoutUri: 'https://ulrikafunctionalfoods.com/checkout',
        confirmationUri: 'https://ulrikafunctionalfoods.com/checkout/success',
        pushUri: 'https://ulrikafunctionalfoods.com/api/webhooks/svea-v2'
      },
      cart: {
        items: [{
          articleNumber: 'TEST-001',
          name: 'Test Product',
          quantity: 1,
          unitPrice: 10000, // 100 SEK in öre
          vatPercent: 2500, // 25%
          unit: 'st'
        }]
      }
    };
    
    console.log('📤 Sending test request to SVEA...');
    const response = await sveaCheckout.createOrder(testRequest);
    
    console.log('✅ SVEA test successful:', response);
    
    return NextResponse.json({
      success: true,
      message: 'SVEA authentication working!',
      orderId: response.orderId,
      status: response.status
    });
    
  } catch (error) {
    console.error('❌ SVEA test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
