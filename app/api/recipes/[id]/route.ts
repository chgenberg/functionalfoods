import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateRecipeData {
  title: string;
  excerpt: string;
  categories: string[];
  difficulty: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  isFree: boolean;
  imageUrl: string;
}

// GET - Hämta specifikt recept
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: params.id
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Konvertera till API-format
    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      excerpt: recipe.excerpt || '',
      content: recipe.content || '',
      imageUrl: recipe.imageUrl || '/images/recipe-placeholder.svg',
      imageAlt: recipe.imageAlt || recipe.title,
      categories: recipe.categories,
      ingredients: recipe.ingredients,
      slug: recipe.slug,
      status: recipe.status,
      isPremium: recipe.isPremium,
      isFree: recipe.isFree,
      date: recipe.createdAt.toISOString(),
      author: {
        name: recipe.author?.name || 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      tips: recipe.tips,
      tags: recipe.tags
    };

    return NextResponse.json({ recipe: formattedRecipe });

  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Uppdatera specifikt recept
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updateData: UpdateRecipeData = await request.json();

    // Kontrollera att receptet finns
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.id }
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Uppdatera receptet
    const updatedRecipe = await prisma.recipe.update({
      where: { id: params.id },
      data: {
        title: updateData.title,
        excerpt: updateData.excerpt,
        categories: updateData.categories,
        difficulty: updateData.difficulty,
        prepTime: updateData.prepTime,
        cookTime: updateData.cookTime,
        totalTime: updateData.totalTime,
        servings: updateData.servings,
        ingredients: updateData.ingredients,
        instructions: updateData.instructions,
        tips: updateData.tips,
        tags: updateData.tags,
        status: updateData.status,
        isPremium: updateData.isPremium,
        isFree: updateData.isFree,
        imageUrl: updateData.imageUrl
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Formatera svar
    const formattedRecipe = {
      id: updatedRecipe.id,
      title: updatedRecipe.title,
      excerpt: updatedRecipe.excerpt,
      imageUrl: updatedRecipe.imageUrl || '/images/recipe-placeholder.svg',
      categories: updatedRecipe.categories,
      ingredients: updatedRecipe.ingredients,
      slug: updatedRecipe.slug,
      status: updatedRecipe.status,
      isPremium: updatedRecipe.isPremium,
      isFree: updatedRecipe.isFree,
      date: updatedRecipe.updatedAt.toISOString(),
      author: {
        name: updatedRecipe.author?.name || 'Ulrika Davidsson',
        username: 'ulrika'
      },
      difficulty: updatedRecipe.difficulty,
      prepTime: updatedRecipe.prepTime,
      cookTime: updatedRecipe.cookTime,
      totalTime: updatedRecipe.totalTime,
      servings: updatedRecipe.servings,
      instructions: updatedRecipe.instructions,
      tips: updatedRecipe.tips,
      tags: updatedRecipe.tags
    };

    return NextResponse.json({ 
      message: 'Recipe updated successfully',
      recipe: formattedRecipe
    });

  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Ta bort specifikt recept
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Kontrollera att receptet finns
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.id }
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Ta bort receptet
    await prisma.recipe.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      message: 'Recipe deleted successfully',
      deletedRecipe: existingRecipe.title
    });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 