import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

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
    const query = request.nextUrl.searchParams.get('q');
    const type = request.nextUrl.searchParams.get('type') || 'all';
    
    if (!query || query.length < 2) {
      return NextResponse.json(
        { results: [], message: 'Sökterm måste vara minst 2 tecken' },
        { status: 400 }
      );
    }

    let hasAccess = false;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        if (decoded.userId) {
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

    const [recipes, articles, rawMaterials] = await prisma.$transaction([
      shouldFetchRecipes ? prisma.recipe.findMany({ 
        where: searchFilter,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          isPremium: true,
          searchText: true,
        },
        take: 50 // Limit initial fetch to prevent overload
      }) : Promise.resolve([]),
      shouldFetchArticles ? prisma.blogPost.findMany({
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
      }) : Promise.resolve([]),
      // @ts-expect-error rawMaterial model exists after prisma generate
      shouldFetchRawMaterials ? prisma.rawMaterial.findMany({
        where: rawMaterialFilter,
        select: {
          id: true,
          name: true,
          description: true,
        },
        take: 50
      }) : Promise.resolve([])
    ]);

    const recipeResults: SearchResult[] = recipes.map((recipe: any) => ({
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

    return NextResponse.json({
      results: limitedResults,
      total: allResults.length,
      query,
    });

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