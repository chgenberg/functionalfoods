import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type RecipeSeed = {
  title: string;
  servings?: number;
  categories?: string[];
  image?: string | null; // relative from /public
  ingredients: string[];
  instructions: string | string[];
};

const IMG_BASE = '/Hormonell_balans/Bilder_v3';

const RECIPES: RecipeSeed[] = [
  {
    title: 'Bananpannkaka med frukt och bär',
    servings: 1,
    image: `${IMG_BASE}/BANANPANNKAKA_MED_FRUKT_OCH_BÄR.JPG`,
    categories: ['frukost'],
    ingredients: ['1/2 banan','1 ägg','1/2 krm vaniljpulver','1 tsk smör','2 msk grekisk yoghurt','1/2 dl blåbär','1 msk granatäppelkärnor','1/2 banan'],
    instructions: [
      'Mosa banan i en skål.',
      'Knäck ner ägg och tillsätt vaniljpulver.',
      'Vispa till en slät smet.',
      'Hetta upp en stekpanna med smör.',
      'Stek pannkakan i 2-3 minuter på varje sida.',
      'Skiva banan. Lägg upp på en tallrik och dekorera med yoghurt, blåbär, granatäppelkärnor och banan.'
    ]
  },
  {
    title: 'Omelett med skinka',
    servings: 1,
    image: `${IMG_BASE}/OMELETT_MED_SKINKA.JPG`,
    categories: ['frukost'],
    ingredients: ['2 ägg','Salt och svartpeppar','1 tsk smör','25 g rökt skinka','1 msk gräslök'],
    instructions: [
      'Vispa ihop äggen i en skål.',
      'Krydda med salt och peppar.',
      'Hetta upp en stekpanna med smör och stek omeletten i någon minut på medelstark värme.',
      'Hacka gräslök.',
      'Lägg på en skiva skinka på omeletten och toppa med gräslök.'
    ]
  },
  {
    title: 'Ost och skinkmacka med gurka',
    servings: 1,
    image: `${IMG_BASE}/OST_OCH_SKINKMACKA_MED_GURKA.JPG`,
    categories: ['frukost'],
    ingredients: ['1 skiva kavring med frön (egenbakat)','1 tsk smör','1 salladsblad','1 skiva ost','1 skiva skinka','3 skivor gurka'],
    instructions: [
      'Bred smör på mackan och lägg på sallad, ost, skinka och gurka.'
    ]
  },
  {
    title: 'Falafel med grönsaker',
    servings: 2,
    image: `${IMG_BASE}/FALAFEL_MED_GRÖNSAKER.JPG`,
    categories: ['vego','lunch','middag'],
    ingredients: ['115 g konserverade kikärtor','1/2 gul lök','1/2 vitlöksklyfta','1/2 tsk malen spiskummin','1 krm salt','2 msk persilja','1 krm sambal oelek','1 msk majsstärkelse','1 tsk olivolja','2 morötter','1/2 paprika','1/2 rödlök','10 cm gurka','10 cocktailtomater','50 g spenat','1/2 dl grekisk yoghurt','1/2 msk sweet chili sås','1/2 vitlögsklyfta'],
    instructions: [
      'Gör dressingen genom att riva vitlök och blanda ihop alla ingredienser i en skål.',
      'Skölj kikärtorna och låt rinna av i ett durkslag.',
      'Skala och hacka lök.',
      'Skala och riv vitlök.',
      'Mixa kikärtor, lök och vitlök i en mixer eller med en stavmixer.',
      'Tillsätt spiskummin, salt, persilja, sambal oelek och majsstärkelse.',
      'Forma smeten till bullar.',
      'Hetta upp en stekpanna med olja och stek i cirka 5 minuter.',
      'Skala och skär morötter i strimlor.',
      'Skär paprika i strimlor.',
      'Skala och skär lök i strimlor.',
      'Skär gurkan i bitar.',
      'Dela cocktailtomaterna.',
      'Lägg spenat i botten på tallrikar.',
      'Fördela grönsakerna ovanpå spenaten.',
      'Toppa med falafel och dressing.',
      'Dekorera med en persiljekvist.'
    ]
  }
];

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // Upsert recipes
    const created: any[] = [];
    for (const r of RECIPES) {
      const slug = slugify(r.title);
      const instructionsString = Array.isArray(r.instructions)
        ? r.instructions.map((s, i) => `${i + 1}. ${s}`).join(' ')
        : (r.instructions || '');
      const doc = await prisma.recipe.upsert({
        where: { slug },
        create: {
          title: r.title,
          slug,
          content: instructionsString,
          instructions: instructionsString,
          ingredients: r.ingredients,
          categories: r.categories || [],
          servings: r.servings || null,
          imageUrl: r.image || undefined,
          isPremium: true,
          isFree: false
        },
        update: {
          content: instructionsString,
          instructions: instructionsString,
          ingredients: r.ingredients,
          categories: r.categories || [],
          servings: r.servings || null,
          imageUrl: r.image || undefined,
        }
      });
      created.push({ id: doc.id, slug });
    }

    // Do not modify meal plan here; this route only seeds recipes for week 3
    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error('Seed hormone week3 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed week 3 recipes' }, { status: 500 });
  }
}


