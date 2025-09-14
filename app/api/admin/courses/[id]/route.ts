import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminAuth(request as any);
    if (auth instanceof NextResponse) return auth;

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminAuth(request as any);
    if (auth instanceof NextResponse) return auth;

    const data = await request.json();

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        duration: data.duration,
        // Nya fält för uppdatering
        price: data.price,
        objectives: data.objectives,
        targetAudience: data.targetAudience,
        coverImage: data.coverImage,
        welcomeMessage: data.welcomeMessage,
        introVideoUrl: data.introVideoUrl,
        enableCommunity: data.enableCommunity,
        communityDescription: data.communityDescription,
        weeks: data.weeks,
        materials: data.materials,
        downloads: data.downloads
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminAuth(request as any);
    if (auth instanceof NextResponse) return auth;

    await prisma.course.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
} 