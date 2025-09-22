import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sveaPayment } from '@/app/lib/svea-payment';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { checkoutOrderId, orderId } = await request.json();

    if (!checkoutOrderId && !orderId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ingen orderinformation angiven' 
      }, { status: 400 });
    }

    // Get order from database
    let order = null;
    
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
    }

    // If we have checkoutOrderId, verify with Svea
    if (checkoutOrderId && !order) {
      try {
        const sveaOrder = await sveaPayment.getOrder(parseInt(checkoutOrderId));
        
        // Find order by Svea checkout order ID in metadata
        order = await prisma.order.findFirst({
          where: {
            metadata: {
              path: ['sveaCheckoutOrderId'],
              equals: parseInt(checkoutOrderId)
            }
          },
          include: { items: true }
        });
      } catch (error) {
        console.error('Error fetching Svea order:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Kunde inte verifiera betalningen med Svea' 
        }, { status: 500 });
      }
    }

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order hittades inte' 
      }, { status: 404 });
    }

    // Check if payment is completed
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ 
        success: false, 
        error: 'Betalningen är inte slutförd än' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        items: order.items,
        createdAt: order.createdAt,
        processedAt: order.processedAt
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ett fel uppstod vid verifiering' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
