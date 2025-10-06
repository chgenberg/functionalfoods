import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SUPPORTED = ['sv','en','es','de','fr'] as const;
type Lang = typeof SUPPORTED[number];
function getLang(req: NextRequest): Lang {
  const hdr = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val as Lang) ? (val as Lang) : 'sv';
}
function pick(obj: any, base: string, lang: Lang) {
  if (lang === 'sv') return obj[base];
  const k = `${base}_${lang}`;
  return obj[k] || obj[base];
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Map legacy/alias slugs to canonical slugs (Basic course fixes)
    const ALIASES: Record<string, string> = {
      'tonfisksallad-apple-sallad': 'tonfisksallad-med-apple',
      'squashspagetti-kottfarssas': 'squashspagetti-med-kottfarssas',
      'laxfile-med-ratatouille': 'het-ratatouille',
      'omelett-bar': 'ugnsomelett-med-keso-och-bar',
      'agghack-kalkon': 'agghack-med-kalkon',
      'stekt-agg-lax-2': 'stekt-agg-med-champinjoner-2',
      'stek-torsk-med-bearnaisesas-och-haricot-verts': 'stekt-torsk-med-bearnaisesas-och-haricots-verts',
      // New: slugs missing in meal plan mapped to existing ones
      'smoothiebowl-med-mango-och-jordgubbar': 'smoothiebowl',
      'laxsallad-med-druvor': 'laxsallad-med-vindruvor',
      'lax-broccolipaj': 'lax-och-broccolipaj'
    };
    const requestedSlug = params.slug;
    const canonicalSlug = ALIASES[requestedSlug] || requestedSlug;
    const lang = getLang(req);
    const recipe = await prisma.recipe.findUnique({
      where: { slug: canonicalSlug },
      include: { author: { select: { name: true, email: true } } }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // For now, we'll send the recipe data along with access info
    // The frontend will handle the display based on user access
    const localized: any = { ...recipe };
    localized.title = pick(recipe as any, 'title', lang);
    localized.excerpt = pick(recipe as any, 'excerpt', lang);
    const instr = pick(recipe as any, 'instructions', lang) as string | null;
    if (instr) localized.instructions = instr;

    // Add access requirements info (two-category model)
    // Premium == course recipes; free == for everyone
    const taggedCourse = recipe.tags?.some((tag: string) => ['Basic', 'Flow', 'Energy'].includes(tag));
    const isCourseRecipe = (recipe.isPremium && !recipe.isFree) || taggedCourse;
    localized.requiresCourse = isCourseRecipe;
    localized.requiresPremium = false;
    localized.courseTags = recipe.tags?.filter((tag: string) => ['Basic', 'Flow', 'Energy'].includes(tag)) || [];
    localized.isAdminOnly = recipe.tags?.includes('ADMIN_ONLY') || recipe.tags?.includes('UD');

    // Normalize imageUrl for local assets
    if (localized.imageUrl && typeof localized.imageUrl === 'string') {
      let url = localized.imageUrl as string;
      if (url.startsWith('/public/')) url = url.replace('/public', '');
      if (url.startsWith('public/')) url = url.replace('public/', '/');
      if (!url.startsWith('/') && !url.startsWith('http')) url = `/${url}`;
      localized.imageUrl = url;
    }

    // Nutrition override for known recipes
    if (canonicalSlug === 'linssallad-med-fetaost-och-pekannotter') {
      const perServing = { energy: 345, carbohydrates: 25, fat: 11, protein: 11, fiber: 5 };
      localized.nutrition = {
        perServing,
        calories: perServing.energy,
        carbohydrates: perServing.carbohydrates,
        fat: perServing.fat,
        protein: perServing.protein,
        fiber: perServing.fiber
      };
    }

    console.log(`🖼️ Recipe API: Serving recipe "${localized.title}" (slug: ${canonicalSlug}${canonicalSlug !== requestedSlug ? `, alias: ${requestedSlug}` : ''}) with imageUrl: ${localized.imageUrl}`);
    return NextResponse.json(localized, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json();
    
    // Hämta befintligt recept för att jämföra titel
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug: params.slug },
      select: { title: true }
    });

    // Generera ny slug endast om titeln faktiskt har ändrats
    let newSlug = params.slug;
    if (existingRecipe && body.title && body.title !== existingRecipe.title) {
      newSlug = body.title.toLowerCase()
        .replace(/[åä]/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const recipe = await prisma.recipe.update({
      where: { slug: params.slug },
      data: {
        title: body.title,
        slug: newSlug,
        excerpt: body.excerpt,
        content: body.description,
        imageUrl: body.imageUrl ?? body.image ?? null,
        categories: body.category ? [body.category] : body.categories,
        ingredients: body.ingredients,
        instructions: Array.isArray(body.instructions) 
          ? body.instructions.join('\n') 
          : body.instructions,
        difficulty: body.difficulty,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        totalTime: body.totalTime || `${parseInt(body.prepTime || '0') + parseInt(body.cookTime || '0')} min`,
        servings: body.servings,
        nutrition: body.nutritionInfo || body.nutrition,
        tips: body.tips,
        tags: body.tags || [],
        status: body.published !== false ? 'PUBLISHED' : 'DRAFT',
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.recipe.delete({ where: { slug: params.slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 