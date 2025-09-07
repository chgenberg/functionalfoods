import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ hasCourseAccess: false, courses: [] });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId?: string; id?: string };
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        return NextResponse.json({ hasCourseAccess: false, courses: [] });
      }

      const now = new Date();
      const purchases = await prisma.purchase.findMany({
        where: {
          userId,
          OR: [
            { status: 'completed' },
            { status: 'COMPLETED' as any }
          ],
          AND: [
            {
              OR: [
                { accessExpiresAt: null },
                { accessExpiresAt: { gt: now } }
              ]
            }
          ]
        },
        include: {
          course: {
            select: { id: true, name: true }
          }
        }
      });

      const hasCourseAccess = purchases.length > 0;

      const courses = purchases
        .filter(p => p.course)
        .map(p => {
          const name = p.course!.name;
          const lower = name.toLowerCase();
          let slug = '';
          if (lower.includes('basics')) slug = 'functional-basics';
          else if (lower.includes('flow')) slug = 'functional-flow';
          else if (lower.includes('energy')) slug = 'functional-energy';
          return { id: p.course!.id, title: name, slug };
        });

      const hasLegacyAccess = purchases.some(p => !p.courseId);

      return NextResponse.json({ hasCourseAccess, courses, hasLegacyAccess });
    } catch {
      return NextResponse.json({ hasCourseAccess: false, courses: [] });
    }
  } catch (error) {
    console.error('Error checking user access:', error);
    return NextResponse.json({ hasCourseAccess: false, courses: [] });
  } finally {
    await prisma.$disconnect();
  }
} 