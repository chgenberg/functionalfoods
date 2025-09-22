import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Svea simple checkout called:', body);
    
    // Temporary simple response for testing
    return NextResponse.json({
      success: true,
      message: 'Svea simple endpoint works',
      checkoutUrl: 'https://example.com/test',
      orderId: 'test-' + Date.now()
    });
    
  } catch (error) {
    console.error('Svea simple error:', error);
    return NextResponse.json(
      { error: 'Simple test failed' },
      { status: 500 }
    );
  }
}