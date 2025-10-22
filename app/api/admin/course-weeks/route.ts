import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const { searchParams } = new URL(req.url);
  const course = searchParams.get('course');

  try {
    const weeks = await prisma.courseWeekMeta.findMany({
      where: course ? { course } : undefined,
      orderBy: [{ course: 'asc' }, { weekNumber: 'asc' }]
    });

    return NextResponse.json({ weeks }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching course week metas:', error);
    return NextResponse.json({ error: 'Failed to fetch week metas' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const body = await req.json();
    const { course, weekNumber, weekTitle, weekSubtitle, heroImage, videoUrl, welcomeMessage } = body;

    if (!course || !weekNumber) {
      return NextResponse.json({ error: 'course and weekNumber required' }, { status: 400 });
    }

    const week = await prisma.courseWeekMeta.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: {
        course,
        weekNumber,
        weekTitle: weekTitle || null,
        weekSubtitle: weekSubtitle || null,
        heroImage: heroImage || null,
        videoUrl: videoUrl || null,
        welcomeMessage: welcomeMessage || null
      },
      update: {
        weekTitle: weekTitle || null,
        weekSubtitle: weekSubtitle || null,
        heroImage: heroImage || null,
        videoUrl: videoUrl || null,
        welcomeMessage: welcomeMessage || null
      }
    });

    return NextResponse.json({ ok: true, week });
  } catch (error) {
    console.error('Error saving course week meta:', error);
    return NextResponse.json({ error: 'Failed to save week meta' }, { status: 500 });
  }
}
