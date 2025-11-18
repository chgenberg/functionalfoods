import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/app/lib/database';
 

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

// Helper to convert image filename to Vision-optimized URL
function imageToOptimizedUrl(imageName: string, size: string = 'medium', usage: 'card' | 'detail' | 'thumb' = 'card'): string {
  const slugified = imageName
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  // Try Vision-optimized first (best quality with intelligent cropping)
  const visionPath = path.join(process.cwd(), 'public', 'recept_images_vision_optimized', `${slugified}-${usage}.webp`);
  if (fs.existsSync(visionPath)) {
    return `/api/images/recept_images_vision_optimized/${slugified}-${usage}.webp`;
  }
  
  // Fallback to regular optimized with format mapping
  let format;
  if (usage === 'detail') {
    format = `detail-${size}`;
  } else if (usage === 'thumb') {
    format = `thumb-${size === 'small' || size === 'medium' ? size : 'medium'}`;
  } else {
    format = `card-${size}`;
  }
  
  const optimizedPath = path.join(process.cwd(), 'public', 'recept_images_optimized', `${slugified}-${format}.webp`);
  if (fs.existsSync(optimizedPath)) {
    return `/api/images/recept_images_optimized/${slugified}-${format}.webp`;
  }
  
  // Final fallback to original image
  const originalDir = path.join(process.cwd(), 'public', 'recept_images_2025');
  const possibleExtensions = ['jpg', 'jpeg', 'png'];
  
  for (const ext of possibleExtensions) {
    const originalPath = path.join(originalDir, `${imageName}.${ext}`);
    if (fs.existsSync(originalPath)) {
      return `/api/images/recept_images_2025/${encodeURIComponent(imageName)}.${ext}`;
    }
  }
  
  // Ultimate fallback
  return `/api/images/recept_images_vision_optimized/het-ratatouille-${usage}.webp`;
}

// Helper to build optimized URL by slug (prefer on-disk assets)
function slugToOptimizedUrl(slug: string, size: string = 'medium', usage: 'card' | 'detail' | 'thumb' = 'card'): string | null {
  const vision = path.join(process.cwd(), 'public', 'recept_images_vision_optimized', `${slug}-${usage}.webp`);
  if (fs.existsSync(vision)) {
    return `/api/images/recept_images_vision_optimized/${slug}-${usage}.webp`;
  }

  let format;
  if (usage === 'detail') {
    format = `detail-${size}`;
  } else if (usage === 'thumb') {
    format = `thumb-${size === 'small' || size === 'medium' ? size : 'medium'}`;
  } else {
    format = `card-${size}`;
  }
  const optimized = path.join(process.cwd(), 'public', 'recept_images_optimized', `${slug}-${format}.webp`);
  if (fs.existsSync(optimized)) {
    return `/api/images/recept_images_optimized/${slug}-${format}.webp`;
  }
  return null;
}

// Get available image files from filesystem
function getAvailableImages(): string[] {
  try {
    const visionDir = path.join(process.cwd(), 'public', 'recept_images_vision_optimized');
    const optimizedDir = path.join(process.cwd(), 'public', 'recept_images_optimized');
  const originalDir = path.join(process.cwd(), 'public', 'recept_images_2025');
    
    let files = [];
    
    // Try Vision-optimized first (best quality)
    if (fs.existsSync(visionDir)) {
      files = fs.readdirSync(visionDir);
      const visionNames = files
        .filter(f => f.endsWith('-card.webp'))
        .map(f => f.replace('-card.webp', ''))
        .map(f => f.replace(/-/g, ' '));
      
      if (visionNames.length > 0) {
        console.log(`📁 Found ${visionNames.length} Vision-optimized images (best quality)`);
        return visionNames;
      }
    }
    
    // Fallback to regular optimized images
    if (fs.existsSync(optimizedDir)) {
      files = fs.readdirSync(optimizedDir);
      const optimizedNames = files
        .filter(f => f.endsWith('-card-medium.webp'))
        .map(f => f.replace('-card-medium.webp', ''))
        .map(f => f.replace(/-/g, ' '));
      
      if (optimizedNames.length > 0) {
        console.log(`📁 Found ${optimizedNames.length} regular optimized images`);
        return optimizedNames;
      }
    }
    
    // Final fallback to original images
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
  
  // 2. Contains match (recipe name is contained in image name)
  // Only check if the image name contains the recipe name, not vice versa
  match = availableImages.find(img => {
    const normalizedImg = normalizeSwedish(img);
    return normalizedImg.includes(normalized);
  });
  if (match) return imageToOptimizedUrl(match, size, usage);
  
  // 3. Word-based matching (require more matches for accuracy)
  const recipeWords = normalized.split(/\s+/).filter(w => w.length > 3); // Increased min length
  if (recipeWords.length > 0) {
    match = availableImages.find(img => {
      const imgWords = normalizeSwedish(img).split(/\s+/);
      const matchedWords = recipeWords.filter(rw => 
        imgWords.some(iw => iw === rw) // Exact word match only
      );
      // Require at least 2 words or 75% of words to match
      return matchedWords.length >= Math.max(2, Math.ceil(recipeWords.length * 0.75));
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

    // Build DB map by slugs (authoritative)
    const validSlugs: string[] = Array.isArray(recipeSlugs) ? recipeSlugs.filter(Boolean) : [];
    const dbRecipes = validSlugs.length > 0 ? await prisma.recipe.findMany({
      where: { slug: { in: validSlugs } },
      select: { slug: true, imageUrl: true }
    }) : [];
    const slugToImage: Record<string, string | null> = {};
    const slugsWithExplicitNoImage = new Set<string>();
    for (const r of dbRecipes) {
      if (r.imageUrl) {
        // Normalize local asset path
        const url = r.imageUrl.startsWith('/') ? r.imageUrl : `/${r.imageUrl}`;
        slugToImage[r.slug] = url;
        console.log(`🎯 DB imageUrl for ${r.slug}: ${url}`);
      } else {
        // Mark that this slug exists in DB but intentionally has no image yet
        slugsWithExplicitNoImage.add(r.slug);
        // Still attempt slug-based filesystem image (may return null)
        slugToImage[r.slug] = slugToOptimizedUrl(r.slug, size, usage);
        console.log(`⚠️  No DB imageUrl for ${r.slug}, using filesystem fallback`);
      }
    }

    // Note: We rely on DB imageUrl or filesystem by slug; no hardcoded overrides

    // Create a map of recipe names to images. Prefer slug -> DB image; fallback to filesystem fuzzy matching
    // Also include slug keys in the response so clients can read by slug first
    const imageMap: Record<string, string> = {};
    for (let i = 0; i < recipeNames.length; i++) {
      const originalName = recipeNames[i];
      const slug = validSlugs[i];

      // 1) ALWAYS prefer DB imageUrl by slug (no filesystem fallback if DB has imageUrl)
      if (slug && slugToImage[slug]) {
        const url = slugToImage[slug] as string;
        imageMap[originalName] = url;
        imageMap[slug] = url; // expose by slug too
        continue;
      }

      // 1b) If recipe exists in DB but explicitly has no image yet, return a neutral placeholder
      if (slug && slugsWithExplicitNoImage.has(slug)) {
        const placeholder = getFallbackImage(size as 'small' | 'medium' | 'large');
        imageMap[originalName] = placeholder;
        imageMap[slug] = placeholder;
        continue;
      }

      // 2) Only if DB imageUrl is missing, try filesystem by slug
      if (slug) {
        const bySlug = slugToOptimizedUrl(slug, size, usage);
        if (bySlug) {
          imageMap[originalName] = bySlug;
          imageMap[slug] = bySlug;
          continue;
        }
      }

      // 3) Last resort: fuzzy matching or placeholder
      const cleanName = cleanedNames[i];
      const fsMatch = findBestImageMatch(cleanName, availableImages, size, usage);
      if (fsMatch) {
        imageMap[originalName] = fsMatch;
        if (slug) imageMap[slug] = fsMatch;
      } else {
        const fallback = getFallbackImage(size as 'small' | 'medium' | 'large');
        imageMap[originalName] = fallback;
        if (slug) imageMap[slug] = fallback;
      }
    }

    console.log('📸 Final image map:', imageMap);

    return NextResponse.json(
      { images: imageMap },
      { 
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        }
      }
    );
  } catch (error) {
    console.error('❌ Error fetching recipe images:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe images' }, { status: 500 });
  }
} 