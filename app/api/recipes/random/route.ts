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

    const freeRecipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
        isFree: true,
        isPremium: false,
        imageUrl: { not: null },
        NOT: [{ imageUrl: { contains: 'placeholder' } }]
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
      take: 50 // Get more recipes
    });

    let pool = freeRecipes;
    if (pool.length === 0) {
      // Fallback: tillåt poster utan bild och ta de senaste, fortfarande endast gratis
      pool = await prisma.recipe.findMany({
        where: {
          status: 'PUBLISHED',
          isFree: true,
          isPremium: false,
          NOT: [{ imageUrl: { contains: 'placeholder' } }]
        },
        orderBy: { createdAt: 'desc' },
        take: 30, // Increased from 12 to 30
        select: {
          id: true, title: true, slug: true, imageUrl: true, imageAlt: true, excerpt: true, prepTime: true, categories: true
        }
      });
    }

    if (pool.length === 0) {
      return NextResponse.json({ recipes: sampleFallback() }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } });
    }

    const count = Math.min(20, pool.length); // Increased from 10 to 20
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const randomRecipes = shuffled.slice(0, count);

    return NextResponse.json({ recipes: randomRecipes }, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { recipes: sampleFallback() },
      { status: 200, headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' } }
    );
  }
}

function sampleFallback() {
  return [
    { id: 'f1', title: 'Stekt ägg med lax', slug: 'stekt-agg-lax', imageUrl: '/Recept_complete/images/Stekt agg med lax.jpg', imageAlt: 'Stekt ägg med lax', excerpt: 'Proteinrik frukost med omega-3', prepTime: '10 min', categories: ['Frukost'] },
    { id: 'f2', title: 'Het ratatouille', slug: 'het-ratatouille', imageUrl: '/Recept_complete/images/Ratatouille med Apetina panéer.jpg', imageAlt: 'Het ratatouille', excerpt: 'Medelhavsinspirerad grönsaksgryta', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f3', title: 'Yoghurt med ketomüsli', slug: 'yoghurt-ketomusli', imageUrl: '/Recept_complete/images/Yoghurt med ketomüsli.jpg', imageAlt: 'Yoghurt med ketomüsli', excerpt: 'Hälsosam start på dagen', prepTime: '5 min', categories: ['Frukost'] },
    { id: 'f4', title: 'Kycklingburgare med papayasallad', slug: 'kycklingburgare-papayasallad-sallad', imageUrl: '/Recept_complete/images/Kycklingburgare med papayasallad.jpg', imageAlt: 'Kycklingburgare', excerpt: 'Proteinrik middag med exotisk touch', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f5', title: 'Choklad- och kokoschiapudding', slug: 'choklad-kokoschiapudding', imageUrl: '/Recept_complete/images/Choklad- och kokoschiapudding.jpg', imageAlt: 'Chiapudding', excerpt: 'Krämig och näringsrik dessert', prepTime: '15 min', categories: ['Dessert'] },
  ];
} 