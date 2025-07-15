import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteParams {
  params: {
    courseId: string;
    week: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { courseId, week } = params;

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

    return NextResponse.json({
      shoppingList: {
        items,
      },
      weekNumber,
      itemCount: items.length,
    });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update item checked status
export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; week: string } }
) {
  try {
    const { itemId, isChecked } = await request.json();

    // Verify user has access (optional - add auth check here)
    
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { isChecked }
    });

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 