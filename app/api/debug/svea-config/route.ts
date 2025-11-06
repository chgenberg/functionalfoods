import { NextRequest, NextResponse } from 'next/server';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to verify Svea configuration and test order creation
 */
export async function GET(req: NextRequest) {
  try {
    // List all env vars that contain 'SVEA' or 'svea'
    const allEnvVars = Object.keys(process.env).filter(key => 
      key.toUpperCase().includes('SVEA') || 
      key.toUpperCase().includes('PAYMENT') ||
      key.toUpperCase().includes('CHECKOUT')
    );

    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const testModeEnv = (process.env.SVEA_TEST_MODE || '').toLowerCase().trim();
    const testMode = testModeEnv === 'true';

    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      environment: {
        SVEA_MERCHANT_ID: merchantId ? `SET (${merchantId})` : 'NOT SET',
        SVEA_SECRET_WORD: secretWord ? `SET (${secretWord.length} chars)` : 'NOT SET',
        SVEA_TEST_MODE: testModeEnv ? `SET (${testModeEnv})` : 'NOT SET (defaults to production)',
        ACTUAL_MODE: testMode ? 'TEST' : 'PRODUCTION',
        BASE_URL: testMode ? 'https://checkoutapistage.svea.com' : 'https://checkoutapi.svea.com'
      },
      allSveaRelatedVars: allEnvVars.length > 0 ? allEnvVars : 'NONE FOUND',
      configured: !!merchantId && !!secretWord,
      warning: testMode ? '⚠️ Using TEST environment. Set SVEA_TEST_MODE=false for production!' : '✅ Using PRODUCTION environment'
    };

    if (!merchantId || !secretWord) {
      return NextResponse.json({
        ...debugInfo,
        status: 'ERROR',
        message: 'Missing Svea credentials',
        nextSteps: [
          'Check Railway Variables page',
          'Ensure SVEA_MERCHANT_ID is set',
          'Ensure SVEA_SECRET_WORD is set',
          'Redeploy after setting variables'
        ]
      });
    }

    // Try to initialize
    try {
      const svea = getSveaCheckout();
      
      // Optionally test order creation with a minimal test order
      const testOrder = req.nextUrl.searchParams.get('test') === 'true';
      let testResult = null;
      
      if (testOrder) {
        try {
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
          
          const result = await svea.createOrder(testRequest);
          testResult = {
            success: true,
            orderId: result.orderId,
            status: result.status,
            hasGui: !!result.gui
          };
        } catch (testError: any) {
          testResult = {
            success: false,
            error: testError?.message || 'Unknown error',
            details: testError?.stack || String(testError)
          };
        }
      }
      
      return NextResponse.json({
        ...debugInfo,
        status: 'OK',
        message: 'Svea is properly configured and initialized',
        testUrl: 'POST /api/checkout/svea-v2',
        testOrderResult: testResult,
        testOrderNote: testOrder ? 'Test order was attempted' : 'Add ?test=true to URL to test order creation'
      });
    } catch (error) {
      return NextResponse.json({
        ...debugInfo,
        status: 'ERROR',
        message: 'Failed to initialize Svea',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Debug endpoint error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
