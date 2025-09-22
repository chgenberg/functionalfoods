import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const config = {
      sveaSecretConfigured: !!process.env.SVEA_SECRET_WORD,
      sveaMerchantConfigured: !!process.env.SVEA_MERCHANT_ID,
      nodeEnv: process.env.NODE_ENV,
      sveaSecretLength: process.env.SVEA_SECRET_WORD?.length || 0,
      merchantId: process.env.SVEA_MERCHANT_ID || 'NOT_SET'
    };

    console.log('🔍 Svea Debug Info:', config);

    // Test basic API connectivity
    const testEndpoint = process.env.NODE_ENV === 'production' 
      ? 'https://checkoutapi.svea.com'
      : 'https://checkoutapistage.svea.com';

    console.log('🌐 Testing Svea endpoint:', testEndpoint);

    // Simple connectivity test
    try {
      const testResponse = await fetch(`${testEndpoint}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SVEA_SECRET_WORD || 'test'}`
        },
        body: JSON.stringify({
          merchantSettings: {
            termsUri: 'https://example.com/terms',
            checkoutUri: 'https://example.com/checkout',
            confirmationUri: 'https://example.com/success',
            pushUri: 'https://example.com/webhook'
          },
          cart: {
            items: [{
              articleNumber: 'TEST',
              name: 'Test Item',
              quantity: 1,
              unitPrice: 10000, // 100 kr in öre
              vatPercent: 25,
              unit: 'st'
            }]
          },
          currency: 'SEK',
          countryCode: 'SE',
          locale: 'sv-SE'
        })
      });

      const responseText = await testResponse.text();
      
      return NextResponse.json({
        config,
        apiTest: {
          endpoint: testEndpoint,
          status: testResponse.status,
          statusText: testResponse.statusText,
          response: responseText.substring(0, 1000),
          headers: Object.fromEntries(testResponse.headers.entries())
        }
      });

    } catch (apiError: any) {
      return NextResponse.json({
        config,
        apiTest: {
          endpoint: testEndpoint,
          error: apiError.message,
          stack: apiError.stack
        }
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
