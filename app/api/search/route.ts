import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Interface for recipe data
interface Recipe {
  ID: string;
  Title: string;
  Content: string;
  Excerpt: string;
  Date: string;
  'Image URL': string;
  'Image Alt Text': string;
  Ingredienser: string;
  Kategorier: string;
  Status: 'publish' | 'draft';
  'Author First Name': string;
  'Author Last Name': string;
  Slug: string;
}

// Search result interface
interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'recipe' | 'ingredient' | 'category' | 'article';
  href: string;
  imageUrl?: string;
  isPremium?: boolean;
  author?: string;
  relevanceScore: number;
}

// Read and parse CSV file
function getRecipesFromCSV(): Recipe[] {
  try {
    const csvPath = path.join(process.cwd(), 'Recept', 'Recept_Functional.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    return records as Recipe[];
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
}

// Check if user has access to premium recipes
async function checkUserAccess(userId: string): Promise<boolean> {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId }
    });
    return purchases.length > 0;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

// Calculate relevance score based on search matches
function calculateRelevanceScore(searchTerm: string, title: string, content: string, ingredients: string[], categories: string[]): number {
  const lowerSearchTerm = searchTerm.toLowerCase();
  let score = 0;

  // Title match (highest priority)
  if (title.toLowerCase().includes(lowerSearchTerm)) {
    score += 100;
    if (title.toLowerCase().startsWith(lowerSearchTerm)) {
      score += 50; // Bonus for starts with
    }
  }

  // Exact ingredient match
  const exactIngredientMatch = ingredients.some(ing => 
    ing.toLowerCase().includes(lowerSearchTerm)
  );
  if (exactIngredientMatch) {
    score += 80;
  }

  // Category match
  const categoryMatch = categories.some(cat => 
    cat.toLowerCase().includes(lowerSearchTerm)
  );
  if (categoryMatch) {
    score += 60;
  }

  // Content match
  if (content.toLowerCase().includes(lowerSearchTerm)) {
    score += 40;
  }

  // Partial matches in ingredients
  const partialIngredientMatches = ingredients.filter(ing => 
    ing.toLowerCase().includes(lowerSearchTerm)
  ).length;
  score += partialIngredientMatches * 20;

  return score;
}

// Search through recipes
function searchRecipes(searchTerm: string, hasAccess: boolean): SearchResult[] {
  const allRecipes = getRecipesFromCSV();
  const results: SearchResult[] = [];

  allRecipes.forEach(recipe => {
    // Check if user can access this recipe
    const isPremium = recipe.Status === 'draft';
    if (isPremium && !hasAccess) {
      // Still show premium recipes in search but mark them as premium
    }

    // Parse ingredients and categories
    const ingredients = recipe.Ingredienser ? 
      recipe.Ingredienser.split(/[,;|\n]/).map(ing => ing.trim()).filter(ing => ing.length > 0) : [];
    const categories = recipe.Kategorier ? 
      recipe.Kategorier.split('|').filter(Boolean) : [];

    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore(
      searchTerm, 
      recipe.Title, 
      recipe.Content, 
      ingredients, 
      categories
    );

    // Only include if there's some relevance
    if (relevanceScore > 0) {
      results.push({
        id: recipe.ID,
        title: recipe.Title,
        excerpt: recipe.Excerpt || recipe.Content.substring(0, 150) + '...',
        type: 'recipe',
        href: `/kunskapsbank/recept/${recipe.Slug}`,
        imageUrl: recipe['Image URL'],
        isPremium,
        author: `${recipe['Author First Name']} ${recipe['Author Last Name']}`.trim(),
        relevanceScore
      });
    }
  });

  return results;
}

// Search for ingredients
function searchIngredients(searchTerm: string): SearchResult[] {
  const allRecipes = getRecipesFromCSV();
  const ingredientMatches = new Map<string, { count: number, recipes: string[] }>();

  allRecipes.forEach(recipe => {
    if (recipe.Ingredienser) {
      const ingredients = recipe.Ingredienser.split(/[,;|\n]/).map(ing => ing.trim()).filter(ing => ing.length > 0);
      
      ingredients.forEach(ingredient => {
        if (ingredient.toLowerCase().includes(searchTerm.toLowerCase())) {
          const key = ingredient.toLowerCase();
          if (!ingredientMatches.has(key)) {
            ingredientMatches.set(key, { count: 0, recipes: [] });
          }
          const existing = ingredientMatches.get(key)!;
          existing.count++;
          existing.recipes.push(recipe.Title);
        }
      });
    }
  });

  const results: SearchResult[] = [];
  ingredientMatches.forEach((data, ingredient) => {
    results.push({
      id: `ingredient-${ingredient}`,
      title: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
      excerpt: `Finns i ${data.count} recept: ${data.recipes.slice(0, 3).join(', ')}${data.recipes.length > 3 ? '...' : ''}`,
      type: 'ingredient',
      href: `/kunskapsbank/recept?search=${encodeURIComponent(ingredient)}`,
      relevanceScore: data.count * 10
    });
  });

  return results;
}

// Search for categories
function searchCategories(searchTerm: string): SearchResult[] {
  const allRecipes = getRecipesFromCSV();
  const categoryMatches = new Map<string, { count: number, recipes: string[] }>();

  allRecipes.forEach(recipe => {
    if (recipe.Kategorier) {
      const categories = recipe.Kategorier.split('|').filter(Boolean);
      
      categories.forEach(category => {
        if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
          const key = category.toLowerCase();
          if (!categoryMatches.has(key)) {
            categoryMatches.set(key, { count: 0, recipes: [] });
          }
          const existing = categoryMatches.get(key)!;
          existing.count++;
          existing.recipes.push(recipe.Title);
        }
      });
    }
  });

  const results: SearchResult[] = [];
  categoryMatches.forEach((data, category) => {
    results.push({
      id: `category-${category}`,
      title: category,
      excerpt: `${data.count} recept i denna kategori`,
      type: 'category',
      href: `/kunskapsbank/recept?category=${encodeURIComponent(category)}`,
      relevanceScore: data.count * 5
    });
  });

  return results;
}

// Add static content results
function getStaticContentResults(searchTerm: string): SearchResult[] {
  const staticContent = [
    {
      id: 'functional-foods-guide',
      title: 'Vad är Functional Foods?',
      excerpt: 'En omfattande guide till funktionella livsmedel och deras hälsofördelar',
      type: 'article' as const,
      href: '/kunskapsbank/blogg/functional-foods',
      keywords: ['functional foods', 'funktionella livsmedel', 'hälsa', 'näring']
    },
    {
      id: 'longevity-guide', 
      title: 'Longevity och Anti-aging',
      excerpt: 'Upptäck hur rätt kost kan förlänga ditt liv och förbättra din hälsa',
      type: 'article' as const,
      href: '/kunskapsbank/blogg/longevity',
      keywords: ['longevity', 'anti-aging', 'åldras', 'livslängd', 'hälsa']
    },
    {
      id: 'omega-3-guide',
      title: 'Omega-3 fettsyror',
      excerpt: 'Allt du behöver veta om omega-3 och dess hälsofördelar',
      type: 'article' as const,
      href: '/kunskapsbank/blogg',
      keywords: ['omega-3', 'fettsyror', 'fisk', 'hälsa', 'inflammation']
    }
  ];

  const lowerSearchTerm = searchTerm.toLowerCase();
  return staticContent.filter(content => {
    return content.title.toLowerCase().includes(lowerSearchTerm) ||
           content.excerpt.toLowerCase().includes(lowerSearchTerm) ||
           content.keywords.some(keyword => keyword.includes(lowerSearchTerm));
  }).map(content => ({
    ...content,
    relevanceScore: content.title.toLowerCase().includes(lowerSearchTerm) ? 70 : 30
  }));
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q');
    const type = request.nextUrl.searchParams.get('type') || 'all';
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Sökterm måste vara minst 2 tecken'
      });
    }

    // Get user access
    let hasAccess = false;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        hasAccess = decoded.userId ? await checkUserAccess(decoded.userId) : false;
      } catch (error) {
        // Token invalid, continue as guest
      }
    }

    let allResults: SearchResult[] = [];

    // Search based on type
    if (type === 'all' || type === 'recipe') {
      const recipeResults = searchRecipes(query, hasAccess);
      allResults.push(...recipeResults);
    }

    if (type === 'all' || type === 'ingredient') {
      const ingredientResults = searchIngredients(query);
      allResults.push(...ingredientResults);
    }

    if (type === 'all' || type === 'category') {
      const categoryResults = searchCategories(query);
      allResults.push(...categoryResults);
    }

    if (type === 'all' || type === 'article') {
      const staticResults = getStaticContentResults(query);
      allResults.push(...staticResults);
    }

    // Sort by relevance score
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit results
    const limitedResults = allResults.slice(0, 20);

    return NextResponse.json({
      results: limitedResults,
      total: allResults.length,
      query,
      type,
      hasAccess
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 