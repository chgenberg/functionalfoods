import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

interface Item {
  id: string;
  price: number;
  quantity: number;
  type: 'course' | 'book';
}

function computeDiscountForItems(items: Item[], type: 'percent'|'fixed', amount: number, applicableCourseIds?: string[] | null) {
  const applicableItems = Array.isArray(applicableCourseIds) && applicableCourseIds.length > 0
    ? items.filter((i) => applicableCourseIds.includes(i.id))
    : items;

  const applicableSubtotal = applicableItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (applicableSubtotal <= 0) return { discount: 0, applicableSubtotal: 0 };

  let discount = 0;
  if (type === 'percent') {
    discount = Math.round(applicableSubtotal * (amount / 100));
  } else {
    discount = Math.round(amount);
  }
  if (discount > applicableSubtotal) discount = applicableSubtotal;
  return { discount, applicableSubtotal };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const codeRaw: string = (body.code || '').toString();
    const items: Item[] = Array.isArray(body.items) ? body.items : [];

    if (!codeRaw || items.length === 0) {
      return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
    }

    const code = codeRaw.toUpperCase().trim();
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Rabattkoden hittades inte' }, { status: 404 });
    }

    const now = new Date();
    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'Rabattkoden är inaktiv' }, { status: 400 });
    }
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ valid: false, error: 'Rabattkoden är ännu inte giltig' }, { status: 400 });
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Rabattkoden har gått ut' }, { status: 400 });
    }
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Rabattkoden har nått max antal användningar' }, { status: 400 });
    }

    const applicableCourseIds: string[] | null = coupon.applicableCourseIds ? (Array.isArray(coupon.applicableCourseIds) ? coupon.applicableCourseIds as string[] : null) : null;

    const { discount } = computeDiscountForItems(items, (coupon.type as 'percent'|'fixed'), coupon.amount, applicableCourseIds);

    if (discount <= 0) {
      return NextResponse.json({ valid: false, error: 'Rabattkoden kan inte tillämpas på dessa varor' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
      appliesTo: applicableCourseIds && applicableCourseIds.length > 0 ? applicableCourseIds : 'all',
      discount,
      message: 'Rabattkod tillämpad'
    });
  } catch (e) {
    console.error('Coupon validate error', e);
    return NextResponse.json({ error: 'Kunde inte validera rabattkod' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 