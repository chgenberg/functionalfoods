import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing simple SVEA authentication...');
    
    // Get config from environment
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const isTestMode = process.env.SVEA_TEST_MODE === 'true';
    
    if (!merchantId || !secretWord) {
      return NextResponse.json({
        error: 'SVEA credentials not configured',
        hasId: !!merchantId,
        hasSecret: !!secretWord
      }, { status: 500 });
    }
    
    console.log('🔑 SVEA Config Check:', {
      merchantId,
      secretWordLength: secretWord.length,
      secretWordStart: secretWord.substring(0, 5) + '...',
      secretWordEnd: '...' + secretWord.slice(-5),
      secretWordStartsWithEaOXe: secretWord.startsWith('eaOXe'),
      secretWordEndsWithDtlig9: secretWord.endsWith('dtlig9'),
      isTestMode
    });
    
    // Test 1: Simple Basic Auth (MerchantId:SecretWord)
    const simpleCredentials = `${merchantId}:${secretWord}`;
    const simpleAuth = `Basic ${Buffer.from(simpleCredentials).toString('base64')}`;
    
    console.log('🧪 Testing simple Basic Auth:', {
      credentials: simpleCredentials.substring(0, 20) + '...',
      authHeader: simpleAuth.substring(0, 50) + '...'
    });
    
    const baseUrl = isTestMode 
      ? 'https://checkoutapi.test.svea.com'
      : 'https://checkoutapi.svea.com';
    
    // Try to get a simple endpoint first (if available) or create minimal order
    const testRequest = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `SIMPLE-TEST-${Date.now()}`,
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
    
    console.log('📤 Sending simple auth test to SVEA...');
    
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': simpleAuth,
        'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
      },
      body: JSON.stringify(testRequest)
    });
    
    const responseText = await response.text();
    
    console.log('📥 SVEA Simple Auth Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Simple Basic Auth works!',
        response: JSON.parse(responseText)
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Simple Basic Auth failed',
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        authUsed: 'Simple Basic Auth (MerchantId:SecretWord)'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Simple auth test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
