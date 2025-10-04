import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

// Hämta alla recept för en kurs
export async function GET(
  req: NextRequest,
  { params }: { params: { courseSlug: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { courseSlug } = params;

    // Hämta recept som är taggade med denna kurs
    const recipes = await prisma.recipe.findMany({
      where: {
        tags: {
          has: courseSlug
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        excerpt: true,
        categories: true,
        tags: true,
        status: true,
        isPremium: true,
        isFree: true,
        servings: true,
        prepTime: true,
        cookTime: true,
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json({ recipes, count: recipes.length });
  } catch (error) {
    console.error('Error fetching course recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// Lägg till recept till kurs (tagga recept)
export async function POST(
  req: NextRequest,
  { params }: { params: { courseSlug: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { courseSlug } = params;
    const { recipeIds } = await req.json();

    if (!Array.isArray(recipeIds)) {
      return NextResponse.json(
        { error: 'recipeIds must be an array' },
        { status: 400 }
      );
    }

    // Uppdatera alla recept och lägg till kurs-taggen
    const updatePromises = recipeIds.map(async (recipeId: string) => {
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        select: { tags: true }
      });

      if (!recipe) return null;

      const currentTags = Array.isArray(recipe.tags) ? recipe.tags : [];
      
      // Lägg till kurs-slug om den inte redan finns
      if (!currentTags.includes(courseSlug)) {
        return prisma.recipe.update({
          where: { id: recipeId },
          data: {
            tags: [...currentTags, courseSlug]
          }
        });
      }
      
      return recipe;
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      success: true, 
      message: `${recipeIds.length} recept taggade med ${courseSlug}` 
    });
  } catch (error) {
    console.error('Error adding recipes to course:', error);
    return NextResponse.json(
      { error: 'Failed to add recipes' },
      { status: 500 }
    );
  }
}

// Ta bort recept från kurs (ta bort tagg)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseSlug: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { courseSlug } = params;
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get('recipeId');

    if (!recipeId) {
      return NextResponse.json(
        { error: 'recipeId is required' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { tags: true }
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    const currentTags = Array.isArray(recipe.tags) ? recipe.tags : [];
    const newTags = currentTags.filter(tag => tag !== courseSlug);

    await prisma.recipe.update({
      where: { id: recipeId },
      data: { tags: newTags }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Recept borttaget från ${courseSlug}` 
    });
  } catch (error) {
    console.error('Error removing recipe from course:', error);
    return NextResponse.json(
      { error: 'Failed to remove recipe' },
      { status: 500 }
    );
  }
}
