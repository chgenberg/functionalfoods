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
    const weekNumber = 4;
    const link = (title: string) => `/kunskapsbank/recept/${slugify(title)}`;

    const days = {
      'Måndag': {
        breakfast: { name: 'Ägghack med skinka och äpple', recipeLink: link('Ägghack med skinka och äpple') },
        lunch: { name: 'Kyckling med grön curry (rester)', recipeLink: link('Kyckling med grön curry') },
        dinner: { name: 'Wokad lövbiff med nudlar', recipeLink: link('Wokad lövbiff med nudlar') }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Torskgratäng med champinjoner (rester från frysen)', recipeLink: link('Torskgratäng med champinjoner') },
        dinner: { name: 'Bondsoppa med vita bönor', recipeLink: link('Bondsoppa med vita bönor') }
      },
      'Onsdag': {
        breakfast: { name: 'Havregrynsgröt med bär och kokos', recipeLink: link('Havregrynsgröt med bär och kokos') },
        lunch: { name: 'Wokad lövbiff med nudlar (rester)', recipeLink: link('Wokad lövbiff med nudlar') },
        dinner: { name: 'Kycklinggryta med garam masala (rester från frysen)', recipeLink: link('Kycklinggryta med garam masala') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Bondsoppa med vita bönor (rester)', recipeLink: link('Bondsoppa med vita bönor') },
        dinner: { name: 'Asiatisk tonfisksallad', recipeLink: link('Asiatisk tonfisksallad') }
      },
      'Fredag': {
        breakfast: { name: 'Yoghurt med kokosgranola, frukt och bär', recipeLink: link('Yoghurt med kokosgranola, frukt och bär') },
        lunch: { name: 'Asiatisk tonfisksallad (rester)', recipeLink: link('Asiatisk tonfisksallad') },
        dinner: { name: 'Kycklinggryta med mango och linser', recipeLink: link('Kycklinggryta med mango och linser') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kycklinggryta med mango och linser (rester)', recipeLink: link('Kycklinggryta med mango och linser') },
        dinner: { name: 'Köttfärsbiffar med sötpotatis', recipeLink: link('Köttfärsbiffar med sötpotatis') },
        dessert: { name: 'Mandarin med kanelkräm', recipeLink: link('Mandarin med kanelkräm') }
      },
      'Söndag': {
        breakfast: { name: 'Stekt ägg med majonnäs', recipeLink: link('Stekt ägg med majonnäs') },
        lunch: { name: 'Köttfärsbiffar med sötpotatis (rester)', recipeLink: link('Köttfärsbiffar med sötpotatis') },
        dinner: { name: 'Lax med quinoasallad', recipeLink: link('Lax med quinoasallad') }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 4', days },
      update: { title: 'Vecka 4', days }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Seed hormone week4 meal-plan error:', error);
    return NextResponse.json({ error: 'Failed to seed week 4 meal plan' }, { status: 500 });
  }
}


