import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Fixing image paths for Next.js...');

    // Find all recipes with /public/ in their imageUrl
    const recipes = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          contains: '/public/'
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true
      }
    });

    console.log(`Found ${recipes.length} recipes with /public/ in image paths`);

    let updated = 0;
    for (const recipe of recipes) {
      if (!recipe.imageUrl) continue;
      const newUrl = recipe.imageUrl.replace('/public', '');
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: newUrl }
      });

      updated++;
    }

    // Also check for recipes that might need the opposite fix
    const recipesWithoutPublic = await prisma.recipe.findMany({
      where: {
        AND: [
          { imageUrl: { not: null } },
          { imageUrl: { not: { startsWith: '/' } } }
        ]
      },
      select: {
        id: true,
        title: true,
        imageUrl: true
      }
    });

    for (const recipe of recipesWithoutPublic) {
      if (!recipe.imageUrl) continue;
      const newUrl = recipe.imageUrl.startsWith('/') ? recipe.imageUrl : `/${recipe.imageUrl}`;
      
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
      examples: examples.map(r => ({ title: r.title, imageUrl: r.imageUrl }))
    });

  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix image paths' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 