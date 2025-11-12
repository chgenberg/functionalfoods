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
      // Map short slug to the correct "Omelett med bär" recipe
      'omelett-bar': 'omelett-med-bar',
      'agghack-kalkon': 'agghack-med-kalkon',
      'stekt-agg-lax-2': 'stekt-agg-med-champinjoner-2',
      'stek-torsk-med-bearnaisesas-och-haricot-verts': 'stekt-torsk-med-bearnaisesas-och-haricots-verts',
      // Ensure common variation resolves too
      'stekt-torsk-med-bearnaisesas-och-haricot-verts': 'stekt-torsk-med-bearnaisesas-och-haricots-verts',
      // New: slugs missing in meal plan mapped to existing ones
      'smoothiebowl-med-mango-och-jordgubbar': 'smoothiebowl',
      'smoothie-smoothiebowl': 'tropisk-smoothiebowl', // Map smoothie-smoothiebowl to tropisk-smoothiebowl
      'laxsallad-med-druvor': 'laxsallad-med-vindruvor',
      // Basic week 1: ensure Egenbakat recipe slug resolves
      'havrefrallor-morotter-aprikoser': 'havrefralla-med-morotter-och-torkade-aprikoser',
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

    // Normalize nutrition to perServing if present in shorthand (kcal/protein/carbs/fat/fiber)
    if (localized.nutrition && !(localized.nutrition as any).perServing) {
      const n: any = localized.nutrition || {};
      const kcal = n.kcal || n.calories || n.energy;
      const protein = n.protein;
      const carbs = n.carbs || n.carbohydrates;
      const fat = n.fat;
      const fiber = n.fiber || n.fibre;
      const perServing: any = {};
      if (typeof kcal === 'number' && kcal > 0) perServing.energy = Math.round(kcal);
      if (typeof protein === 'number' && protein > 0) perServing.protein = Math.round(protein);
      if (typeof carbs === 'number' && carbs > 0) perServing.carbohydrates = Math.round(carbs);
      if (typeof fat === 'number' && fat > 0) perServing.fat = Math.round(fat);
      if (typeof fiber === 'number' && fiber > 0) perServing.fiber = Math.round(fiber);
      if (Object.keys(perServing).length > 0) {
        localized.nutrition = {
          perServing,
          calories: perServing.energy,
          protein: perServing.protein,
          carbohydrates: perServing.carbohydrates,
          fat: perServing.fat,
          fiber: perServing.fiber
        } as any;
      }
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

    // Ingredient override for Egenbakat: Havrefrallor med morötter och aprikoser
    if (canonicalSlug === 'havrefralla-med-morotter-och-torkade-aprikoser') {
      const fallbackIngredients = [
        '4 dl havregryn',
        '4 torkade aprikoser',
        '1 morot',
        '3 dl keso 4%',
        '4 ägg',
        '1 dl solroskärnor',
        '1 dl pumpafrön',
        '1 dl hampafrön',
        '1 dl sesamfrön',
        '1.5 tsk bakpulver',
        '1 krm salt'
      ];
      if (!Array.isArray(localized.ingredients) || localized.ingredients.length === 0) {
        localized.ingredients = fallbackIngredients;
      }
    }

    console.log(`🖼️ Recipe API: Serving recipe "${localized.title}" (slug: ${canonicalSlug}${canonicalSlug !== requestedSlug ? `, alias: ${requestedSlug}` : ''}) with imageUrl: ${localized.imageUrl}`);
    const isPersonalized = req.nextUrl.searchParams.has('tk');
    const headers = new Headers();
    if (isPersonalized) {
      headers.set('Cache-Control', 'no-store');
    } else {
      headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }
    return NextResponse.json(localized, { headers });
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
        content: body.description || body.content,
        imageUrl: body.imageUrl ?? body.image ?? null,
        imageAlt: body.imageAlt || null,
        categories: body.category ? [body.category] : body.categories,
        ingredients: body.ingredients,
        ingredientsStructured: body.ingredientsStructured || null,
        instructions: Array.isArray(body.instructions) 
          ? body.instructions.join('\n') 
          : body.instructions,
        instructionsStructured: body.instructionsStructured || null,
        difficulty: body.difficulty,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        totalTime: body.totalTime || `${parseInt(body.prepTime || '0') + parseInt(body.cookTime || '0')} min`,
        servings: body.servings,
        nutrition: body.nutritionInfo || body.nutrition,
        tips: body.tips,
        tags: body.tags || [],
        status: body.status || (body.published !== false ? 'PUBLISHED' : 'DRAFT'),
        isPremium: typeof body.isPremium === 'boolean' ? body.isPremium : undefined,
        isFree: typeof body.isPremium === 'boolean' ? !body.isPremium : undefined,
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