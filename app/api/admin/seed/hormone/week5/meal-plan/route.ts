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
    const weekNumber = 5;
    const link = (title: string) => `/kunskapsbank/recept/${slugify(title)}`;

    const days = {
      'Måndag': {
        breakfast: { name: 'Ost och skinkmacka', recipeLink: link('Ost och skinkmacka') },
        lunch: { name: 'Lax med quinoasallad (rester)', recipeLink: link('Lax med quinoasallad') },
        dinner: { name: 'Biff med blomkålsmos', recipeLink: link('Biff med blomkålsmos') }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Bondsoppa med vita bönor (rester från frysen)', recipeLink: link('Bondsoppa med vita bönor') },
        dinner: { name: 'Kesotorsk med mango chutney', recipeLink: link('Kesotorsk med mango chutney') }
      },
      'Onsdag': {
        breakfast: { name: 'Havregrynsgröt med banan', recipeLink: link('Havregrynsgröt med banan') },
        lunch: { name: 'Biff med blomkålsmos (rester)', recipeLink: link('Biff med blomkålsmos') },
        dinner: { name: 'Rostad fänkål och rödbeta med getost', recipeLink: link('Rostad fänkål och rödbeta med getost') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kesotorsk med mango chutney (rester)', recipeLink: link('Kesotorsk med mango chutney') },
        dinner: { name: 'Kycklingburgare med citronkräm', recipeLink: link('Kycklingburgare med citronkräm') }
      },
      'Fredag': {
        breakfast: { name: 'Yoghurt med kokosgranola och bär', recipeLink: link('Yoghurt med kokosgranola och bär') },
        lunch: { name: 'Rostad fänkål och rödbeta med getost (rester)', recipeLink: link('Rostad fänkål och rödbeta med getost') },
        dinner: { name: 'Laxwok teriyaki', recipeLink: link('Laxwok teriyaki') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Laxwok teriyaki (rester)', recipeLink: link('Laxwok teriyaki') },
        dinner: { name: 'Minihamburgare med gorgonzola', recipeLink: link('Minihamburgare med gorgonzola') },
        dessert: { name: 'Äpple med jordnötskräm', recipeLink: link('Äpple med jordnötskräm') }
      },
      'Söndag': {
        breakfast: { name: 'Äggröra med lax', recipeLink: link('Äggröra med lax') },
        lunch: { name: 'Minihamburgare med gorgonzola (rester)', recipeLink: link('Minihamburgare med gorgonzola') },
        dinner: { name: 'Panerad kyckling med waldorfsallad', recipeLink: link('Panerad kyckling med waldorfsallad') }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 5', days },
      update: { title: 'Vecka 5', days }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Seed hormone week5 meal-plan error:', error);
    return NextResponse.json({ error: 'Failed to seed week 5 meal plan' }, { status: 500 });
  }
}


