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
    const weekNumber = 3;

    const link = (title: string) => `/kunskapsbank/recept/${slugify(title)}`;

    const days = {
      'Måndag': {
        breakfast: { name: 'Bärsmoothie (rester)', recipeLink: link('Bärsmoothie') },
        lunch: { name: 'Kyckling med blomkålsmos (rester)', recipeLink: link('Kyckling med blomkålsmos') },
        dinner: { name: 'Högrevsburgare med mango', recipeLink: link('Högrevsburgare med mango') }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Tomatsoppa med kanel och ingefära (rester från frysen)', recipeLink: link('Tomatsoppa med kanel och ingefära') },
        dinner: { name: 'Torskgratäng med champinjoner', recipeLink: link('Torskgratäng med champinjoner') }
      },
      'Onsdag': {
        breakfast: { name: 'Omelett med skinka', recipeLink: link('Omelett med skinka') },
        lunch: { name: 'Högrevsburgare med mango (rester)', recipeLink: link('Högrevsburgare med mango') },
        dinner: { name: 'Kycklinggryta med garam masala (rester från frysen)', recipeLink: link('Kycklinggryta med garam masala') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Torskgratäng med champinjoner (rester)', recipeLink: link('Torskgratäng med champinjoner') },
        dinner: { name: 'Falafel med grönsaker', recipeLink: link('Falafel med grönsaker') }
      },
      'Fredag': {
        breakfast: { name: 'Ost och skinkmacka med gurka', recipeLink: link('Ost och skinkmacka med gurka') },
        lunch: { name: 'Falafel med grönsaker (rester)', recipeLink: link('Falafel med grönsaker') },
        dinner: { name: 'Italiensk pizza med skinka', recipeLink: link('Italiensk pizza med skinka') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Italiensk pizza med skinka (rester)', recipeLink: link('Italiensk pizza med skinka') },
        dinner: { name: 'Scampi med mangosallad', recipeLink: link('Scampi med mangosallad') },
        dessert: { name: 'Fruktsallad med chokladkräm', recipeLink: link('Fruktsallad med chokladkräm') }
      },
      'Söndag': {
        breakfast: { name: 'Bananpannkaka med frukt och bär', recipeLink: link('Bananpannkaka med frukt och bär') },
        lunch: { name: 'Scampi med mangosallad (rester)', recipeLink: link('Scampi med mangosallad') },
        dinner: { name: 'Kyckling med grön curry', recipeLink: link('Kyckling med grön curry') }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 3', days },
      update: { title: 'Vecka 3', days }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Seed hormone week3 meal-plan error:', error);
    return NextResponse.json({ error: 'Failed to seed week 3 meal plan' }, { status: 500 });
  }
}


