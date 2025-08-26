import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Get meal progress for a user
export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { searchParams } = new URL(req.url);
    const courseType = searchParams.get('courseType');
    const weekNumber = searchParams.get('weekNumber');
    const dayNumber = searchParams.get('dayNumber');

    if (!courseType || !weekNumber || !dayNumber) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const progress = await prisma.mealProgress.findMany({
      where: {
        userId: decoded.userId,
        courseType,
        weekNumber: parseInt(weekNumber),
        dayNumber: parseInt(dayNumber),
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching meal progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Toggle meal completion
export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { courseType, weekNumber, dayNumber, mealIndex } = await req.json();

    if (!courseType || weekNumber === undefined || dayNumber === undefined || mealIndex === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check if progress entry exists
    const existingProgress = await prisma.mealProgress.findUnique({
      where: {
        userId_courseType_weekNumber_dayNumber_mealIndex: {
          userId: decoded.userId,
          courseType,
          weekNumber: parseInt(weekNumber),
          dayNumber: parseInt(dayNumber),
          mealIndex: parseInt(mealIndex),
        },
      },
    });

    let progress;
    if (existingProgress) {
      // Toggle existing progress
      progress = await prisma.mealProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          completed: !existingProgress.completed,
          completedAt: !existingProgress.completed ? new Date() : null,
        },
      });
    } else {
      // Create new progress entry
      progress = await prisma.mealProgress.create({
        data: {
          userId: decoded.userId,
          courseType,
          weekNumber: parseInt(weekNumber),
          dayNumber: parseInt(dayNumber),
          mealIndex: parseInt(mealIndex),
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error toggling meal progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 