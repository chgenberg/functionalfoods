import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Skipped during build' });
  }
  
  try {
    console.log('🔧 Fixing image paths for Next.js...');

    // Find all recipes with /public/ in their imageUrl
    const recipesWithPublic = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          contains: '/public/'
        }
      }
    });

    console.log(`Found ${recipesWithPublic.length} recipes with /public/ in image paths`);

    let updated = 0;
    for (const recipe of recipesWithPublic) {
      if (!recipe.imageUrl) continue;
      const newUrl = recipe.imageUrl.replace('/public', '');
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: newUrl }
      });

      updated++;
    }

    // Get some examples
    const examples = await prisma.recipe.findMany({
      take: 5,
      select: {
        title: true,
        imageUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Fixed ${updated} recipe image paths`,
      recipesWithPublic: recipesWithPublic.length,
      updated: updated,
      examples: examples
    });

  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix image paths', details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 