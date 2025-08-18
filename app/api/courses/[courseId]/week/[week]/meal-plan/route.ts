import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mealPlans, type WeekMealPlan } from '@/app/data/mealPlans';

interface RouteParams {
  params: { courseId: string; week: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { courseId, week } = params;

  const weekNumber = parseInt(week, 10);
  if (!courseId || isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
    return NextResponse.json({ error: 'Invalid courseId or week' }, { status: 400 });
  }

  try {
    // For now we serve from the centralized mealPlans file.
    // Later we can move this to Prisma (e.g., CourseProduct.weeks or a dedicated table).
    const key = `week${weekNumber}` as keyof typeof mealPlans;
    const plan = mealPlans[key] as WeekMealPlan | undefined;

    if (!plan) {
      return NextResponse.json({ error: 'Meal plan not found for this week' }, { status: 404 });
    }

    return NextResponse.json({ courseId, week: weekNumber, plan });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
} 