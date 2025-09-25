import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface VerifyRequest {
  checkoutOrderId: string;
  orderId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VerifyRequest;
    const { checkoutOrderId, orderId } = body;

    if (!checkoutOrderId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // If simulation is enabled, treat as completed without contacting Svea
    if (process.env.PAYMENTS_SIMULATE === 'true' || checkoutOrderId === 'SIMULATED') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, user: true }
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        paymentCompleted: true,
        orderStatus: 'COMPLETED',
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          items: order.items.map(i => ({ productId: i.productId, productName: i.productName, productType: i.productType, quantity: i.quantity, price: i.price }))
        }
      });
    }

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // Get order from Svea
    const sveaOrder = await sveaCheckout.getOrder(parseInt(checkoutOrderId));
    
    console.log('🔍 Verifying Svea order:', {
      checkoutOrderId,
      orderId,
      sveaStatus: sveaOrder.status
    });

    // Check if payment is completed
    const isCompleted = SveaCheckoutService.isOrderCompleted(sveaOrder.status);

    // Get our order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare response
    const response = {
      success: true,
      paymentCompleted: isCompleted,
      orderStatus: sveaOrder.status,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        customerEmail: sveaOrder.customer?.email || order.customerEmail,
        customerName: `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
          price: item.price
        }))
      }
    };

    // If payment is completed but order isn't updated yet, update it now
    if (isCompleted && order.status === 'PENDING') {
      console.log('⚡ Fast-tracking order completion from verification');
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          paymentMethod: sveaOrder.paymentType || 'svea',
          customerEmail: sveaOrder.customer?.email || order.customerEmail,
          customerName: `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName,
          metadata: {
            ...order.metadata as any,
            sveaOrderId: sveaOrder.id,
            sveaStatus: sveaOrder.status,
            verifiedAt: new Date().toISOString()
          }
        }
      });

      // Create purchases for courses if user exists
      if (order.userId) {
        const courseItems = order.items.filter(item => item.productType === 'course');
        
        for (const item of courseItems) {
          const existingPurchase = await prisma.purchase.findFirst({
            where: {
              userId: order.userId,
              courseSlug: item.productId
            }
          });

          if (!existingPurchase) {
            await prisma.purchase.create({
              data: {
                userId: order.userId,
                courseSlug: item.productId,
                courseName: item.productName,
                purchasedAt: new Date(),
                amount: item.price,
                orderId: order.id
              }
            });
          }
        }
      }

      response.order.status = 'COMPLETED';
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
