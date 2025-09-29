import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

function fallbackMealPlan(course: string, weekNumber: number) {
  const key = `week${weekNumber}` as const;
  if (course === 'basic') return (mealPlans as any)[key] || null;
  if (course === 'flow') return (flowMealPlans as any)[key] || null;
  if (course === 'energy') return (energyMealPlans as any)[key] || null;
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = (searchParams.get('course') || 'basic') as 'basic' | 'flow' | 'energy';
    const weekNumber = parseInt(searchParams.get('week') || '1', 10);

    // Remove temporary override for Basic week 1 – now read from DB or fallback

    // Try DB first
    try {
      const row = await (prisma as any).mealPlanWeek?.findUnique({
        where: { course_weekNumber: { course, weekNumber } }
      });
      if (row) {
        return NextResponse.json({
          title: row.title || `Vecka ${weekNumber}`,
          days: row.days
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
    } catch (e) {
      console.warn('MealPlanWeek not available, using fallback');
    }

    // Fallback to static TS
    const fallback = fallbackMealPlan(course, weekNumber);
    if (!fallback) {
      return NextResponse.json({ title: `Vecka ${weekNumber}`, days: {} }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json(fallback, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('Meal Plans API error:', e);
    return NextResponse.json({ title: '', days: {} }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    await prisma.$disconnect();
  }
} 