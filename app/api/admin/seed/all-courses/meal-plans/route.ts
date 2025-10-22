import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { mealPlans as basicMealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Seed Basic, Flow, and Energy meal plans from static TypeScript files to DB
 * This is 100% safe - static files remain unchanged, API continues using them
 * This allows editing in admin while customers still see static data
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const results: any = {
      basic: { created: 0, updated: 0 },
      flow: { created: 0, updated: 0 },
      energy: { created: 0, updated: 0 }
    };

    // Seed Basic
    for (const [key, plan] of Object.entries(basicMealPlans)) {
      const weekNumber = parseInt(key.replace('week', ''), 10);
      const existing = await prisma.mealPlanWeek.findUnique({
        where: { course_weekNumber: { course: 'basic', weekNumber } }
      });

      if (existing) {
        await prisma.mealPlanWeek.update({
          where: { id: existing.id },
          data: { title: plan.title, days: plan.days as any }
        });
        results.basic.updated++;
      } else {
        await prisma.mealPlanWeek.create({
          data: {
            course: 'basic',
            weekNumber,
            title: plan.title,
            days: plan.days as any
          }
        });
        results.basic.created++;
      }
    }

    // Seed Flow
    for (const [key, plan] of Object.entries(flowMealPlans)) {
      const weekNumber = parseInt(key.replace('week', ''), 10);
      const existing = await prisma.mealPlanWeek.findUnique({
        where: { course_weekNumber: { course: 'flow', weekNumber } }
      });

      if (existing) {
        await prisma.mealPlanWeek.update({
          where: { id: existing.id },
          data: { title: plan.title, days: plan.days as any }
        });
        results.flow.updated++;
      } else {
        await prisma.mealPlanWeek.create({
          data: {
            course: 'flow',
            weekNumber,
            title: plan.title,
            days: plan.days as any
          }
        });
        results.flow.created++;
      }
    }

    // Seed Energy
    for (const [key, plan] of Object.entries(energyMealPlans)) {
      const weekNumber = parseInt(key.replace('week', ''), 10);
      const existing = await prisma.mealPlanWeek.findUnique({
        where: { course_weekNumber: { course: 'energy', weekNumber } }
      });

      if (existing) {
        await prisma.mealPlanWeek.update({
          where: { id: existing.id },
          data: { title: plan.title, days: plan.days as any }
        });
        results.energy.updated++;
      } else {
        await prisma.mealPlanWeek.create({
          data: {
            course: 'energy',
            weekNumber,
            title: plan.title,
            days: plan.days as any
          }
        });
        results.energy.created++;
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Meal plans seeded from static files to DB (customers still see static files)',
      results
    });
  } catch (error) {
    console.error('Seed all courses meal plans error:', error);
    return NextResponse.json({ error: 'Failed to seed meal plans' }, { status: 500 });
  }
}

