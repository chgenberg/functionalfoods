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

    const content = (course.content as any) || {};
    const builderData = content.builderData || {};

    // Return the full draft data
    return NextResponse.json({
      id: course.id,
      title: builderData.title || course.name,
      description: builderData.description || course.description,
      price: builderData.price ?? course.price,
      salePrice: builderData.salePrice ?? course.salePrice,
      saleStartsAt: builderData.saleStartsAt ?? course.saleStartsAt?.toISOString() ?? null,
      saleEndsAt: builderData.saleEndsAt ?? course.saleEndsAt?.toISOString() ?? null,
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
      status: content.isDraft ? 'draft' : 'published',
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
      saleStartsAt,
      saleEndsAt,
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

    const existingContent = (existing.content as any) || {};
    const existingBuilderData = existingContent.builderData || {};

    // Merge the updates
    const updatedBuilderData = {
      ...existingBuilderData,
      title: title ?? existingBuilderData.title,
      description: description ?? existingBuilderData.description,
      price: price ?? existingBuilderData.price,
      salePrice: salePrice === undefined ? existingBuilderData.salePrice : salePrice,
      saleStartsAt: saleStartsAt === undefined ? existingBuilderData.saleStartsAt : saleStartsAt,
      saleEndsAt: saleEndsAt === undefined ? existingBuilderData.saleEndsAt : saleEndsAt,
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
        salePrice: updatedBuilderData.salePrice ?? null,
        saleStartsAt: updatedBuilderData.saleStartsAt ? new Date(updatedBuilderData.saleStartsAt) : null,
        saleEndsAt: updatedBuilderData.saleEndsAt ? new Date(updatedBuilderData.saleEndsAt) : null,
        welcomeText: updatedBuilderData.welcomeMessage,
        overviewVideoUrl: updatedBuilderData.introVideoUrl,
        content: {
          ...existingContent,
          isDraft,
          coverImage: updatedBuilderData.coverImage,
          objectives: updatedBuilderData.objectives,
          weeks: updatedBuilderData.weeks,
          builderData: updatedBuilderData
        },
        features: updatedBuilderData.features || []
      }
    });

    // Sync to MealPlanWeeks and CourseWeekMeta when publishing
    // Always sync if status is 'published' to keep tables in sync with edits
    if (status === 'published') {
      // Use existing slug from content if available (for migrated courses),
      // otherwise derive from title (for new courses)
      const courseSlug = existingContent.slug || null;
      await publishCourseData(params.id, updatedBuilderData, courseSlug);
    }

    // Return the updated data
    return NextResponse.json({
      id: updated.id,
      title: updatedBuilderData.title,
      description: updatedBuilderData.description,
      price: updatedBuilderData.price,
      salePrice: updatedBuilderData.salePrice,
      saleStartsAt: updatedBuilderData.saleStartsAt,
      saleEndsAt: updatedBuilderData.saleEndsAt,
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

    const content = (course.content as any) || {};
    
    // Only allow deleting drafts, not published courses
    if (!content.isDraft) {
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
async function publishCourseData(courseId: string, builderData: any, existingSlug: string | null = null) {
  // Use existing slug if provided (for migrated courses), otherwise derive from title
  const courseSlug = existingSlug || builderData.title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  console.log(`📝 Publishing course data with slug: ${courseSlug}`);

  const weeks = builderData.weeks || [];

  // Collect all knowledge document IDs for this course
  const allDocumentIds: string[] = [];

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

    // Update knowledge documents linked to this week
    const weekDocuments = week.knowledgeDocuments || [];
    for (const doc of weekDocuments) {
      if (doc.id) {
        allDocumentIds.push(doc.id);
        
        // Update the knowledge document to include this course and week number
        try {
          const existingDoc = await prisma.knowledgeDocument.findUnique({
            where: { id: doc.id }
          });

          if (existingDoc) {
            const currentCourses = existingDoc.courses || [];
            const updatedCourses = currentCourses.includes(courseSlug) 
              ? currentCourses 
              : [...currentCourses, courseSlug];

            await prisma.knowledgeDocument.update({
              where: { id: doc.id },
              data: {
                courses: updatedCourses,
                weekNumber: week.weekNumber
              }
            });
          }
        } catch (docError) {
          console.error(`Failed to update knowledge document ${doc.id}:`, docError);
        }
      }
    }
  }

  // Update the CourseProduct content with slug and linked documents (preserving existing data)
  const existingCourse = await prisma.courseProduct.findUnique({
    where: { id: courseId }
  });
  
  const existingContent = (existingCourse?.content as any) || {};
  
  await prisma.courseProduct.update({
    where: { id: courseId },
    data: {
      content: {
        ...existingContent,
        isDraft: false,
        slug: courseSlug,
        linkedDocumentIds: allDocumentIds,
        publishedAt: new Date().toISOString()
      }
    }
  });

  console.log(`✅ Published course data for ${courseSlug} with ${weeks.length} weeks and ${allDocumentIds.length} linked documents`);
}
