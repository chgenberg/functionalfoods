import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 6
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 6
    const week = 6;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in alla rader som ingredient-strängar
    const ingredients: string[] = [
      // KÖTT/FISK/FÅGEL/ÄGG/VEGO
      '10 st ägg',
      '300 g laxfile',
      '300 g falukorv med hög kötthalt',
      '300 g högrev',
      '250 g tofu',
      '200 g rökt skinka',
      '125 g tonfisk i vatten',
      // MEJERI
      '0,75 dl grädde',
      '2 msk gräddfil',
      '2 dl riven ost',
      '1,5 dl grekisk yoghurt',
      '50 g cheddarost',
      '205 g smör',
      '1 dl keso',
      '1 dl mjölk',
      '50 g chevre',
      // KRYDDOR/SMAKSÄTTARE
      'Salt',
      'Svartpeppar',
      '1 msk sötstark senap',
      '1,5 msk färsk koriander',
      '0,5 tsk kardemumma',
      '1 krm paprikapulver',
      '1 msk chilisås',
      '1 påse tacokrydda',
      '2 msk färsk rosmarin',
      '0,5 krm malen kryddnejlika',
      '0,5 krm vaniljpulver',
      '2 msk färsk persilja',
      '0,75 tsk örtagårdskrydda',
      '0,5 krm kryddpeppar',
      '1 st kanelstång',
      '0,5 msk färsk basilika',
      '1,5 tsk currypasta',
      '1 tsk curry',
      '1 msk ketjap manis',
      // FRUKT/GRÖNT
      '3,25 dl blåbär',
      '100 g svartkål',
      '2 st paprikor',
      '0,25 st salladslök',
      '0,5 st rödlök',
      '0,5 st persika',
      '2 st färska fikon',
      '0,5 st broccolistånd',
      '4 st jordgubbar',
      '2 st citroner',
      '1 st morot',
      '0,5 dl granatäppelkärnor',
      '10 cm purjolök',
      '1,5 st gul lök',
      '10 cm färsk ingefära',
      '0,5 st lime',
      '1 st bifftomat',
      '0,75 st röd chili',
      '2 st kokta rödbetor',
      '0,5 st banan',
      '160 g rucola',
      '0,5 st vitlök',
      '350 g blomkål',
      '0,5 st selleristjälk',
      '200 g fryst mango',
      '10 st hallon',
      // TORRVAROR
      '1 dl torkade röda linser',
      '200 ml kokosmjölk',
      '1 dl vit quinoa',
      '2 msk pistagenötter',
      '4,5 dl mandelmjöl',
      '1,25 msk olivolja',
      '3 st torkade dadlar',
      '1 dl sötströ',
      '1 msk fiberhusk',
      '1,5 dl jordnötter',
      '1 tsk flytande honung',
      '200 ml krossade tomater',
      '200 g mörk choklad',
      '0,5 dl skalade sesamfrön',
      '5 st valnötter',
      '1,5 dl råris',
      '1 tsk bakpulver',
      // ÖVRIGT
      '1,5 msk kapris',
      '0,5 dl fefferoni',
      '1,5 st soltorkade tomater',
      '3,5 dl havregrädde',
      '2 dl mandelmjölk',
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
    console.error('Seed hormone week6 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 6 shopping list' }, { status: 500 });
  }
}


