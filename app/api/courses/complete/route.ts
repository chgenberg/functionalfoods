import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { emailService } from '@/app/lib/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId } = await req.json();
    
    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Missing userId or courseId' }, { status: 400 });
    }

    // Get user and course info
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has purchased this course
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        course: true
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Course not purchased' }, { status: 403 });
    }

    // Check if review already exists
    const existingReview = await prisma.courseReview.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    const courseName = courseId === 'functional-flow' ? 'Functional Flow' : 'Functional Basics';
    
    // Send review reminder email (only if no review exists)
    if (!existingReview) {
      try {
        await emailService.sendCourseReviewRequest({
          email: user.email,
          name: user.name || user.email.split('@')[0],
          courseId,
          courseName,
          userId
        });

        console.log(`Review reminder email sent to ${user.email} for course ${courseId}`);
      } catch (emailError) {
        console.error('Failed to send review reminder email:', emailError);
        // Don't fail the completion if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Course completion processed',
      reviewExists: !!existingReview 
    });

  } catch (error) {
    console.error('Course completion error:', error);
    return NextResponse.json({ error: 'Failed to process course completion' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 