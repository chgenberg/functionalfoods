import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET all course products (for admin dropdown)
export async function GET(req: NextRequest) {
  try {
    const courseProducts = await prisma.courseProduct.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        basePrice: true,
        salePrice: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(courseProducts);
  } catch (error) {
    console.error('Error fetching course products:', error);
    return NextResponse.json({ error: 'Failed to fetch course products' }, { status: 500 });
  }
}

