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
    const course = 'hormone';
    const weekNumber = 2;

    // Helper to link existing recipes where vi har dem från vecka 1
    const linkIfExists = (title: string) => {
      const known = new Set([
        'Stekt lax med citronmarinerad broccoli',
        'Torskgryta med rotfrukter och curry',
      ]);
      return known.has(title) ? `/kunskapsbank/recept/${slugify(title)}` : undefined;
    };

    const days = {
      'Måndag': {
        breakfast: { name: 'Yoghurt med kokosgranola och mango' },
        lunch: { name: 'Stekt lax med citronmarinerad broccoli (rester)', recipeLink: linkIfExists('Stekt lax med citronmarinerad broccoli') },
        dinner: { name: 'Köttfärssås med glutenfri pasta' }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te' },
        lunch: { name: 'Torskgryta med rotfrukter och curry (rester från frysen)', recipeLink: linkIfExists('Torskgryta med rotfrukter och curry') },
        dinner: { name: 'Spenatbiffar med tomatsallad' }
      },
      'Onsdag': {
        breakfast: { name: 'Kokt ägg med kaviar' },
        lunch: { name: 'Köttfärssås med glutenfri pasta (rester)' },
        dinner: { name: 'Kycklingklubbor med kikärtssallad' }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te' },
        lunch: { name: 'Spenatbiffar med tomatsallad (rester)' },
        dinner: { name: 'Mortadella med päron' }
      },
      'Fredag': {
        breakfast: { name: 'Äggröra med tomatsallad' },
        lunch: { name: 'Kycklingklubbor med kikärtssallad (rester)' },
        dinner: { name: 'Köttfärsbiff med champinjonsås' }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten med svart kafffe/te' },
        lunch: { name: 'Köttfärsbiff med champinjonsås (rester)' },
        dinner: { name: 'Lax med saffranssås och quinoasallad' }
      },
      'Söndag': {
        breakfast: { name: 'Bärsmoothie' },
        lunch: { name: 'Lax med saffranssås och quinoasallad (rester)' },
        dinner: { name: 'Kyckling med blomkålsmos' },
        dessert: { name: 'Banankaka' }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 2', days },
      update: { title: 'Vecka 2', days }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Seed hormone week2 meal-plan error:', error);
    return NextResponse.json({ error: 'Failed to seed week 2 meal plan' }, { status: 500 });
  }
}


