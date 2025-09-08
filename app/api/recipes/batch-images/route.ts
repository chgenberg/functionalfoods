import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
  // Use a working image from Recept_complete2.0 as fallback
  const fallbackImages = [
    '/api/images/Recept_complete2.0/images/_optimized/Agg%20i%20paprika.webp',
    '/api/images/Recept_complete2.0/images/_optimized/Het%20ratatouille.webp',
    '/api/images/Recept_complete2.0/images/_optimized/Agghack%20med%20kalkon.webp',
    '/api/images/Recept_complete2.0/images/_optimized/Fruktsmoothie.webp'
  ];
  const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  return randomImage;
}

// Helper to convert local public asset path to /api/images with encoded segments
function localAssetToApiUrl(assetPath: string): string {
  if (!assetPath) return assetPath as unknown as string;
  let p = assetPath;
  if (p.startsWith('/public/')) p = p.replace('/public', '');
  if (!p.startsWith('/')) p = `/${p}`;
  // encode each segment but preserve slashes
  const segments = p.split('/').filter(Boolean).map(s => encodeURIComponent(s));
  return `/api/images/${segments.join('/')}`;
}

// Get available image files from filesystem
function getAvailableImages(): string[] {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'Recept_complete2.0', 'images', '_optimized');
    const files = fs.readdirSync(imagesDir);
    return files.filter(f => f.endsWith('.webp')).map(f => f.replace('.webp', ''));
  } catch (error) {
    console.warn('Could not read images directory:', error);
    return [];
  }
}

// Fuzzy match recipe name to image filename
function findBestImageMatch(recipeName: string, availableImages: string[]): string | null {
  const normalized = normalizeSwedish(recipeName);
  
  // 1. Exact match
  let match = availableImages.find(img => normalizeSwedish(img) === normalized);
  if (match) return `/api/images/Recept_complete2.0/images/_optimized/${encodeURIComponent(match)}.webp`;
  
  // 2. Contains match (both directions)
  match = availableImages.find(img => {
    const normalizedImg = normalizeSwedish(img);
    return normalizedImg.includes(normalized) || normalized.includes(normalizedImg);
  });
  if (match) return `/api/images/Recept_complete2.0/images/_optimized/${encodeURIComponent(match)}.webp`;
  
  // 3. Word-based matching
  const recipeWords = normalized.split(/\s+/).filter(w => w.length > 2);
  if (recipeWords.length > 0) {
    match = availableImages.find(img => {
      const imgWords = normalizeSwedish(img).split(/\s+/);
      const matchedWords = recipeWords.filter(rw => 
        imgWords.some(iw => iw.includes(rw) || rw.includes(iw))
      );
      return matchedWords.length >= Math.min(2, recipeWords.length);
    });
    if (match) return `/api/images/Recept_complete2.0/images/_optimized/${encodeURIComponent(match)}.webp`;
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const { recipeNames, recipeSlugs = [], size = 'medium' } = await request.json();

    if (!Array.isArray(recipeNames)) {
      return NextResponse.json({ error: 'Recipe names must be an array' }, { status: 400 });
    }

    console.log('🔍 Fetching images for:', recipeNames);

    // Get available image files from filesystem
    const availableImages = getAvailableImages();
    console.log(`📁 Found ${availableImages.length} available image files`);

    // Clean recipe names and create search patterns
    const cleanedNames = recipeNames.map(name => extractRecipeName(name));
    const normalizedNames = cleanedNames.map(name => normalizeSwedish(name));

    console.log('🧹 Cleaned names:', cleanedNames);
    console.log('🔤 Normalized names:', normalizedNames);

    // Fetch all recipes for database matching (as backup)
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

    console.log(`📚 Found ${recipes.length} recipes with images in database`);

    // Build quick index by slug
    const slugToImage: Record<string, string> = {};
    for (const r of recipes) {
      if (r.slug && r.imageUrl) {
        let url = r.imageUrl;
        if (url.startsWith('/public/')) url = url.replace('/public', '');
        if (!url.startsWith('/') && !url.startsWith('http')) url = `/${url}`;
        // Always serve via API route to handle spaces/slugified filenames
        slugToImage[r.slug] = localAssetToApiUrl(url);
      }
    }

    // Create a map of recipe names to images
    const imageMap: Record<string, string> = {};

    for (let i = 0; i < recipeNames.length; i++) {
      const originalName = recipeNames[i];
      const cleanName = cleanedNames[i];
      const normalizedName = normalizedNames[i];

      // 1. Try slug matching first (most reliable)
      const providedSlug = Array.isArray(recipeSlugs) ? recipeSlugs[i] : null;
      if (providedSlug && slugToImage[providedSlug]) {
        imageMap[originalName] = slugToImage[providedSlug];
        console.log(`✅ Slug match: ${providedSlug} -> ${slugToImage[providedSlug]}`);
        continue;
      }

      // 2. Try filesystem fuzzy matching
      const fsMatch = findBestImageMatch(cleanName, availableImages);
      if (fsMatch) {
        imageMap[originalName] = fsMatch;
        console.log(`✅ Filesystem match: "${originalName}" -> ${fsMatch}`);
        continue;
      }

      // 3. Try database matching
      console.log(`🔍 DB matching "${originalName}" -> "${cleanName}" -> "${normalizedName}"`);
      let match = recipes.find((r: any) => normalizeSwedish(r.title) === normalizedName);
      if (!match) {
        match = recipes.find((r: any) => {
          const nt = normalizeSwedish(r.title);
          return nt.includes(normalizedName) || normalizedName.includes(nt);
        });
      }
      if (!match) {
        const searchWords = normalizedName.split(/\s+/).filter((w: string) => w.length > 2);
        match = recipes.find((r: any) => {
          const tw = normalizeSwedish(r.title).split(/\s+/);
          const hits = searchWords.filter((w: string) => tw.some((t: string) => t.includes(w) || w.includes(t)));
          return hits.length >= Math.min(2, searchWords.length);
        });
      }

      if (match && match.imageUrl) {
        let url = match.imageUrl as string;
        if (url.startsWith('/public/')) url = url.replace('/public', '');
        if (!url.startsWith('/') && !url.startsWith('http')) url = `/${url}`;
        // Use API images route for reliability
        imageMap[originalName] = localAssetToApiUrl(url);
        console.log(`✅ DB match: "${originalName}" -> ${imageMap[originalName]}`);
      } else {
        const fallback = getFallbackImage(size as 'small' | 'medium' | 'large');
        imageMap[originalName] = fallback;
        console.log(`⚠️ No match for "${originalName}", using fallback: ${fallback}`);
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