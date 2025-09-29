// Image optimization utility for better performance

export type ImageSize = 'small' | 'medium' | 'large' | 'xl';

export interface ImageSizeConfig {
  width: number;
  height: number;
  quality: number;
}

export const imageSizes: Record<ImageSize, ImageSizeConfig> = {
  small: { width: 120, height: 120, quality: 75 },
  medium: { width: 300, height: 300, quality: 80 },
  large: { width: 600, height: 600, quality: 85 },
  xl: { width: 1200, height: 1200, quality: 90 }
};

function toApiImagePath(localPath: string): string {
  if (!localPath) return localPath;
  if (localPath.startsWith('/api/images')) return localPath;
  if (localPath === '/images/recipe-placeholder.svg') return localPath;
  let p = localPath;
  if (p.startsWith('/public/')) p = p.replace('/public', '');
  if (!p.startsWith('/')) p = `/${p}`;
  const segments = p.split('/').filter(Boolean).map(s => encodeURIComponent(s));
  return `/api/images/${segments.join('/')}`;
}

/**
 * Optimizes image URL with size and quality parameters
 * Works with both local and external images
 */
export function optimizeImageUrl(
  imageUrl: string | undefined | null, 
  size: ImageSize = 'medium',
  aspectRatio?: 'square' | 'portrait' | 'landscape'
): string {
  if (!imageUrl || imageUrl.includes('placeholder')) {
    return '/images/recipe-placeholder.svg';
  }

  // For local images, serve via API route so filenames with spaces/ÅÄÖ work
  if (imageUrl.startsWith('/')) {
    const base = toApiImagePath(imageUrl);
    const cfg = imageSizes[size] || imageSizes.medium;
    const params = new URLSearchParams();
    if (cfg.width) params.set('w', String(cfg.width));
    if (cfg.height) params.set('h', String(cfg.height));
    if (cfg.quality) params.set('q', String(cfg.quality));
    // Prefer WebP in pipeline
    params.set('format', 'webp');
    return `${base}?${params.toString()}`;
  }

  // For external images, return as-is (could be enhanced with proxy service)
  return imageUrl;
}

/**
 * Get responsive image sizes string for Next.js Image component
 */
export function getResponsiveSizes(size: ImageSize): string {
  const sizeMap = {
    small: '(max-width: 640px) 80px, (max-width: 1024px) 120px, 120px',
    medium: '(max-width: 640px) 200px, (max-width: 1024px) 300px, 300px',
    large: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
    xl: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px'
  };
  
  return sizeMap[size];
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
}

/**
 * Check if an image URL is valid and fallback to placeholder if needed
 */
export function getValidImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/images/recipe-placeholder.svg';
  }
  
  // If it's already a placeholder, return as-is
  if (imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  
  // Route local images via API for reliability
  if (imageUrl.startsWith('/')) {
    return toApiImagePath(imageUrl);
  }
  
  // For local images that might be missing, we'll let Next.js Image component handle the error
  return imageUrl;
} 