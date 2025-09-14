import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Hide this test endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 });
  }

  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Skipped during build' });
  }
  
  try {
    console.log('🧪 Testing random recipes API logic...');

    // Test the exact query from the random API
    const freeRecipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
        isFree: true,
        isPremium: false,
        imageUrl: { not: null }
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
      },
      take: 10
    });

    const workingImages = freeRecipes.filter(recipe => 
      recipe.imageUrl && (
        recipe.imageUrl.includes('Bilder_basic/_optimized') || 
        recipe.imageUrl.includes('Bilder_flow/_optimized')
      )
    );

    return NextResponse.json({
      success: true,
      totalFreeRecipes: freeRecipes.length,
      withWorkingImages: workingImages.length,
      sampleRecipes: freeRecipes.slice(0, 5),
      workingSamples: workingImages.slice(0, 5)
    });

  } catch (error) {
    console.error('Error testing random recipes:', error);
    return NextResponse.json(
      { success: false, error: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 