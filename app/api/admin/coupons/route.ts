import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient() as any;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const active = searchParams.get('active');

    const where: any = {};
    if (q) where.code = { contains: q, mode: 'insensitive' as const };
    if (active !== null) where.active = active === 'true';

    const coupons = await prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ coupons });
  } catch (e) {
    console.error('Coupons GET error', e);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        type: body.type,
        amount: Number(body.amount),
        active: body.active ?? true,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        usageLimit: body.usageLimit ?? null,
        applicableCourseIds: body.applicableCourseIds ?? null,
      } as any,
    });
    return NextResponse.json(coupon);
  } catch (e) {
    console.error('Coupons POST error', e);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 