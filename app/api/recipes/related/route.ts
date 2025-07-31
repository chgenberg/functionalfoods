import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface Recipe {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: string;
  isPremium: boolean;
  isFree: boolean;
  date: string;
  author: {
    name: string;
    username: string;
    email: string;
  };
}

// Funktion för att blanda array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  try {
    const currentSlug = request.nextUrl.searchParams.get('current');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '3');
    const categories = request.nextUrl.searchParams.get('categories')?.split(',') || [];

    // Bygg filter för relaterade recept
    const where: any = {
      status: 'PUBLISHED',
      isFree: true,
      isPremium: false
    };

    // Exkludera nuvarande recept om slug finns
    if (currentSlug) {
      where.slug = {
        not: currentSlug
      };
    }

    let recipes;

    // Om kategorier finns, försök hitta recept med liknande kategorier först
    if (categories.length > 0) {
      const similarRecipes = await prisma.recipe.findMany({
        where: {
          ...where,
          categories: {
            hasSome: categories
          }
        },
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        },
        take: limit * 2 // Ta fler för att ha mer att blanda
      });

      if (similarRecipes.length >= limit) {
        recipes = similarRecipes;
      } else {
        // Om inte tillräckligt med liknande recept, hämta alla tillgängliga
        const allRecipes = await prisma.recipe.findMany({
          where,
          include: {
            author: {
              select: {
                name: true,
                email: true
              }
            }
          },
          take: limit * 3
        });
        recipes = allRecipes;
      }
    } else {
      // Hämta alla tillgängliga recept
      recipes = await prisma.recipe.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true
            }
          }
        },
        take: limit * 3
      });
    }

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
      status: recipe.status,
      isPremium: recipe.isPremium,
      isFree: recipe.isFree,
      date: recipe.createdAt.toISOString(),
      author: {
        name: recipe.author?.name || 'Ulrika Davidsson',
        username: 'ulrika',
        email: recipe.author?.email || ''
      }
    }));

    // Blanda recepten
    const shuffledRecipes = shuffleArray(formattedRecipes);

    // Returnera det begärda antalet recept
    const relatedRecipes = shuffledRecipes.slice(0, limit);

    return NextResponse.json({
      recipes: relatedRecipes,
      total: relatedRecipes.length
    });

  } catch (error) {
    console.error('Error fetching related recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 