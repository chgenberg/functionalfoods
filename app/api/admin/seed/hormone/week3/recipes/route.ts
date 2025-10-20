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
    ingredients: [
      '1/2 banan',
      '1 ägg',
      '1/2 krm vaniljpulver',
      '1 tsk smör',
      '2 msk grekisk yoghurt',
      '1/2 dl blåbär',
      '1 msk granatäppelkärnor',
      '1/2 banan (topping)'
    ],
    instructions: [
      'Mosa 1/2 banan i en skål.',
      'Knäck ner ägget och tillsätt vaniljpulver. Vispa till en slät smet.',
      'Hetta upp en stekpanna med smör.',
      'Stek pannkakan i 2–3 minuter per sida på medelvärme.',
      'Skiva resterande 1/2 banan.',
      'Lägg upp pannkakan på en tallrik och toppa med yoghurt, blåbär, granatäppelkärnor och banan.'
    ]
  },
  {
    title: 'Omelett med skinka',
    servings: 1,
    image: `${IMG_BASE}/OMELETT_MED_SKINKA.JPG`,
    categories: ['frukost'],
    ingredients: [
      '2 ägg',
      'salt och svartpeppar',
      '1 tsk smör',
      '25 g rökt skinka',
      '1 msk gräslök'
    ],
    instructions: [
      'Vispa ihop äggen i en skål och krydda med salt och peppar.',
      'Hetta upp en stekpanna med smör på medelstark värme.',
      'Häll i äggsmeten och stek omeletten i någon minut tills den sätter sig.',
      'Hacka gräslök fint.',
      'Lägg skinka över omeletten och toppa med gräslök. Servera direkt.'
    ]
  },
  {
    title: 'Ost och skinkmacka med gurka',
    servings: 1,
    image: `${IMG_BASE}/OST_OCH_SKINKMACKA_MED_GURKA.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 skiva kavring med frön (egenbakat)',
      '1 tsk smör',
      '1 salladsblad',
      '1 skiva ost',
      '1 skiva skinka',
      '3 skivor gurka'
    ],
    instructions: [
      'Bred smör på brödskivan.',
      'Lägg på salladsblad, ost och skinka.',
      'Toppa med gurkskivor och servera.'
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


