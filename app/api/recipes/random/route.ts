import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function sampleFallback() {
  return [
    { 
      id: 'f1', 
      title: 'Stekt ägg med lax', 
      slug: 'stekt-agg-med-lax', 
      imageUrl: '/api/images/Recept_complete2.0/images/_optimized/Agg%20i%20paprika.webp', 
      imageAlt: 'Stekt ägg med lax', 
      excerpt: 'Proteinrik frukost med omega-3', 
      prepTime: '10 min', 
      categories: ['Frukost'] 
    },
    { 
      id: 'f2', 
      title: 'Het ratatouille', 
      slug: 'het-ratatouille', 
      imageUrl: '/api/images/Recept_complete2.0/images/_optimized/Het%20ratatouille.webp', 
      imageAlt: 'Het ratatouille', 
      excerpt: 'Medelhavsinspirerad grönsaksgryta', 
      prepTime: '25 min', 
      categories: ['Middag'] 
    },
    { 
      id: 'f3', 
      title: 'Yoghurt med ketomüsli', 
      slug: 'yoghurt-med-ketomusli', 
      imageUrl: '/api/images/Recept_complete2.0/images/_optimized/Agghack%20med%20kalkon.webp', 
      imageAlt: 'Yoghurt med ketomüsli', 
      excerpt: 'Hälsosam start på dagen', 
      prepTime: '5 min', 
      categories: ['Frukost'] 
    },
    { 
      id: 'f4', 
      title: 'Kycklingburgare med papayasallad', 
      slug: 'kycklingburgare-med-papayasallad', 
      imageUrl: '/api/images/Recept_complete2.0/images/_optimized/Kycklingburgare%20med%20papayasallad.webp', 
      imageAlt: 'Kycklingburgare', 
      excerpt: 'Proteinrik middag med exotisk touch', 
      prepTime: '25 min', 
      categories: ['Middag'] 
    },
    { 
      id: 'f5', 
      title: 'Choklad- och kokoschiapudding', 
      slug: 'choklad-och-kokoschiapudding', 
      imageUrl: '/api/images/Recept_complete2.0/images/_optimized/Choklad-%20och%20kokoschiapudding.webp', 
      imageAlt: 'Chiapudding', 
      excerpt: 'Krämig och näringsrik dessert', 
      prepTime: '15 min', 
      categories: ['Dessert'] 
    }
  ];
}

function normalizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  let out = url;
  if (out.startsWith('/public/')) out = out.replace('/public', '');
  // Ensure leading slash for local assets
  if (out.startsWith('public/')) out = out.replace('public/', '/');
  if (!out.startsWith('/') && !out.startsWith('http')) out = `/${out}`;
  return out;
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
    const selectedRecipes = shuffled.slice(0, count).map(r => ({
      ...r,
      imageUrl: normalizeImageUrl(r.imageUrl)
    }));

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