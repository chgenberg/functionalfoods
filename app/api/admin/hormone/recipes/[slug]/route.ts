import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;
  try {
    const recipe = await prisma.recipe.findUnique({ where: { slug: params.slug } });
    if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, recipe });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;
  try {
    const body = await req.json();
    const data: any = {};
    if (typeof body.title === 'string') data.title = body.title;
    if (Array.isArray(body.ingredients)) data.ingredients = body.ingredients;
    if (typeof body.instructions === 'string') data.instructions = body.instructions;
    if (typeof body.imageUrl === 'string') data.imageUrl = body.imageUrl;
    if (Array.isArray(body.categories)) data.categories = body.categories;
    if (typeof body.isPremium === 'boolean') data.isPremium = body.isPremium;
    if (typeof body.isFree === 'boolean') data.isFree = body.isFree;

    const updated = await prisma.recipe.update({ where: { slug: params.slug }, data });
    return NextResponse.json({ ok: true, recipe: updated });
  } catch (e) {
    console.error('Update hormone recipe error:', e);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;
  try {
    await prisma.recipe.delete({ where: { slug: params.slug } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}


