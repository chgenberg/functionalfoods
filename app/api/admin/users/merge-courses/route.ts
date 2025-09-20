import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-post krävs' },
        { status: 400 }
      );
    }

    // Hitta alla användare med samma e-post
    const users = await prisma.user.findMany({
      where: { email },
      include: {
        purchases: {
          include: {
            course: true
          }
        },
        orders: true,
        courseReviews: true,
        goals: true,
        mealProgress: true,
        notifications: true
      }
    });

    if (users.length <= 1) {
      return NextResponse.json(
        { message: 'Endast en användare hittad med denna e-post' },
        { status: 200 }
      );
    }

    console.log(`🔄 Slår ihop ${users.length} användare för ${email}`);

    // Hitta huvudanvändaren (den med flest köp eller senaste)
    const mainUser = users.reduce((main, current) => 
      current.purchases.length > main.purchases.length || 
      (current.purchases.length === main.purchases.length && current.createdAt > main.createdAt)
        ? current 
        : main
    );

    const otherUsers = users.filter(u => u.id !== mainUser.id);

    // Flytta alla köp till huvudanvändaren
    for (const user of otherUsers) {
      // Flytta purchases (undvik duplikater)
      for (const purchase of user.purchases) {
        const existingPurchase = await prisma.purchase.findUnique({
          where: {
            userId_courseId: {
              userId: mainUser.id,
              courseId: purchase.courseId
            }
          }
        });

        if (!existingPurchase) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { userId: mainUser.id }
          });
          console.log(`📚 Flyttade kurs ${purchase.courseId} till huvudkonto`);
        } else {
          // Ta bort duplikat
          await prisma.purchase.delete({ where: { id: purchase.id } });
          console.log(`🗑️ Tog bort duplikat av ${purchase.courseId}`);
        }
      }

      // Flytta orders
      await prisma.order.updateMany({
        where: { userId: user.id },
        data: { userId: mainUser.id }
      });

      // Flytta recensioner
      await prisma.courseReview.updateMany({
        where: { userId: user.id },
        data: { userId: mainUser.id }
      });

      // Flytta mål och progress
      await prisma.goal.updateMany({
        where: { userId: user.id },
        data: { userId: mainUser.id }
      });

      await prisma.mealProgress.updateMany({
        where: { userId: user.id },
        data: { userId: mainUser.id }
      });

      // Flytta notifikationer
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { userId: mainUser.id }
      });

      // Ta bort den tomma användaren
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`🗑️ Tog bort duplikatanvändare ${user.id}`);
    }

    // Hämta uppdaterad huvudanvändare
    const updatedUser = await prisma.user.findUnique({
      where: { id: mainUser.id },
      include: {
        purchases: {
          include: { course: true }
        }
      }
    });

    console.log(`✅ Sammanslagning slutförd för ${email}`);

    return NextResponse.json({
      message: `Framgångsrikt slagit ihop ${users.length} konton till ett`,
      user: {
        email: updatedUser?.email,
        name: updatedUser?.name,
        totalCourses: updatedUser?.purchases.length || 0,
        courses: updatedUser?.purchases.map(p => p.course.name) || []
      }
    });

  } catch (error) {
    console.error('Error merging user courses:', error);
    return NextResponse.json(
      { error: 'Fel vid sammanslagning av kurser' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
