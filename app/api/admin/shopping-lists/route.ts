import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course');
    const week = searchParams.get('week');

    if (!course) {
      return NextResponse.json({ error: 'Course parameter required' }, { status: 400 });
    }

    // Map course codes to course names
    const courseNameMap: Record<string, string> = {
      'basic': 'Functional Basics',
      'flow': 'Functional Flow',
      'energy': 'Functional Energy',
      'hormone': 'Hormonell Balans'
    };

    const courseName = courseNameMap[course];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course' }, { status: 400 });
    }

    // Find course product
    const courseProduct = await prisma.courseProduct.findFirst({
      where: { name: { contains: courseName, mode: 'insensitive' } }
    });

    if (!courseProduct) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Build where clause
    const where: any = { courseId: courseProduct.id };
    if (week) {
      where.week = parseInt(week);
    }

    // Fetch shopping lists
    const lists = await prisma.weeklyShoppingList.findMany({
      where,
      include: {
        items: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { week: 'asc' }
    });

    // Transform to frontend format
    const transformedLists = lists.map(list => ({
      id: list.id,
      week: list.week,
      courseId: list.courseId,
      items: list.items.map(item => {
        // Parse "amount unit name" format
        const parts = item.ingredient.split(' ');
        const quantity = parts.slice(0, 2).join(' '); // "500 g" or "2 st"
        const name = parts.slice(2).join(' '); // rest is the name
        
        return {
          name: name || item.ingredient,
          quantity: quantity || '',
          category: 'Övrigt' // Default category
        };
      })
    }));

    return NextResponse.json({ lists: transformedLists });
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json({ error: 'Failed to fetch shopping lists' }, { status: 500 });
  }
}

