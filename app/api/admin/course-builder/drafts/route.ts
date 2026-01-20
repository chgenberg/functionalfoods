import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - List course drafts (or all courses if includePublished=true)
export async function GET(request: NextRequest) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ drafts: [] });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const includePublished = searchParams.get('includePublished') === 'true';

    // Get all course products
    const courses = await prisma.courseProduct.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    // Filter courses based on includePublished flag
    const filteredCourses = courses.filter(course => {
      const content = (course.content as any) || {};
      // If includePublished, return all courses with builderData
      // Otherwise, only return drafts
      if (includePublished) {
        return content.builderData !== undefined;
      }
      return content.isDraft === true;
    });

    const drafts = filteredCourses.map(course => {
      const content = (course.content as any) || {};
      const builderData = content.builderData || {};
      
      return {
        id: course.id,
        title: builderData.title || course.name || 'Ny kurs',
        description: builderData.description || course.description || '',
        duration: builderData.duration || '6 veckor',
        price: builderData.price ?? course.price ?? 0,
        status: content.isDraft === true ? 'draft' : 'published',
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        currentStep: builderData.currentStep || 5,
        weeksCount: builderData.weeksCount || 6,
        hasBuilderData: !!content.builderData
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

    // Generate a unique name for the draft
    const timestamp = Date.now();
    const draftName = title || `Ny kurs (utkast) ${timestamp}`;

    // Create a new CourseProduct with draft data in content field
    const course = await prisma.courseProduct.create({
      data: {
        name: draftName,
        description: '',
        price: 0,
        content: {
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
        },
        features: []
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
