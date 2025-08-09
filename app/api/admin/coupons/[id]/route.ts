import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(coupon);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: body.code,
        type: body.type,
        amount: Number(body.amount),
        active: body.active,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        usageLimit: body.usageLimit ?? null,
        applicableCourseIds: body.applicableCourseIds ?? null,
      } as any,
    });
    return NextResponse.json(coupon);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 