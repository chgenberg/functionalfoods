import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer } = body;
    
    console.log('Svea checkout request:', { 
      itemCount: items?.length, 
      customerEmail: customer?.email 
    });

    // Temporary response while we debug
    return NextResponse.json({
      success: false,
      error: 'Svea checkout temporarily disabled for debugging',
      message: 'Please try again later'
    }, { status: 503 });

  } catch (error) {
    console.error('Svea checkout error:', error);
    return NextResponse.json(
      { error: 'Betalning kunde inte initieras. Försök igen.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
