import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET shopping list for a specific week
export async function GET(
  request: Request,
  { params }: { params: { courseId: string; week: string } }
) {
  try {
    const weekNumber = parseInt(params.week);
    
    // Find or create shopping list
    let shoppingList = await prisma.weeklyShoppingList.findUnique({
      where: {
        courseId_week: {
          courseId: params.courseId,
          week: weekNumber
        }
      },
      include: {
        items: {
          orderBy: {
            ingredient: 'asc'
          }
        }
      }
    });

    // If no list exists, trigger sync for this week
    if (!shoppingList) {
      // Run sync logic inline for this specific week
      const course = await prisma.courseProduct.findUnique({
        where: { id: params.courseId }
      });
      
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      // Create empty list for now
      shoppingList = await prisma.weeklyShoppingList.create({
        data: {
          courseId: params.courseId,
          week: weekNumber,
          items: {
            create: []
          }
        },
        include: {
          items: true
        }
      });
    }

    return NextResponse.json({
      shoppingList,
      weekNumber,
      itemCount: shoppingList.items.length,
      checkedCount: shoppingList.items.filter(item => item.isChecked).length
    });

  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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