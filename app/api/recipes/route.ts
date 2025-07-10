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
    const slug = searchParams.get('slug') || '';

    // Bygg Prisma filter
    const where: any = {};

    // Om slug är angiven, hämta endast det specifika receptet
    if (slug) {
      where.slug = slug;
      where.status = 'PUBLISHED'; // Bara publicerade recept
    }

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Create the recipe
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
        imageUrl: body.image,
        categories: [body.category],
        ingredients: body.ingredients,
        instructions: body.instructions.join('\n'),
        difficulty: body.difficulty,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        totalTime: `${parseInt(body.prepTime || '0') + parseInt(body.cookTime || '0')} min`,
        servings: body.servings,
        nutrition: body.nutritionInfo,
        tips: body.tips,
        tags: body.tags || [],
        status: body.published ? 'PUBLISHED' : 'DRAFT',
        isFree: true,
        isPremium: false,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
} 