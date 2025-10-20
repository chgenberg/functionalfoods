import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { weeks = [2,3,4,5,6] } = await req.json().catch(() => ({ weeks: [2,3,4,5,6] }));
    const course = 'hormone';

    const updated: Array<{ week: number; updates: number }> = [];
    for (const w of weeks) {
      const mp = await (prisma as any).mealPlanWeek?.findUnique({ where: { course_weekNumber: { course, weekNumber: w } } });
      if (!mp?.days) { updated.push({ week: w, updates: 0 }); continue; }

      const daysOrder = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
      let changes = 0;
      const days = { ...mp.days } as any;
      for (const dayName of daysOrder) {
        const day = days[dayName] || days[`day${daysOrder.indexOf(dayName)+1}`];
        if (!day) continue;
        for (const key of ['breakfast','lunch','dinner','snack','dessert']) {
          const meal = day[key];
          if (!meal?.name) continue;
          const baseName = meal.name.replace(/\s*\(rester.*\)$/i, '').trim();
          if (!meal.recipeLink) {
            meal.recipeLink = `/kunskapsbank/recept/${slugify(baseName)}`;
            changes++;
          }
        }
      }

      if (changes > 0) {
        await (prisma as any).mealPlanWeek?.update({
          where: { course_weekNumber: { course, weekNumber: w } },
          data: { days }
        });
      }
      updated.push({ week: w, updates: changes });
    }

    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error('Normalize missing links error:', error);
    return NextResponse.json({ error: 'Failed to normalize links' }, { status: 500 });
  }
}


