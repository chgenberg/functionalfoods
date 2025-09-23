import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing different SVEA request headers and structures...');
    
    const merchantId = process.env.SVEA_MERCHANT_ID!;
    const secretWord = process.env.SVEA_SECRET_WORD!;
    const baseUrl = 'https://checkoutapi.svea.com';
    
    // Minimal test request
    const testRequest = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `HEADER-TEST-${Date.now()}`,
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
    
    // Generate hash as per SVEA specification
    const hash = createHash('sha512').update(secretWord + requestBody + timestamp, 'utf8').digest('hex');
    const credentials = `${merchantId}:${hash}`;
    const authHeader = `Svea ${Buffer.from(credentials).toString('base64')}`;
    
    // Test different header combinations
    const headerTests = [
      {
        name: 'Minimal headers',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      },
      {
        name: 'Standard headers',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader
        }
      },
      {
        name: 'With timestamp header',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'X-Timestamp': timestamp
        }
      },
      {
        name: 'With user agent',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'X-Timestamp': timestamp,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        }
      },
      {
        name: 'With request ID',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'X-Timestamp': timestamp,
          'X-Request-Id': `req-${Date.now()}`,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        }
      },
      {
        name: 'With merchant ID header',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'X-Timestamp': timestamp,
          'X-Merchant-Id': merchantId,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        }
      },
      {
        name: 'Alternative content type',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'X-Timestamp': timestamp,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        }
      }
    ];
    
    const results = [];
    
    for (const test of headerTests) {
      console.log(`🧪 Testing: ${test.name}`);
      
      try {
        const response = await fetch(`${baseUrl}/api/orders`, {
          method: 'POST',
          headers: test.headers,
          body: requestBody
        });
        
        const responseText = await response.text();
        
        console.log(`📥 ${test.name} Response:`, {
          status: response.status,
          statusText: response.statusText,
          hasBody: responseText.length > 0,
          bodyStart: responseText.substring(0, 100)
        });
        
        results.push({
          test: test.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          hasResponseBody: responseText.length > 0,
          responseStart: responseText.substring(0, 200),
          responseHeaders: Object.fromEntries(response.headers.entries()),
          requestHeaders: test.headers
        });
        
        // If we get a successful response, return immediately
        if (response.ok) {
          return NextResponse.json({
            success: true,
            workingHeaders: test.name,
            response: JSON.parse(responseText),
            allResults: results
          });
        }
        
        // If we get a different error than 401, that's progress
        if (response.status !== 401) {
          console.log(`🎯 Different status code: ${response.status} - ${responseText}`);
        }
        
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error);
        results.push({
          test: test.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }
    
    // Also test a completely different request structure
    const alternativeRequest = {
      MerchantSettings: {
        CheckoutUri: 'https://ulrikafunctionalfoods.com/checkout',
        ConfirmationUri: 'https://ulrikafunctionalfoods.com/checkout/success',
        TermsUri: 'https://ulrikafunctionalfoods.com/anvandarvillkor',
        PushUri: 'https://ulrikafunctionalfoods.com/api/webhooks/svea-v2'
      },
      Cart: {
        Items: [{
          ArticleNumber: 'TEST-001',
          Name: 'Test Product',
          Quantity: 1,
          UnitPrice: 10000,
          VatPercent: 2500,
          Unit: 'st'
        }]
      },
      CountryCode: 'SE',
      Currency: 'SEK',
      Locale: 'sv-SE',
      ClientOrderNumber: `ALT-TEST-${Date.now()}`
    };
    
    try {
      const altRequestBody = JSON.stringify(alternativeRequest);
      const altHash = createHash('sha512').update(secretWord + altRequestBody + timestamp, 'utf8').digest('hex');
      const altCredentials = `${merchantId}:${altHash}`;
      const altAuthHeader = `Svea ${Buffer.from(altCredentials).toString('base64')}`;
      
      const altResponse = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': altAuthHeader,
          'X-Timestamp': timestamp,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        },
        body: altRequestBody
      });
      
      const altResponseText = await altResponse.text();
      
      results.push({
        test: 'Alternative request structure (PascalCase)',
        status: altResponse.status,
        statusText: altResponse.statusText,
        success: altResponse.ok,
        hasResponseBody: altResponseText.length > 0,
        responseStart: altResponseText.substring(0, 200),
        requestStructure: 'PascalCase fields'
      });
      
    } catch (error) {
      results.push({
        test: 'Alternative request structure',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'All header combinations failed',
      authInfo: {
        merchantId,
        hashMethod: 'SHA512(secretWord + requestBody + timestamp)',
        authFormat: 'Svea base64(merchantId:hash)',
        timestamp,
        requestBodyLength: requestBody.length
      },
      results,
      nextSteps: [
        'Contact SVEA support with these detailed test results',
        'Request working example from SVEA',
        'Ask SVEA to test order creation on their end with Merchant ID 207552'
      ]
    });
    
  } catch (error) {
    console.error('❌ Headers test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
