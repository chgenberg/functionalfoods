import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '3');
    const excludeId = searchParams.get('excludeId');

    // Build where clause
    const where: any = {
      status: 'PUBLISHED'
    };

    // Exclude current recipe if specified
    if (excludeId) {
      where.id = {
        not: excludeId
      };
    }

    // Get total count of recipes
    const totalRecipes = await prisma.recipe.count({ where });

    if (totalRecipes === 0) {
      return NextResponse.json({ recipes: [] });
    }

    // Generate random skip values
    const randomRecipes = [];
    const usedSkips = new Set();

    for (let i = 0; i < Math.min(count, totalRecipes); i++) {
      let skip;
      do {
        skip = Math.floor(Math.random() * totalRecipes);
      } while (usedSkips.has(skip));
      
      usedSkips.add(skip);

      const recipe = await prisma.recipe.findFirst({
        where,
        skip,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          categories: true,
          difficulty: true,
          prepTime: true,
          cookTime: true,
          servings: true,
          nutrition: true,
          isFree: true,
          isPremium: true
        }
      });

      if (recipe) {
        randomRecipes.push({
          ...recipe,
          nutritionInfo: recipe.nutrition
        });
      }
    }

    return NextResponse.json({
      recipes: randomRecipes,
      count: randomRecipes.length
    });

  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 