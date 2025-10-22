import { NextRequest, NextResponse } from 'next/server';
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

  const results: any[] = [];
  try {
    // 0) Ensure course skeleton exists (idempotent)
    results.push(await postInternal('/api/admin/courses/create-skeleton', req, {
      name: 'Hormonell Balans',
      courseCode: 'hormone',
      productId: 'hormonell-balans',
      weeks: 6
    }));

    // 1) Seed meal plans (weeks 1-6)
    const mealPlanPaths = [
      '/api/admin/seed/hormone/week1',
      '/api/admin/seed/hormone/week2/meal-plan',
      '/api/admin/seed/hormone/week3/meal-plan',
      '/api/admin/seed/hormone/week4/meal-plan',
      '/api/admin/seed/hormone/week5/meal-plan',
      '/api/admin/seed/hormone/week6/meal-plan'
    ];
    for (const p of mealPlanPaths) results.push(await postInternal(p, req));

    // 2) Seed recipes (weeks 1-6) if available
    const recipePaths = [
      '/api/admin/seed/hormone/week1/recipes',
      '/api/admin/seed/hormone/week2/recipes',
      '/api/admin/seed/hormone/week3/recipes',
      '/api/admin/seed/hormone/week4/recipes',
      '/api/admin/seed/hormone/week5/recipes',
      '/api/admin/seed/hormone/week6/recipes'
    ];
    for (const p of recipePaths) results.push(await postInternal(p, req));

    // 3) Seed shopping lists (weeks 1-6)
    const listPaths = [
      '/api/admin/seed/hormone/week1/shopping-list',
      '/api/admin/seed/hormone/week2/shopping-list',
      '/api/admin/seed/hormone/week3/shopping-list',
      '/api/admin/seed/hormone/week4/shopping-list',
      '/api/admin/seed/hormone/week5/shopping-list',
      '/api/admin/seed/hormone/week6/shopping-list'
    ];
    for (const p of listPaths) results.push(await postInternal(p, req));

    // 4) Tag recipes used in meal plans with 'hormonell-balans'
    results.push(await postInternal('/api/admin/hormone/tag-recipes', req));

    const summary = {
      ok: results.every(r => r.ok || r.status === 404),
      results
    };
    return NextResponse.json(summary, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Hormone run-migration error:', error);
    return NextResponse.json({ error: 'Migration failed', results }, { status: 500 });
  }
}


