import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { email, courseId, orderData } = await req.json();

    console.log(`🔗 Auto-linking course ${courseId} for ${email}`);

    // Hitta befintlig användare med samma e-post
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { purchases: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Användare hittades inte' },
        { status: 404 }
      );
    }

    // Kontrollera om användaren redan har denna kurs
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: existingUser.id,
          courseId: courseId
        }
      }
    });

    if (existingPurchase) {
      return NextResponse.json({
        message: 'Användaren har redan denna kurs',
        user: existingUser,
        purchase: existingPurchase
      });
    }

    // Skapa ny purchase för befintlig användare
    const newPurchase = await prisma.purchase.create({
      data: {
        userId: existingUser.id,
        courseId: courseId,
        amount: orderData.amount || 1497,
        status: 'completed',
        accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 år
      }
    });

    // Skapa order-post för spårning
    const order = await prisma.order.create({
      data: {
        userId: existingUser.id,
        orderNumber: `AUTO-${Date.now()}`,
        totalAmount: orderData.amount || 1497,
        status: 'COMPLETED',
        items: {
          create: [{
            courseId: courseId,
            name: 'Course access',
            type: 'course',
            quantity: 1,
            price: orderData.amount || 1497
          }]
        }
      }
    });

    console.log(`✅ Auto-linked course ${courseId} to existing user ${email}`);

    return NextResponse.json({
      message: 'Kurs automatiskt kopplad till befintligt konto',
      user: existingUser,
      purchase: newPurchase,
      order: order
    });

  } catch (error) {
    console.error('Error auto-linking course:', error);
    return NextResponse.json(
      { error: 'Fel vid automatisk kontokoppling' },
      { status: 500 }
    );
  }
}
