import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get user ID from authorization header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ hasCourseAccess: false });
    }

    try {
      // Decode JWT to get user ID (simple base64 decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id;
      
      if (!userId) {
        return NextResponse.json({ hasCourseAccess: false });
      }

      // Check if user has any completed purchases
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
        }
      });

      const hasCourseAccess = purchases.length > 0;

      return NextResponse.json({ hasCourseAccess });
    } catch (error) {
      // Invalid token
      return NextResponse.json({ hasCourseAccess: false });
    }
  } catch (error) {
    console.error('Error checking user access:', error);
    return NextResponse.json({ hasCourseAccess: false });
  } finally {
    await prisma.$disconnect();
  }
} 