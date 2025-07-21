import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // @ts-expect-error rawMaterial model will exist after prisma generate
    const materials = await prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error fetching raw materials', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 