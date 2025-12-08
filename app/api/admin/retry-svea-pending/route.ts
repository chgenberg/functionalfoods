"use server";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Admin-only endpoint to retry verification of Svea orders that are stuck in PENDING.
 * It fetches PENDING orders with a checkoutOrderId older than a short grace period,
 * and calls the existing /api/checkout/verify-svea-v2 to finalize them.
 *
 * Usage (GET):
 *   /api/admin/retry-svea-pending?limit=20&ageMinutes=5
 *
 * Defaults: limit 20, ageMinutes 5.
 */
export async function GET(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'build phase' });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const ageMinutes = Math.max(parseInt(searchParams.get('ageMinutes') || '5', 10), 1);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';

  try {
    const cutoff = new Date(Date.now() - ageMinutes * 60 * 1000);

    const pending = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        checkoutOrderId: { not: null },
        createdAt: { lt: cutoff },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        checkoutOrderId: true,
        createdAt: true,
      },
    });

    const results: Array<{
      orderNumber: string;
      checkoutOrderId: string | null;
      ok: boolean;
      status?: string;
      error?: string;
    }> = [];

    for (const order of pending) {
      try {
        const res = await fetch(`${baseUrl}/api/checkout/verify-svea-v2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutOrderId: order.checkoutOrderId,
            orderId: order.orderNumber,
          }),
        });
        const data = await res.json();
        results.push({
          orderNumber: order.orderNumber,
          checkoutOrderId: order.checkoutOrderId,
          ok: res.ok && data?.success && data?.paymentCompleted,
          status: data?.orderStatus,
          error: res.ok ? data?.error || data?.details : data?.error || res.statusText,
        });
      } catch (err: any) {
        results.push({
          orderNumber: order.orderNumber,
          checkoutOrderId: order.checkoutOrderId,
          ok: false,
          error: err?.message || 'fetch_failed',
        });
      }
    }

    return NextResponse.json({
      ok: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('retry-svea-pending error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'unknown_error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

