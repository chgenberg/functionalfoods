import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const settings = await prisma.courseProduct.findFirst({
      where: { name: 'Functional Flow' }
    });

    if (!settings) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: settings.name,
      description: settings.description || '',
      welcomeText: (settings as any).welcomeText || '',
      overviewVideoUrl: (settings as any).overviewVideoUrl || ''
    });
  } catch (error) {
    console.error('Error fetching course settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const body = await req.json();
    const { name, description, welcomeText, overviewVideoUrl } = body;

    const updated = await prisma.courseProduct.updateMany({
      where: { name: 'Functional Flow' },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(welcomeText !== undefined && { welcomeText: welcomeText as any }),
        ...(overviewVideoUrl !== undefined && { overviewVideoUrl: overviewVideoUrl as any })
      }
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating course settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
