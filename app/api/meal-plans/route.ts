import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans as basicMealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseRaw = (searchParams.get('course') || 'basic').toLowerCase();
    const weekNumber = parseInt(searchParams.get('week') || '1', 10);

    // If course is 'hormone', use DB exclusively (no static fallback)
    if (courseRaw === 'hormone') {
      const row = await (prisma as any).mealPlanWeek?.findUnique({
        where: { course_weekNumber: { course: 'hormone', weekNumber } }
      });
      if (row) {
        return NextResponse.json({ title: row.title || `Vecka ${weekNumber}`, days: row.days }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return NextResponse.json({ title: `Vecka ${weekNumber}`, days: {} }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // For basics/flow/energy: normalize and prefer static TS
    const course = (courseRaw.includes('flow')
      ? 'flow'
      : courseRaw.includes('energy') || courseRaw.includes('insulin')
      ? 'energy'
      : 'basic') as 'basic' | 'flow' | 'energy';

    const row = await (prisma as any).mealPlanWeek?.findUnique({
      where: { course_weekNumber: { course, weekNumber } }
    });

    const map = course === 'basic' ? basicMealPlans : course === 'flow' ? flowMealPlans : energyMealPlans;
    const weekKey = `week${weekNumber}` as keyof typeof map;
    const staticWeek = (map as any)[weekKey];

    if (staticWeek) {
      return NextResponse.json({
        title: row?.title || staticWeek.title || `Vecka ${weekNumber}`,
        days: staticWeek.days
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (row) {
      return NextResponse.json({ title: row.title || `Vecka ${weekNumber}`, days: row.days }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ title: `Vecka ${weekNumber}`, days: {} }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Meal Plans API error:', e);
    return NextResponse.json({ title: '', days: {} }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 