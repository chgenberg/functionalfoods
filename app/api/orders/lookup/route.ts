import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

/**
 * Lookup order by ID to get checkoutOrderId
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId parameter is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      select: {
        id: true,
        orderNumber: true,
        checkoutOrderId: true,
        status: true,
        totalAmount: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutOrderId: order.checkoutOrderId,
      status: order.status,
      totalAmount: order.totalAmount
    });

  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup order' },
      { status: 500 }
    );
  }
}

