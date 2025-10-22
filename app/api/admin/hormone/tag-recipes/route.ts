import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractSlug(link?: string): string | null {
  if (!link) return null;
  try {
    const url = new URL(link, 'https://example.com');
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    // fallback: naive split
    const parts = (link || '').split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  }
}

// Tag all recipes referenced in hormone meal plans with 'hormonell-balans'
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const course = 'hormone';
    const hormoneTag = 'hormonell-balans';

    const weeks = await prisma.mealPlanWeek.findMany({
      where: { course },
      orderBy: { weekNumber: 'asc' }
    });

    const slugs = new Set<string>();
    for (const w of weeks) {
      const days: any = (w as any).days || {};
      for (const day of Object.values(days) as any[]) {
        if (!day) continue;
        for (const key of ['breakfast','lunch','dinner','snack','dessert']) {
          const meal = (day as any)[key];
          const slug = extractSlug(meal?.recipeLink || undefined);
          if (slug) slugs.add(slug);
        }
      }
    }

    if (slugs.size === 0) {
      return NextResponse.json({ ok: true, message: 'No recipe links found in hormone meal plans', tagged: 0 });
    }

    const recipes = await prisma.recipe.findMany({
      where: { slug: { in: Array.from(slugs) } },
      select: { id: true, tags: true, slug: true }
    });

    let taggedCount = 0;
    for (const r of recipes) {
      const currentTags = Array.isArray(r.tags) ? r.tags : [];
      if (!currentTags.includes(hormoneTag)) {
        await prisma.recipe.update({
          where: { id: r.id },
          data: { tags: [...currentTags, hormoneTag] }
        });
        taggedCount++;
      }
    }

    return NextResponse.json({ ok: true, tagged: taggedCount, totalFound: recipes.length });
  } catch (error) {
    console.error('Admin hormone tag-recipes error:', error);
    return NextResponse.json({ error: 'Failed to tag hormone recipes' }, { status: 500 });
  }
}


