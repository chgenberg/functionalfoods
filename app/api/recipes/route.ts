import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Recipe {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  isFree: boolean;
  date: string;
  author: {
    name: string;
    username: string;
  };
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  instructions?: string[];
  nutrition?: any;
  tips?: string;
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Bygg Prisma filter
    const where: any = {};

    // Filtrera baserat på status
    if (status) {
      if (status === 'published') {
        where.status = 'PUBLISHED';
        where.isPremium = false;
      } else if (status === 'draft') {
        where.status = 'DRAFT';
      } else if (status === 'premium') {
        where.isPremium = true;
      }
    } else {
      // Default: visa bara publicerade, gratis recept
      where.status = 'PUBLISHED';
      where.isFree = true;
    }

    // Filtrera baserat på kategori
    if (category) {
      where.categories = {
        has: category
      };
    }

    // Sökfilter
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          ingredients: {
            hasSome: [search]
          }
        },
        {
          categories: {
            hasSome: [search]
          }
        }
      ];
    }

    // Hämta recept från databasen
    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Räkna totalt antal recept
    const totalRecipes = await prisma.recipe.count({ where });

    // Konvertera till API-format
    const formattedRecipes: Recipe[] = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      excerpt: recipe.excerpt || '',
      imageUrl: recipe.imageUrl || '/images/recipe-placeholder.svg',
      imageAlt: recipe.imageAlt || recipe.title,
      categories: recipe.categories,
      ingredients: recipe.ingredients,
      slug: recipe.slug,
      status: recipe.status as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED',
      isPremium: recipe.isPremium,
      isFree: recipe.isFree,
      date: recipe.createdAt.toISOString(),
      author: {
        name: recipe.author?.name || 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      instructions: recipe.instructions,
      tips: recipe.tips,
      tags: recipe.tags
    }));

    // Hämta alla unika kategorier för filter
    const allRecipes = await prisma.recipe.findMany({
      where: { status: 'PUBLISHED', isFree: true },
      select: { categories: true }
    });
    
    const allCategories = [...new Set(allRecipes.flatMap(recipe => recipe.categories))];

    // Beräkna statistik
    const statistics = {
      total: totalRecipes,
      free: await prisma.recipe.count({ where: { status: 'PUBLISHED', isFree: true } }),
      premium: await prisma.recipe.count({ where: { isPremium: true } }),
      visible: await prisma.recipe.count({ where: { status: 'PUBLISHED' } })
    };

    return NextResponse.json({
      recipes: formattedRecipes,
      pagination: {
        page,
        limit,
        total: totalRecipes,
        totalPages: Math.ceil(totalRecipes / limit),
        hasMore: (page * limit) < totalRecipes
      },
      categories: allCategories.sort(),
      statistics
    });

  } catch (error) {
    console.error('Error in recipes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 