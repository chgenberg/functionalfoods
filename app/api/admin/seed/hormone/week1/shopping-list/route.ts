import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 1
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 1
    const week = 1;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in samtliga rader som "ingredient"-strängar
    const ingredients: string[] = [
      // TORRVAROR
      '80 g glasnudlar',
      '1 dl solrosfrön',
      '3,25 dl bovetemjöl',
      '600 ml krossade tomater',
      '1 dl hasselnötter',
      '2 dl kokosskivor',
      '1 dl agavesirap',
      '2 msk sesamfrön',
      '1,75 dl pumpafrön',
      '1 dl valnötter',
      '1 msk rapsolja',
      '0,5 dl pekannötter',
      '3 dl saltade jordnötter',
      '1 msk fiberhusk',
      '3 dl havremjöl',
      '1 dl russin',
      '4 msk olivolja',
      '1 dl paranötter',
      '4 dl mandelmjöl',
      '400 ml kokosmjölk',
      '150 g mörk choklad',
      '0,5 dl linfrön',
      '1 dl vit quinoa',
      '1,25 dl mandlar',
      '2 dl kokosflingor',
      '0,5 dl kakao',
      '1 tsk bikarbonat',
      // MEJERI
      '160 g smör',
      '0,5 dl havregrädde',
      '2 msk creme fraiche',
      '5 dl filmjölk',
      '100 g ädelost',
      '3,5 dl grekisk yoghurt 6%',
      '3 dl mandelmjölk',
      '1 skiva ost',
      '100 g halloumi',
      // FRUKT/GRÖNT
      '1,25 st paprika',
      '3 st citroner',
      '3,5 st morötter',
      '10 cm färsk ingefära',
      '0,5 st rödlök',
      '18 st cocktailtomater',
      '3 st jordgubbar',
      '0,25 st blomkålshuvud',
      '300 g broccoli',
      '1,5 st salladslök',
      '0,5 st fänkål',
      '0,5 st mango',
      '2 st kvisttomater',
      '50 g rucola',
      '1 st vitlök',
      '100 g sockerärtor',
      '1,5 st palsternacka',
      '10 cm gurka',
      '0,5 st lime',
      '150 g mango (fryst)',
      '4 st champinjoner',
      '3,25 st gula lökar',
      '10 cm purjolök',
      '50 g färsk spenat',
      '2 st färska fikon',
      // KÖTT/FISK/FÅGEL/ÄGG/VEGO
      '5 st ägg',
      '300 g kycklingfärs',
      '100 g rökt lax',
      '300 g laxfile',
      '300 g lövbiff',
      '300 g nötfärs',
      '1 kg kycklingklubbor',
      // ÖVRIGT
      '1,5 msk majonäs',
      '1 dl osötat jordnötssmör',
      '1 msk Nicks fiberhonung',
      '2 msk romsås (Erik Lallerstedt)',
      '2 dl fefferoni',
      '3 msk brödsirap',
      '1 dl mango chutney',
      // KRYDDOR/SMAKSÄTTARE
      'Salt',
      'Svartpeppar',
      '0,5 dl teriyakisås',
      '1 krm srirachasås',
      '1,5 st grönsaksbuljongtärningar',
      '1,25 msk kanel',
      '2 krm vaniljpulver',
      '3 tsk sesamolja',
      '1 tsk curry',
      '1 krm paprikapulver',
      '1 tsk kardemumma',
      '1 tsk grön pesto',
      '0,5 msk ketjap manis',
      '0,5 st fiskbuljongtärning',
      '2 krm spiskummin',
      '33 g garam masala kryddmix (Santa Maria)',
      '4,5 msk färsk gräslök',
      '5 msk färsk koriander',
      '2,5 dl färsk persilja',
      '2 krm örtagårdskrydda',
      '1 nypa chiliflakes'
    ];

    // 5) Skapa items i bulk (no-op om tom lista)
    if (ingredients.length > 0) {
      const chunk = 200;
      for (let i = 0; i < ingredients.length; i += chunk) {
        await prisma.shoppingListItem.createMany({
          data: ingredients.slice(i, i + chunk).map((ingredient) => ({ listId: list!.id, ingredient })),
        });
      }
    }

    return NextResponse.json({ ok: true, listId: list.id, count: ingredients.length });
  } catch (error) {
    console.error('Seed hormone week1 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 1 shopping list' }, { status: 500 });
  }
}


