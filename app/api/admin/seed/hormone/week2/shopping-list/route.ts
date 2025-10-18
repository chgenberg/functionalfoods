import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 2
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 2
    const week = 2;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in samtliga rader (som givits av kunden) som "ingredient"-strängar
    const ingredients: string[] = [
      // FRUKT/GRÖNT
      '250 g mango (fryst)',
      '1 st selleristjälk',
      '1 st schalottenlök',
      '6 st cocktailtomater',
      '150 g champinjoner',
      '2 st färska fikon',
      '1/2 st blomkålshuvud',
      '1,75 st gula lökar',
      '2 st citroner',
      '3 st kvisttomater',
      '1/2 st päron',
      '1 dl frysta ärtor',
      '1 dl edamamebönor',
      '1/2 st vitlök',
      '5 cm färsk ingefära',
      '1 st rödlök',
      '1,5 dl rucola',
      '100 g sockerärtor',
      '2 dl blåbär (frysta)',
      '1 st salladslök',
      '3 st morötter',
      '100 g bladspenat',
      '3/4 st paprika',
      '1/4 st vitkålshuvud',
      '2 dl hallon (frysta)',
      '4 st bananer',
      // MEJERI
      '2,25 dl grekisk yoghurt 6%',
      '0,75 dl mjölk',
      '2 msk grädde',
      '1 dl keso',
      '2 dl mandelmjölk',
      '40 g fetaost',
      '2,25 dl havregrädde',
      '170 g smör',
      '50 g getost',
      // TORRVAROR
      '200 ml krossade tomater',
      '200 g konserverade kikärtor',
      '2 tsk bakpulver',
      '2 msk glutenfritt ströbröd',
      '150 g glutenfri pasta',
      '1,5 dl vit quinoa',
      '130 g valnötter',
      '4,5 dl mandelmjöl',
      '2 dl kokossocker',
      '50 g mörk choklad',
      '2 msk olivolja',
      '1 tsk fiberhusk',
      '2 dl kokosmjöl',
      '1 tsk rapsolja',
      // KRYDDOR/SMAKSÄTTARE
      'Salt',
      'Svartpeppar',
      '1 krm torkade örter',
      '2 tsk vinäger',
      '1 krm curry',
      '1/2 msk sötstark senap',
      '1 tsk vaniljpulver',
      '2,5 msk färsk basilika',
      '1 msk mango chutney',
      '1/2 tsk kardemumma',
      '1/2 msk örtagårdskrydda',
      '3/4 msk ketjap manis',
      '3/4 dl färsk persilja',
      '1 msk färsk gräslök',
      '3/4 msk stark chilisås',
      '1 krm paprikapulver',
      '1/2 paket saffran',
      // KÖTT/FISK/FÅGEL/ÄGG/VEGO
      '550 g nötfärs',
      '2 skivor mortadella',
      '25 g tärnat bacon',
      '550 g kycklingklubbor',
      '300 g kycklinglårfile',
      '1 msk kaviar',
      '300 g laxfile',
      '8 st ägg',
      '2 skivor lufttorkad skinka',
      // ÖVRIGT
      '25 g soltorkade tomater i olja',
      '1/4 dl inlagd gurka',
      '1/2 dl inlagda rödbetor',
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
    console.error('Seed hormone week2 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 2 shopping list' }, { status: 500 });
  }
}


