import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    console.log('🚀 Starting SAFE Energy migration to database...');
    
    // Step 1: Verify Energy course exists
    const energyCourse = await prisma.courseProduct.findFirst({
      where: { name: 'Functional Energy' }
    });

    if (!energyCourse) {
      return NextResponse.json({
        error: 'Functional Energy course not found in database',
        hint: 'Create the course first'
      }, { status: 404 });
    }

    console.log('✓ Course verified:', energyCourse.name);

    // Step 2: Check if migration already completed (non-destructive check)
    const existingWeeks = await prisma.mealPlanWeek.findMany({
      where: { course: 'energy' },
      select: { weekNumber: true }
    });

    if (existingWeeks.length > 0) {
      return NextResponse.json({
        ok: true,
        message: 'Energy course already migrated to database',
        status: 'ALREADY_MIGRATED',
        weeksInDatabase: existingWeeks.map(w => w.weekNumber)
      });
    }

    console.log('✓ No existing data found - safe to migrate');

    // Step 3: Get all meal plan data from static files
    // The app/data/mealPlans module has the energy meal plans
    const { mealPlans } = await import('@/app/data/mealPlans');

    let migratedWeeks = 0;

    // Step 4: Seed weeks only if they don't exist (SAFE)
    for (let week = 1; week <= 6; week++) {
      const weekKey = `week${week}` as keyof typeof mealPlans;
      const weekData = mealPlans[weekKey];

      if (!weekData) {
        console.log(`⚠️ Week ${week} not found in static data, skipping`);
        continue;
      }

      // Check if this week already exists in database
      const existingWeek = await prisma.mealPlanWeek.findUnique({
        where: { course_weekNumber: { course: 'energy', weekNumber: week } }
      });

      if (existingWeek) {
        console.log(`⏭️ Week ${week} already in database, skipping`);
        continue;
      }

      // Create the week (SAFE - only if doesn't exist)
      await prisma.mealPlanWeek.create({
        data: {
          course: 'energy',
          weekNumber: week,
          title: `Week ${week} - Energy Optimization`,
          days: weekData
        }
      });

      migratedWeeks++;
      console.log(`✓ Migrated week ${week}`);
    }

    console.log(`✓ Migration complete: ${migratedWeeks} weeks migrated`);

    return NextResponse.json({
      ok: true,
      message: 'Energy course safely migrated to database',
      status: 'SUCCESS',
      weeksMigrated: migratedWeeks,
      totalWeeks: 6,
      details: {
        course: energyCourse.name,
        timestamp: new Date().toISOString(),
        note: 'All data is safe - existing data was not overwritten'
      }
    });

  } catch (error) {
    console.error('❌ Safe migration error:', error);
    return NextResponse.json({
      error: 'Failed to safely migrate Energy course',
      details: (error as any).message,
      recovery: 'You can safely retry this operation - it only adds missing data'
    }, { status: 500 });
  }
}
