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
  // Use optimized images as fallback
  const fallbackImages = [
    'het-ratatouille',
    'keso-med-granola-och-fruktsallad', 
    'yoghurt-med-ketomusli',
    'bananplattar-med-keso-och-hallon'
  ];
  const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  return `/api/images/recept_images_optimized/${randomImage}-${size}.webp`;
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

// Helper to convert image filename to optimized URL with correct format
function imageToOptimizedUrl(imageName: string, size: string = 'medium', usage: 'card' | 'detail' | 'thumb' = 'card'): string {
  const slugified = imageName
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  // Map size to specific format based on usage
  let format;
  if (usage === 'detail') {
    format = `detail-${size}`;
  } else if (usage === 'thumb') {
    format = `thumb-${size === 'small' || size === 'medium' ? size : 'medium'}`;
  } else {
    format = `card-${size}`;
  }
  
  // Try optimized first
  const optimizedPath = path.join(process.cwd(), 'public', 'recept_images_optimized', `${slugified}-${format}.webp`);
  if (fs.existsSync(optimizedPath)) {
    return `/api/images/recept_images_optimized/${slugified}-${format}.webp`;
  }
  
  // Fallback to original image
  const originalDir = path.join(process.cwd(), 'recept_images_2025');
  const possibleExtensions = ['jpg', 'jpeg', 'png'];
  
  for (const ext of possibleExtensions) {
    const originalPath = path.join(originalDir, `${imageName}.${ext}`);
    if (fs.existsSync(originalPath)) {
      return `/api/images/recept_images_2025/${encodeURIComponent(imageName)}.${ext}`;
    }
  }
  
  // Final fallback
  return `/api/images/recept_images_optimized/het-ratatouille-${format}.webp`;
}

// Get available image files from filesystem
function getAvailableImages(): string[] {
  try {
    const optimizedDir = path.join(process.cwd(), 'public', 'recept_images_optimized');
    const originalDir = path.join(process.cwd(), 'recept_images_2025');
    
    let files = [];
    
    // Try optimized first
    if (fs.existsSync(optimizedDir)) {
      files = fs.readdirSync(optimizedDir);
      // Extract base names from optimized files (remove -size.webp suffix)
      const optimizedNames = files
        .filter(f => f.endsWith('-medium.webp'))
        .map(f => f.replace('-medium.webp', ''))
        .map(f => {
          // Convert slugified back to readable name for matching
          return f.replace(/-/g, ' ');
        });
      
      if (optimizedNames.length > 0) {
        console.log(`📁 Found ${optimizedNames.length} optimized images`);
        return optimizedNames;
      }
    }
    
    // Fallback to original images
    if (fs.existsSync(originalDir)) {
      files = fs.readdirSync(originalDir);
      const originalNames = files
        .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
        .map(f => f.replace(/\.(jpg|jpeg|png)$/i, ''));
      console.log(`📁 Fallback to ${originalNames.length} original images`);
      return originalNames;
    }
    
    return [];
  } catch (error) {
    console.warn('Could not read images directory:', error);
    return [];
  }
}

// Fuzzy match recipe name to image filename
function findBestImageMatch(recipeName: string, availableImages: string[], size: string = 'medium', usage: 'card' | 'detail' | 'thumb' = 'card'): string | null {
  const normalized = normalizeSwedish(recipeName);
  
  // 1. Exact match
  let match = availableImages.find(img => normalizeSwedish(img) === normalized);
  if (match) return imageToOptimizedUrl(match, size, usage);
  
  // 2. Contains match (both directions)
  match = availableImages.find(img => {
    const normalizedImg = normalizeSwedish(img);
    return normalizedImg.includes(normalized) || normalized.includes(normalizedImg);
  });
  if (match) return imageToOptimizedUrl(match, size, usage);
  
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
    if (match) return imageToOptimizedUrl(match, size, usage);
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const { recipeNames, recipeSlugs = [], size = 'medium', usage = 'card' } = await request.json();

    if (!Array.isArray(recipeNames)) {
      return NextResponse.json({ error: 'Recipe names must be an array' }, { status: 400 });
    }

    console.log('🔍 Fetching images for:', recipeNames, 'with usage:', usage);

    // Get available image files from filesystem
    const availableImages = getAvailableImages();
    console.log(`📁 Found ${availableImages.length} available image files`);

    // Clean recipe names and create search patterns
    const cleanedNames = recipeNames.map(name => extractRecipeName(name));
    const normalizedNames = cleanedNames.map(name => normalizeSwedish(name));

    console.log('🧹 Cleaned names:', cleanedNames);
    console.log('🔤 Normalized names:', normalizedNames);

    // Create a map of recipe names to images using only filesystem fuzzy matching
    const imageMap: Record<string, string> = {};

    for (let i = 0; i < recipeNames.length; i++) {
      const originalName = recipeNames[i];
      const cleanName = cleanedNames[i];

      // Try filesystem fuzzy matching
      const fsMatch = findBestImageMatch(cleanName, availableImages, size, usage);
      if (fsMatch) {
        imageMap[originalName] = fsMatch;
        console.log(`✅ Filesystem match: "${originalName}" -> ${fsMatch}`);
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