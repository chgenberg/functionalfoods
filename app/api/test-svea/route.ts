import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Simple environment check
    const hasSecret = !!process.env.SVEA_SECRET_WORD;
    const hasMerchant = !!process.env.SVEA_MERCHANT_ID;
    
    if (!hasSecret || !hasMerchant) {
      return NextResponse.json({
        status: 'MISSING_ENV_VARS',
        hasSecret,
        hasMerchant,
        message: 'Add SVEA_SECRET_WORD and SVEA_MERCHANT_ID to Railway environment variables'
      });
    }

    // Test minimal Svea API call
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    
    const auth = Buffer.from(`${merchantId}:${secretWord}`).toString('base64');
    const endpoint = 'https://checkoutapi.svea.com/api/orders';
    
    console.log('🧪 Testing Svea API with Basic auth...', new Date().toISOString());
    
    const testPayload = {
      merchantSettings: {
        termsUri: 'https://functionalfoods.se/anvandarvillkor',
        checkoutUri: 'https://functionalfoods.se/checkout',
        confirmationUri: 'https://functionalfoods.se/checkout/success',
        pushUri: 'https://functionalfoods.se/api/webhooks/svea'
      },
      cart: {
        items: [{
          articleNumber: 'TEST-001',
          name: 'Test Course',
          quantity: 1,
          unitPrice: 149700, // 1497 kr in öre
          vatPercent: 25,
          unit: 'st'
        }]
      },
      currency: 'SEK',
      countryCode: 'SE',
      locale: 'sv-SE'
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    
    console.log('📡 Svea API Test Result:', {
      status: response.status,
      statusText: response.statusText,
      response: responseText.substring(0, 500)
    });

    return NextResponse.json({
      status: 'API_TEST_COMPLETE',
      config: {
        hasSecret: true,
        hasMerchant: true,
        merchantId,
        secretLength: secretWord.length,
        endpoint
      },
      apiResult: {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        success: response.ok
      }
    });

  } catch (error: any) {
    console.error('❌ Svea test error:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
