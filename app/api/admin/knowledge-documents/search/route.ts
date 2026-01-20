import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Search knowledge documents by title
export async function GET(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ documents: [] });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const course = searchParams.get('course') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Search knowledge documents by title (case-insensitive)
    const where: Record<string, unknown> = {};
    
    if (query.trim()) {
      where.title = {
        contains: query,
        mode: 'insensitive'
      };
    }

    // Optionally filter by course
    if (course.trim()) {
      where.OR = [
        { course: course },
        { courses: { has: course } }
      ];
    }

    const documents = await prisma.knowledgeDocument.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        headerImage: true,
        course: true,
        courses: true,
        weekNumber: true,
        readTime: true
      },
      orderBy: [
        { weekNumber: 'asc' },
        { order: 'asc' },
        { title: 'asc' }
      ],
      take: limit
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error searching knowledge documents:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge documents' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
