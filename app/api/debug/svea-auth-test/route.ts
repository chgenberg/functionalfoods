import { NextRequest, NextResponse } from 'next/server';
import { getSveaCheckout } from '@/app/lib/svea-checkout-service';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing SVEA authentication...');
    
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const testMode = process.env.SVEA_TEST_MODE === 'true';
    
    if (!merchantId || !secretWord) {
      return NextResponse.json({
        success: false,
        error: 'SVEA credentials not configured'
      }, { status: 500 });
    }
    
    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();
    
    // Create a minimal test order
    const testRequest = {
      countryCode: 'SE' as const,
      currency: 'SEK' as const,
      locale: 'sv-SE' as const,
      clientOrderNumber: `TEST-${Date.now()}`,
      merchantSettings: {
        termsUri: 'https://www.functionalfoods.se/anvandarvillkor',
        checkoutUri: 'https://www.functionalfoods.se/checkout',
        confirmationUri: 'https://www.functionalfoods.se/checkout/success/svea-v2',
        pushUri: 'https://www.functionalfoods.se/api/webhooks/svea-v2'
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
    
    const requestBody = JSON.stringify(testRequest);
    
    // Manual auth calculation for debugging
    const now = new Date();
    const timestampPadded = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
    const timestampUnpadded = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}`;
    
    const hashInputPadded = requestBody + secretWord + timestampPadded;
    const hashInputUnpadded = requestBody + secretWord + timestampUnpadded;
    
    const sha512Padded = createHash('sha512').update(hashInputPadded, 'utf8').digest('hex');
    const sha512Unpadded = createHash('sha512').update(hashInputUnpadded, 'utf8').digest('hex');
    
    const base64Padded = Buffer.from(`${merchantId}:${sha512Padded}`, 'utf8').toString('base64');
    const base64Unpadded = Buffer.from(`${merchantId}:${sha512Unpadded}`, 'utf8').toString('base64');
    
    const authPadded = `Svea ${base64Padded}`;
    const authUnpadded = `Svea ${base64Unpadded}`;
    
    const baseUrl = testMode ? 'https://checkoutapistage.svea.com' : 'https://checkoutapi.svea.com';
    const endpoint = `${baseUrl}/api/orders`;
    
    console.log('📤 Sending test request to SVEA...');
    console.log('🔐 Auth details:', {
      merchantId,
      secretWordLength: secretWord.length,
      secretWordFirst5: secretWord.substring(0, 5),
      secretWordLast5: secretWord.slice(-5),
      testMode,
      baseUrl,
      timestampPadded,
      timestampUnpadded,
      requestBodyLength: requestBody.length
    });
    
    // Try with padded timestamp first
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authPadded,
        'Timestamp': timestampPadded
      },
      body: requestBody
    });
    
    let responseText = await response.text();
    let usedPadded = true;
    
    // If 401, try unpadded
    if (!response.ok && response.status === 401) {
      console.warn('⚠️ 401 with padded timestamp, trying unpadded...');
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authUnpadded,
          'Timestamp': timestampUnpadded
        },
        body: requestBody
      });
      responseText = await response.text();
      usedPadded = false;
    }
    
    console.log('📥 SVEA test response:', {
      status: response.status,
      statusText: response.statusText,
      usedPadded,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 200)
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `SVEA API Error (${response.status}): ${responseText || 'Empty response'}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText,
          usedPaddedTimestamp: usedPadded,
          timestamp: usedPadded ? timestampPadded : timestampUnpadded,
          merchantId,
          secretWordLength: secretWord.length,
          testMode,
          baseUrl,
          authHeaderPreview: (usedPadded ? authPadded : authUnpadded).substring(0, 50) + '...'
        },
        troubleshooting: {
          message: '401 Unauthorized means authentication failed',
          checklist: [
            `Merchant ID: ${merchantId} (should be 207552)`,
            `Secret Word length: ${secretWord.length} characters`,
            `Test Mode: ${testMode} (should be true for test environment)`,
            `Base URL: ${baseUrl} (should be checkoutapistage.svea.com for test)`,
            `Timestamp format: ${usedPadded ? 'Padded' : 'Unpadded'} - ${usedPadded ? timestampPadded : timestampUnpadded}`,
            'Check that SVEA_SECRET_WORD is your TEST/STAGE key (not production key)',
            'Verify the key is copied correctly (no extra spaces, line breaks, etc)',
            'Check that the key is active in Svea Payment Admin'
          ]
        }
      }, { status: 500 });
    }
    
    const result = JSON.parse(responseText);
    console.log('✅ SVEA test successful:', result);
    
    return NextResponse.json({
      success: true,
      message: 'SVEA authentication working!',
      orderId: result.orderId || result.OrderId,
      status: result.status || result.Status,
      usedPaddedTimestamp: usedPadded,
      timestamp: usedPadded ? timestampPadded : timestampUnpadded
    });
    
  } catch (error) {
    console.error('❌ SVEA test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 });
  }
}
