import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Search recipes by title
export async function GET(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ recipes: [] });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query.trim()) {
      return NextResponse.json({ recipes: [] });
    }

    // Search recipes by title (case-insensitive)
    const recipes = await prisma.recipe.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive'
        },
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true
      },
      orderBy: {
        title: 'asc'
      },
      take: limit
    });

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error searching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
