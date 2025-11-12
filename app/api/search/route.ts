import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { createRateLimiter } from '@/app/lib/ratelimit';
import { cacheGet, cacheSet } from '@/app/lib/cache';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const rl = createRateLimiter('api:search', { requests: 120, window: '60 s' });

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'recipe' | 'article' | 'raw-material';
  href: string;
  imageUrl?: string | null;
  isPremium?: boolean;
  author?: string;
  relevanceScore: number;
}

async function checkUserAccess(userId: string): Promise<boolean> {
  const purchaseCount = await prisma.purchase.count({
    where: { userId },
  });
  return purchaseCount > 0;
}

async function getUserCourseAccess(userId: string): Promise<string[]> {
  const now = new Date();
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: 'completed',
      OR: [
        { accessExpiresAt: null },
        { accessExpiresAt: { gt: now } }
      ]
    },
    include: {
      course: true
    }
  });
  
  return purchases.map(purchase => purchase.course.id);
}

function calculateRelevance(
  term: string,
  fields: { title: string; searchText: string | null }
): number {
  const lowerTerm = term.toLowerCase();
  let score = 0;

  if (fields.searchText?.toLowerCase().includes(lowerTerm)) {
    score += 50;
  }
  if (fields.title.toLowerCase().includes(lowerTerm)) {
    score += 100; // Extra boost for title matches
  }
  
  return score;
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { success, retryAfter } = await rl.limit(`ip:${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfter / 1000)) } });
    }

    const query = request.nextUrl.searchParams.get('q');
    const type = request.nextUrl.searchParams.get('type') || 'all';
    
    if (!query || query.length < 2) {
      return NextResponse.json(
        { results: [], message: 'Sökterm måste vara minst 2 tecken' },
        { status: 400 }
      );
    }

    // Cache by query + type for 30s (guests and general data)
    const cacheKey = `search:${type}:${query.toLowerCase()}`;
    const cached = await cacheGet<{ results: SearchResult[]; total: number }>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, query }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } });
    }

    let hasAccess = false;
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.userId) {
          userId = decoded.userId;
          hasAccess = await checkUserAccess(decoded.userId);
        }
      } catch (error) {
        // Invalid token, proceed as guest
      }
    }

    const searchFilter: Prisma.RecipeWhereInput = {
      status: 'PUBLISHED',
      ...(hasAccess ? {} : { isPremium: false }),
      searchText: {
        contains: query,
        mode: 'insensitive',
      },
    };
    
    const articleFilter: Prisma.BlogPostWhereInput = {
      published: true,
      searchText: {
        contains: query,
        mode: 'insensitive',
      },
    };

    const rawMaterialFilter = {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    // Conditionally fetch based on type filter
    const shouldFetchRecipes = type === 'all' || type === 'recipe';
    const shouldFetchArticles = type === 'all' || type === 'article';
    const shouldFetchRawMaterials = type === 'all' || type === 'raw-material';

    // Get user's course access if authenticated
    let userCourseIds: string[] = [];
    if (userId) {
      userCourseIds = await getUserCourseAccess(userId);
    }

    // Execute searches
    const recipes = shouldFetchRecipes ? await prisma.recipe.findMany({ 
      where: searchFilter,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        isPremium: true,
        searchText: true,
        nutrition: true,
      },
      take: 50 // Limit initial fetch to prevent overload
    }) : [];
    
    const articles = shouldFetchArticles ? await prisma.blogPost.findMany({
      where: articleFilter,
      select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          searchText: true,
          author: {
              select: { name: true }
          }
      },
      take: 50
    }) : [];
    
    const rawMaterials = shouldFetchRawMaterials ? await prisma.rawMaterial.findMany({
      where: rawMaterialFilter,
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: 50
    }) : [];

    // Filter recipes based on course access
    const filteredRecipes = recipes.filter((recipe: any) => {
      if (!recipe.isPremium) return true; // Free recipes are always accessible
      if (!userId) return false; // Premium recipes need authentication
      
      // Check if user has access to the course this recipe belongs to
      const recipeNutrition = recipe.nutrition as any;
      if (recipeNutrition?.courseId) {
        return userCourseIds.includes(recipeNutrition.courseId);
      }
      
      // If no specific course, use general premium access
      return hasAccess;
    });

    const recipeResults: SearchResult[] = filteredRecipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      excerpt: recipe.excerpt || '',
      type: 'recipe',
      href: `/kunskapsbank/recept/${recipe.slug}`,
      imageUrl: recipe.imageUrl,
      isPremium: recipe.isPremium,
      relevanceScore: calculateRelevance(query, {
          title: recipe.title,
          searchText: recipe.searchText,
      }),
    }));

    const articleResults: SearchResult[] = articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        type: 'article',
        href: `/kunskapsbank/blogg/${article.slug}`,
        author: article.author?.name || 'Okänd författare',
        relevanceScore: calculateRelevance(query, {
            title: article.title,
            searchText: article.searchText,
        })
    }));

    const rawMaterialResults: SearchResult[] = rawMaterials.map((material: any) => ({
      id: material.id,
      title: material.name,
      excerpt: material.description || '',
      type: 'raw-material',
      href: `/kunskapsbank/ingredienser#${material.id}`,
      relevanceScore: calculateRelevance(query, {
          title: material.name,
          searchText: material.description,
      }),
    }));

    const allResults = [...recipeResults, ...articleResults, ...rawMaterialResults];
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const limitedResults = allResults.slice(0, 20);

    // Write-through cache for 30 seconds
    await cacheSet(cacheKey, { results: limitedResults, total: allResults.length }, 30);

    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');

    return NextResponse.json({
      results: limitedResults,
      total: allResults.length,
      query,
    }, { headers });

  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Specific Prisma error
      return NextResponse.json(
        { error: 'Database search error', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 