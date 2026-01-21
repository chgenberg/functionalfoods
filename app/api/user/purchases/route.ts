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

    // Debug logging
    console.log('🔍 API Debug - User ID from JWT:', decoded.userId);
    
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
    
    console.log('🔍 API Debug - Purchases found:', purchases.length);
    console.log('🔍 API Debug - Course names:', purchases.map(p => p.course.name));

    // Beräkna 1 års åtkomstfönster
    const now = new Date();
    const enriched = purchases.map(p => {
      const accessExpiresAt = new Date(p.createdAt);
      accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1);
      const isActive = now < accessExpiresAt;
      return { ...p, accessExpiresAt, isActive };
    });

    // Include debug info in response temporarily
    return NextResponse.json({ 
      purchases: enriched,
      _debug: {
        userId: decoded.userId,
        courseNames: purchases.map(p => p.course.name)
      }
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av köp' },
      { status: 500 }
    );
  }
} 