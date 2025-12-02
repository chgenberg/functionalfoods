import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/users/add-course
 * Add course access for a user (create a Purchase record)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if course exists
    const course = await prisma.courseProduct.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if purchase already exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'User already has access to this course' },
        { status: 400 }
      );
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        courseId,
        amount: 0, // Manual grant - no payment
        status: 'completed',
        accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      include: {
        course: true
      }
    });

    console.log(`✅ Admin granted course access: ${user.email} -> ${course.name}`);

    return NextResponse.json({
      success: true,
      message: `Access to "${course.name}" granted to ${user.email}`,
      purchase: {
        id: purchase.id,
        courseName: purchase.course.name,
        accessExpiresAt: purchase.accessExpiresAt
      }
    });

  } catch (error) {
    console.error('Error adding course access:', error);
    return NextResponse.json(
      { error: 'Failed to add course access' },
      { status: 500 }
    );
  }
}

