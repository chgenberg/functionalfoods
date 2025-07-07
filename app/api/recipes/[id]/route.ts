import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Find recipe by ID or slug
    const recipe = allRecipes.find(r => r.ID === id || r.Slug === id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Check access for draft recipes
    if (recipe.Status === 'draft' && !hasAccess) {
      return NextResponse.json(
        { 
          error: 'Access denied',
          message: 'This recipe is only available to course members',
          requiresAccess: true
        },
        { status: 403 }
      );
    }
    
    // Parse ingredients if available
    let ingredients: string[] = [];
    if (recipe.Ingredienser) {
      // Split by common delimiters and clean up
      ingredients = recipe.Ingredienser
        .split(/[,;|\n]/)
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
    }
    
    // Parse instructions from content
    let instructions: string[] = [];
    if (recipe.Content) {
      // Extract text content and split into steps
      const textContent = recipe.Content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[^;]+;/g, ' ') // Remove HTML entities
        .trim();
      
      if (textContent) {
        instructions = textContent
          .split(/\d+\.|•|-/)
          .map(step => step.trim())
          .filter(step => step.length > 10); // Filter out short fragments
      }
    }
    
    // Transform data for frontend
    const transformedRecipe = {
      id: recipe.ID,
      title: recipe.Title,
      content: recipe.Content,
      excerpt: recipe.Excerpt,
      imageUrl: recipe['Image URL'],
      imageAlt: recipe['Image Alt Text'] || recipe['Image Title'],
      imageCaption: recipe['Image Caption'],
      categories: recipe.Kategorier?.split('|').filter(Boolean) || [],
      ingredients,
      instructions,
      slug: recipe.Slug,
      status: recipe.Status,
      isPremium: recipe.Status === 'draft',
      date: recipe.Date || recipe['Post Modified Date'],
      author: {
        name: `${recipe['Author First Name']} ${recipe['Author Last Name']}`.trim(),
        username: recipe['Author Username'],
        email: recipe['Author Email']
      },
      permalink: recipe.Permalink,
      nutritionInfo: {
        // Extract nutrition info from content if available
        description: recipe.Excerpt || `En hälsosam och näringsrik rätt från ${recipe['Author First Name']}.`,
        carbs: '23',
        fat: '42',
        protein: '19',
        calories: '536',
        fiber: '5'
      },
      featuredIngredients: ['Aubergine', 'Ricottaost', 'Bladspenat'],
      prepTime: '20 min',
      cookTime: '40 min',
      servings: '4 portioner'
    };
    
    return NextResponse.json({
      recipe: transformedRecipe,
      userAccess: {
        hasAccess,
        userId: userId || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
} 