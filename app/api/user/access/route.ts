import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get user ID from authorization header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        hasCourseAccess: false,
        courses: []
      });
    }

    try {
      // Decode JWT to get user ID (simple base64 decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id;
      
      if (!userId) {
        return NextResponse.json({ 
          hasCourseAccess: false,
          courses: []
        });
      }

      // Check if user has any completed purchases and get course details
      const purchases = await prisma.purchase.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          OR: [
            { courseId: { not: null } },
            { 
              AND: [
                { accessExpiresAt: { not: null } },
                { accessExpiresAt: { gt: new Date() } }
              ]
            },
            { accessExpiresAt: null }
          ]
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      });

      const hasCourseAccess = purchases.length > 0;
      
      // Extract course information
      const courses = purchases
        .filter(p => p.course)
        .map(p => ({
          id: p.course!.id,
          title: p.course!.title,
          slug: p.course!.slug
        }));

      // Also check for any purchases without courseId (legacy)
      const hasLegacyAccess = purchases.some(p => !p.courseId);
      
      return NextResponse.json({ 
        hasCourseAccess,
        courses,
        hasLegacyAccess // For backwards compatibility
      });
    } catch (error) {
      // Invalid token
      return NextResponse.json({ 
        hasCourseAccess: false,
        courses: []
      });
    }
  } catch (error) {
    console.error('Error checking user access:', error);
    return NextResponse.json({ 
      hasCourseAccess: false,
      courses: []
    });
  } finally {
    await prisma.$disconnect();
  }
} 