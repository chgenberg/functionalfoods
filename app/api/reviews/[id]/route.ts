import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient() as any;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const body = await req.json();
    const { status } = body; // 'APPROVED' | 'REJECTED' | 'PENDING'
    const updated = await prisma.courseReview.update({ where: { id: params.id }, data: { status } });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 