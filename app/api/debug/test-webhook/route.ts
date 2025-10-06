import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Test webhook endpoint to verify Railway can receive and process webhooks
 * Access at: /api/debug/test-webhook
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('🧪 TEST WEBHOOK RECEIVED');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body length:', body.length);
    console.log('Body preview:', body.substring(0, 200));
    
    return NextResponse.json({ 
      success: true,
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      headers: headers
    });
  } catch (error: any) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint is ready',
    instructions: 'Send POST request to test webhook reception',
    url: '/api/debug/test-webhook'
  });
}
