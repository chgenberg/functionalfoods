import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface Recipe {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'publish' | 'draft';
  isPremium: boolean;
  date: string;
  author: {
    name: string;
    username: string;
    email: string;
  };
}

// Shuffle array function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  try {
    const currentSlug = request.nextUrl.searchParams.get('current');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '3');
    const categories = request.nextUrl.searchParams.get('categories')?.split(',') || [];

    // Read CSV file
    const csvFilePath = path.join(process.cwd(), 'Recept', 'Recept_Functional.csv');
    const csvContent = await fs.readFile(csvFilePath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ','
    });

    // Process recipes
    const recipes: Recipe[] = records.map((record: any) => {
      const parseIngredients = (ingredientString: string): string[] => {
        if (!ingredientString) return [];
        return ingredientString
          .split(/[,;|\n]/)
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient.length > 0);
      };

      const parseCategories = (categoryString: string): string[] => {
        if (!categoryString) return [];
        return categoryString
          .split('|')
          .map(cat => cat.trim())
          .filter(cat => cat.length > 0);
      };

      const createSlug = (title: string): string => {
        return title
          .toLowerCase()
          .replace(/[åäà]/g, 'a')
          .replace(/[öø]/g, 'o')
          .replace(/[ü]/g, 'u')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      };

      const isPremium = record.Status === 'draft';

      return {
        id: record.ID?.toString() || '',
        title: record.Title || '',
        excerpt: record.Excerpt || '',
        imageUrl: record['Image URL'] || '',
        imageAlt: record['Image Alt Text'] || '',
        categories: parseCategories(record.Kategorier || ''),
        ingredients: parseIngredients(record.Ingredienser || ''),
        slug: createSlug(record.Title || ''),
        status: record.Status === 'publish' ? 'publish' : 'draft',
        isPremium,
        date: record.Date || '',
        author: {
          name: record['First Name'] && record['Last Name'] 
            ? `${record['First Name']} ${record['Last Name']}` 
            : record.Username || 'Functional Foods',
          username: record.Username || '',
          email: record.Email || ''
        }
      };
    });

    // Filter out current recipe and only include free recipes (status: 'publish')
    let filteredRecipes = recipes.filter(recipe => 
      recipe.slug !== currentSlug && recipe.status === 'publish' && !recipe.isPremium
    );

    // If categories are provided, try to find recipes with similar categories first
    if (categories.length > 0) {
      const similarRecipes = filteredRecipes.filter(recipe => 
        recipe.categories.some(cat => categories.includes(cat))
      );
      
      if (similarRecipes.length >= limit) {
        filteredRecipes = similarRecipes;
      }
    }

    // Randomize the recipes
    const shuffledRecipes = shuffleArray(filteredRecipes);

    // Return the requested number of recipes
    const relatedRecipes = shuffledRecipes.slice(0, limit);

    return NextResponse.json({
      recipes: relatedRecipes,
      total: relatedRecipes.length
    });

  } catch (error) {
    console.error('Error fetching related recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related recipes' },
      { status: 500 }
    );
  }
} 