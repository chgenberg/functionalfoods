import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function sampleFallback() {
  return [
    { 
      id: 'f1', 
      title: 'Stekt ägg med lax', 
      slug: 'stekt-agg-med-lax', 
      imageUrl: '/Bilder_basic/_optimized/agg-med-majonnas-och-kaffe.webp', 
      imageAlt: 'Stekt ägg med lax', 
      excerpt: 'Proteinrik frukost med omega-3', 
      prepTime: '10 min', 
      categories: ['Frukost'] 
    },
    { 
      id: 'f2', 
      title: 'Het ratatouille', 
      slug: 'het-ratatouille', 
      imageUrl: '/Bilder_basic/_optimized/aggrora-med-tomat-och-paprika.webp', 
      imageAlt: 'Het ratatouille', 
      excerpt: 'Medelhavsinspirerad grönsaksgryta', 
      prepTime: '25 min', 
      categories: ['Middag'] 
    },
    { 
      id: 'f3', 
      title: 'Yoghurt med ketomüsli', 
      slug: 'yoghurt-med-ketomusli', 
      imageUrl: '/Bilder_basic/_optimized/banankeso-plattar-med-frukt-och-bar.webp', 
      imageAlt: 'Yoghurt med ketomüsli', 
      excerpt: 'Hälsosam start på dagen', 
      prepTime: '5 min', 
      categories: ['Frukost'] 
    },
    { 
      id: 'f4', 
      title: 'Kycklingburgare med papayasallad', 
      slug: 'kycklingburgare-med-papayasallad', 
      imageUrl: '/Bilder_flow/_optimized/IMG_0457.webp', 
      imageAlt: 'Kycklingburgare', 
      excerpt: 'Proteinrik middag med exotisk touch', 
      prepTime: '25 min', 
      categories: ['Middag'] 
    },
    { 
      id: 'f5', 
      title: 'Choklad- och kokoschiapudding', 
      slug: 'choklad-och-kokoschiapudding', 
      imageUrl: '/Bilder_flow/_optimized/IMG_0480.webp', 
      imageAlt: 'Chiapudding', 
      excerpt: 'Krämig och näringsrik dessert', 
      prepTime: '15 min', 
      categories: ['Dessert'] 
    }
  ];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Math.min(50, Math.max(1, parseInt(searchParams.get('count') || '10')));
    const excludeId = searchParams.get('excludeId');

    // Get free recipes with images
    const freeRecipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
        isFree: true,
        isPremium: false,
        imageUrl: { not: null },
        ...(excludeId && { id: { not: excludeId } })
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
      take: count * 2 // Get more to shuffle from
    });

    if (freeRecipes.length === 0) {
      return NextResponse.json(
        { recipes: sampleFallback().slice(0, count) },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
      );
    }

    // Shuffle and return requested count
    const shuffled = freeRecipes.sort(() => 0.5 - Math.random());
    const selectedRecipes = shuffled.slice(0, count);

    return NextResponse.json(
      { recipes: selectedRecipes },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );

  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { recipes: sampleFallback().slice(0, 10) },
      { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60' } }
    );
  } finally {
    await prisma.$disconnect();
  }
} 