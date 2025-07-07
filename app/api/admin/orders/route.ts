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

    // Kontrollera att användaren är admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Otillräckliga behörigheter' },
        { status: 403 }
      );
    }

    // Hämta alla orders med relaterad data
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            course: {
              select: {
                name: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            externalId: true,
            processedAt: true,
            failureReason: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av beställningar' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT endpoint för att uppdatera order status (för framtida användning)
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Ingen giltig token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Ogiltig token' },
        { status: 401 }
      );
    }

    // Kontrollera admin behörighet
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Otillräckliga behörigheter' },
        { status: 403 }
      );
    }

    const { orderId, status, note } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID och status krävs' },
        { status: 400 }
      );
    }

    // Uppdatera order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true,
        payment: true
      }
    });

    // TODO: Skicka notification till kund om statusändring
    // TODO: Logga admin-åtgärd

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order ${updatedOrder.orderNumber} uppdaterad till ${status}`
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid uppdatering av beställning' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 