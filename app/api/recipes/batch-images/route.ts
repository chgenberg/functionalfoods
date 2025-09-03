import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { recipeNames } = await request.json();
    
    if (!Array.isArray(recipeNames)) {
      return NextResponse.json({ error: 'Recipe names must be an array' }, { status: 400 });
    }

    // Clean recipe names and create search patterns
    const cleanedNames = recipeNames.map(name => 
      name.replace(/\s*(rester|från frysen)\s*/gi, '').trim()
    );

    // Fetch recipes by name (case insensitive)
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: cleanedNames.map(name => ({
          title: {
            contains: name,
            mode: 'insensitive'
          }
        }))
      },
      select: {
        title: true,
        imageUrl: true,
        slug: true
      }
    });

    // Create a map of recipe names to images
    const imageMap: Record<string, string> = {};
    
    for (const recipeName of recipeNames) {
      const cleanName = recipeName.replace(/\s*(rester|från frysen)\s*/gi, '').trim();
      
      // Find the best match
      const match = recipes.find((recipe: any) => 
        recipe.title.toLowerCase().includes(cleanName.toLowerCase()) ||
        cleanName.toLowerCase().includes(recipe.title.toLowerCase())
      );
      
      if (match && match.imageUrl) {
        imageMap[recipeName] = match.imageUrl;
      } else {
        // Try to find a partial match
        const partialMatch = recipes.find((recipe: any) => {
          const recipeWords = recipe.title.toLowerCase().split(/\s+/);
          const searchWords = cleanName.toLowerCase().split(/\s+/);
          
          // Check if at least 2 words match
          const matchingWords = searchWords.filter((word: string) => 
            recipeWords.some((recipeWord: string) => recipeWord.includes(word) || word.includes(recipeWord))
          );
          
          return matchingWords.length >= 2;
        });
        
        if (partialMatch && partialMatch.imageUrl) {
          imageMap[recipeName] = partialMatch.imageUrl;
        } else {
          imageMap[recipeName] = '/images/recipe-placeholder.svg';
        }
      }
    }

    return NextResponse.json({ images: imageMap });
  } catch (error) {
    console.error('Error fetching recipe images:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe images' }, { status: 500 });
  }
} 