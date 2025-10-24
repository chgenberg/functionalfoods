import { NextRequest, NextResponse } from 'next/server';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';

export const runtime = 'nodejs';

/**
 * Debug endpoint to verify Svea configuration
 * Only accessible in development or with admin auth
 */
export async function GET(req: NextRequest) {
  // Check if in development or if calling from localhost
  const isLocalhost = req.headers.get('host')?.includes('localhost');
  const inDevelopment = process.env.NODE_ENV === 'development';

  if (!isLocalhost && !inDevelopment && process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
    return NextResponse.json(
      { error: 'Debug endpoints disabled' },
      { status: 403 }
    );
  }

  try {
    // Verify environment variables
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    const testMode = process.env.SVEA_TEST_MODE === 'true';

    const config = {
      status: 'OK',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SVEA_TEST_MODE: testMode,
        SVEA_MERCHANT_ID: merchantId ? `${merchantId.substring(0, 4)}...${merchantId.substring(merchantId.length - 4)}` : 'NOT SET',
        SVEA_SECRET_WORD: secretWord ? '***MASKED***' : 'NOT SET'
      },
      configured: !!merchantId && !!secretWord,
      baseUrl: testMode ? 'https://checkoutapistage.svea.com' : 'https://checkoutapi.svea.com'
    };

    if (!merchantId || !secretWord) {
      return NextResponse.json({
        ...config,
        status: 'ERROR',
        message: 'Svea credentials not configured',
        requiredVariables: ['SVEA_MERCHANT_ID', 'SVEA_SECRET_WORD']
      });
    }

    // Try to initialize Svea service
    try {
      const svea = getSveaCheckout();
      
      // Generate a test auth header (GET request, no body)
      const testTimestamp = new Date().toISOString().split('T')[0] + ' ' + 
        String(new Date().getUTCHours()).padStart(2, '0') + ':' +
        String(new Date().getUTCMinutes()).padStart(2, '0');

      return NextResponse.json({
        ...config,
        status: 'OK',
        message: 'Svea is properly configured',
        serviceInitialized: true,
        testableWith: {
          endpoint: '/api/checkout/svea-v2',
          method: 'POST',
          example: {
            items: [
              {
                id: 'functional-basics',
                name: 'Functional Basics',
                price: 499,
                quantity: 1,
                type: 'course'
              }
            ]
          }
        }
      });
    } catch (serviceError) {
      return NextResponse.json({
        ...config,
        status: 'ERROR',
        message: 'Failed to initialize Svea service',
        error: serviceError instanceof Error ? serviceError.message : 'Unknown error'
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Unexpected error checking Svea configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
