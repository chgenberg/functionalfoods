import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // Check if CourseProduct already exists
    let product = await prisma.courseProduct.findFirst({
      where: { name: 'Hormonell Balans' }
    });

    if (!product) {
      // Create the CourseProduct
      product = await prisma.courseProduct.create({
        data: {
          name: 'Hormonell Balans',
          description: 'Hormonell Balans - 6 veckors grundkurs familjevänlig',
          price: 297,
          basePrice: 297,
          content: {},
          features: {}
        }
      });
      console.log('✅ Created CourseProduct:', product);
    } else {
      console.log('✅ CourseProduct already exists:', product);
    }

    return NextResponse.json({
      ok: true,
      message: 'CourseProduct ready',
      courseProduct: {
        id: product.id,
        name: product.name
      }
    });
  } catch (error) {
    console.error('Error creating course product:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
