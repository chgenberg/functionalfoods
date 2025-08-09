import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ recipes: [] });
    }
    // Hämta alla gratis recept
    const freeRecipes = await prisma.recipe.findMany({
      where: {
        isFree: true,
        status: 'PUBLISHED',
        imageUrl: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        imageAlt: true,
        excerpt: true,
        prepTime: true,
        categories: true
      }
    });

    const count = Math.min(10, freeRecipes.length);
    const shuffled = freeRecipes.sort(() => 0.5 - Math.random());
    const randomRecipes = shuffled.slice(0, count);

    return NextResponse.json({ recipes: randomRecipes });
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { recipes: [] },
      { status: 200 }
    );
  }
} 