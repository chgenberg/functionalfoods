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
  'Post Type': string;
  Permalink: string;
  'Image URL': string;
  'Image Title': string;
  'Image Caption': string;
  'Image Description': string;
  'Image Alt Text': string;
  'Image Featured': string;
  'Attachment URL': string;
  Ingredienser: string;
  Kategorier: string;
  'Extra kategorier': string;
  Status: 'publish' | 'draft';
  'Author ID': string;
  'Author Username': string;
  'Author Email': string;
  'Author First Name': string;
  'Author Last Name': string;
  Slug: string;
  Format: string;
  Template: string;
  Parent: string;
  'Parent Slug': string;
  Order: string;
  'Comment Status': string;
  'Ping Status': string;
  'Post Modified Date': string;
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
    // Check if user has purchased any course
    const purchases = await prisma.purchase.findMany({
      where: { userId }
    });
    
    return purchases.length > 0;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');
    const search = request.nextUrl.searchParams.get('search');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    
    // Get user from JWT token (optional)
    let userId: string | null = null;
    let hasAccess = false;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
        hasAccess = userId ? await checkUserAccess(userId) : false;
      } catch (error) {
        // Token invalid, continue as guest
      }
    }
    
    // Read all recipes from CSV
    const allRecipes = getRecipesFromCSV();
    
    // Don't filter by access - show all recipes
    // We'll handle access control in the frontend
    let filteredRecipes = allRecipes;
    
    // Apply category filter
    if (category && category !== 'all') {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const categories = recipe.Kategorier?.toLowerCase() || '';
        return categories.includes(category.toLowerCase());
      });
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe => {
        return recipe.Title?.toLowerCase().includes(searchLower) ||
               recipe.Content?.toLowerCase().includes(searchLower) ||
               recipe.Excerpt?.toLowerCase().includes(searchLower) ||
               recipe.Ingredienser?.toLowerCase().includes(searchLower);
      });
    }
    
    // Sort by date (newest first)
    filteredRecipes.sort((a, b) => {
      const dateA = new Date(a.Date || a['Post Modified Date'] || '1970-01-01');
      const dateB = new Date(b.Date || b['Post Modified Date'] || '1970-01-01');
      return dateB.getTime() - dateA.getTime();
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);
    
    // Transform data for frontend
    const transformedRecipes = paginatedRecipes.map(recipe => {
      // Parse ingredients if available
      let ingredients: string[] = [];
      if (recipe.Ingredienser) {
        // Split by common delimiters and clean up
        ingredients = recipe.Ingredienser
          .split(/[,;|\n]/)
          .map(ing => ing.trim())
          .filter(ing => ing.length > 0);
      }

      return {
        id: recipe.ID,
        title: recipe.Title,
        excerpt: recipe.Excerpt || recipe.Content?.substring(0, 150) + '...',
        imageUrl: recipe['Image URL'],
        imageAlt: recipe['Image Alt Text'] || recipe['Image Title'],
        categories: recipe.Kategorier?.split('|').filter(Boolean) || [],
        ingredients,
        slug: recipe.Slug,
        status: recipe.Status,
        isPremium: recipe.Status === 'draft',
        date: recipe.Date || recipe['Post Modified Date'],
        author: {
          name: `${recipe['Author First Name']} ${recipe['Author Last Name']}`.trim(),
          username: recipe['Author Username']
        },
        permalink: recipe.Permalink
      };
    });
    
    // Get unique categories for filtering
    const allCategories = allRecipes.reduce((categories, recipe) => {
      const recipeCategories = recipe.Kategorier?.split('|').filter(Boolean) || [];
      recipeCategories.forEach(cat => {
        if (cat && !categories.includes(cat)) {
          categories.push(cat);
        }
      });
      return categories;
    }, [] as string[]);
    
    // Calculate statistics
    const totalRecipes = allRecipes.length;
    const freeRecipes = allRecipes.filter(r => r.Status === 'publish').length;
    const premiumRecipes = allRecipes.filter(r => r.Status === 'draft').length;
    
    return NextResponse.json({
      recipes: transformedRecipes,
      pagination: {
        page,
        limit,
        total: filteredRecipes.length,
        totalPages: Math.ceil(filteredRecipes.length / limit),
        hasMore: endIndex < filteredRecipes.length
      },
      categories: allCategories.sort(),
      userAccess: {
        hasAccess,
        userId: userId || null
      },
      statistics: {
        total: totalRecipes,
        free: freeRecipes,
        premium: premiumRecipes,
        visible: filteredRecipes.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
} 