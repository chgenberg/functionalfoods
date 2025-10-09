import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || '3');

    const recipes = await prisma.recipe.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: count
    });

    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return NextResponse.json(recipes, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch random recipes' }, { status: 500 });
  }
} 