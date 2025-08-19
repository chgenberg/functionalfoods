import { NextRequest, NextResponse } from 'next/server';
import { getShoppingListForWeek } from '@/scripts/generateShoppingLists';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseType: string; week: string } }
) {
  try {
    const { courseType, week } = params;
    const weekNumber = parseInt(week);
    
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
      return NextResponse.json(
        { error: 'Invalid week number' },
        { status: 400 }
      );
    }
    
    if (courseType !== 'basics' && courseType !== 'flow') {
      return NextResponse.json(
        { error: 'Invalid course type' },
        { status: 400 }
      );
    }
    
    // Try to load pre-generated shopping list first
    try {
      const shoppingList = await import(`@/app/data/shoppingLists/${courseType}-week${weekNumber}.json`);
      return NextResponse.json(shoppingList);
    } catch {
      // If pre-generated list doesn't exist, generate on demand
      const shoppingList = await getShoppingListForWeek(weekNumber, courseType);
      return NextResponse.json(shoppingList);
    }
    
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  }
} 