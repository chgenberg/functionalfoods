import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authResult = await requireAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const active = searchParams.get('active');

    const where: any = {};
    if (q) where.code = { contains: q, mode: 'insensitive' };
    if (active !== null) where.active = active === 'true';

    const coupons = await prisma.coupon.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ coupons });
  } catch (e) {
    console.error('Coupons GET error', e);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.code || !body.type || body.amount === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: code, type, amount' 
      }, { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: body.code.toUpperCase() }
    });
    
    if (existing) {
      return NextResponse.json({ 
        error: 'En rabattkod med denna kod finns redan' 
      }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        amount: Number(body.amount),
        active: body.active ?? true,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        applicableCourseIds: body.applicableCourseIds || []
      },
    });
    return NextResponse.json(coupon);
  } catch (e) {
    console.error('Coupons POST error', e);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
} 