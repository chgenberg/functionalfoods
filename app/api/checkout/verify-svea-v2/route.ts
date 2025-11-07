import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { getSveaCheckout, SveaCheckoutService } from '@/app/lib/svea-checkout-service';
import { emailService } from '@/app/lib/email';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

interface VerifyRequest {
  checkoutOrderId: string;
  orderId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkoutOrderId, orderId: clientOrderId } = body;

    if (!checkoutOrderId || !clientOrderId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // If simulation is enabled, treat as completed without contacting Svea
    if (process.env.PAYMENTS_SIMULATE === 'true' || checkoutOrderId === 'SIMULATED') {
      const order = await prisma.order.findUnique({
        where: { id: clientOrderId },
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
          items: order.items.map(i => ({ productId: i.courseId || i.id, productName: i.name, productType: i.type, quantity: i.quantity, price: i.price }))
        }
      });
    }

    // Initialize Svea service
    const sveaCheckout = getSveaCheckout();

    // Get order from Svea
    const sveaOrder = await sveaCheckout.getOrder(parseInt(checkoutOrderId));
    
    console.log('🔍 Verifying Svea order:', {
      checkoutOrderId,
      orderId: clientOrderId,
      sveaStatus: sveaOrder.status
    });

    // Check if payment is completed
    const isCompleted = SveaCheckoutService.isOrderCompleted(sveaOrder.status);

    // Get our order from database
    const order = await prisma.order.findUnique({
      where: { id: clientOrderId },
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
          productId: item.courseId || item.id,
          productName: item.name,
          productType: item.type,
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
          customerEmail: sveaOrder.customer?.email || order.customerEmail,
          customerName: `${sveaOrder.customer?.firstName || ''} ${sveaOrder.customer?.lastName || ''}`.trim() || order.customerName,
          metadata: {
            ...order.metadata as any,
            sveaOrderId: sveaOrder.id,
            sveaStatus: sveaOrder.status,
            sveaPaymentType: sveaOrder.paymentType,
            verifiedAt: new Date().toISOString(),
            processedAt: new Date().toISOString()
          }
        }
      });

      // Create purchases for courses if user exists
      if (order.userId) {
        const courseItems = order.items.filter(item => item.type === 'course');
        
        // Course name mapping for exact matching
        const courseNameMap: Record<string, string> = {
          'hormonell balans': 'Hormonell Balans',
          'functional flow': 'Functional Flow',
          'functional gut health/flow': 'Functional Flow',
          'functional basics': 'Functional Basics',
          'functional energy': 'Functional Energy',
          'functional insulin balance/energy': 'Functional Energy'
        };
        
        for (const item of courseItems) {
          // Use courseId if available, otherwise match by name
          let courseId = item.courseId;
          
          if (!courseId) {
            // Match course by name using same logic as other webhooks
            const normalizedName = item.name.toLowerCase().trim();
            const mappedName = courseNameMap[normalizedName] || item.name;
            
            // Try exact match first (case-insensitive)
            let course = await prisma.courseProduct.findFirst({
              where: {
                name: { equals: mappedName, mode: 'insensitive' }
              }
            });
            
            // If no exact match, try original name
            if (!course) {
              course = await prisma.courseProduct.findFirst({
                where: {
                  name: { equals: item.name, mode: 'insensitive' }
                }
              });
            }
            
            // Only use contains as last resort, and be more specific
            if (!course && item.name.toLowerCase().includes('functional')) {
              const functionalPart = item.name.split('Functional ')[1]?.trim();
              if (functionalPart) {
                course = await prisma.courseProduct.findFirst({
                  where: {
                    AND: [
                      { name: { contains: 'Functional', mode: 'insensitive' } },
                      { name: { contains: functionalPart, mode: 'insensitive' } }
                    ]
                  }
                });
              }
            }
            
            if (!course) {
              console.error(`❌ Course not found for: "${item.name}"`);
              continue;
            }
            
            courseId = course.id;
            console.log(`✅ Matched course: "${item.name}" → "${course.name}"`);
            
            // Update order item with courseId for future reference
            await prisma.orderItem.update({
              where: { id: item.id },
              data: { courseId: course.id }
            });
          }
          
          // Check if purchase already exists
          const existingPurchase = await prisma.purchase.findUnique({
            where: {
              userId_courseId: {
                userId: order.userId,
                courseId: courseId
              }
            }
          });

          if (!existingPurchase) {
            await prisma.purchase.create({
              data: {
                userId: order.userId,
                courseId: courseId,
                amount: item.price * (item.quantity || 1),
                status: 'completed',
                orderId: order.id,
                accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
              }
            });
            console.log(`✅ Created purchase for course: ${courseId}`);
          }
        }
      }

      response.order.status = 'COMPLETED';
      response.paymentCompleted = true; // Force to true after fast-tracking
    }

    console.log('✅ Returning verification response:', {
      success: response.success,
      paymentCompleted: response.paymentCompleted,
      orderStatus: response.orderStatus,
      orderDbStatus: response.order.status
    });

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
  }
}
