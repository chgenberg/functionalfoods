import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Get single course draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Skip during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const course = await prisma.courseProduct.findUnique({
      where: { id: params.id }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    const metadata = (course.metadata as any) || {};
    const builderData = metadata.builderData || {};

    // Return the full draft data
    return NextResponse.json({
      id: course.id,
      title: builderData.title || course.name,
      description: builderData.description || course.description,
      price: builderData.price ?? course.price,
      salePrice: builderData.salePrice || course.salePrice,
      duration: builderData.duration || '6 veckor',
      weeksCount: builderData.weeksCount || 6,
      level: builderData.level || 'Beginner',
      targetAudience: builderData.targetAudience || '',
      objectives: builderData.objectives || [],
      features: builderData.features || [],
      coverImage: builderData.coverImage || '',
      introVideoUrl: builderData.introVideoUrl || course.overviewVideoUrl || '',
      welcomeMessage: builderData.welcomeMessage || course.welcomeText || '',
      enableCommunity: builderData.enableCommunity || false,
      communityDescription: builderData.communityDescription || '',
      weeks: builderData.weeks || [],
      status: metadata.isDraft ? 'draft' : 'published',
      currentStep: builderData.currentStep || 1
    });
  } catch (error) {
    console.error('Error fetching course draft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update course draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      salePrice,
      duration,
      weeksCount,
      level,
      targetAudience,
      objectives,
      features,
      coverImage,
      introVideoUrl,
      welcomeMessage,
      enableCommunity,
      communityDescription,
      weeks,
      status,
      currentStep
    } = body;

    // Get existing course
    const existing = await prisma.courseProduct.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    const existingMetadata = (existing.metadata as any) || {};
    const existingBuilderData = existingMetadata.builderData || {};

    // Merge the updates
    const updatedBuilderData = {
      ...existingBuilderData,
      title: title ?? existingBuilderData.title,
      description: description ?? existingBuilderData.description,
      price: price ?? existingBuilderData.price,
      salePrice: salePrice ?? existingBuilderData.salePrice,
      duration: duration ?? existingBuilderData.duration,
      weeksCount: weeksCount ?? existingBuilderData.weeksCount,
      level: level ?? existingBuilderData.level,
      targetAudience: targetAudience ?? existingBuilderData.targetAudience,
      objectives: objectives ?? existingBuilderData.objectives,
      features: features ?? existingBuilderData.features,
      coverImage: coverImage ?? existingBuilderData.coverImage,
      introVideoUrl: introVideoUrl ?? existingBuilderData.introVideoUrl,
      welcomeMessage: welcomeMessage ?? existingBuilderData.welcomeMessage,
      enableCommunity: enableCommunity ?? existingBuilderData.enableCommunity,
      communityDescription: communityDescription ?? existingBuilderData.communityDescription,
      weeks: weeks ?? existingBuilderData.weeks,
      currentStep: currentStep ?? existingBuilderData.currentStep
    };

    // Update the course
    const isDraft = status !== 'published';
    
    const updated = await prisma.courseProduct.update({
      where: { id: params.id },
      data: {
        name: updatedBuilderData.title || existing.name,
        description: updatedBuilderData.description || existing.description,
        price: updatedBuilderData.price ?? existing.price,
        salePrice: updatedBuilderData.salePrice,
        welcomeText: updatedBuilderData.welcomeMessage,
        overviewVideoUrl: updatedBuilderData.introVideoUrl,
        content: {
          ...(existing.content as any || {}),
          coverImage: updatedBuilderData.coverImage,
          objectives: updatedBuilderData.objectives,
          weeks: updatedBuilderData.weeks
        },
        features: updatedBuilderData.features || [],
        metadata: {
          ...existingMetadata,
          isDraft,
          builderData: updatedBuilderData
        }
      }
    });

    // If publishing, also create MealPlanWeeks and CourseWeekMeta
    if (status === 'published' && isDraft !== existingMetadata.isDraft) {
      await publishCourseData(params.id, updatedBuilderData);
    }

    // Return the updated data
    return NextResponse.json({
      id: updated.id,
      title: updatedBuilderData.title,
      description: updatedBuilderData.description,
      price: updatedBuilderData.price,
      salePrice: updatedBuilderData.salePrice,
      duration: updatedBuilderData.duration,
      weeksCount: updatedBuilderData.weeksCount,
      level: updatedBuilderData.level,
      targetAudience: updatedBuilderData.targetAudience,
      objectives: updatedBuilderData.objectives,
      features: updatedBuilderData.features,
      coverImage: updatedBuilderData.coverImage,
      introVideoUrl: updatedBuilderData.introVideoUrl,
      welcomeMessage: updatedBuilderData.welcomeMessage,
      enableCommunity: updatedBuilderData.enableCommunity,
      communityDescription: updatedBuilderData.communityDescription,
      weeks: updatedBuilderData.weeks,
      status: isDraft ? 'draft' : 'published',
      currentStep: updatedBuilderData.currentStep
    });
  } catch (error) {
    console.error('Error updating course draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete course draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Check if it's a draft
    const course = await prisma.courseProduct.findUnique({
      where: { id: params.id }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    const metadata = (course.metadata as any) || {};
    
    // Only allow deleting drafts, not published courses
    if (!metadata.isDraft) {
      return NextResponse.json(
        { error: 'Cannot delete published course. Archive it instead.' },
        { status: 400 }
      );
    }

    // Delete the draft
    await prisma.courseProduct.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to publish course data to MealPlanWeek and CourseWeekMeta
async function publishCourseData(courseId: string, builderData: any) {
  const courseSlug = builderData.title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const weeks = builderData.weeks || [];

  for (const week of weeks) {
    // Create or update MealPlanWeek
    const daysData: Record<string, any> = {};
    
    for (const day of week.days || []) {
      const meals: Record<string, any> = {};
      
      for (const [mealType, meal] of Object.entries(day.meals || {})) {
        if (meal) {
          meals[mealType] = {
            name: (meal as any).name,
            recipeLink: (meal as any).recipeLink || undefined,
            note: (meal as any).note || undefined
          };
        }
      }

      if (Object.keys(meals).length > 0) {
        daysData[day.dayName] = meals;
      }
    }

    // Upsert MealPlanWeek
    await prisma.mealPlanWeek.upsert({
      where: {
        course_weekNumber: {
          course: courseSlug,
          weekNumber: week.weekNumber
        }
      },
      update: {
        title: week.title,
        days: daysData
      },
      create: {
        course: courseSlug,
        weekNumber: week.weekNumber,
        title: week.title,
        days: daysData
      }
    });

    // Upsert CourseWeekMeta
    await prisma.courseWeekMeta.upsert({
      where: {
        course_weekNumber: {
          course: courseSlug,
          weekNumber: week.weekNumber
        }
      },
      update: {
        weekTitle: week.title,
        weekSubtitle: week.subtitle || null,
        videoUrl: week.videoUrl || null,
        welcomeMessage: week.welcomeMessage || null,
        keyTakeaways: week.keyTakeaways || []
      },
      create: {
        course: courseSlug,
        weekNumber: week.weekNumber,
        weekTitle: week.title,
        weekSubtitle: week.subtitle || null,
        videoUrl: week.videoUrl || null,
        welcomeMessage: week.welcomeMessage || null,
        keyTakeaways: week.keyTakeaways || []
      }
    });
  }

  console.log(`✅ Published course data for ${courseSlug} with ${weeks.length} weeks`);
}
