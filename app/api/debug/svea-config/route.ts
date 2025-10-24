import { NextRequest, NextResponse } from 'next/server';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';

export const runtime = 'nodejs';

/**
 * Debug endpoint to verify Svea configuration
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
    const testMode = process.env.SVEA_TEST_MODE;

    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      environment: {
        SVEA_MERCHANT_ID: merchantId ? `SET (${merchantId.length} chars)` : 'NOT SET',
        SVEA_SECRET_WORD: secretWord ? `SET (${secretWord.length} chars)` : 'NOT SET',
        SVEA_TEST_MODE: testMode ? `SET (${testMode})` : 'NOT SET',
      },
      allSveaRelatedVars: allEnvVars.length > 0 ? allEnvVars : 'NONE FOUND',
      configured: !!merchantId && !!secretWord,
      baseUrl: testMode === 'true' ? 'https://checkoutapistage.svea.com' : 'https://checkoutapi.svea.com'
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
      return NextResponse.json({
        ...debugInfo,
        status: 'OK',
        message: 'Svea is properly configured and initialized',
        testUrl: 'POST /api/checkout/svea-v2'
      });
    } catch (error) {
      return NextResponse.json({
        ...debugInfo,
        status: 'ERROR',
        message: 'Failed to initialize Svea',
        error: error instanceof Error ? error.message : 'Unknown error'
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
