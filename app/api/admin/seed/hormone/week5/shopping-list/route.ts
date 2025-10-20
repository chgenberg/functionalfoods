import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 5
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 5
    const week = 5;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in samtliga rader som "ingredient"-strängar
    const ingredients: string[] = [
      // TORRVAROR
      '1 dl havregryn',
      '3/4 dl pumpafrön',
      '2 msk kokosgrädde',
      '3 msk olivolja',
      '1/2 tsk agavesirap',
      '1,5 tsk flytande honung',
      '2 msk mandelspån',
      '1 msk jordnötter',
      '1 msk jordnötssmör',
      '3/4 dl Panko Crunchy Crumbs (glutenfritt ströbröd)',
      // MEJERI
      '2 tsk smör',
      '1 dl mjölk',
      '50 g gorgonzola',
      '1 skiva ost',
      '100 g getost',
      '3 msk gräddfil',
      '1/2 dl creme fraiche',
      '1,5 dl grekisk yoghurt',
      '30 g fetaost',
      '1,5 dl keso',
      '1 msk grädde',
      // KÖTT/FISK/FÅGEL/ÄGG/VEGO
      '1 skiva skinka',
      '125 g kycklingfärs',
      '300 g kycklingfile',
      '600 g torskrygg',
      '50 g rökt lax',
      '25 g bacon',
      '3 st ägg',
      '600 g nötfärs',
      '300 g laxfile',
      // FRUKT/GRÖNT
      '1/2 st vitlök',
      '1/4 st paprika',
      '1/2 st banan',
      '175 g sockerärtor',
      '5 cm färsk ingefära',
      '100 g rättika',
      '650 g blomkål',
      '1/2 st bifftomat',
      '3 st rödbetor',
      '75 g grön sparris',
      '1 dl frysta bär',
      '1 st squash',
      '1,25 st citron',
      '250 g broccoli',
      '1,25 st fänkål',
      '3 st morötter',
      '16 st cocktailtomater',
      '1 st selleristjälk',
      '3,25 st rödlökar',
      '2 st kvisttomater',
      '1 dl granatäpplekärnor',
      '3 st rädisor',
      '10 st brysselkål',
      '1 st äpple',
      // KRYDDOR/SMAKSÄTTARE
      '1/2 krm spiskummin',
      '3 msk mango chutney',
      '3 msk färsk gräslök',
      '2,5 krm örtagårdskrydda',
      '2 msk sweet chilisås',
      '1,5 dl färsk persilja',
      '3 msk färsk dill',
      '1 kvist rosmarin',
      '120 g Teriyaki woksås (Blue dragon)',
      // ÖVRIGT
      '1 msk majonnäs',
      '1,5 msk röd pesto',
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
    console.error('Seed hormone week5 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 5 shopping list' }, { status: 500 });
  }
}


