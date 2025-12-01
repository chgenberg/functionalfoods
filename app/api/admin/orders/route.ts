import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json([]);
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            lastLogin: true
          }
        },
        items: true,
        payment: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            externalId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 200 // Increased to allow proper date filtering
    });

    const formattedOrders = orders.map((order) => {
      const metadata = (order.metadata as any) || {};
      const actualPaidAmount =
        typeof metadata?.actualPaidAmount === 'number'
          ? metadata.actualPaidAmount
          : typeof metadata?.displayTotalAmount === 'number'
            ? metadata.displayTotalAmount
            : null;

      const displayTotalAmount =
        actualPaidAmount && actualPaidAmount > 0
          ? actualPaidAmount
          : order.totalAmount;

      const VAT_RATE = 0.25;

      const items = order.items.map((item) => {
        const priceInclVAT =
          Math.round(item.price * (1 + VAT_RATE) * 100) / 100;

        return {
          ...item,
          priceInclVAT,
        };
      });

      return {
        ...order,
        totalAmount: displayTotalAmount,
        metadata: {
          ...metadata,
          actualPaidAmount: displayTotalAmount,
        },
        items,
      };
    });

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 