import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Hämta token från headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Ingen giltig token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verifiera token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Ogiltig token' },
        { status: 401 }
      );
    }

    // Hämta användarens köp
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: decoded.userId,
        status: 'completed'
      },
      include: {
        course: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av köp' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 