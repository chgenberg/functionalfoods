import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ recipes: [] });
  }
  
  try {
    console.log('🔄 Force refreshing carousel data...');

    // Get fresh free recipes directly
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
      take: 20
    });

    console.log(`Found ${freeRecipes.length} free recipes`);

    // Ensure we have working images
    const recipesWithWorkingImages = freeRecipes.filter(recipe => 
      recipe.imageUrl && (
        recipe.imageUrl.includes('Bilder_basic/_optimized') || 
        recipe.imageUrl.includes('Bilder_flow/_optimized')
      )
    );

    console.log(`${recipesWithWorkingImages.length} have working images`);

    if (recipesWithWorkingImages.length === 0) {
      // Return fallback with working images
      return NextResponse.json({
        recipes: [
          { id: 'f1', title: 'Stekt ägg med lax', slug: 'stekt-agg-med-lax', imageUrl: '/Bilder_basic/_optimized/agg-med-majonnas-och-kaffe.webp', imageAlt: 'Stekt ägg med lax', excerpt: 'Proteinrik frukost med omega-3', prepTime: '10 min', categories: ['Frukost'] },
          { id: 'f2', title: 'Het ratatouille', slug: 'het-ratatouille', imageUrl: '/Bilder_basic/_optimized/aggrora-med-tomat-och-paprika.webp', imageAlt: 'Het ratatouille', excerpt: 'Medelhavsinspirerad grönsaksgryta', prepTime: '25 min', categories: ['Middag'] },
          { id: 'f3', title: 'Yoghurt med ketomüsli', slug: 'yoghurt-med-ketomusli', imageUrl: '/Bilder_basic/_optimized/banankeso-plattar-med-frukt-och-bar.webp', imageAlt: 'Yoghurt med ketomüsli', excerpt: 'Hälsosam start på dagen', prepTime: '5 min', categories: ['Frukost'] },
          { id: 'f4', title: 'Kycklingburgare med papayasallad', slug: 'kycklingburgare-med-papayasallad', imageUrl: '/Bilder_flow/_optimized/IMG_0457.webp', imageAlt: 'Kycklingburgare', excerpt: 'Proteinrik middag med exotisk touch', prepTime: '25 min', categories: ['Middag'] },
          { id: 'f5', title: 'Choklad- och kokoschiapudding', slug: 'choklad-och-kokoschiapudding', imageUrl: '/Bilder_flow/_optimized/IMG_0480.webp', imageAlt: 'Chiapudding', excerpt: 'Krämig och näringsrik dessert', prepTime: '15 min', categories: ['Dessert'] },
        ]
      }, { 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      });
    }

    // Return real recipes with working images
    const shuffled = recipesWithWorkingImages.sort(() => 0.5 - Math.random());
    const selectedRecipes = shuffled.slice(0, 5);

    return NextResponse.json({
      recipes: selectedRecipes,
      debug: {
        totalFreeRecipes: freeRecipes.length,
        withWorkingImages: recipesWithWorkingImages.length,
        returned: selectedRecipes.length
      }
    }, { 
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } 
    });

  } catch (error) {
    console.error('Error forcing carousel refresh:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refresh carousel',
        recipes: [
          { id: 'f1', title: 'Stekt ägg med lax', slug: 'stekt-agg-med-lax', imageUrl: '/Bilder_basic/_optimized/agg-med-majonnas-och-kaffe.webp', imageAlt: 'Stekt ägg med lax', excerpt: 'Proteinrik frukost med omega-3', prepTime: '10 min', categories: ['Frukost'] },
          { id: 'f2', title: 'Het ratatouille', slug: 'het-ratatouille', imageUrl: '/Bilder_basic/_optimized/aggrora-med-tomat-och-paprika.webp', imageAlt: 'Het ratatouille', excerpt: 'Medelhavsinspirerad grönsaksgryta', prepTime: '25 min', categories: ['Middag'] },
          { id: 'f3', title: 'Yoghurt med ketomüsli', slug: 'yoghurt-med-ketomusli', imageUrl: '/Bilder_basic/_optimized/banankeso-plattar-med-frukt-och-bar.webp', imageAlt: 'Yoghurt med ketomüsli', excerpt: 'Hälsosam start på dagen', prepTime: '5 min', categories: ['Frukost'] },
          { id: 'f4', title: 'Kycklingburgare med papayasallad', slug: 'kycklingburgare-med-papayasallad', imageUrl: '/Bilder_flow/_optimized/IMG_0457.webp', imageAlt: 'Kycklingburgare', excerpt: 'Proteinrik middag med exotisk touch', prepTime: '25 min', categories: ['Middag'] },
          { id: 'f5', title: 'Choklad- och kokoschiapudding', slug: 'choklad-och-kokoschiapudding', imageUrl: '/Bilder_flow/_optimized/IMG_0480.webp', imageAlt: 'Chiapudding', excerpt: 'Krämig och näringsrik dessert', prepTime: '15 min', categories: ['Dessert'] },
        ]
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 