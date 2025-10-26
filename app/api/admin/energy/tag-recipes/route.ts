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
    const course = 'energy';
    const weeks = await prisma.mealPlanWeek.findMany({
      where: { course },
      select: { days: true }
    });

    const slugsToTag = new Set<string>();
    for (const w of weeks) {
      const days = (w as any).days || {};
      // Handle both Swedish (Måndag, Tisdag) and English (monday, tuesday) keys
      const allDays = Object.values(days) as any[];
      
      for (const day of allDays) {
        if (!day || typeof day !== 'object') continue;
        
        // Iterate through all properties of the day object
        for (const [key, value] of Object.entries(day)) {
          const meal = value as any;
          if (meal && typeof meal === 'object' && meal.recipeLink) {
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
      if (!recipe.tags.includes('functional-energy')) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { tags: { push: 'functional-energy' } }
        });
        taggedCount++;
      }
    }

    return NextResponse.json({ ok: true, tagged: taggedCount, totalFound: recipes.length });
  } catch (error) {
    console.error('Admin energy tag recipes error:', error);
    return NextResponse.json({ error: 'Failed to tag energy recipes' }, { status: 500 });
  }
}

