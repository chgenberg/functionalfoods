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
    
    // Sort materials with "Äpple" at the end
    const sortedMaterials = materials.sort((a, b) => {
      if (a.name.toLowerCase() === 'äpple') return 1;
      if (b.name.toLowerCase() === 'äpple') return -1;
      return a.name.localeCompare(b.name, 'sv');
    });
    
    return NextResponse.json({ materials: sortedMaterials });
  } catch (error) {
    console.error('Error fetching raw materials', error);
    return NextResponse.json({ materials: [] }, { status: 200 });
  }
} 