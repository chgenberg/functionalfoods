import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const week = searchParams.get('week');

    if (!courseId || !week) {
      return NextResponse.json(
        { error: 'courseId and week are required' },
        { status: 400 }
      );
    }

    const weekNumber = parseInt(week);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 6) {
      return NextResponse.json(
        { error: 'week must be a number between 1 and 6' },
        { status: 400 }
      );
    }

    // Get the shopping list for this course and week
    const shoppingList = await prisma.weeklyShoppingList.findUnique({
      where: {
        courseId_week: {
          courseId,
          week: weekNumber
        }
      },
      include: {
        items: true
      }
    });

    if (!shoppingList) {
      return NextResponse.json({ items: [] });
    }

    // Transform the data to include categories
    const categorizedItems = shoppingList.items.map(item => ({
      id: item.id,
      ingredient: item.ingredient,
      isChecked: item.isChecked,
      category: categorizeIngredient(item.ingredient)
    }));

    return NextResponse.json({ items: categorizedItems });

  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const week = searchParams.get('week');
    
    const body = await request.json();
    const { itemId, isChecked } = body;

    if (!courseId || !week || !itemId || typeof isChecked !== 'boolean') {
      return NextResponse.json(
        { error: 'courseId, week, itemId, and isChecked are required' },
        { status: 400 }
      );
    }

    // Update the shopping list item
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { isChecked }
    });

    return NextResponse.json({ success: true, item: updatedItem });

  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function categorizeIngredient(ingredient: string): string {
  const lowercaseIngredient = ingredient.toLowerCase();
  
  // Protein category
  if (lowercaseIngredient.includes('kyckling') || 
      lowercaseIngredient.includes('fisk') || 
      lowercaseIngredient.includes('lax') || 
      lowercaseIngredient.includes('torsk') || 
      lowercaseIngredient.includes('kött') || 
      lowercaseIngredient.includes('fläsk') || 
      lowercaseIngredient.includes('biff') || 
      lowercaseIngredient.includes('lamm') || 
      lowercaseIngredient.includes('kalkon') ||
      lowercaseIngredient.includes('scampi') ||
      lowercaseIngredient.includes('tonfisk')) {
    return 'Protein';
  }
  
  // Mejeri & Ägg category
  if (lowercaseIngredient.includes('mjölk') || 
      lowercaseIngredient.includes('grädde') || 
      lowercaseIngredient.includes('yoghurt') || 
      lowercaseIngredient.includes('keso') || 
      lowercaseIngredient.includes('ost') || 
      lowercaseIngredient.includes('ägg') || 
      lowercaseIngredient.includes('smör') ||
      lowercaseIngredient.includes('crème') ||
      lowercaseIngredient.includes('fetaost') ||
      lowercaseIngredient.includes('mozzarella') ||
      lowercaseIngredient.includes('halloumi')) {
    return 'Mejeri & Ägg';
  }
  
  // Grönsaker & Frukt category
  if (lowercaseIngredient.includes('tomat') || 
      lowercaseIngredient.includes('lök') || 
      lowercaseIngredient.includes('vitlök') || 
      lowercaseIngredient.includes('morot') || 
      lowercaseIngredient.includes('potatis') || 
      lowercaseIngredient.includes('paprika') || 
      lowercaseIngredient.includes('gurka') || 
      lowercaseIngredient.includes('sallad') || 
      lowercaseIngredient.includes('spenat') || 
      lowercaseIngredient.includes('broccoli') || 
      lowercaseIngredient.includes('blomkål') || 
      lowercaseIngredient.includes('äpple') || 
      lowercaseIngredient.includes('banan') || 
      lowercaseIngredient.includes('apelsin') || 
      lowercaseIngredient.includes('citron') || 
      lowercaseIngredient.includes('avokado') ||
      lowercaseIngredient.includes('squash') ||
      lowercaseIngredient.includes('zucchini') ||
      lowercaseIngredient.includes('aubergine') ||
      lowercaseIngredient.includes('champinjon') ||
      lowercaseIngredient.includes('fänkål') ||
      lowercaseIngredient.includes('grapefrukt') ||
      lowercaseIngredient.includes('mango') ||
      lowercaseIngredient.includes('kiwi') ||
      lowercaseIngredient.includes('hallon') ||
      lowercaseIngredient.includes('jordgubb') ||
      lowercaseIngredient.includes('blåbär')) {
    return 'Grönsaker & Frukt';
  }
  
  // Skafferi category
  if (lowercaseIngredient.includes('mjöl') || 
      lowercaseIngredient.includes('havre') || 
      lowercaseIngredient.includes('ris') || 
      lowercaseIngredient.includes('pasta') || 
      lowercaseIngredient.includes('nudel') || 
      lowercaseIngredient.includes('bröd') || 
      lowercaseIngredient.includes('quinoa') || 
      lowercaseIngredient.includes('linser') || 
      lowercaseIngredient.includes('olivolja') || 
      lowercaseIngredient.includes('olja') || 
      lowercaseIngredient.includes('vinäger') || 
      lowercaseIngredient.includes('salt') || 
      lowercaseIngredient.includes('peppar') || 
      lowercaseIngredient.includes('krydda') ||
      lowercaseIngredient.includes('bovete') ||
      lowercaseIngredient.includes('granola') ||
      lowercaseIngredient.includes('müsli') ||
      lowercaseIngredient.includes('chiafr') ||
      lowercaseIngredient.includes('kokos') ||
      lowercaseIngredient.includes('mandel') ||
      lowercaseIngredient.includes('valnöt') ||
      lowercaseIngredient.includes('pistagenöt')) {
    return 'Skafferi';
  }
  
  // Default to Övrigt
  return 'Övrigt';
} 