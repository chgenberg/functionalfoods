// Utility for linking recipe ingredients to raw materials pages

export interface RawMaterial {
  id: string;
  name: string;
  description?: string;
  slug?: string;
}

// Cache for raw materials to avoid repeated API calls
let rawMaterialsCache: RawMaterial[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch raw materials from API with caching
 */
export async function getRawMaterials(): Promise<RawMaterial[]> {
  // Only run on client side
  if (typeof window === 'undefined') {
    return [];
  }
  
  const now = Date.now();
  
  // Return cached data if still valid
  if (rawMaterialsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return rawMaterialsCache;
  }
  
  try {
    const response = await fetch('/api/raw-materials');
    const data = await response.json();
    rawMaterialsCache = data.materials || [];
    cacheTimestamp = now;
    return rawMaterialsCache;
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    // Return empty array on error, but keep existing cache if available
    return rawMaterialsCache ?? [];
  }
}

/**
 * Normalize text for better matching (handles Swedish characters)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract the actual ingredient name from measurement text
 */
function extractIngredientName(ingredient: string): string {
  // Remove quantities and units at the beginning
  let cleaned = ingredient
    .replace(/^\d+(\.\d+)?\s*(st|stycken|styck|stk|msk|matsked|tsk|tesked|krm|dl|l|liter|ml|g|gram|kg|kilo|klyftor|klyfta|skivor|skiva|cm|mm|m)?\s*/i, '')
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*(hackad|hackade|strimlad|strimlade|tärnad|tärnede|riven|rivet|rivna|färsk|färska|fryst|frysta|torr|torra|kokt|kokta|stekt|stekta|rå|råa)\s*/gi, '') // Remove preparation adjectives
    .trim();
  
  return cleaned;
}

/**
 * Find matching raw material for an ingredient with improved precision
 */
export function findRawMaterial(ingredient: string, rawMaterials: RawMaterial[]): RawMaterial | null {
  const cleanIngredient = extractIngredientName(ingredient);
  const normalizedIngredient = normalizeText(cleanIngredient);
  
  // Skip very short ingredients (less than 3 characters) to avoid false matches
  if (normalizedIngredient.length < 3) {
    return null;
  }
  
  // Try exact match first (most reliable)
  let match = rawMaterials.find(material => 
    normalizeText(material.name) === normalizedIngredient
  );
  
  if (match) return match;
  
  // Try exact word match in material name
  const ingredientWords = normalizedIngredient.split(/\s+/).filter(w => w.length >= 3);
  
  for (const word of ingredientWords) {
    match = rawMaterials.find(material => {
      const materialWords = normalizeText(material.name).split(/\s+/);
      return materialWords.includes(word);
    });
    
    if (match) {
      // Additional validation: ensure the match makes sense
      const materialName = normalizeText(match.name);
      
      // Avoid false matches where ingredient is too different from material
      if (word.length >= 4 && materialName.includes(word)) {
        return match;
      }
    }
  }
  
  // Try substring match only for longer ingredients (5+ chars) to avoid false positives
  if (normalizedIngredient.length >= 5) {
    match = rawMaterials.find(material => {
      const normalizedMaterial = normalizeText(material.name);
      
      // Check if ingredient is a substantial part of material name
      if (normalizedMaterial.includes(normalizedIngredient) && 
          normalizedIngredient.length >= normalizedMaterial.length * 0.4) {
        return true;
      }
      
      // Check if material name is a substantial part of ingredient
      if (normalizedIngredient.includes(normalizedMaterial) && 
          normalizedMaterial.length >= normalizedIngredient.length * 0.4) {
        return true;
      }
      
      return false;
    });
    
    if (match) return match;
  }
  
  return null;
}

/**
 * Create a slug for raw material linking
 */
export function createRawMaterialSlug(name: string): string {
  return normalizeText(name)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate link URL for a raw material
 */
export function getRawMaterialLink(material: RawMaterial): string {
  const slug = material.slug || createRawMaterialSlug(material.name);
  return `/kunskapsbank/ingredienser#${slug}`;
} 