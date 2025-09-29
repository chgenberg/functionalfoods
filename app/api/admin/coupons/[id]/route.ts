import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!coupon) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(coupon);
  } catch (e) {
    console.error('Coupon GET error', e);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    
    // Check if changing code to something that already exists
    if (body.code) {
      const existing = await prisma.coupon.findFirst({
        where: { 
          code: body.code.toUpperCase(),
          id: { not: params.id }
        }
      });
      
      if (existing) {
        return NextResponse.json({ 
          error: 'En rabattkod med denna kod finns redan' 
        }, { status: 400 });
      }
    }
    
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: body.code ? body.code.toUpperCase() : undefined,
        type: body.type,
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        active: body.active,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        usageLimit: body.usageLimit !== undefined ? (body.usageLimit ? Number(body.usageLimit) : null) : undefined,
        applicableCourseIds: body.applicableCourseIds !== undefined ? body.applicableCourseIds : undefined
      },
    });
    return NextResponse.json(coupon);
  } catch (e) {
    console.error('Coupon PUT error', e);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await requireAdminAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Coupon DELETE error', e);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
} 