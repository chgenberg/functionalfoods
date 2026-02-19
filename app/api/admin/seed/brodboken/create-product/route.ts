import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // Best practice: använd ett "canonical" name som matchar cart-id via slugify
    // Om cart skickar id="brodboken" så vill vi att slugify(name) => "brodboken"
    const NAME = 'Brödboken';
    const DESCRIPTION = 'Brödboken (E-bok)';

    let product = await prisma.courseProduct.findFirst({
      where: { name: NAME }
    });

    if (!product) {
      product = await prisma.courseProduct.create({
        data: {
          name: NAME,
          description: DESCRIPTION,
          price: 188,      // EXKL moms (samma som kurser)
          basePrice: 188,  // EXKL moms
          // Om din modell har salePrice/saleStartsAt/saleEndsAt, sätt dem null här
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
      message: 'Brödboken ready',
      courseProduct: { id: product.id, name: product.name }
    });
  } catch (error) {
    console.error('Error creating Brödboken product:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
