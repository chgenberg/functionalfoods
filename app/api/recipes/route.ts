import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// Funktion för att hämta användarens kursåtkomst
async function getUserCourseAccess(userId: string): Promise<string[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching user course access:', error);
    return []; // Return empty array on error to allow guest access
  }
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
  isAccessible?: boolean; // Added for frontend filtering
  isComingSoon?: boolean; // Added for frontend filtering
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
      // När slug är angiven, hoppa över default-filtreringen nedan
    } else {
      // Filtrera baserat på status endast när ingen slug är angiven
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
        // Default: visa alla publicerade recept (inklusive ADMIN_ONLY för visning som "kommer snart")
        where.status = 'PUBLISHED';
        
        // Ta INTE bort följande rad - vi vill visa ALLA recept i listan
        // where.isFree = true;
      }
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

    // Hämta användarens kurs-namn för jämförelse
    let userCourseNames: string[] = [];
    let isAdmin = false;
    
    if (userId && userCourseIds.length > 0) {
      const userCourses = await prisma.courseProduct.findMany({
        where: {
          id: { in: userCourseIds }
        },
        select: {
          name: true
        }
      });
      userCourseNames = userCourses.map(course => course.name);
    }
    
    // Check if user is admin
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      isAdmin = user?.role === 'admin';
    }

    // Process recipes - don't filter out, just mark accessibility
    const processedRecipes = recipes.map(recipe => {
      const hasAdminOnlyTag = recipe.tags && recipe.tags.includes('ADMIN_ONLY');
      const isAccessible = !hasAdminOnlyTag || isAdmin;
      
      return {
        ...recipe,
        isAccessible,
        isComingSoon: hasAdminOnlyTag && !isAdmin
      };
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
    const formattedRecipes: Recipe[] = processedRecipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      excerpt: recipe.excerpt || '',
      imageUrl: normalizeImageUrl(recipe.imageUrl),
      imageAlt: recipe.imageAlt || recipe.title,
      categories: recipe.isComingSoon ? ['Kommer snart'] : recipe.categories,
      ingredients: recipe.ingredients,
      slug: recipe.slug,
      status: recipe.status as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED',
      isPremium: recipe.isPremium,
      isFree: recipe.isFree,
      isAccessible: recipe.isAccessible,
      isComingSoon: recipe.isComingSoon,
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
      premium: await prisma.recipe.count({ where: { status: 'PUBLISHED', isFree: false } }),
      visible: await prisma.recipe.count({ where: { status: 'PUBLISHED' } })
    };

    const headers = new Headers();
    // Public list queries (no auth, only published+free) can be cached at CDN for 60s
    const isPublicList = !userId && !slug && (!status || status === 'published') && !search;
    if (isPublicList) {
      headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    } else {
      headers.set('Cache-Control', 'no-store');
    }

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
    }, { headers: new Headers({ 'Cache-Control': 'no-store, max-age=0' }) });

  } catch (error) {
    console.error('Error in recipes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
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