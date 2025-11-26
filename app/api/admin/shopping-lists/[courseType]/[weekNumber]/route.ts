import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/app/lib/database';
import jwt from 'jsonwebtoken';

// Verify admin access - checks both cookie and Authorization header
async function verifyAdmin(request: NextRequest) {
  let token: string | null = null;
  
  // First try to get token from HTTP-only cookie (primary method for admin)
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('adminToken');
  if (adminCookie?.value) {
    token = adminCookie.value;
  }
  
  // Fallback: try Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    return false;
  }

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
    
    // Categorize ingredient based on name
    const categorizeIngredient = (ingredientName: string): string => {
      const lower = ingredientName.toLowerCase();
      
      // Frukt & Grönt
      if (/tomat|gurka|paprika|lök|vitlök|morot|broccoli|spenat|sallad|ingefära|citron|lime|mango|avokado|äpple|banan|jordgubb|blåbär|hallon|fänkål|palsternacka|purjolök|blomkål|squash|rädis|selleri|kål|champinjon|svamp|chili|persilja|basilika|dill|koriander|mynta|gräslök|rödbeta|sockerärtor|fikon|clementin|kiwi|persika|granatäppel|brysselkål/.test(lower)) {
        return 'Frukt & Grönt';
      }
      
      // Kött & Fisk
      if (/kyckling|lax|torsk|nötfärs|köttfärs|högrev|lövbiff|skinka|bacon|korv|scampi|tonfisk|mortadella|falukorv/.test(lower)) {
        return 'Kött & Fisk';
      }
      
      // Mejeri & Ägg
      if (/ägg|yoghurt|mjölk|grädde|smör|ost|fetaost|mozzarella|halloumi|parmesan|cheddar|gorgonzola|getost|keso|creme fraiche|filmjölk/.test(lower)) {
        return 'Mejeri & Ägg';
      }
      
      // Torrvaror (pasta, mjöl, ris, nötter, etc)
      if (/mjöl|ris|quinoa|nudlar|pasta|spirelli|linser|kikärtor|bönor|nötter|mandel|valnöt|cashew|jordnöt|pumpafrö|solrosfrö|sesamfrö|linfrö|havregryn|kokos|choklad|agave|honung|sirap|bakpulver|bikarbonat|fiberhusk|ströbröd|granola|tofu/.test(lower)) {
        return 'Torrvaror';
      }
      
      // Kryddor & Såser
      if (/curry|chili|paprika|kanel|kardemumma|kummin|oregano|timjan|rosmarin|vanilj|saffran|krydda|buljon|soja|teriyaki|pesto|majonnäs|senap|vinäger|tabasco|sriracha|sambal|ketjap|sweet chili|mango chutney/.test(lower)) {
        return 'Kryddor & Såser';
      }
      
      return 'Övrigt';
    };
    
    // Transform to admin format
    const items = list.items.map(item => {
      const parts = item.ingredient.split(' ');
      const amount = parts[0] || '1';
      const unit = parts[1] || 'st';
      const name = parts.slice(2).join(' ') || item.ingredient;
      
      return {
        id: item.id,
        ingredient: item.ingredient, 
        name,
        amount,
        unit,
        category: categorizeIngredient(item.ingredient)
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