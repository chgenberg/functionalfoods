import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminFilter = searchParams.get('adminFilter') || 'all';
    const courseFilter = searchParams.get('courseFilter');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Bygg where-klausul
    let where: any = {};

    // Admin-filter
    if (adminFilter === 'free') {
      where.isFree = true;
      where.isPremium = false;
    } else if (adminFilter === 'premium') {
      where.isPremium = true;
    }

    // Kursfilter
    if (courseFilter) {
      where.tags = {
        has: courseFilter
      };
    }

    // Sökfilter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { searchText: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Hämta recept
    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    // Beräkna statistik
    const allRecipes = await prisma.recipe.findMany({
      select: { isPremium: true, isFree: true, tags: true, status: true }
    });

    const statistics = {
      total: allRecipes.length,
      free: allRecipes.filter(r => r.isFree && !r.isPremium).length,
      premium: allRecipes.filter(r => r.isPremium).length,
      visible: allRecipes.filter(r => r.status === 'PUBLISHED').length,
      byCourse: {
        'functional-basics': allRecipes.filter(r => r.tags?.includes('functional-basics')).length,
        'functional-flow': allRecipes.filter(r => r.tags?.includes('functional-flow')).length,
        'functional-energy': allRecipes.filter(r => r.tags?.includes('functional-energy')).length
      }
    };

    // Formatera recept för admin
    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      date: recipe.createdAt.toISOString(),
      courseTags: recipe.tags?.filter(tag => 
        ['functional-basics', 'functional-flow', 'functional-energy'].includes(tag)
      ) || []
    }));

    return NextResponse.json({
      recipes: formattedRecipes,
      statistics,
      total: recipes.length
    });

  } catch (error) {
    console.error('Error fetching admin recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Skapa nytt recept
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        slug: body.title.toLowerCase()
          .replace(/[åä]/g, 'a')
          .replace(/ö/g, 'o')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        excerpt: body.excerpt,
        content: body.description,
        imageUrl: body.imageUrl,
        categories: body.categories || [body.category],
        ingredients: body.ingredients || [],
        instructions: Array.isArray(body.instructions) 
          ? body.instructions.join('\n') 
          : body.instructions,
        difficulty: body.difficulty,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        servings: body.servings,
        nutrition: body.nutrition,
        tips: body.tips,
        tags: body.tags || [],
        status: body.status || 'PUBLISHED',
        isPremium: body.isPremium || false,
        isFree: body.isFree !== false
      }
    });

    return NextResponse.json(recipe);

  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}