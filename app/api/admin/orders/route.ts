import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAdminAuth } from '@/app/lib/admin-auth';
import { logInfo, logError } from '@/app/lib/monitoring';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders - Get all orders with payment info
 */
export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json([]);
  }

  return withAdminAuth(async (req, adminUser) => {
    try {
      logInfo('Admin fetching orders', { adminUser: adminUser.email });

      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      // Build where clause
      const where: any = {};
      if (status && status !== 'ALL') {
        where.status = status;
      }

      // Fetch orders with full related data
      const orders = await prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          },
          items: {
            include: {
              course: {
                select: {
                  name: true,
                  title: true
                }
              }
            }
          },
          payment: {
            select: {
              id: true,
              status: true,
              paymentMethod: true,
              externalId: true,
              processedAt: true,
              failureReason: true,
              gatewayResponse: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      // Get total count for pagination
      const totalCount = await prisma.order.count({ where });

      // Format response
      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: 'SEK',
        createdAt: order.createdAt.toISOString(),
        user: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          customerSince: order.user.createdAt.toISOString()
        },
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
          course: item.course ? {
            name: item.course.name || item.course.title
          } : null
        })),
        payment: order.payment ? {
          id: order.payment.id,
          status: order.payment.status,
          paymentMethod: order.payment.paymentMethod,
          externalId: order.payment.externalId,
          processedAt: order.payment.processedAt?.toISOString(),
          failureReason: order.payment.failureReason
        } : null
      }));

      logInfo('Orders fetched successfully', { 
        count: formattedOrders.length,
        totalCount,
        adminUser: adminUser.email 
      });

      return NextResponse.json({
        orders: formattedOrders,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      });

    } catch (error) {
      logError('Failed to fetch orders', { error, adminUser: adminUser.email });
      return NextResponse.json(
        { error: 'Ett fel uppstod vid hämtning av beställningar' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  });
}

/**
 * PUT /api/admin/orders - Update order status
 */
export async function PUT(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ success: false, error: 'Not available during build' });
  }

  return withAdminAuth(async (req, adminUser) => {
    try {
      const { orderId, status, note } = await req.json();

      if (!orderId || !status) {
        return NextResponse.json(
          { error: 'Order ID och status krävs' },
          { status: 400 }
        );
      }

      logInfo('Admin updating order status', { 
        orderId, 
        newStatus: status, 
        adminUser: adminUser.email 
      });

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: status,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              course: {
                select: {
                  name: true
                }
              }
            }
          },
          payment: true
        }
      });

      logInfo('Order status updated successfully', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        newStatus: status,
        adminUser: adminUser.email
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: `Order ${updatedOrder.orderNumber} uppdaterad till ${status}`
      });

    } catch (error) {
      logError('Failed to update order', { error, adminUser: adminUser.email });
      return NextResponse.json(
        { error: 'Ett fel uppstod vid uppdatering av beställning' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  });
} 