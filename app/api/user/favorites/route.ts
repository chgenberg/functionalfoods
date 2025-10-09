import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

function getUserIdFromToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return (decoded as any).userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      orderBy: { addedAt: 'asc' }
    });
    return NextResponse.json({ favorites });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, recipeLink, courseType, weekNumber, dayName, mealType } = body || {};
    if (!name || !courseType || !weekNumber || !dayName || !mealType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Idempotent: do not duplicate the same favorite
    const exists = await prisma.userFavorite.findFirst({
      where: { userId, name, courseType, weekNumber, dayName, mealType }
    });
    if (exists) return NextResponse.json({ favorite: exists, created: false });

    const favorite = await prisma.userFavorite.create({
      data: { userId, name, recipeLink, courseType, weekNumber, dayName, mealType }
    });
    return NextResponse.json({ favorite, created: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const courseType = searchParams.get('courseType');
    const weekNumber = Number(searchParams.get('weekNumber'));
    const dayName = searchParams.get('dayName');
    const mealType = searchParams.get('mealType');

    if (!name || !courseType || !weekNumber || !dayName || !mealType) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    await prisma.userFavorite.deleteMany({
      where: { userId, name, courseType, weekNumber, dayName, mealType }
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}


