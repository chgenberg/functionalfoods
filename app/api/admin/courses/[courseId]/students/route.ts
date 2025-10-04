import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { courseId } = params;
    
    // Map course ID to course name
    const courseNameMap: Record<string, string> = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy'
    };
    
    const courseName = courseNameMap[courseId];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }
    
    // Find the course product
    const courseProduct = await prisma.courseProduct.findFirst({
      where: { name: courseName }
    });
    
    if (!courseProduct) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Fetch all purchases for this course
    const purchases = await prisma.purchase.findMany({
      where: { courseId: courseProduct.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            lastLogin: true
          }
        }
      },
      orderBy: { purchaseDate: 'desc' }
    });
    
    // Transform to student format
    const students = purchases.map(purchase => ({
      id: purchase.user.id,
      name: purchase.user.name || 'Okänd',
      email: purchase.user.email,
      enrolledAt: purchase.purchaseDate.toISOString(),
      progress: 0, // Could be calculated from course progress if tracked
      lastActive: purchase.user.lastLogin?.toISOString() || null
    }));
    
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
