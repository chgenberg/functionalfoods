import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Basic SVEA configuration check...');
    
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const isTestMode = process.env.SVEA_TEST_MODE === 'true';
    
    console.log('🔑 Environment check:', {
      hasMerchantId: !!merchantId,
      merchantId,
      hasSecretWord: !!secretWord,
      secretWordLength: secretWord?.length,
      isTestMode
    });
    
    if (!merchantId || !secretWord) {
      return NextResponse.json({
        error: 'Missing credentials',
        hasMerchantId: !!merchantId,
        hasSecretWord: !!secretWord
      }, { status: 500 });
    }
    
    // Test different base URLs
    const testUrls = [
      'https://checkoutapi.svea.com',
      'https://checkoutapi.test.svea.com',
      'https://api.svea.com',
      'https://webpay.svea.com'
    ];
    
    const results = [];
    
    for (const baseUrl of testUrls) {
      console.log(`🌐 Testing URL: ${baseUrl}`);
      
      try {
        // Try a simple GET request first to see if endpoint exists
        const response = await fetch(`${baseUrl}/api/orders`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
          }
        });
        
        const responseText = await response.text();
        
        console.log(`📥 ${baseUrl} Response:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          bodyLength: responseText.length,
          bodyStart: responseText.substring(0, 200)
        });
        
        results.push({
          url: baseUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          hasBody: responseText.length > 0,
          bodyStart: responseText.substring(0, 200),
          accessible: response.status !== 404 && response.status !== 503
        });
        
      } catch (error) {
        console.error(`❌ ${baseUrl} failed:`, error);
        results.push({
          url: baseUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        });
      }
    }
    
    // Also test if we can reach SVEA at all
    const connectivityTest = [];
    
    try {
      const response = await fetch('https://www.svea.com', {
        method: 'HEAD',
        headers: {
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        }
      });
      
      connectivityTest.push({
        test: 'SVEA main website',
        accessible: response.ok,
        status: response.status
      });
      
    } catch (error) {
      connectivityTest.push({
        test: 'SVEA main website',
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return NextResponse.json({
      message: 'Basic SVEA configuration check complete',
      config: {
        merchantId,
        secretWordInfo: {
          length: secretWord.length,
          start: secretWord.substring(0, 5) + '...',
          end: '...' + secretWord.slice(-5),
          startsWithEaOXe: secretWord.startsWith('eaOXe'),
          endsWithDtlig9: secretWord.endsWith('dtlig9')
        },
        isTestMode
      },
      urlTests: results,
      connectivityTests: connectivityTest,
      recommendations: [
        'Check if Merchant ID 207552 is activated for production',
        'Verify API endpoint URL with SVEA support',
        'Confirm authentication method with SVEA documentation',
        'Test with SVEA support team using their test tools'
      ]
    });
    
  } catch (error) {
    console.error('❌ Basic check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
