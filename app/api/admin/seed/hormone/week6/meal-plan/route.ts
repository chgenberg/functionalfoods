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
    const weekNumber = 6;
    const link = (title: string) => `/kunskapsbank/recept/${slugify(title)}`;

    const days = {
      'Måndag': {
        breakfast: { name: 'Äggröra med bär', recipeLink: link('Äggröra med bär') },
        lunch: { name: 'Panerad kyckling med waldorfsallad (rester)', recipeLink: link('Panerad kyckling med waldorfsallad') },
        dinner: { name: 'Korvstroganoff med svartkål', recipeLink: link('Korvstroganoff med svartkål') }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kesotorsk med mango chutney (rester från frysen)', recipeLink: link('Kesotorsk med mango chutney') },
        dinner: { name: 'Tacosoppa', recipeLink: link('Tacosoppa') }
      },
      'Onsdag': {
        breakfast: { name: 'Yoghurt med blåbär och kokosgranola', recipeLink: link('Yoghurt med blåbär och kokosgranola') },
        lunch: { name: 'Korvstroganoff med svartkål (rester)', recipeLink: link('Korvstroganoff med svartkål') },
        dinner: { name: 'Tofugryta med jordnötter och blomkålsris', recipeLink: link('Tofugryta med jordnötter och blomkålsris') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Tacosoppa (rester)', recipeLink: link('Tacosoppa') },
        dinner: { name: 'Tonfisksallad med tomat', recipeLink: link('Tonfisksallad med tomat') }
      },
      'Fredag': {
        breakfast: { name: 'Keso med persika och jordgubbar', recipeLink: link('Keso med persika och jordgubbar') },
        lunch: { name: 'Tofugryta med jordnötter och blomkålsris (rester)', recipeLink: link('Tofugryta med jordnötter och blomkålsris') },
        dinner: { name: 'Rödbetsquinoa med chevrelax', recipeLink: link('Rödbetsquinoa med chevrelax') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Rödbetsquinoa med chevrelax (rester)', recipeLink: link('Rödbetsquinoa med chevrelax') },
        dinner: { name: 'Persisk köttgryta med råris', recipeLink: link('Persisk köttgryta med råris') },
        dessert: { name: 'Kladdkaka med grädde och hallon', recipeLink: link('Kladdkaka med grädde och hallon') }
      },
      'Söndag': {
        breakfast: { name: 'Blåbärssmoothie', recipeLink: link('Blåbärssmoothie') },
        lunch: { name: 'Persisk köttgryta med råris (rester)', recipeLink: link('Persisk köttgryta med råris') },
        dinner: { name: 'Skinkpaj med broccoli och cheddar', recipeLink: link('Skinkpaj med broccoli och cheddar') }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 6', days },
      update: { title: 'Vecka 6', days }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Seed hormone week6 meal-plan error:', error);
    return NextResponse.json({ error: 'Failed to seed week 6 meal plan' }, { status: 500 });
  }
}


