import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const auth = await requireAdminAuth(request as any);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const level = searchParams.get('level');

    let where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (level && level !== 'all') {
      where.level = level;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminAuth(request as any);
    if (auth instanceof NextResponse) return auth;

    const data = await request.json();

    // Get the first admin user as the default author
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        level: data.level || 'Beginner',
        duration: data.duration || '4 weeks',
        progress: 0,
        userId: adminUser.id,
        // Nya fält
        price: data.price || 0,
        objectives: data.objectives || [],
        targetAudience: data.targetAudience,
        coverImage: data.coverImage,
        welcomeMessage: data.welcomeMessage,
        introVideoUrl: data.introVideoUrl,
        enableCommunity: data.enableCommunity || false,
        communityDescription: data.communityDescription,
        weeks: data.weeks || [],
        materials: data.materials || [],
        downloads: data.downloads || []
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 