import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

function extractSlug(link?: string): string {
  if (!link) return '';
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/');
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const course = 'flow';
    const weeks = await prisma.mealPlanWeek.findMany({
      where: { course },
      select: { days: true }
    });

    const slugsToTag = new Set<string>();
    for (const w of weeks) {
      const days = (w as any).days || {};
      for (const day of Object.values(days) as any[]) {
        if (!day) continue;
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack', 'snack1', 'snack2', 'dessert', 'evening']) {
          const meal = day[mealType];
          if (meal?.recipeLink) {
            const slug = extractSlug(meal.recipeLink);
            if (slug) slugsToTag.add(slug);
          }
        }
      }
    }

    const recipes = await prisma.recipe.findMany({
      where: { slug: { in: Array.from(slugsToTag) } }
    });

    let taggedCount = 0;
    for (const recipe of recipes) {
      if (!recipe.tags.includes('functional-flow')) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { tags: { push: 'functional-flow' } }
        });
        taggedCount++;
      }
    }

    return NextResponse.json({ ok: true, tagged: taggedCount, totalFound: recipes.length });
  } catch (error) {
    console.error('Admin flow tag recipes error:', error);
    return NextResponse.json({ error: 'Failed to tag flow recipes' }, { status: 500 });
  }
}

