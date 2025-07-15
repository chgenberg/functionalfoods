import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const week = searchParams.get('week');

  if (!courseId || !week) {
    return NextResponse.json({ error: 'Course ID and week are required' }, { status: 400 });
  }

  const weekNumber = parseInt(week, 10);
  if (isNaN(weekNumber)) {
    return NextResponse.json({ error: 'Week must be a number' }, { status: 400 });
  }

  try {
    const shoppingList = await prisma.weeklyShoppingList.findFirst({
      where: {
        courseId,
        week: weekNumber,
      },
      include: {
        items: true,
      },
    });

    if (!shoppingList) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }

    const items = (shoppingList.items as any[]).map((item) => ({
      id: item.id,
      name: item.ingredient,
      quantity: '',
      category: 'Övrigt',
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 