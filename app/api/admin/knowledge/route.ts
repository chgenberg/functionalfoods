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
  const slug = searchParams.get('slug') || undefined;

  const docs = await prisma.knowledgeDocument.findMany({
    where: {
      ...(course ? { course } : {}),
      ...(slug ? { slug } : {})
    },
    orderBy: [{ course: 'asc' }, { order: 'asc' }]
  });
  return NextResponse.json({ documents: docs }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const body = await req.json();
  const { title, slug, content, headerImage, relatedImages, keyTakeaways, readTime, course, courses, order, weekNumber } = body;

  const createData: any = {
    title,
    slug,
    content,
    headerImage: headerImage || null,
    relatedImages: relatedImages || null,
    keyTakeaways: keyTakeaways || null,
    readTime: readTime || 5,
    course: course || (Array.isArray(courses) && courses.length === 1 ? courses[0] : 'basic'),
    order: order ?? 0,
    weekNumber: weekNumber || null
  };
  if (Array.isArray(courses) && courses.length > 0) {
    createData.courses = courses;
  } else if (course) {
    createData.courses = [course];
  }

  const doc = await (prisma as any).knowledgeDocument.create({
    data: createData
  });
  return NextResponse.json({ document: doc });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'id krävs' }, { status: 400 });

  // Normalize single course vs multi courses
  const updateData: any = { ...rest };
  if (rest.courses && Array.isArray(rest.courses)) {
    updateData.courses = rest.courses;
    if (!rest.course && rest.courses.length === 1) {
      updateData.course = rest.courses[0];
    }
  }

  const doc = await (prisma as any).knowledgeDocument.update({
    where: { id },
    data: updateData
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