import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 3
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 3
    const week = 3;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in samtliga rader (som givits av kunden) som "ingredient"-strängar
    const ingredients: string[] = [
      // KÖTT/FISK/FÅGEL/ÄGG/VEGO
      '300 g högrevsburgare',
      '1 skiva skinka',
      '700 g torskrygg',
      '75 g lufttorkad skinka',
      '5 st ägg',
      '250 g fryst scampi',
      '25 g rökt skinka',
      '300 g kycklinglårfile',
      // TORRVAROR
      '1,5 msk olivolja',
      '1 tsk bakpulver',
      '200 ml kokosmjölk',
      '1 msk fiberhusk',
      '10 g vit choklad',
      '1 st tetra konserverade kikärtor (115 g avrunnen vikt)',
      '1/2 dl kokosgrädde',
      '1 msk majsstärkelse',
      '40 g mörk choklad',
      '1/2 dl cashewnötter',
      // KRYDDOR/SMAKSÄTTARE
      'Salt',
      'Svartpeppar',
      '1 tsk örtagårdskrydda',
      '1 krm sambal oelek',
      '3 msk färsk koriander',
      '4 msk färsk mynta',
      '1/2 tsk spiskummin',
      '1 krm torkad oregano',
      '1/2 krm vaniljpulver',
      '1/2 tsk färsk gräslök',
      '1 msk färsk basilika',
      '1 tsk ketjap manis',
      '2,5 msk sweet chilisås',
      '2 msk färsk persilja',
      '2 msk mango chutney',
      '20 g Green Curry kryddmix (Santa Maria)',
      // FRUKT/GRÖNT
      '80 g spenat',
      '490 g cocktailtomater',
      '1/4 st vitlök',
      '11 cm gurka',
      '350 g champinjoner',
      '1/2 st röd chili',
      '1 st banan',
      '100 g sockerärtor',
      '1,5 st citroner',
      '1/2 st gul lök',
      '1/4 st lime',
      '1 st paprika',
      '1,75 st rödlök',
      '6 cm färsk ingefära',
      '1,5 dl squash',
      '3 st morötter',
      '1 st salladsblad',
      '2 st salladslök',
      '5 st jordgubbar',
      '1 msk granatäppelkärnor',
      '2,5 st mango',
      '2 st kvisttomater',
      '2 st hjärtsalladshuvuden',
      '1 st kiwi',
      '1/2 dl blåbär',
      // MEJERI
      '40 g fetaost',
      '1 skiva ost',
      '150 g riven ost',
      '4 tsk smör',
      '125 g mozzarella',
      '1,25 dl grekisk yoghurt',
      // ÖVRIGT
      '1/2 dl jalapeno',
      '4 msk färdig tomatsås',
    ];

    // 5) Skapa items i bulk
    const chunk = 200;
    for (let i = 0; i < ingredients.length; i += chunk) {
      await prisma.shoppingListItem.createMany({
        data: ingredients.slice(i, i + chunk).map((ingredient) => ({ listId: list!.id, ingredient })),
      });
    }

    return NextResponse.json({ ok: true, listId: list.id, count: ingredients.length });
  } catch (error) {
    console.error('Seed hormone week3 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 3 shopping list' }, { status: 500 });
  }
}


