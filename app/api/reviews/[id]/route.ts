import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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