import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { getSveaCheckout } from '@/app/lib/svea-checkout-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/svea-refunds - Refund a SVEA payment
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { orderId, amount, reason = 'requested_by_customer' } = await request.json();

    if (!orderId) {
      return NextResponse.json({
        error: 'Order ID is required'
      }, { status: 400 });
    }

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    });

    if (!order) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    // Check if order is SVEA
    const checkoutOrderId = order.checkoutOrderId;
    if (!checkoutOrderId) {
      return NextResponse.json({
        error: 'This order is not a SVEA order'
      }, { status: 400 });
    }

    // Check if already refunded
    const metadata = order.metadata as any;
    if (metadata?.refunded) {
      return NextResponse.json({
        error: 'Order has already been refunded'
      }, { status: 400 });
    }

    // Get SVEA order details
    const sveaCheckout = getSveaCheckout();
    const sveaOrder = await sveaCheckout.getOrder(parseInt(checkoutOrderId));

    if (sveaOrder.status !== 'Final') {
      return NextResponse.json({
        error: `Cannot refund order with status: ${sveaOrder.status}. Order must be Final.`
      }, { status: 400 });
    }

    // Calculate refund amount (in öre)
    const refundAmountOre = amount 
      ? Math.round(amount * 100) 
      : Math.round(order.totalAmount * 100);

    console.log('🔄 Processing SVEA refund:', {
      orderId,
      checkoutOrderId,
      refundAmountOre,
      orderTotal: order.totalAmount,
      reason
    });

    // SVEA uses credit orders for refunds
    // We need to create a credit order with negative amounts
    const creditItems = order.items.map(item => {
      // Calculate item total in öre (inkl. VAT)
      const VAT_RATE = 0.25;
      const priceInclVAT = item.price * (1 + VAT_RATE);
      const itemTotalOre = Math.round(priceInclVAT * 100) * item.quantity;
      
      // Calculate proportional refund if partial
      const refundRatio = amount ? (amount / order.totalAmount) : 1;
      const refundItemTotalOre = Math.round(itemTotalOre * refundRatio);

      return {
        articleNumber: item.id || `ITEM-${item.id}`,
        name: item.name,
        quantity: item.quantity,
        unitPrice: -refundItemTotalOre / item.quantity, // Negative for credit
        vatPercent: 2500, // 25%
        unit: 'st',
        discountPercent: 0
      };
    });

    // Create credit order via SVEA API
    // Note: SVEA may require you to use their admin panel or specific credit API
    // This is a simplified implementation - you may need to adjust based on SVEA's actual API
    const creditOrder = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `REFUND-${orderId}-${Date.now()}`,
      merchantSettings: {
        termsUri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.functionalfoods.se'}/anvandarvillkor`,
        checkoutUri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.functionalfoods.se'}/checkout`,
        confirmationUri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.functionalfoods.se'}/admin/sales-complete`,
        pushUri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.functionalfoods.se'}/api/webhooks/svea-v2`
      },
      cart: {
        items: creditItems
      },
      merchantData: orderId
    };

    // For SVEA, refunds are typically handled through their admin panel
    // or via a specific credit API endpoint. Since we don't have direct access
    // to SVEA's credit API in the Checkout API, we'll mark it as refunded in our DB
    // and log it. The actual refund should be processed manually in SVEA's admin panel
    // or via their separate credit API if available.

    // Update order in database to mark as refunded
    const refundAmount = refundAmountOre / 100;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...metadata,
          refunded: true,
          refundAmount: refundAmount,
          refundReason: reason,
          refundedAt: new Date().toISOString(),
          creditOrderData: creditOrder // Store credit order data for reference
        }
      }
    });

    // Remove purchases if full refund
    if (!amount || refundAmount >= order.totalAmount) {
      const courseItems = order.items.filter(item => item.type === 'course' && item.courseId);
      for (const item of courseItems) {
        if (item.courseId && order.userId) {
          await prisma.purchase.deleteMany({
            where: {
              userId: order.userId,
              courseId: item.courseId
            }
          });
          console.log(`✅ Removed purchase for course: ${item.courseId}`);
        }
      }
    }

    console.log('✅ SVEA refund processed:', {
      orderId,
      refundAmount,
      fullRefund: !amount || refundAmount >= order.totalAmount
    });

    return NextResponse.json({
      success: true,
      refund: {
        orderId,
        amount: refundAmount,
        currency: 'SEK',
        status: 'pending', // SVEA refunds may need manual processing
        created: new Date().toISOString(),
        reason
      },
      message: `Återbetalning på ${refundAmount} SEK har registrerats. Observera: Den faktiska återbetalningen måste genomföras i SVEA:s admin-panel eller via deras kredit-API.`,
      note: 'Credit order data has been stored. Please process the refund in SVEA admin panel or contact SVEA support.'
    });

  } catch (error) {
    console.error('❌ SVEA refund processing failed:', error);

    return NextResponse.json({
      error: 'Failed to process refund',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

