import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { getCourseEffectivePrice } from '@/app/lib/course-pricing';

export const dynamic = 'force-dynamic';

// Admin endpoint: grant a course to an existing user by email
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { email, productName, amount } = await req.json();
    if (!email || !productName) {
      return NextResponse.json({ error: 'email och productName krävs' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Användare hittas inte' }, { status: 404 });

    const product = await prisma.courseProduct.findFirst({ where: { name: productName } });
    if (!product) return NextResponse.json({ error: 'CourseProduct saknas' }, { status: 404 });

    // Check existing
    const existing = await prisma.purchase.findUnique({ where: { userId_courseId: { userId: user.id, courseId: product.id } } });
    if (existing) return NextResponse.json({ message: 'Kurs finns redan på kontot', purchase: existing });

    const price = typeof amount === 'number' ? amount : getCourseEffectivePrice(product);

    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: product.id,
        amount: price,
        status: 'completed',
        accessExpiresAt: new Date(Date.now() + 365*24*60*60*1000)
      }
    });

    await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: `ADMIN-${Date.now()}`,
        totalAmount: price,
        status: 'COMPLETED',
        items: { create: [{ courseId: product.id, name: product.name, price, quantity: 1, type: 'course' }] }
      }
    });

    return NextResponse.json({ ok: true, purchase });
  } catch (error) {
    console.error('grant-course error:', error);
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 });
  }
}


