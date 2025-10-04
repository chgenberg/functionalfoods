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

    // Skapa kursen
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

    // Skapa ett slug för kursen (används för meal plans etc)
    const courseSlug = data.title
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Automatiskt skapa veckostruktur (6 veckor som standard)
    const numberOfWeeks = parseInt(data.duration?.match(/\d+/)?.[0] || '6');
    
    for (let weekNum = 1; weekNum <= numberOfWeeks; weekNum++) {
      // Skapa CourseWeekMeta för varje vecka
      await prisma.courseWeekMeta.create({
        data: {
          course: courseSlug,
          weekNumber: weekNum,
          title: `Vecka ${weekNum}`,
          subtitle: `Välkommen till vecka ${weekNum}`,
          heroImage: data.coverImage || null,
          videoUrl: null,
        }
      });

      // Skapa tom MealPlanWeek för varje vecka
      await prisma.mealPlanWeek.create({
        data: {
          course: courseSlug,
          weekNumber: weekNum,
          days: {
            Måndag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null },
            Tisdag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null },
            Onsdag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null },
            Torsdag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null },
            Fredag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null },
            Lördag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null },
            Söndag: { breakfast: null, lunch: null, dinner: null, snack: null, dessert: null }
          }
        }
      });
    }

    return NextResponse.json({
      ...course,
      courseSlug,
      message: `Kurs skapad med ${numberOfWeeks} veckor`
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 