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
    return imageUrl || '/images/recipe-placeholder.svg';
  }

  // For local images, return as-is since Next.js Image component handles optimization
  if (imageUrl.startsWith('/')) {
    return imageUrl;
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