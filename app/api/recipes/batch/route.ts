import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { verify } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header (same pattern as app/api/recipes/route.ts)
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verify(token, process.env.JWT_SECRET! ) as any;
        if (decoded.userId) {
          userId = decoded.userId;
        }
      } catch {
        // invalid token → proceed as guest
      }
    }
    
    const { slugs } = await req.json();

    if (!slugs || !Array.isArray(slugs)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch all recipes in one query
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: slugs.map(slug => ({ slug }))
      },
      select: {
        id: true,
        title: true,
        slug: true,
        ingredients: true,
        instructions: true,
        prepTime: true,
        cookTime: true,
        totalTime: true,
        servings: true,
        difficulty: true,
        categories: true,
        tags: true,
        isPremium: true,
        nutrition: true,
        imageUrl: true
      }
    });

    // Determine user course names if logged in (align with /api/recipes logic)
    let userCourseNames: string[] = [];
    if (userId) {
      const purchases = await prisma.purchase.findMany({
        where: { userId, status: 'completed' },
        include: { course: true }
      });
      userCourseNames = purchases.map(p => p.course?.name || '').filter(Boolean) as string[];
    }

    // Map course names to tag labels used on recipes
    const userCourseTags = userCourseNames.map((name) => {
      const n = name.toLowerCase();
      if (n.includes('basic')) return 'Basic';
      if (n.includes('flow') || n.includes('gut')) return 'Flow';
      if (n.includes('energy') || n.includes('insulin')) return 'Energy';
      return '';
    }).filter(Boolean);

    // Filter out premium recipes the user doesn't have access to
    const accessibleRecipes = recipes.filter((recipe: any) => {
      if (!recipe.isPremium) return true; // always allow free/non-premium
      if (!userId) return false; // guest cannot access premium
      const recipeTags: string[] = recipe.tags || [];
      return recipeTags.some(tag => userCourseTags.includes(tag));
    });

    // Normalize shape for frontend (instructions to array, nutrition to perServing if applicable)
    const normalized = accessibleRecipes.map((r: any) => {
      let instructionsArray: string[] = [];
      if (Array.isArray(r.instructions)) {
        instructionsArray = r.instructions.filter(Boolean);
      } else if (typeof r.instructions === 'string') {
        instructionsArray = r.instructions
          .split(/\r?\n+/)
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      return {
        title: r.title,
        slug: r.slug,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
        instructions: instructionsArray,
        cookingTime: r.totalTime || r.cookTime || r.prepTime || null,
        servings: r.servings || 4,
        nutritionPerServing: r.nutrition || null,
        tags: r.tags || [],
        isPremium: r.isPremium === true,
        imageUrl: r.imageUrl || null
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching batch recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
