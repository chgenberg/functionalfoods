import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // NOTE: GET is public (no auth required) so customers can see current prices
  // Only PUT requires admin auth to change prices
  
  try {
    // Hämta alla kursprodukter från databasen
    const courseProducts = await prisma.courseProduct.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        basePrice: true,
        salePrice: true,
        saleStartsAt: true,
        saleEndsAt: true,
        purchases: {
          select: { id: true }
        }
      }
    });

    // Hämta veckodata för varje kurs
    const weekData = await prisma.courseWeekMeta.findMany({
      orderBy: [{ course: 'asc' }, { weekNumber: 'asc' }]
    });

    // Organisera veckodata per kurs
    const weeksByCourse: Record<string, any[]> = {
      'basic': [],
      'flow': [],
      'energy': []
    };

    weekData.forEach(week => {
      if (weeksByCourse[week.course]) {
        weeksByCourse[week.course].push({
          weekNumber: week.weekNumber,
          title: week.weekTitle || `Vecka ${week.weekNumber}`,
          subtitle: week.weekSubtitle || '',
          welcomeMessage: week.welcomeMessage || '',
          videoUrl: week.videoUrl || '',
          heroImage: week.heroImage || ''
        });
      }
    });

    // Mappa kursprodukter till kursformat
    const courseNameToId: Record<string, string> = {
      'Functional Basics': 'functional-basics',
      'Functional Flow': 'functional-flow',
      'Functional Energy': 'functional-energy',
      'Hormonell Balans': 'hormonell-balans'
    };

    const courseNameToCourse: Record<string, string> = {
      'Functional Basics': 'basic',
      'Functional Flow': 'flow',
      'Functional Energy': 'energy',
      'Hormonell Balans': 'hormone'
    };

    const courses = courseProducts
      .filter(cp => courseNameToId[cp.name]) // Endast functional foods-kurser
      .map(cp => ({
        id: courseNameToId[cp.name],
        name: cp.name,
        description: cp.description,
        price: cp.price,
        basePrice: cp.basePrice,
        salePrice: cp.salePrice,
        saleStartsAt: cp.saleStartsAt,
        saleEndsAt: cp.saleEndsAt,
        enrollments: cp.purchases.length,
        weeks: weeksByCourse[courseNameToCourse[cp.name]] || []
      }));

    return NextResponse.json(courses, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// Update course price
export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const body = await req.json();
    const { courseId, price, basePrice, salePrice, saleStartsAt, saleEndsAt } = body;

    // Map course IDs to database names
    const courseNameMap: Record<string, string> = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy',
      'hormonell-balans': 'Hormonell Balans',
      'functional-hormone': 'Hormonell Balans'
    };

    const courseName = courseNameMap[courseId];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Update price in CourseProduct table
    const data: any = { price };
    if (typeof basePrice === 'number') data.basePrice = basePrice;
    if (basePrice === null) data.basePrice = null;
    if (typeof salePrice === 'number') data.salePrice = salePrice;
    if (salePrice === null) data.salePrice = null;
    if (saleStartsAt) data.saleStartsAt = new Date(saleStartsAt);
    if (saleStartsAt === null) data.saleStartsAt = null;
    if (saleEndsAt) data.saleEndsAt = new Date(saleEndsAt);
    if (saleEndsAt === null) data.saleEndsAt = null;

    const updated = await prisma.courseProduct.updateMany({
      where: { name: courseName },
      data
    });

    return NextResponse.json({ success: true, updated: updated.count });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}
