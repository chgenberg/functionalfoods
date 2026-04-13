import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const before = await prisma.blogPost.findUnique({
      where: { slug: 'grot' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const updated = await prisma.blogPost.update({
      where: { slug: 'grot' },
      data: {
        coverImage: '/Ariklar_bilder_optimized/grot.webp',
        author: {
          update: {
            name: 'Ulrika Davidsson',
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      before,
      updated,
    });
  } catch (error) {
    console.error('Fix grot image error:', error);

    return NextResponse.json(
      {
        error: 'Update failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
