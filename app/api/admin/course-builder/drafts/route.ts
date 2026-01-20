import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - List all course drafts
export async function GET(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ drafts: [] });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get all course products that have draft data in metadata
    const courses = await prisma.courseProduct.findMany({
      where: {
        OR: [
          { metadata: { path: ['isDraft'], equals: true } },
          { metadata: { path: ['builderData'], not: undefined } }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Also get any standalone drafts from a potential drafts table
    // For now, we'll use the courseProduct with special metadata

    const drafts = courses.map(course => {
      const metadata = (course.metadata as any) || {};
      const builderData = metadata.builderData || {};
      
      return {
        id: course.id,
        title: course.name || 'Ny kurs (utkast)',
        description: course.description,
        duration: builderData.duration || '6 veckor',
        price: course.price || 0,
        status: metadata.isDraft ? 'draft' : 'published',
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        currentStep: builderData.currentStep || 1,
        weeksCount: builderData.weeksCount || 6
      };
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('Error fetching course drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new course draft
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { title, duration } = body;

    // Parse duration to get weeks count
    const weeksMatch = duration?.match(/(\d+)/);
    const weeksCount = weeksMatch ? parseInt(weeksMatch[1], 10) : 6;

    // Create a new CourseProduct with draft metadata
    const course = await prisma.courseProduct.create({
      data: {
        name: title || 'Ny kurs (utkast)',
        description: '',
        price: 0,
        content: {},
        features: [],
        metadata: {
          isDraft: true,
          builderData: {
            title: title || 'Ny kurs (utkast)',
            description: '',
            price: 0,
            duration: duration || '6 veckor',
            weeksCount: weeksCount,
            level: 'Beginner',
            targetAudience: '',
            objectives: [],
            features: [],
            coverImage: '',
            introVideoUrl: '',
            welcomeMessage: '',
            enableCommunity: false,
            communityDescription: '',
            weeks: [],
            currentStep: 1
          }
        }
      }
    });

    return NextResponse.json({
      id: course.id,
      title: course.name,
      message: 'Draft created successfully'
    });
  } catch (error) {
    console.error('Error creating course draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
