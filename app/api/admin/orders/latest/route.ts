import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the 5 most recent orders with full details
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        items: {
          include: {
            course: {
              select: {
                name: true,
                price: true,
              }
            }
          }
        },
        payment: true
      }
    });

    // Format orders for easy reading
    const formattedOrders = orders.map(order => ({
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      currency: order.currency,
      user: {
        email: order.user.email,
        name: order.user.name,
      },
      items: order.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
        courseName: item.course?.name,
        coursePrice: item.course?.price,
      })),
      payment: order.payment ? {
        id: order.payment.id,
        status: order.payment.status,
        amount: order.payment.amount,
        paymentMethod: order.payment.paymentMethod,
        externalId: order.payment.externalId,
        processedAt: order.payment.processedAt,
      } : null,
      // Check if amounts match
      verification: {
        orderTotal: order.totalAmount,
        paymentAmount: order.payment?.amount ?? null,
        match: order.payment ? Math.abs(order.totalAmount - order.payment.amount) < 0.01 : null,
        itemsTotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      }
    }));

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: formattedOrders,
      latestOrder: formattedOrders[0] || null,
    });

  } catch (error) {
    console.error('Get latest orders error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
