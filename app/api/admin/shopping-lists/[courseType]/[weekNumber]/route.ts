import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import jwt from 'jsonwebtoken';

// Verify admin access
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    return decoded.userId && (decoded.role === 'ADMIN' || decoded.role === 'admin');
  } catch {
    return false;
  }
}

// GET shopping list from DB
export async function GET(
  request: NextRequest,
  { params }: { params: { courseType: string; weekNumber: string } }
) {
  try {
    const { courseType, weekNumber } = params;
    const weekNum = parseInt(weekNumber);
    
    // Find course
    const courseNameMap: Record<string, string> = {
      'basics': 'Basic',
      'flow': 'Flow', 
      'energy': 'Energy',
      'hormone': 'Hormonell Balans'
    };
    const courseName = courseNameMap[courseType];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course type' }, { status: 400 });
    }
    
    const course = await prisma.courseProduct.findFirst({
      where: { name: { contains: courseName, mode: 'insensitive' } }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Find shopping list
    const list = await prisma.weeklyShoppingList.findFirst({
      where: { courseId: course.id, week: weekNum },
      include: { items: true }
    });
    
    if (!list) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }
    
    // Transform to admin format
    const items = list.items.map(item => {
      const parts = item.ingredient.split(' ');
      const amount = parts[0] || '1';
      const unit = parts[1] || 'st';
      const name = parts.slice(2).join(' ') || item.ingredient;
      
      return {
        name,
        amount,
        unit,
        category: 'Övrigt' // Default category, could be enhanced
      };
    });
    
    return NextResponse.json({
      week: weekNum,
      courseType,
      items,
      source: 'database'
    });
  } catch (error) {
    console.error('Error reading shopping list from DB:', error);
    return NextResponse.json({ error: 'Failed to read shopping list' }, { status: 500 });
  }
}

// POST save shopping list to DB
export async function POST(
  request: NextRequest,
  { params }: { params: { courseType: string; weekNumber: string } }
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseType, weekNumber } = params;
    const { items } = await request.json();
    const weekNum = parseInt(weekNumber);

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items format' }, { status: 400 });
    }

    // Find course
    const courseNameMap: Record<string, string> = {
      'basics': 'Basic',
      'flow': 'Flow', 
      'energy': 'Energy',
      'hormone': 'Hormonell Balans'
    };
    const courseName = courseNameMap[courseType];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course type' }, { status: 400 });
    }
    
    const course = await prisma.courseProduct.findFirst({
      where: { name: { contains: courseName, mode: 'insensitive' } }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Find or create shopping list
    let list = await prisma.weeklyShoppingList.findFirst({
      where: { courseId: course.id, week: weekNum }
    });
    
    if (!list) {
      list = await prisma.weeklyShoppingList.create({
        data: { courseId: course.id, week: weekNum }
      });
    }

    // Delete existing items and create new ones
    await prisma.shoppingListItem.deleteMany({
      where: { listId: list.id }
    });

    // Transform admin format to DB format
    const dbItems = items.map(item => ({
      ingredient: `${item.amount} ${item.unit} ${item.name}`.trim(),
      listId: list.id
    }));

    // Create new items in chunks
    const chunkSize = 100;
    for (let i = 0; i < dbItems.length; i += chunkSize) {
      await prisma.shoppingListItem.createMany({
        data: dbItems.slice(i, i + chunkSize)
      });
    }

    // Update timestamp
    await prisma.weeklyShoppingList.update({
      where: { id: list.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Shopping list saved to database',
      itemCount: dbItems.length
    });
  } catch (error) {
    console.error('Error saving shopping list to DB:', error);
    return NextResponse.json({ error: 'Failed to save shopping list' }, { status: 500 });
  }
}

// DELETE shopping list from DB
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseType: string; weekNumber: string } }
) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseType, weekNumber } = params;
    const weekNum = parseInt(weekNumber);

    // Find course
    const courseNameMap: Record<string, string> = {
      'basics': 'Basic',
      'flow': 'Flow', 
      'energy': 'Energy',
      'hormone': 'Hormonell Balans'
    };
    const courseName = courseNameMap[courseType];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course type' }, { status: 400 });
    }
    
    const course = await prisma.courseProduct.findFirst({
      where: { name: { contains: courseName, mode: 'insensitive' } }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete shopping list and its items (cascade)
    const deleted = await prisma.weeklyShoppingList.deleteMany({
      where: { courseId: course.id, week: weekNum }
    });

    if (deleted.count > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Shopping list deleted from database' 
      });
    } else {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting shopping list from DB:', error);
    return NextResponse.json({ error: 'Failed to delete shopping list' }, { status: 500 });
  }
}