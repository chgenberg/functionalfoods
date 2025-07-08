import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

    // Hämta användarens första kursköp för Functional Basics
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: decoded.userId,
        status: 'completed',
        course: {
          name: 'Functional Basics'
        }
      },
      include: {
        course: true
      },
      orderBy: {
        createdAt: 'asc' // Första köpet
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Ingen kurs hittades' },
        { status: 404 }
      );
    }

    // Returnera köpdatumet som kursstartdatum
    return NextResponse.json({
      courseStartDate: purchase.createdAt,
      courseName: purchase.course.name,
      purchaseId: purchase.id
    });

  } catch (error) {
    console.error('Error fetching course start date:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av kursstartdatum' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 