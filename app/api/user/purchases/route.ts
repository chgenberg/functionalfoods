import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import jwt from 'jsonwebtoken';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    // Beräkna 1 års åtkomstfönster
    const now = new Date();
    const enriched = purchases.map(p => {
      const accessExpiresAt = new Date(p.createdAt);
      accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1);
      const isActive = now < accessExpiresAt;
      return { ...p, accessExpiresAt, isActive };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av köp' },
      { status: 500 }
    );
  }
} 