import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toStepsArray(content?: string | string[]): string[] {
  if (!content) return [];
  if (Array.isArray(content)) return content.filter(s => !!s && s.trim().length > 0).map(s => s.trim());
  const str = String(content);
  const numbered = str.split(/\d+\./).map(s => s.trim()).filter(Boolean);
  if (numbered.length > 1) return numbered;
  const sentences = str
    .split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ])/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
  if (sentences.length > 1) return sentences;
  return str
    .split(/\s*(?=(Blanda|Forma|Hetta|Stek|Dela|Krydda|Servera|Tillsätt|Värm|Koka|Rör|Hacka|Skiva|Lägg|Placera|Skär|Finhacka|Grädda|Toppa|Strö|Fyll|Smula)\b)/i)
    .map(s => s.trim())
    .filter(s => s.length > 5);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { weekNumbers = [1,2], fixLeftovers = true } = await req.json().catch(() => ({ weekNumbers: [1,2], fixLeftovers: true }));

    // 1) Normalize all recipes whose slugs are referenced from the specified MealPlanWeek(s)
    const updatedRecipes: string[] = [];
    for (const week of weekNumbers) {
      const mp = await (prisma as any).mealPlanWeek?.findUnique({
        where: { course_weekNumber: { course: 'hormone', weekNumber: week } }
      });
      if (!mp?.days) continue;

      const daysOrder = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
      const recipeLinks: string[] = [];
      for (const dayName of daysOrder) {
        const day = mp.days[dayName] || mp.days[`day${daysOrder.indexOf(dayName)+1}`];
        if (!day) continue;
        for (const key of ['breakfast','lunch','dinner','snack','dessert']) {
          const meal = day[key];
          if (meal?.recipeLink && typeof meal.recipeLink === 'string') {
            try {
              const slug = new URL(meal.recipeLink, 'https://x/').pathname.split('/').pop() || '';
              if (slug) recipeLinks.push(slug);
            } catch {}
          }
        }
      }

      const uniqueSlugs = Array.from(new Set(recipeLinks));
      const recipes = await prisma.recipe.findMany({ where: { slug: { in: uniqueSlugs } } });
      for (const r of recipes) {
        const steps = toStepsArray(r.instructions || r.content || '');
        const content = steps.length > 0 ? steps.map((s, i) => `${i+1}. ${s}`).join(' ') : (r.content || '');
        await prisma.recipe.update({
          where: { id: r.id },
          // Store as strings (DB column is String). UI will split numbered content to steps.
          data: { instructions: content, content }
        });
        updatedRecipes.push(r.slug);
      }

      // 2) Ensure leftovers point to original recipe (so images/links work)
      if (fixLeftovers) {
        const days = mp.days;
        for (const dayName of daysOrder) {
          const day = days[dayName] || days[`day${daysOrder.indexOf(dayName)+1}`];
          if (!day) continue;
          for (const key of ['breakfast','lunch','dinner','snack','dessert']) {
            const meal = day[key];
            if (!meal || !meal.name) continue;
            if (/\(rester\)/i.test(meal.name) && (!meal.recipeLink || typeof meal.recipeLink !== 'string')) {
              const baseName = meal.name.replace(/\s*\(rester\)/i,'').trim();
              const baseSlug = baseName
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[åä]/g,'a').replace(/[ö]/g,'o')
                .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
              day[key] = { ...meal, recipeLink: `/kunskapsbank/recept/${baseSlug}` };
            }
          }
        }
        await (prisma as any).mealPlanWeek?.update({
          where: { course_weekNumber: { course: 'hormone', weekNumber: week } },
          data: { days }
        });
      }
    }

    return NextResponse.json({ ok: true, updatedRecipesCount: updatedRecipes.length, updatedRecipes });
  } catch (error) {
    console.error('Normalize hormone recipes error:', error);
    return NextResponse.json({ error: 'Failed to normalize' }, { status: 500 });
  }
}


