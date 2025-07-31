import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ materials: [] }, { status: 200 });
    }

    const materials = await prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error fetching raw materials', error);
    return NextResponse.json({ materials: [] }, { status: 200 });
  }
} 