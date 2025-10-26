import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tags = searchParams.get('tags');
    const q = searchParams.get('q');

    if (!tags && !q) {
      return NextResponse.json({ error: 'Missing search parameters' }, { status: 400 });
    }

    const where: any = { status: 'PUBLISHED' };

    if (tags) {
      where.tags = { has: tags };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { searchText: { contains: q, mode: 'insensitive' } }
      ];
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        tags: true,
        categories: true
      }
    });

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Recipe search error:', error);
    return NextResponse.json({ error: 'Failed to search recipes' }, { status: 500 });
  }
}

