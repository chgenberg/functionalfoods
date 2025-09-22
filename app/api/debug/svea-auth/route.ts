import { NextRequest, NextResponse } from 'next/server';
import { getSveaCheckout } from '@/app/lib/svea-checkout-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const testMode = process.env.SVEA_TEST_MODE;
    const nodeEnv = process.env.NODE_ENV;
    
    const sveaService = getSveaCheckout();
    
    // Create auth header manually to debug
    const credentials = `${merchantId}:${secretWord}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
    
    return NextResponse.json({
      debug: {
        hasMerchantId: !!merchantId,
        merchantIdLength: merchantId?.length,
        merchantIdFirst4: merchantId?.substring(0, 4),
        hasSecretWord: !!secretWord,
        secretWordLength: secretWord?.length,
        secretWordFirst10: secretWord?.substring(0, 10),
        testMode,
        nodeEnv,
        authHeaderLength: authHeader.length,
        authHeaderFirst20: authHeader.substring(0, 20),
        baseUrl: testMode === 'true' ? 'https://checkoutapistage.svea.com' : 'https://checkoutapi.svea.com'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
