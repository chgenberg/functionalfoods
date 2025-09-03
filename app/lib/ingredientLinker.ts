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
    return [];
  }
}

/**
 * Normalize text for better matching (handles Swedish characters)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract ingredient name from full ingredient text
 * Examples: "2 dl mjölk" -> "mjölk", "400 g kycklingfilé" -> "kycklingfilé"
 */
function extractIngredientName(ingredient: string): string {
  // Remove quantities and units at the beginning
  let cleaned = ingredient
    .replace(/^(\d+(?:[.,]\d+)?|½|¼|¾|1\/2|1\/4|3\/4)\s*(dl|ml|l|g|kg|msk|tsk|st|krm)\s+/i, '')
    .replace(/^\d+\s*[-–]\s*\d+\s*(dl|ml|l|g|kg|msk|tsk|st|krm)\s+/i, '')
    .replace(/^ca\.?\s*\d+\s*(dl|ml|l|g|kg|msk|tsk|st|krm)\s+/i, '');
  
  // Remove parenthetical information
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  
  // Remove common descriptive words
  cleaned = cleaned
    .replace(/\b(färsk|fryst|hackad|skivad|tärnad|riven|finhackad|grovhackad|kokt|stekt|rå)\b/gi, '')
    .replace(/\b(stor|liten|medium|extra|fin|grov)\b/gi, '')
    .trim();
  
  return cleaned;
}

/**
 * Find matching raw material for an ingredient
 */
export function findRawMaterial(ingredient: string, rawMaterials: RawMaterial[]): RawMaterial | null {
  const cleanIngredient = extractIngredientName(ingredient);
  const normalizedIngredient = normalizeText(cleanIngredient);
  
  // Try exact match first
  let match = rawMaterials.find(material => 
    normalizeText(material.name) === normalizedIngredient
  );
  
  if (match) return match;
  
  // Try partial match
  match = rawMaterials.find(material => {
    const normalizedMaterial = normalizeText(material.name);
    return normalizedMaterial.includes(normalizedIngredient) || 
           normalizedIngredient.includes(normalizedMaterial);
  });
  
  if (match) return match;
  
  // Try word-based matching
  const ingredientWords = normalizedIngredient.split(/\s+/).filter(w => w.length > 2);
  match = rawMaterials.find(material => {
    const materialWords = normalizeText(material.name).split(/\s+/);
    const matchingWords = ingredientWords.filter(word => 
      materialWords.some(matWord => matWord.includes(word) || word.includes(matWord))
    );
    return matchingWords.length >= Math.min(2, ingredientWords.length);
  });
  
  return match || null;
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