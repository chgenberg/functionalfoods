import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { PaymentService, PaymentRequest } from '../../lib/payment';

const prisma = new PrismaClient();
const paymentService = new PaymentService();

export async function POST(request: Request) {
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

    const { items, paymentMethod } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Inga produkter i beställningen' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Ingen betalningsmetod vald' },
        { status: 400 }
      );
    }

    // Hämta användare
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Användaren hittades inte' },
        { status: 404 }
      );
    }

    // Validera och hämta kurser
    const courseIds = items
      .filter(item => item.type === 'course')
      .map(item => item.name);

    const courses = await prisma.courseProduct.findMany({
      where: {
        name: { in: courseIds }
      }
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: 'En eller flera kurser hittades inte' },
        { status: 404 }
      );
    }

    // Kontrollera om användaren redan äger någon av kurserna
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        userId: decoded.userId,
        courseId: { in: courses.map(c => c.id) },
        status: 'completed'
      }
    });

    if (existingPurchases.length > 0) {
      const ownedCourses = existingPurchases.map(p => 
        courses.find(c => c.id === p.courseId)?.name
      ).filter(Boolean);
      
      return NextResponse.json(
        { error: `Du äger redan följande kurser: ${ownedCourses.join(', ')}` },
        { status: 400 }
      );
    }

    // Beräkna totalsumma
    const totalAmount = items.reduce((sum, item) => {
      const course = courses.find(c => c.name === item.name);
      return sum + (course ? course.price * item.quantity : 0);
    }, 0);

    // Generera unikt ordernummer
    const orderNumber = `UFF-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Skapa order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: decoded.userId,
        status: 'PENDING',
        totalAmount,
        currency: 'SEK',
        items: {
          create: items.map(item => {
            const course = courses.find(c => c.name === item.name);
            return {
              courseId: course?.id,
              name: item.name,
              price: course?.price || 0,
              quantity: item.quantity,
              type: item.type
            };
          })
        }
      },
      include: {
        items: true
      }
    });

    // Skapa payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod,
        status: 'PENDING',
        amount: totalAmount,
        currency: 'SEK'
      }
    });

    // Processera betalning
    const paymentRequest: PaymentRequest = {
      amount: totalAmount,
      currency: 'SEK',
      items: items,
      customer: {
        userId: decoded.userId,
        email: user.email,
        name: user.name || undefined
      },
      paymentMethod,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`
    };

    const paymentResult = await paymentService.processPayment(paymentRequest);

    // Uppdatera payment med resultat
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentResult.status === 'completed' ? 'COMPLETED' :
                paymentResult.status === 'failed' ? 'FAILED' :
                paymentResult.status === 'cancelled' ? 'CANCELLED' : 'PROCESSING',
        externalId: paymentResult.paymentId,
        gatewayResponse: paymentResult,
        processedAt: paymentResult.success ? new Date() : null,
        failureReason: paymentResult.error
      }
    });

    if (paymentResult.success && paymentResult.status === 'completed') {
      // Uppdatera order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' }
      });

      // Skapa Purchase records för backward compatibility
      const purchases = [];
      for (const item of items) {
        if (item.type === 'course') {
          const course = courses.find(c => c.name === item.name);
          if (course) {
            const purchase = await prisma.purchase.create({
              data: {
                userId: decoded.userId,
                courseId: course.id,
                amount: course.price * item.quantity,
                status: 'completed',
                orderId: order.id
              },
              include: {
                course: true
              }
            });
            purchases.push(purchase);
          }
        }
      }

      // TODO: Skicka bekräftelse-email

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'COMPLETED',
          totalAmount
        },
        payment: {
          id: payment.id,
          status: 'COMPLETED',
          paymentId: paymentResult.paymentId
        },
        purchases,
        message: 'Köp genomfört framgångsrikt!'
      });

    } else if (paymentResult.redirectUrl) {
      // För betalningar som kräver redirect (Klarna, Stripe checkout etc.)
      return NextResponse.json({
        success: false,
        requiresRedirect: true,
        redirectUrl: paymentResult.redirectUrl,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'PENDING'
        },
        payment: {
          id: payment.id,
          status: 'PROCESSING'
        }
      });

    } else {
      // Betalning misslyckades
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' }
      });

      return NextResponse.json({
        success: false,
        error: paymentResult.error || 'Betalningen misslyckades',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'CANCELLED'
        }
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid köp' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 