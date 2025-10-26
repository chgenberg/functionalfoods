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
    // If not a full URL, just extract the last part
    if (link) {
      const parts = link.split('/');
      return parts[parts.length - 1] || '';
    }
    return '';
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const course = 'basic';
    const weeks = await prisma.mealPlanWeek.findMany({
      where: { course },
      select: { days: true, weekNumber: true }
    });

    console.log(`Found ${weeks.length} weeks for ${course}`);

    const slugsToTag = new Set<string>();
    for (const w of weeks) {
      const days = (w as any).days || {};
      const allDays = Object.values(days) as any[];
      
      for (const day of allDays) {
        if (!day || typeof day !== 'object') continue;
        
        for (const [key, value] of Object.entries(day)) {
          const meal = value as any;
          if (meal && typeof meal === 'object' && meal.recipeLink) {
            const slug = extractSlug(meal.recipeLink);
            if (slug) {
              slugsToTag.add(slug);
              console.log(`Week ${w.weekNumber}: Found slug: ${slug} from ${meal.recipeLink}`);
            }
          }
        }
      }
    }

    console.log(`Total unique slugs extracted: ${slugsToTag.size}`);
    console.log('Slugs:', Array.from(slugsToTag).slice(0, 20));

    const slugArray = Array.from(slugsToTag);
    const recipes = await prisma.recipe.findMany({
      where: { slug: { in: slugArray } },
      select: { id: true, slug: true, tags: true }
    });

    console.log(`Found ${recipes.length} recipes in database`);

    return NextResponse.json({ 
      ok: true, 
      weeksFound: weeks.length,
      slugsExtracted: slugArray,
      slugsCount: slugArray.length,
      recipesFound: recipes.length,
      recipeDetails: recipes.slice(0, 10).map(r => ({ slug: r.slug, tags: r.tags }))
    });
  } catch (error) {
    console.error('Admin basic debug tag error:', error);
    return NextResponse.json({ error: 'Failed to debug tag basic recipes', details: (error as any).message }, { status: 500 });
  }
}

