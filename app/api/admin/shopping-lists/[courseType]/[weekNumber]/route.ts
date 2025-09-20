import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Verify admin access
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    // Check if user is admin (you might need to fetch user from DB to verify role)
    return decoded.userId && decoded.role === 'ADMIN';
  } catch {
    return false;
  }
}

// GET curated shopping list
export async function GET(
  request: NextRequest,
  { params }: { params: { courseType: string; weekNumber: string } }
) {
  try {
    const { courseType, weekNumber } = params;
    
    // Check if curated list exists
    const curatedPath = path.join(
      process.cwd(), 
      'app', 
      'data', 
      'shoppingLists', 
      `curated-${courseType}-week${weekNumber}.json`
    );
    
    if (fs.existsSync(curatedPath)) {
      const data = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Curated list not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error reading curated list:', error);
    return NextResponse.json({ error: 'Failed to read shopping list' }, { status: 500 });
  }
}

// POST save curated shopping list
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

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items format' }, { status: 400 });
    }

    // Ensure directory exists
    const shoppingListsDir = path.join(process.cwd(), 'app', 'data', 'shoppingLists');
    if (!fs.existsSync(shoppingListsDir)) {
      fs.mkdirSync(shoppingListsDir, { recursive: true });
    }

    // Save curated list
    const curatedPath = path.join(
      shoppingListsDir,
      `curated-${courseType}-week${weekNumber}.json`
    );

    const data = {
      week: parseInt(weekNumber),
      courseType,
      items,
      lastModified: new Date().toISOString(),
      source: 'admin-curated'
    };

    fs.writeFileSync(curatedPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Shopping list saved successfully' 
    });
  } catch (error) {
    console.error('Error saving curated list:', error);
    return NextResponse.json({ error: 'Failed to save shopping list' }, { status: 500 });
  }
}

// DELETE curated shopping list (revert to generated)
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
    
    const curatedPath = path.join(
      process.cwd(), 
      'app', 
      'data', 
      'shoppingLists', 
      `curated-${courseType}-week${weekNumber}.json`
    );
    
    if (fs.existsSync(curatedPath)) {
      fs.unlinkSync(curatedPath);
      return NextResponse.json({ 
        success: true, 
        message: 'Curated list deleted, will use generated list' 
      });
    } else {
      return NextResponse.json({ error: 'Curated list not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting curated list:', error);
    return NextResponse.json({ error: 'Failed to delete shopping list' }, { status: 500 });
  }
}
