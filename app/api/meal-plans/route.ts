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

    // DB is the single source of truth. Do not fall back to TS.
    const row = await (prisma as any).mealPlanWeek?.findUnique({
      where: { course_weekNumber: { course, weekNumber } }
    });

    if (row) {
      return NextResponse.json({
        title: row.title || `Vecka ${weekNumber}`,
        days: row.days
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // If not found, return an empty structure so UI doesn't show stale content
    return NextResponse.json({ title: `Vecka ${weekNumber}`, days: {} }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Meal Plans API error:', e);
    return NextResponse.json({ title: '', days: {} }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 