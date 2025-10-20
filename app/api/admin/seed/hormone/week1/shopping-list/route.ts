import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed WeeklyShoppingList for Hormonell Balans, vecka 1
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // 1) Hämta CourseProduct
    const product = await prisma.courseProduct.findFirst({ where: { name: 'Hormonell Balans' } });
    if (!product) return NextResponse.json({ error: 'CourseProduct Hormonell Balans saknas' }, { status: 404 });

    // 2) Hämta/Skapa WeeklyShoppingList för vecka 1
    const week = 1;
    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: product.id, week } });
    if (!list) {
      list = await prisma.weeklyShoppingList.create({ data: { courseId: product.id, week } });
    }

    // 3) Radera tidigare items
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    // 4) Lägg in raderna. OBS: Den fulla listan för v.1 seedades tidigare –
    // detta är en tom/upkeep seed som säkerställer att listan finns.
    const ingredients: string[] = [];

    // 5) Skapa items i bulk (no-op om tom lista)
    if (ingredients.length > 0) {
      const chunk = 200;
      for (let i = 0; i < ingredients.length; i += chunk) {
        await prisma.shoppingListItem.createMany({
          data: ingredients.slice(i, i + chunk).map((ingredient) => ({ listId: list!.id, ingredient })),
        });
      }
    }

    return NextResponse.json({ ok: true, listId: list.id, count: ingredients.length });
  } catch (error) {
    console.error('Seed hormone week1 shopping-list error:', error);
    return NextResponse.json({ error: 'Failed to seed week 1 shopping list' }, { status: 500 });
  }
}


