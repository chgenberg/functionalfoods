import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const { searchParams } = new URL(req.url);
  const course = searchParams.get('course') || undefined;

  const rows = await (prisma as any).courseWeekMeta?.findMany({
    where: course ? { course } : undefined,
    orderBy: [{ course: 'asc' }, { weekNumber: 'asc' }]
  });
  return NextResponse.json({ weeks: rows || [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const body = await req.json();
  const { course, weekNumber, weekTitle, weekSubtitle, heroImage, videoUrl } = body;
  if (!course || !weekNumber) {
    return NextResponse.json({ error: 'course och weekNumber krävs' }, { status: 400 });
  }

  const row = await (prisma as any).courseWeekMeta?.upsert({
    where: { course_weekNumber: { course, weekNumber } },
    create: { course, weekNumber, weekTitle: weekTitle || null, weekSubtitle: weekSubtitle || null, heroImage: heroImage || null, videoUrl: videoUrl || null },
    update: { weekTitle: weekTitle || null, weekSubtitle: weekSubtitle || null, heroImage: heroImage || null, videoUrl: videoUrl || null }
  });

  return NextResponse.json({ week: row });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const { searchParams } = new URL(req.url);
  const course = searchParams.get('course');
  const weekNumber = parseInt(searchParams.get('week') || '', 10);
  if (!course || !weekNumber) return NextResponse.json({ error: 'course och week krävs' }, { status: 400 });

  await (prisma as any).courseWeekMeta?.delete({
    where: { course_weekNumber: { course, weekNumber } }
  });
  return NextResponse.json({ ok: true });
} 