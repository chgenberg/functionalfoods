import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to normalize Swedish text for better matching
function normalizeSwedish(text: string): string {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to extract recipe name from meal name
function extractRecipeName(mealName: string): string {
  return mealName.replace(/\s+rester$/, '').replace(/\s+\(.*\)$/, '').trim();
}

// Helper function to add optimization parameters to image URLs
function optimizeImageUrl(imageUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!imageUrl || imageUrl.includes('placeholder')) return imageUrl;

  // Normalize '/public' prefix if present
  if (imageUrl.startsWith('/public/')) {
    imageUrl = imageUrl.replace('/public', '');
  }

  // Do NOT append query params for local assets; Next.js handles optimization
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Remote URLs can remain unchanged
  return imageUrl;
}

// Helper function to get a working fallback image
function getFallbackImage(size: 'small' | 'medium' | 'large' = 'medium'): string {
  // Use a working image from Bilder_basic as fallback
  const fallbackImages = [
    '/Bilder_basic/_optimized/agg-med-majonnas-och-kaffe.webp',
    '/Bilder_basic/_optimized/aggrora-med-tomat-och-paprika.webp',
    '/Bilder_basic/_optimized/banankeso-plattar-med-frukt-och-bar.webp',
    '/Bilder_basic/_optimized/barsmoothie-med-apelsin.webp'
  ];
  const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  return optimizeImageUrl(randomImage, size);
}

export async function POST(request: Request) {
  try {
    const { recipeNames, size = 'medium' } = await request.json();

    if (!Array.isArray(recipeNames)) {
      return NextResponse.json({ error: 'Recipe names must be an array' }, { status: 400 });
    }

    console.log('🔍 Fetching images for:', recipeNames);

    // Clean recipe names and create search patterns
    const cleanedNames = recipeNames.map(name => extractRecipeName(name));
    const normalizedNames = cleanedNames.map(name => normalizeSwedish(name));

    console.log('🧹 Cleaned names:', cleanedNames);
    console.log('🔤 Normalized names:', normalizedNames);

    // Fetch all recipes for better matching
    const recipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED',
        imageUrl: { not: null }
      },
      select: {
        title: true,
        imageUrl: true,
        slug: true
      }
    });

    console.log(`📚 Found ${recipes.length} recipes with images`);

    // Create a map of recipe names to images
    const imageMap: Record<string, string> = {};

    for (let i = 0; i < recipeNames.length; i++) {
      const originalName = recipeNames[i];
      const cleanName = cleanedNames[i];
      const normalizedName = normalizedNames[i];

      console.log(`🔍 Matching "${originalName}" -> "${cleanName}" -> "${normalizedName}"`);

      // Try exact match first
      let match = recipes.find((recipe: any) => 
        normalizeSwedish(recipe.title) === normalizedName
      );

      // Try partial match
      if (!match) {
        match = recipes.find((recipe: any) => {
          const normalizedTitle = normalizeSwedish(recipe.title);
          return normalizedTitle.includes(normalizedName) || normalizedName.includes(normalizedTitle);
        });
      }

      // Try word-based matching
      if (!match) {
        const searchWords = normalizedName.split(/\s+/).filter(w => w.length > 2);
        match = recipes.find((recipe: any) => {
          const titleWords = normalizeSwedish(recipe.title).split(/\s+/);
          const matchingWords = searchWords.filter(word => 
            titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
          );
          return matchingWords.length >= Math.min(2, searchWords.length);
        });
      }

      if (match && match.imageUrl) {
        // Prefer actual recipe image; accept Recept_complete2.0/Recept_complete as valid sources
        let url = match.imageUrl as string;
        if (url.startsWith('/public/')) url = url.replace('/public', '');
        const optimizedUrl = optimizeImageUrl(url, size as 'small' | 'medium' | 'large');
        imageMap[originalName] = optimizedUrl;
        console.log(`✅ Match found: "${originalName}" -> "${match.title}" -> ${optimizedUrl}`);
      } else {
        imageMap[originalName] = getFallbackImage(size as 'small' | 'medium' | 'large');
        console.log(`❌ No match for: "${originalName}" - using fallback`);
      }
    }

    console.log('📸 Final image map:', imageMap);

    return NextResponse.json({ images: imageMap });
  } catch (error) {
    console.error('❌ Error fetching recipe images:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe images' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 