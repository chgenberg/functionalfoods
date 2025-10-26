import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course');

    if (!course) {
      return NextResponse.json({ error: 'Course parameter required' }, { status: 400 });
    }

    // For now, return empty array as we haven't created KnowledgeDocument model yet
    // This can be extended when we add the model to Prisma schema
    return NextResponse.json({ documents: [] });
  } catch (error) {
    console.error('Error fetching knowledge documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

