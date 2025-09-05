import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const hasDb = !!process.env.DATABASE_URL;
const prisma: PrismaClient | null = hasDb ? new PrismaClient() : null;

export async function GET() {
  try {
    if (!hasDb || !prisma) {
      return NextResponse.json(
        { recipes: sampleFallback() },
        { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } }
      );
    }

    console.log('🔍 Fetching free recipes for carousel...');

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
      take: 50
    });

    console.log(`Found ${freeRecipes.length} free recipes with images`);

    if (freeRecipes.length === 0) {
      console.log('No free recipes found, using fallback');
      return NextResponse.json({ recipes: sampleFallback() }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } });
    }

    const count = Math.min(20, freeRecipes.length);
    const shuffled = freeRecipes.sort(() => 0.5 - Math.random());
    const randomRecipes = shuffled.slice(0, count);

    console.log(`Returning ${randomRecipes.length} random free recipes`);

    return NextResponse.json({ recipes: randomRecipes }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { recipes: sampleFallback() },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

function sampleFallback() {
  return [
    { id: 'f1', title: 'Stekt ägg med lax', slug: 'stekt-agg-lax', imageUrl: '/Bilder_basic/_optimized/agg-med-majonnas-och-kaffe.webp', imageAlt: 'Stekt ägg med lax', excerpt: 'Proteinrik frukost med omega-3', prepTime: '10 min', categories: ['Frukost'] },
    { id: 'f2', title: 'Het ratatouille', slug: 'het-ratatouille', imageUrl: '/Bilder_basic/_optimized/aggrora-med-tomat-och-paprika.webp', imageAlt: 'Het ratatouille', excerpt: 'Medelhavsinspirerad grönsaksgryta', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f3', title: 'Yoghurt med ketomüsli', slug: 'yoghurt-ketomusli', imageUrl: '/Bilder_basic/_optimized/banankeso-plattar-med-frukt-och-bar.webp', imageAlt: 'Yoghurt med ketomüsli', excerpt: 'Hälsosam start på dagen', prepTime: '5 min', categories: ['Frukost'] },
    { id: 'f4', title: 'Kycklingburgare med papayasallad', slug: 'kycklingburgare-papayasallad-sallad', imageUrl: '/Bilder_flow/_optimized/IMG_0457.webp', imageAlt: 'Kycklingburgare', excerpt: 'Proteinrik middag med exotisk touch', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f5', title: 'Choklad- och kokoschiapudding', slug: 'choklad-kokoschiapudding', imageUrl: '/Bilder_flow/_optimized/IMG_0480.webp', imageAlt: 'Chiapudding', excerpt: 'Krämig och näringsrik dessert', prepTime: '15 min', categories: ['Dessert'] },
  ];
} 