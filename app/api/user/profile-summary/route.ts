import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

function getUserIdFromToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded.userId as string;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.substring(7);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Hämta användarens data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quizResults: {
          orderBy: { completedAt: 'desc' },
          take: 1,
          select: {
            healthScore: true,
            energyScore: true,
            sleepScore: true,
            stressScore: true,
            dietScore: true,
            exerciseScore: true,
            completedAt: true
          }
        },
        healthProfile: {
          select: {
            age: true,
            gender: true,
            activityLevel: true
          }
        },
        symptomAnalyses: {
          select: { id: true }
        },
        courses: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profileSummary = {
      quizResults: user.quizResults[0] || null,
      healthProfile: user.healthProfile,
      symptomAnalysesCount: user.symptomAnalyses.length,
      coursesCount: user.courses.length
    };

    return NextResponse.json(profileSummary);

  } catch (error) {
    console.error('Error fetching profile summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile summary' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 