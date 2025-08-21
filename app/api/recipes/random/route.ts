import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      // Static fallback
      return NextResponse.json({ recipes: sampleFallback() });
    }
    const freeRecipes = await prisma.recipe.findMany({
      where: {
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
      },
      take: 50 // Get more recipes
    });

    let pool = freeRecipes;
    if (pool.length === 0) {
      // Fallback: tillåt poster utan bild och ta de senaste
      pool = await prisma.recipe.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 30, // Increased from 12 to 30
        select: {
          id: true, title: true, slug: true, imageUrl: true, imageAlt: true, excerpt: true, prepTime: true, categories: true
        }
      });
    }

    if (pool.length === 0) {
      return NextResponse.json({ recipes: sampleFallback() });
    }

    const count = Math.min(20, pool.length); // Increased from 10 to 20
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const randomRecipes = shuffled.slice(0, count);

    return NextResponse.json({ recipes: randomRecipes });
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    return NextResponse.json(
      { recipes: sampleFallback() },
      { status: 200 }
    );
  }
}

function sampleFallback() {
  return [
    { id: 'f1', title: 'Stekt ägg med lax', slug: 'stekt-agg-lax', imageUrl: '/Bilder_basic/stekt-agg-med-lax-mobile.jpg', imageAlt: 'Stekt ägg med lax', excerpt: 'Proteinrik frukost med omega-3', prepTime: '10 min', categories: ['Frukost'] },
    { id: 'f2', title: 'Het ratatouille', slug: 'het-ratatouille', imageUrl: '/Bilder_basic/fars-och-gronsakswok.JPG', imageAlt: 'Het ratatouille', excerpt: 'Medelhavsinspirerad grönsaksgryta', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f3', title: 'Yoghurt med ketomüsli', slug: 'yoghurt-ketomusli', imageUrl: '/images/recipe-placeholder.svg', imageAlt: 'Yoghurt med ketomüsli', excerpt: 'Hälsosam start på dagen', prepTime: '5 min', categories: ['Frukost'] },
    { id: 'f4', title: 'Kycklingburgare med papayasallad', slug: 'kycklingburgare-papayasallad-sallad', imageUrl: '/images/recipe-placeholder.svg', imageAlt: 'Kycklingburgare', excerpt: 'Proteinrik middag med exotisk touch', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f5', title: 'Choklad- och kokoschiapudding', slug: 'choklad-kokoschiapudding', imageUrl: '/Bilder_flow/chiapudding-med-bar-och-notter.jpg', imageAlt: 'Chiapudding', excerpt: 'Krämig och näringsrik dessert', prepTime: '15 min', categories: ['Dessert'] },
    { id: 'f6', title: 'Äggröra med asiatisk avokadosallad', slug: 'aggrora-asiatisk-avokadosallad', imageUrl: '/Bilder_flow/aggrora-med-asiatisk-avokadosallad.jpg', imageAlt: 'Äggröra med avokado', excerpt: 'Asiatisk fusion med hälsosamma fetter', prepTime: '15 min', categories: ['Lunch'] },
    { id: 'f7', title: 'Laxgratäng med scampi och broccoli', slug: 'laxgratang-broccoli-scampi', imageUrl: '/images/recipe-placeholder.svg', imageAlt: 'Laxgratäng', excerpt: 'Lyxig fiskrätt med omega-3', prepTime: '35 min', categories: ['Middag'] },
    { id: 'f8', title: 'Färskostmacka med tomat', slug: 'farskostmacka-tomat', imageUrl: '/images/recipe-placeholder.svg', imageAlt: 'Färskostmacka', excerpt: 'Snabb och näringsrik lunch', prepTime: '5 min', categories: ['Lunch'] },
    { id: 'f9', title: 'Linssoppa från medelhavet', slug: 'linssoppa-medelhavet-soppa', imageUrl: '/images/recipe-placeholder.svg', imageAlt: 'Linssoppa', excerpt: 'Värmande soppa rik på protein', prepTime: '30 min', categories: ['Soppa'] },
    { id: 'f10', title: 'Torsk med guacamole och sötpotatis', slug: 'torsk-guacamole-sotpotatis', imageUrl: '/Bilder_flow/torsk-med-guacamole-och-sotpotatis.jpg', imageAlt: 'Torsk med guacamole', excerpt: 'Fisk med hälsosamma fetter', prepTime: '25 min', categories: ['Middag'] },
    { id: 'f11', title: 'Ugnsbakad blomkål med ratatouille', slug: 'ugnsbakad-blomkal-ratatouille', imageUrl: '/Bilder_flow/IMG_0481.JPG', imageAlt: 'Blomkål ratatouille', excerpt: 'Vegetarisk middag full av antioxidanter', prepTime: '40 min', categories: ['Middag'] },
    { id: 'f12', title: 'Yoghurt med bovetegranola och frukt', slug: 'yoghurt-bovetegranola-frukt', imageUrl: '/Bilder_flow/IMG_0603.JPG', imageAlt: 'Yoghurt med granola', excerpt: 'Probiotisk frukost med fibrer', prepTime: '5 min', categories: ['Frukost'] },
    { id: 'f13', title: 'Zucchiniplättar med yoghurtsås', slug: 'zucchiniplättar-yoghurtsås', imageUrl: '/Bilder_flow/kokta-agg-med-kaviar.jpg', imageAlt: 'Zucchiniplättar', excerpt: 'Grönsaksrika plättar med protein', prepTime: '20 min', categories: ['Lunch'] },
    { id: 'f14', title: 'Varma grönsaker med halloumi', slug: 'varma-gronsaker-halloumi', imageUrl: '/Bilder_flow/ajvarspett-med-grekisk-sallad-och-tzatziki.jpg', imageAlt: 'Grönsaker halloumi', excerpt: 'Medelhavsmiddag med kalcium', prepTime: '20 min', categories: ['Middag'] },
    { id: 'f15', title: 'Kokt ägg med majonnäs', slug: 'kokt-agg-majonnas', imageUrl: '/Bilder_basic/kokt-agg-med-majonnas.JPG', imageAlt: 'Kokt ägg', excerpt: 'Klassisk proteinrik måltid', prepTime: '10 min', categories: ['Lunch'] }
  ];
} 