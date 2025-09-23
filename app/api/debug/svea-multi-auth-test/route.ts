import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing multiple SVEA authentication methods...');
    
    // Get config from environment
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const isTestMode = process.env.SVEA_TEST_MODE === 'true';
    
    if (!merchantId || !secretWord) {
      return NextResponse.json({
        error: 'SVEA credentials not configured'
      }, { status: 500 });
    }
    
    const baseUrl = isTestMode 
      ? 'https://checkoutapi.test.svea.com'
      : 'https://checkoutapi.svea.com';
    
    const testRequest = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `MULTI-TEST-${Date.now()}`,
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
          unitPrice: 10000,
          vatPercent: 2500,
          unit: 'st'
        }]
      }
    };
    
    const requestBody = JSON.stringify(testRequest);
    const timestamp = new Date().toISOString();
    const unixTimestamp = Math.floor(Date.now() / 1000).toString();
    
    // Test different authentication methods
    const authMethods = [
      {
        name: 'Simple Basic Auth',
        auth: `Basic ${Buffer.from(`${merchantId}:${secretWord}`).toString('base64')}`
      },
      {
        name: 'Simple Svea Auth',
        auth: `Svea ${Buffer.from(`${merchantId}:${secretWord}`).toString('base64')}`
      },
      {
        name: 'SHA512 + ISO timestamp + Basic',
        auth: (() => {
          const hash = createHash('sha512').update(secretWord + requestBody + timestamp, 'utf8').digest('hex');
          return `Basic ${Buffer.from(`${merchantId}:${hash}`).toString('base64')}`;
        })()
      },
      {
        name: 'SHA512 + ISO timestamp + Svea',
        auth: (() => {
          const hash = createHash('sha512').update(secretWord + requestBody + timestamp, 'utf8').digest('hex');
          return `Svea ${Buffer.from(`${merchantId}:${hash}`).toString('base64')}`;
        })()
      },
      {
        name: 'SHA256 + ISO timestamp + Svea',
        auth: (() => {
          const hash = createHash('sha256').update(secretWord + requestBody + timestamp, 'utf8').digest('hex');
          return `Svea ${Buffer.from(`${merchantId}:${hash}`).toString('base64')}`;
        })()
      },
      {
        name: 'SHA512 + Unix timestamp + Svea',
        auth: (() => {
          const hash = createHash('sha512').update(secretWord + requestBody + unixTimestamp, 'utf8').digest('hex');
          return `Svea ${Buffer.from(`${merchantId}:${hash}`).toString('base64')}`;
        })()
      }
    ];
    
    const results = [];
    
    for (const method of authMethods) {
      console.log(`🧪 Testing ${method.name}...`);
      
      try {
        const response = await fetch(`${baseUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': method.auth,
            'X-Timestamp': timestamp,
            'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
          },
          body: requestBody
        });
        
        const responseText = await response.text();
        
        console.log(`📥 ${method.name} Response:`, {
          status: response.status,
          statusText: response.statusText,
          hasBody: responseText.length > 0,
          bodyStart: responseText.substring(0, 100)
        });
        
        results.push({
          method: method.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          hasResponseBody: responseText.length > 0,
          responseStart: responseText.substring(0, 200),
          authHeader: method.auth.substring(0, 50) + '...'
        });
        
        // If we get a successful response, return immediately
        if (response.ok) {
          return NextResponse.json({
            success: true,
            workingMethod: method.name,
            response: JSON.parse(responseText),
            allResults: results
          });
        }
        
      } catch (error) {
        console.error(`❌ ${method.name} failed:`, error);
        results.push({
          method: method.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'All authentication methods failed',
      timestamp,
      unixTimestamp,
      requestBodyLength: requestBody.length,
      secretWordInfo: {
        length: secretWord.length,
        start: secretWord.substring(0, 5) + '...',
        end: '...' + secretWord.slice(-5)
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Multi auth test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
