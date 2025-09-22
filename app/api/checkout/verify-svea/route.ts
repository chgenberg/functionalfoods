import { NextRequest, NextResponse } from 'next/server';
import { sveaPayment } from '@/app/lib/svea-payment';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { checkoutOrderId, orderId } = await request.json();

    if (!checkoutOrderId) {
      return NextResponse.json({ error: 'checkoutOrderId is required' }, { status: 400 });
    }

    // Get order details from Svea
    const sveaOrder = await sveaPayment.getOrder(parseInt(checkoutOrderId));
    
    // Check if payment is completed
    const isCompleted = sveaOrder.status === 'Final' || sveaOrder.status === 'Delivered';
    
    return NextResponse.json({
      success: true,
      paymentCompleted: isCompleted,
      orderStatus: sveaOrder.status,
      orderId: orderId
    });

  } catch (error) {
    console.error('Svea verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}