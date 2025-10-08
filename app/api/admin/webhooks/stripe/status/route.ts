import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h

    const [pendingPayments, processingPayments, recentUnfinishedOrders, lastPayment, lastOrder] = await Promise.all([
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { createdAt: { gte: since }, NOT: { status: 'COMPLETED' } } }),
      prisma.payment.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true, status: true } }),
      prisma.order.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true, status: true } }),
    ]);

    const healthy = pendingPayments === 0 && processingPayments === 0 && recentUnfinishedOrders === 0;

    return NextResponse.json({
      healthy,
      windowHours: 24,
      counts: {
        pendingPayments,
        processingPayments,
        recentUnfinishedOrders
      },
      lastActivity: {
        payment: lastPayment || null,
        order: lastOrder || null
      }
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Webhook status error:', error);
    return NextResponse.json({ healthy: false, error: 'Failed to read webhook status' }, { status: 500 });
  }
}


