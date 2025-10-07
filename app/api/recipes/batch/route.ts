import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
        description: true,
        ingredients: true,
        instructions: true,
        cookingTime: true,
        servings: true,
        difficulty: true,
        category: true,
        tags: true,
        isPremium: true,
        nutritionPerServing: true,
        image: true
      }
    });

    // Check access for premium recipes if user is logged in
    let userCourseIds: string[] = [];
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          purchases: {
            include: {
              course: true
            }
          }
        }
      });

      if (user) {
        userCourseIds = user.purchases.map(p => p.courseId);
      }
    }

    // Filter out premium recipes the user doesn't have access to
    const accessibleRecipes = recipes.filter(recipe => {
      if (!recipe.isPremium) return true;
      if (!session) return false;
      
      // Map course names to tags
      const userCourseTags = userCourseIds.map(courseId => {
        if (courseId.includes('basics')) return 'Basic';
        if (courseId.includes('flow')) return 'Flow';
        if (courseId.includes('energy')) return 'Energy';
        return '';
      }).filter(Boolean);

      // Check if recipe tags overlap with user's course tags
      const recipeTags = recipe.tags || [];
      return recipeTags.some(tag => userCourseTags.includes(tag));
    });

    return NextResponse.json(accessibleRecipes);
  } catch (error) {
    console.error('Error fetching batch recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
