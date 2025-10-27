import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check what exists in the database for hormone course
    const lists = await prisma.weeklyShoppingList.findMany({
      where: {
        courseType: 'hormonell-balans'
      },
      select: {
        id: true,
        courseType: true,
        weekNumber: true,
        items: true
      }
    });

    console.log('📊 Debug: Found shopping lists:', lists);

    return NextResponse.json({
      ok: true,
      count: lists.length,
      lists: lists.map(l => ({
        courseType: l.courseType,
        weekNumber: l.weekNumber,
        itemCount: Array.isArray(l.items) ? l.items.length : 0,
        firstItem: Array.isArray(l.items) && l.items.length > 0 ? l.items[0] : null
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
