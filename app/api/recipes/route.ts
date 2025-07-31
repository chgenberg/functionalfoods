import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Funktion för att hämta användarens kursåtkomst
async function getUserCourseAccess(userId: string): Promise<string[]> {
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: 'completed'
    },
    include: {
      course: true
    }
  });
  
  return purchases.map(purchase => purchase.course.id);
}

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

    // Kontrollera användarens autentisering och kursåtkomst
    let userId: string | null = null;
    let userCourseIds: string[] = [];
    
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.userId) {
          userId = decoded.userId;
          userCourseIds = await getUserCourseAccess(decoded.userId);
        }
      } catch (error) {
        // Invalid token, proceed as guest
        console.log('Invalid token, proceeding as guest');
      }
    }

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

    // Filtrera recept baserat på kursåtkomst
    const filteredRecipes = recipes.filter(recipe => {
      if (!recipe.isPremium || recipe.isFree) return true; // Gratis recept är alltid tillgängliga
      if (!userId) return false; // Premium recept kräver autentisering
      
      // Kontrollera om användaren har åtkomst till kursen detta recept tillhör
      const recipeNutrition = recipe.nutrition as any;
      if (recipeNutrition?.courseId) {
        return userCourseIds.includes(recipeNutrition.courseId);
      }
      
      // Om inget specifik kurs, använd allmän premiumåtkomst
      return userCourseIds.length > 0;
    });

    // Räkna totalt antal recept (före filtrering)
    const totalRecipes = await prisma.recipe.count({ where });

    // Konvertera till API-format
    const formattedRecipes: Recipe[] = filteredRecipes.map(recipe => ({
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
      difficulty: recipe.difficulty || undefined,
      prepTime: recipe.prepTime || undefined,
      cookTime: recipe.cookTime || undefined,
      totalTime: recipe.totalTime || undefined,
      servings: recipe.servings || undefined,
      instructions: recipe.instructions ? recipe.instructions.split('\n').filter(step => step.trim()) : undefined,
      tips: recipe.tips || undefined,
      tags: recipe.tags || undefined
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