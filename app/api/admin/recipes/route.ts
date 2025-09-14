import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const adminFilter = searchParams.get('adminFilter') || 'all';
    const search = searchParams.get('search') || '';
    const adminMode = searchParams.get('adminMode') === 'true';

    // Bygg Prisma filter för admin - visa ALLA recept
    const where: any = {};

    // Admin-specifik filtrering
    if (adminFilter === 'free') {
      where.isFree = true;
      where.isPremium = false;
    } else if (adminFilter === 'premium') {
      where.isPremium = true;
    }
    // För 'all' lägger vi inte till några statusfilter - visa allt

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

    // Räkna totalt antal recept (före filtrering)
    const totalRecipes = await prisma.recipe.count({ where });

    // Normalize image URLs
    function normalizeImageUrl(url: string | null): string {
      if (!url) return '/images/recipe-placeholder.svg';
      
      let normalized = url;
      if (normalized.startsWith('/public/')) {
        normalized = normalized.replace('/public', '');
      }
      if (normalized.startsWith('public/')) {
        normalized = '/' + normalized.substring(7);
      }
      
      // Ensure leading slash for local assets
      if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
        normalized = '/' + normalized;
      }
      
      return normalized;
    }

    // Konvertera till API-format
    const formattedRecipes: Recipe[] = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      excerpt: recipe.excerpt || '',
      imageUrl: normalizeImageUrl(recipe.imageUrl),
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
      difficulty: recipe.difficulty || undefined,
      prepTime: recipe.prepTime || undefined,
      cookTime: recipe.cookTime || undefined,
      totalTime: recipe.totalTime || undefined,
      servings: recipe.servings || undefined,
      instructions: recipe.instructions ? recipe.instructions.split('\n').filter(step => step.trim()) : undefined,
      tips: recipe.tips || undefined,
      tags: recipe.tags || undefined
    }));

    // Beräkna statistik för admin
    const statistics = {
      total: await prisma.recipe.count(),
      free: await prisma.recipe.count({ where: { isFree: true, isPremium: false } }),
      premium: await prisma.recipe.count({ where: { isPremium: true } }),
      visible: await prisma.recipe.count({ where: { status: 'PUBLISHED' } }),
      draft: await prisma.recipe.count({ where: { status: 'DRAFT' } }),
      archived: await prisma.recipe.count({ where: { status: 'ARCHIVED' } })
    };

    const headers = new Headers();
    headers.set('Cache-Control', 'no-store'); // Admin-data ska inte cachas

    return NextResponse.json({
      recipes: formattedRecipes,
      pagination: {
        page,
        limit,
        total: totalRecipes,
        totalPages: Math.ceil(totalRecipes / limit),
        hasMore: (page * limit) < totalRecipes
      },
      statistics
    }, { headers });

  } catch (error) {
    console.error('Error in admin recipes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 