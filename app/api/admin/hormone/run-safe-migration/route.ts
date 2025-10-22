import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function postInternal(path: string, req: NextRequest, body?: any) {
  const origin = req.nextUrl.origin;
  const url = `${origin}${path}`;
  const cookie = req.headers.get('cookie') || '';
  const headers: any = { 'Content-Type': 'application/json', cookie };
  const init: RequestInit = { method: 'POST', headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  let json: any = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { path, status: res.status, ok: res.ok, json };
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const courseCode = 'hormone';
  const weeks = [1, 2, 3, 4, 5, 6];
  const results: any = { skeleton: null, mealPlans: [], shoppingLists: [], tagRecipes: null };

  try {
    // Ensure CourseProduct exists (idempotent) but avoid touching existing meal plan data
    results.skeleton = await postInternal('/api/admin/courses/create-skeleton', req, {
      name: 'Hormonell Balans',
      courseCode,
      productId: 'hormonell-balans',
      weeks: 6
    });

    // Resolve CourseProduct for shopping lists
    const product = await prisma.courseProduct.findFirst({ where: { name: { contains: 'Hormonell Balans', mode: 'insensitive' } } });

    for (const week of weeks) {
      // MEAL PLANS: only seed if missing
      const mp = await prisma.mealPlanWeek.findUnique({ where: { course_weekNumber: { course: courseCode, weekNumber: week } } });
      if (!mp) {
        // Pick seed route per week
        const path = week === 1
          ? '/api/admin/seed/hormone/week1'
          : `/api/admin/seed/hormone/week${week}/meal-plan`;
        const r = await postInternal(path, req);
        results.mealPlans.push({ week, seeded: true, ...r });
      } else {
        results.mealPlans.push({ week, seeded: false, status: 'exists' });
      }

      // SHOPPING LISTS: only seed if missing
      if (product) {
        const list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
        if (!list) {
          const path = `/api/admin/seed/hormone/week${week}/shopping-list`;
          const r = await postInternal(path, req);
          results.shoppingLists.push({ week, seeded: true, ...r });
        } else {
          results.shoppingLists.push({ week, seeded: false, status: 'exists' });
        }
      } else {
        results.shoppingLists.push({ week, seeded: false, status: 'no-course-product' });
      }
    }

    // Finally: tag recipes used in meal plans (non-destructive)
    results.tagRecipes = await postInternal('/api/admin/hormone/tag-recipes', req);

    return NextResponse.json({ ok: true, results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Hormone run-safe-migration error:', error);
    return NextResponse.json({ ok: false, error: 'Safe migration failed', results }, { status: 500 });
  }
}


