import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractSlug(link?: string): string {
  if (!link) return '';
  try {
    const parts = link.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const course = 'hormone';
    const weeks = await prisma.mealPlanWeek.findMany({
      where: { course },
      orderBy: { weekNumber: 'asc' }
    });

    const slugs = new Set<string>();
    for (const w of weeks) {
      const days = (w as any).days || {};
      for (const day of Object.values(days) as any[]) {
        if (!day) continue;
        for (const key of ['breakfast','lunch','dinner','snack','dessert']) {
          const meal = day[key];
          if (meal?.recipeLink) {
            const slug = extractSlug(meal.recipeLink);
            if (slug) slugs.add(slug);
          }
        }
      }
    }

    const recipes = await prisma.recipe.findMany({
      where: { slug: { in: Array.from(slugs) } },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        categories: true,
        ingredients: true,
        instructions: true,
        isPremium: true,
        isFree: true
      }
    });

    return NextResponse.json({ ok: true, count: recipes.length, recipes });
  } catch (error) {
    console.error('Admin hormone recipes list error:', error);
    return NextResponse.json({ error: 'Failed to list hormone recipes' }, { status: 500 });
  }
}


