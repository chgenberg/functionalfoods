import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const hasDb = !!process.env.DATABASE_URL;
const prisma: PrismaClient | null = hasDb ? new PrismaClient() : null;

export async function GET() {
  try {
    if (!hasDb || !prisma) {
      return NextResponse.json(
        { recipes: [] },
        { status: 200, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
      );
    }

    console.log('🔍 Fetching free recipes for carousel...');

    let pool = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
        isFree: true,
        isPremium: false,
        imageUrl: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    console.log(\`Found \${pool.length} free recipes with images\`);

    // Filter out recipes with problematic image URLs
    pool = pool.filter(recipe => {
      if (!recipe.imageUrl) return false;
      // Skip if image URL contains spaces or problematic paths
      if (recipe.imageUrl.includes(' ')) return false;
      if (recipe.imageUrl.includes('/Recept_complete/')) return false;
      if (recipe.imageUrl.includes('/public/')) return false;
      return true;
    });

    console.log(\`After filtering: \${pool.length} recipes with valid images\`);

    if (pool.length === 0) {
      console.log('No free recipes with valid images found');
      return NextResponse.json({ recipes: [] }, { 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      });
    }

    const count = Math.min(20, pool.length);
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const randomRecipes = shuffled.slice(0, count);

    console.log(\`Returning \${randomRecipes.length} random free recipes\`);

    return NextResponse.json({ recipes: randomRecipes }, { 
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { recipes: [] },
      { status: 200, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
