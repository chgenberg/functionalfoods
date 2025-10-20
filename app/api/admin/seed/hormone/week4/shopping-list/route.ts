import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 4
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 4
    const week = 4;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in samtliga rader som "ingredient"-strängar
    const ingredients: string[] = [
      // KÖTT/FISK/FÅGEL/ÄGG/VEGO
      '4 st ägg',
      '300 g kycklingfile',
      '30 g skinka',
      '300 g nötfärs',
      '300 g lövbiff',
      '300 g laxfile',
      '150 g tonfisk i vatten',
      // ÖVRIGT
      '2,5 msk majonäs',
      '50 g inlagd kapris',
      '1/4 dl jalapenos',
      '2 msk bearnaisesås (Erik Lallerstedt)',
      // KRYDDOR/SMAKSÄTTARE
      'Salt',
      'Svartpeppar',
      '3 tsk sesamolja',
      '2 st lagerblad',
      '3 tsk sambal oelek',
      '1 tsk sötstark senap',
      '3/4 dl färsk persilja',
      '1,25 dl färsk koriander',
      '1 tsk srirachasås',
      '1/2 st kycklingbuljongtärning',
      '1 tsk färsk gräslök',
      '1 st grönsaksbuljongtärning',
      '1 tsk soja',
      '2 msk färsk mynta',
      '1/2 krm kanel',
      '120 g teriyakisås (Blue Dragon)',
      '1 krm torkad oregano',
      '1,25 msk sweet chilisås',
      '1/2 tsk dijonsenap',
      // FRUKT/GRÖNT
      '1/2 st äpple',
      '1/4 st vitlök',
      '4 st morötter',
      '2 st paprika',
      '1 dl frysta bär',
      '1 st salladslök',
      '2 st clementiner',
      '3/4 st mango',
      '1/2 st broccolistånd',
      '1,5 st rödlök',
      '1 msk färsk oregano',
      '20 cm purjolök',
      '1/2 dl blåbär',
      '300 g sötpotatis',
      '1/2 st gul lök',
      '150 g haricots verts',
      '8 cm färsk ingefära',
      '22 st cocktailtomater',
      '50 g sockerärtor',
      '1,5 st röd chili',
      '1/2 st kiwi',
      '35 g rucola',
      '1,5 st citroner',
      '1 st selleristjälk',
      '4 dl isbergssallad',
      '1/2 st lime',
      '1/4 st banan',
      // TORRVAROR
      '100 g vermicelli nudlar',
      '2 msk kokosflingor',
      '1 msk mandelspån',
      '2,25 msk olivolja',
      '2 tsk sesamfrön',
      '1/2 krm agavesirap',
      '400 g konserverade vita bönor',
      '1 msk kokosgrädde',
      '1,25 msk rapsolja',
      '1 dl havregryn',
      '1 dl torkade röda linser',
      '1,5 dl vit quinoa',
      // MEJERI
      '1 dl mjölk',
      '2 msk riven parmesanost',
      '2 msk creme fraiche',
      '1/2 dl havregrädde',
      '1 dl grekisk yoghurt',
      '1 tsk smör',
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
    console.error('Seed hormone week4 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 4 shopping list' }, { status: 500 });
  }
}


