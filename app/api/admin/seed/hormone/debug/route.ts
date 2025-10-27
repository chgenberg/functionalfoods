import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First, find the hormone course by name
    const course = await prisma.courseProduct.findFirst({
      where: {
        name: { contains: 'hormonell-balans', mode: 'insensitive' }
      }
    });

    if (!course) {
      return NextResponse.json({ 
        error: 'Hormone course not found in CourseProduct',
        info: 'Make sure a CourseProduct with name containing "hormonell-balans" exists'
      }, { status: 404 });
    }

    // Check what exists in the database for hormone course
    const lists = await prisma.weeklyShoppingList.findMany({
      where: {
        courseId: course.id
      },
      select: {
        id: true,
        courseId: true,
        week: true,
        items: true
      }
    });

    console.log('📊 Debug: Found shopping lists:', lists);

    return NextResponse.json({
      ok: true,
      courseId: course.id,
      courseName: course.name,
      count: lists.length,
      lists: lists.map(l => ({
        courseId: l.courseId,
        week: l.week,
        itemCount: Array.isArray(l.items) ? l.items.length : 0,
        firstItem: Array.isArray(l.items) && l.items.length > 0 ? l.items[0] : null
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
