import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const name = 'Brödboken (E-bok)';

    let product = await prisma.courseProduct.findFirst({
      where: { name }
    });

    if (!product) {
      product = await prisma.courseProduct.create({
        data: {
          name,
          description: 'Brödboken (E-bok)',
          price: 199,         // EXKL moms (som kurserna idag)
          basePrice: 199,
          content: {},
          features: {}
        }
      });
      console.log('✅ Created CourseProduct (ebook):', product);
    } else {
      console.log('ℹ️ CourseProduct already exists (ebook):', product);
    }

    return NextResponse.json({ ok: true, id: product.id, name: product.name });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
