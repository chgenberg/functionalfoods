import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = (searchParams.get('course') || 'basic') as 'basic' | 'flow' | 'energy';
    const weekNumber = parseInt(searchParams.get('week') || '1', 10);

    try {
      const row = await (prisma as any).courseWeekMeta?.findUnique({
        where: { course_weekNumber: { course, weekNumber } }
      });
      if (row) {
        return NextResponse.json({
          weekTitle: row.weekTitle || null,
          weekSubtitle: row.weekSubtitle || null,
          heroImage: row.heroImage || null,
          videoUrl: row.videoUrl || null
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
    } catch (e) {
      console.warn('CourseWeekMeta not available, using defaults');
    }

    // Default nulls so frontend keeps its current hardcoded values
    return NextResponse.json({ weekTitle: null, weekSubtitle: null, heroImage: null, videoUrl: null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Course Week API error:', e);
    return NextResponse.json({ weekTitle: null, weekSubtitle: null, heroImage: null, videoUrl: null }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 