import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed MealPlanWeek for Hormonell Balans, vecka 1
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const course = 'hormone';
    const weekNumber = 1;

    const days = {
      'Måndag': {
        breakfast: { name: 'Ostmacka med paprika' },
        lunch: { name: 'Laxsallad med ägg' },
        dinner: { name: 'Lövbiff teriyaki med nudelsallad' },
        snack: { name: 'Kavring med frön' }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te' },
        lunch: { name: 'Torskgryta med rotfrukter och curry' },
        dinner: { name: 'Kycklingbiffar med mangosalsa' },
        snack: { name: 'Kokosgranola' }
      },
      'Onsdag': {
        breakfast: { name: 'Yoghurt med kokosgranola' },
        lunch: { name: 'Lövbiff teriyaki med nudelsallad (rester)' },
        dinner: { name: 'Ratatouille med quinoa och raita' }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te' },
        lunch: { name: 'Kycklingbiffar med mangosalsa (rester)' },
        dinner: { name: 'Tomatsoppa med kanel och ingefära' }
      },
      'Fredag': {
        breakfast: { name: 'Mangosmoothie med spenat' },
        lunch: { name: 'Ratatouille med quinoa och raita (rester)' },
        dinner: { name: 'Kycklinggryta med garam masala' }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te' },
        lunch: { name: 'Kycklinggryta med garam masala (rester)' },
        dinner: { name: 'Köttfärsbiffar med champinjonhattar' },
        dessert: { name: 'Snickerskaka' }
      },
      'Söndag': {
        breakfast: { name: 'Mangosmoothie med spenat (rester)' },
        lunch: { name: 'Köttfärsbiffar med champinjonhattar (rester)' },
        dinner: { name: 'Stekt lax med citronmarinerad broccoli' }
      }
    } as any;

    // Upsert meal plan week
    const week = await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 1', days },
      update: { title: 'Vecka 1', days }
    });

    return NextResponse.json({ ok: true, week });
  } catch (error) {
    console.error('Seed hormone week1 error:', error);
    return NextResponse.json({ error: 'Failed to seed week 1' }, { status: 500 });
  }
}


