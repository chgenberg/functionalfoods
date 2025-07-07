/**
 * Image utilities for recipe images
 */

export function getRecipeImageUrl(recipe: { slug?: string, imageUrl?: string }): string {
  // If we have a slug, try local image first
  if (recipe.slug) {
    const localImageUrl = `/images/recept/${recipe.slug}.jpg`;
    // In a real implementation, you could check if file exists
    // For now, we'll use a convention-based approach
    return localImageUrl;
  }
  
  // Fallback to external URL if available
  if (recipe.imageUrl) {
    return recipe.imageUrl;
  }
  
  // Final fallback to placeholder
  return '/images/recipe-placeholder.jpg';
}

export function getImageProps(recipe: { slug?: string, imageUrl?: string, imageAlt?: string, title?: string }) {
  const imageUrl = getRecipeImageUrl(recipe);
  const isLocal = imageUrl.startsWith('/images/');
  
  return {
    src: imageUrl,
    alt: recipe.imageAlt || recipe.title || 'Recept',
    unoptimized: !isLocal, // Only optimize local images
  };
} 