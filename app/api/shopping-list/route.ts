import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kategorisera ingrediens baserat på namn
function categorizeIngredient(ingredientName: string): string {
  const lower = ingredientName.toLowerCase();
  
  // Frukt & Grönt
  if (/tomat|gurka|paprika|lök|vitlök|morot|broccoli|spenat|sallad|ingefära|citron|lime|mango|avokado|äpple|banan|jordgubb|blåbär|hallon|fänkål|palsternacka|purjolök|blomkål|squash|rädis|selleri|kål|champinjon|svamp|chili|persilja|basilika|dill|koriander|mynta|gräslök|rödbeta|sockerärtor|fikon|clementin|kiwi|persika|granatäppel|brysselkål/.test(lower)) {
    return 'Grönsaker & Frukt';
  }
  
  // Kött & Fisk (Protein)
  if (/kyckling|lax|torsk|nötfärs|köttfärs|högrev|lövbiff|skinka|bacon|korv|scampi|tonfisk|mortadella|falukorv|räkor|fisk|kött|fläsk|lamm|kalkon/.test(lower)) {
    return 'Protein';
  }
  
  // Mejeri & Ägg
  if (/ägg|yoghurt|mjölk|grädde|smör|ost|fetaost|mozzarella|halloumi|parmesan|cheddar|gorgonzola|getost|keso|creme fraiche|filmjölk|kvarg/.test(lower)) {
    return 'Mejeri & Ägg';
  }
  
  // Skafferi (Torrvaror)
  if (/mjöl|ris|quinoa|nudlar|pasta|spirelli|linser|kikärtor|bönor|nötter|mandel|valnöt|cashew|jordnöt|pumpafrö|solrosfrö|sesamfrö|linfrö|havregryn|kokos|choklad|agave|honung|sirap|bakpulver|bikarbonat|fiberhusk|ströbröd|granola|tofu|bröd|olja|olivolja/.test(lower)) {
    return 'Skafferi';
  }
  
  return 'Övrigt';
}

// GET shopping list - supports query params: courseId and week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const week = searchParams.get('week');
    
    if (!courseId || !week) {
      return NextResponse.json({ 
        error: 'Missing required parameters: courseId and week' 
      }, { status: 400 });
    }
    
    const weekNum = parseInt(week);
    if (isNaN(weekNum)) {
      return NextResponse.json({ error: 'Invalid week number' }, { status: 400 });
    }
    
    // Map courseId to course name for database lookup
    const courseNameMap: Record<string, string> = {
      'functional-basics': 'Basic',
      'functional-flow': 'Flow',
      'functional-energy': 'Energy',
      'hormonell-balans': 'Hormonell Balans',
      'basics': 'Basic',
      'flow': 'Flow',
      'energy': 'Energy',
      'hormone': 'Hormonell Balans'
    };
    
    const courseName = courseNameMap[courseId];
    if (!courseName) {
      return NextResponse.json({ 
        error: 'Invalid courseId',
        validCourseIds: Object.keys(courseNameMap)
      }, { status: 400 });
    }
    
    // Find the course product
    const course = await prisma.courseProduct.findFirst({
      where: { name: { contains: courseName, mode: 'insensitive' } }
    });
    
    if (!course) {
      return NextResponse.json({ 
        error: 'Course not found in database',
        courseName 
      }, { status: 404 });
    }
    
    // Find the shopping list for this course and week
    const shoppingList = await prisma.weeklyShoppingList.findUnique({
      where: {
        courseId_week: { courseId: course.id, week: weekNum }
      },
      include: { items: true }
    });
    
    if (!shoppingList || !shoppingList.items || shoppingList.items.length === 0) {
      // Return empty list instead of error - allows UI to show "no items" message
      return NextResponse.json({
        week: weekNum,
        courseId,
        items: [],
        source: 'database',
        message: 'No shopping list found for this week'
      });
    }
    
    // Transform items to frontend format
    const items = shoppingList.items.map((item: any) => {
      // Parse "amount unit name" format
      const ingredientStr = item.ingredient || '';
      const parts = ingredientStr.split(' ');
      const amount = parts[0] || '1';
      const unit = parts[1] || 'st';
      const name = parts.slice(2).join(' ') || ingredientStr;
      
      return {
        id: item.id,
        name: name || ingredientStr,
        amount: amount,
        unit: unit,
        category: categorizeIngredient(name || ingredientStr),
        checked: false
      };
    });
    
    return NextResponse.json({
      week: weekNum,
      courseId,
      items,
      source: 'database',
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch shopping list' 
    }, { status: 500 });
  }
}

