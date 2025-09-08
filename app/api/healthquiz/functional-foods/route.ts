import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Functional Foods & Longevity criteria
const FUNCTIONAL_INGREDIENTS = [
  // Omega-3 sources
  'omega-3', 'dha', 'epa', 'linseed', 'chia', 'walnut', 'salmon', 'sardine', 'mackerel',
  
  // Antioxidants & Polyphenols
  'blueberry', 'goji', 'acai', 'pomegranate', 'turmeric', 'green tea', 'dark chocolate',
  'resveratrol', 'quercetin', 'anthocyanin', 'curcumin',
  
  // Probiotics & Prebiotics
  'probiotic', 'lactobacillus', 'bifidobacterium', 'kefir', 'kombucha', 'sauerkraut',
  'kimchi', 'miso', 'prebiotic', 'inulin', 'oligosaccharide',
  
  // Adaptogens & Nootropics
  'ashwagandha', 'rhodiola', 'ginseng', "lion's mane", 'reishi', 'cordyceps',
  'bacopa', 'ginkgo', 'mcr oil', 'phosphatidylserine',
  
  // Longevity compounds
  'collagen', 'hyaluronic acid', 'coq10', 'nad+', 'nmn', 'pterostilbene',
  'spermidine', 'fisetin', 'quercetin', 'sulforaphane',
  
  // Superfoods
  'spirulina', 'chlorella', 'moringa', 'maca', 'cacao', 'matcha',
  'hemp seed', 'quinoa', 'amaranth', 'buckwheat'
];

const EXCLUDED_CATEGORIES = [
  'sugary-snacks', 'sodas', 'alcoholic-beverages', 'candies', 'ice-cream',
  'cookies', 'cakes', 'pastries', 'chips', 'processed-meat', 'fast-food'
];

const PREFERRED_CATEGORIES = [
  'plant-based-foods', 'nuts', 'seeds', 'fruits', 'vegetables', 'legumes',
  'whole-grains', 'fermented-foods', 'organic', 'supplements', 'functional-foods'
];

interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands: string;
  categories: string;
  ingredients_text: string;
  nutriments: any;
  nutriscore_grade: string;
  nova_group: number;
  ecoscore_grade: string;
  image_url: string;
}

function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Request timeout')), ms);
    promise
      .then((value) => { clearTimeout(id); resolve(value); })
      .catch((err) => { clearTimeout(id); reject(err); });
  });
}

async function searchOpenFoodFacts(query: string, country = 'se'): Promise<OpenFoodFactsProduct[]> {
  // Limit fields for faster responses
  const base = 'https://world.openfoodfacts.org/cgi/search.pl';
  const fields = 'product_name,brands,categories,ingredients_text,nutriments,nutriscore_grade,nova_group,ecoscore_grade,image_url,code';
  const url = `${base}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=50&country=${country}&fields=${encodeURIComponent(fields)}`;
  
  const response = await withTimeout(fetch(url, {
    headers: { 'User-Agent': 'UlrikaFunctionalFoods/1.0' }
  }), 7000);
  
  if (!response.ok) {
    throw new Error(`OpenFoodFacts API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.products || [];
}

function isFunctionalFood(product: OpenFoodFactsProduct): boolean {
  const searchText = [
    product.product_name || '',
    product.ingredients_text || '',
    product.categories || '',
    product.brands || ''
  ].join(' ').toLowerCase();
  
  // Must contain at least one functional ingredient
  const hasFunctionalIngredient = FUNCTIONAL_INGREDIENTS.some(ingredient => 
    searchText.includes(ingredient.toLowerCase())
  );
  
  // Must not be in excluded categories
  const isExcluded = EXCLUDED_CATEGORIES.some(category =>
    searchText.includes(category.replace('-', ' '))
  );
  
  // Prefer good nutritional scores
  const hasGoodNutriScore = !product.nutriscore_grade || 
    ['a', 'b'].includes(product.nutriscore_grade.toLowerCase());
  
  // Prefer minimally processed (NOVA 1-2)
  const isMinimallyProcessed = !product.nova_group || product.nova_group <= 2;
  
  return hasFunctionalIngredient && !isExcluded && (hasGoodNutriScore || isMinimallyProcessed);
}

function categorizeFunctionalFood(product: OpenFoodFactsProduct): string {
  const searchText = [
    product.product_name || '',
    product.ingredients_text || '',
    product.categories || ''
  ].join(' ').toLowerCase();
  
  if (['omega-3', 'dha', 'epa', 'fish oil', 'salmon', 'sardine'].some(term => searchText.includes(term))) {
    return 'omega-3';
  }
  
  if (['probiotic', 'lactobacillus', 'bifidobacterium', 'kefir', 'kombucha'].some(term => searchText.includes(term))) {
    return 'probiotics';
  }
  
  if (['antioxidant', 'blueberry', 'goji', 'acai', 'pomegranate', 'green tea'].some(term => searchText.includes(term))) {
    return 'antioxidants';
  }
  
  if (['ashwagandha', 'rhodiola', 'ginseng', 'adaptogen'].some(term => searchText.includes(term))) {
    return 'adaptogens';
  }
  
  if (['collagen', 'hyaluronic', 'coq10', 'anti-aging'].some(term => searchText.includes(term))) {
    return 'longevity';
  }
  
  return 'superfood';
}

function extractHealthBenefits(product: OpenFoodFactsProduct): string[] {
  const searchText = [
    product.product_name || '',
    product.ingredients_text || ''
  ].join(' ').toLowerCase();
  
  const benefits: string[] = [];
  
  if (searchText.includes('omega-3') || searchText.includes('dha')) {
    benefits.push('Hjärn- och hjärthälsa');
  }
  
  if (searchText.includes('probiotic') || searchText.includes('fermented')) {
    benefits.push('Tarmhälsa och immunförsvar');
  }
  
  if (searchText.includes('antioxidant') || searchText.includes('polyphenol')) {
    benefits.push('Cellskydd och anti-inflammation');
  }
  
  if (searchText.includes('collagen') || searchText.includes('hyaluronic')) {
    benefits.push('Hud-, hår- och ledhälsa');
  }
  
  if (searchText.includes('adaptogen') || searchText.includes('ashwagandha')) {
    benefits.push('Stresshantering och energi');
  }
  
  return benefits.length > 0 ? benefits : ['Allmän hälsa och välbefinnande'];
}

const LOCAL_FALLBACK = [
  {
    id: 'omega3-fish-oil',
    name: 'Fiskolja (omega‑3, EPA/DHA)',
    brand: '',
    category: 'omega-3',
    healthBenefits: ['Hjärn- och hjärthälsa', 'Minskar inflammation'],
    nutriScore: 'A',
    novaGroup: 1,
    ecoScore: null,
    imageUrl: null,
    ingredients: '',
    nutrition: {},
    openFoodFactsUrl: 'https://world.openfoodfacts.org'
  },
  {
    id: 'probiotic-kefir',
    name: 'Kefir (probiotika)',
    brand: '',
    category: 'probiotics',
    healthBenefits: ['Tarmhälsa', 'Immunförsvar'],
    nutriScore: 'A',
    novaGroup: 1,
    ecoScore: null,
    imageUrl: null,
    ingredients: '',
    nutrition: {},
    openFoodFactsUrl: 'https://world.openfoodfacts.org'
  },
  {
    id: 'green-tea',
    name: 'Grönt te (polyfenoler)',
    brand: '',
    category: 'antioxidants',
    healthBenefits: ['Antioxidanter', 'Metabolism'],
    nutriScore: 'A',
    novaGroup: 1,
    ecoScore: null,
    imageUrl: null,
    ingredients: '',
    nutrition: {},
    openFoodFactsUrl: 'https://world.openfoodfacts.org'
  }
];

export async function POST(req: Request) {
  try {
    const { healthGoals, currentDeficiencies, preferences } = await req.json();
    
    // Map health goals to search terms
    const searchTerms: string[] = [];
    
    if (healthGoals?.includes('energy')) {
      searchTerms.push('b-vitamins', 'coq10', 'iron', 'magnesium');
    }
    
    if (healthGoals?.includes('brain_health')) {
      searchTerms.push('omega-3', 'dha', "lion's mane");
    }
    
    if (healthGoals?.includes('gut_health')) {
      searchTerms.push('probiotic', 'prebiotic', 'fermented');
    }
    
    if (healthGoals?.includes('anti_aging')) {
      searchTerms.push('collagen', 'antioxidant', 'resveratrol');
    }
    
    if (healthGoals?.includes('immune')) {
      searchTerms.push('vitamin-c', 'zinc', 'elderberry', 'probiotic');
    }
    
    // Add deficiency-specific terms
    if (currentDeficiencies?.includes('vitamin_d')) {
      searchTerms.push('vitamin-d3', 'cholecalciferol');
    }
    
    if (currentDeficiencies?.includes('omega_3')) {
      searchTerms.push('omega-3', 'fish-oil', 'algae-oil');
    }
    
    // Default search if no specific goals
    if (searchTerms.length === 0) {
      searchTerms.push('organic', 'superfood', 'functional-food');
    }
    
    const allProducts: OpenFoodFactsProduct[] = [];
    
    // Search for each term
    for (const term of searchTerms.slice(0, 3)) { // Keep tight to avoid timeouts
      try {
        const products = await searchOpenFoodFacts(term);
        allProducts.push(...products);
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 120));
      } catch (error) {
        console.warn(`Search failed for term: ${term}`, error);
      }
    }
    
    // Filter and process products
    const functionalProducts = allProducts
      .filter(isFunctionalFood)
      .map(product => ({
        id: product.code,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        category: categorizeFunctionalFood(product),
        healthBenefits: extractHealthBenefits(product),
        nutriScore: product.nutriscore_grade?.toUpperCase() || null,
        novaGroup: product.nova_group || null,
        ecoScore: product.ecoscore_grade?.toUpperCase() || null,
        imageUrl: product.image_url || null,
        ingredients: product.ingredients_text || '',
        nutrition: product.nutriments || {},
        openFoodFactsUrl: `https://world.openfoodfacts.org/product/${product.code}`
      }))
      .filter((product, index, self) => 
        // Remove duplicates by name
        self.findIndex(p => p.name.toLowerCase() === product.name.toLowerCase()) === index
      )
      .sort((a, b) => {
        // Sort by quality: NutriScore A/B first, then by NOVA group
        const scoreA = (a.nutriScore === 'A' ? 4 : a.nutriScore === 'B' ? 3 : 1) + (5 - (a.novaGroup || 3));
        const scoreB = (b.nutriScore === 'A' ? 4 : b.nutriScore === 'B' ? 3 : 1) + (5 - (b.novaGroup || 3));
        return scoreB - scoreA;
      })
      .slice(0, 20); // Top 20 recommendations
    
    return new NextResponse(JSON.stringify({
      recommendations: functionalProducts.length > 0 ? functionalProducts : LOCAL_FALLBACK,
      searchTerms,
      totalFound: allProducts.length,
      functionalFound: functionalProducts.length,
      timestamp: new Date().toISOString()
    }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    
  } catch (error) {
    console.error('Functional foods API error:', error);
    // Graceful fallback instead of 500 to avoid spinner lock
    return new NextResponse(JSON.stringify({ recommendations: LOCAL_FALLBACK, message: 'Using local fallback due to API error.' }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
} 