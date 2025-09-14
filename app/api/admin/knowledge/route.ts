import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const { searchParams } = new URL(req.url);
  const course = searchParams.get('course') || undefined;

  const docs = await prisma.knowledgeDocument.findMany({
    where: course ? { course } : undefined,
    orderBy: [{ course: 'asc' }, { order: 'asc' }]
  });
  return NextResponse.json({ documents: docs }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const body = await req.json();
  const { title, slug, content, headerImage, relatedImages, keyTakeaways, readTime, course, order, weekNumber } = body;

  const doc = await prisma.knowledgeDocument.create({
    data: {
      title,
      slug,
      content,
      headerImage: headerImage || null,
      relatedImages: relatedImages || null,
      keyTakeaways: keyTakeaways || null,
      readTime: readTime || 5,
      course,
      order: order ?? 0,
      weekNumber: weekNumber || null
    }
  });
  return NextResponse.json({ document: doc });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'id krävs' }, { status: 400 });

  const doc = await prisma.knowledgeDocument.update({
    where: { id },
    data: {
      ...rest,
    }
  });
  return NextResponse.json({ document: doc });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id krävs' }, { status: 400 });

  await prisma.knowledgeDocument.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} 