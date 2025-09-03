import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId, rating, feedback, consent } = await req.json();
    
    if (!userId || !courseId || !rating || !feedback || !consent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify user has purchased the course
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        course: true,
        user: true
      }
    });
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Course not purchased' },
        { status: 403 }
      );
    }
    
    // Create or update review
    const review = await prisma.courseReview.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      update: {
        rating: parseInt(rating),
        answers: {
          feedback: feedback.trim(),
          submittedAt: new Date().toISOString(),
          source: 'email'
        },
        consent: true,
        source: 'EMAIL',
        status: 'PENDING' // Will be manually approved by admin
      },
      create: {
        userId,
        courseId,
        rating: parseInt(rating),
        answers: {
          feedback: feedback.trim(),
          submittedAt: new Date().toISOString(),
          source: 'email'
        },
        consent: true,
        source: 'EMAIL',
        status: 'PENDING'
      }
    });
    
    console.log(`✅ Review submitted via email for course ${purchase.course.name} by ${purchase.user.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Tack för din recension! Den kommer att granskas och publiceras inom kort.'
    });
    
  } catch (error) {
    console.error('❌ Error submitting email review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 