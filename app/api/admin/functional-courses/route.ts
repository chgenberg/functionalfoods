import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Hårdkodade kurser som matchar systemet
const COURSES = {
  'functional-basics': {
    id: 'functional-basics',
    name: 'Functional Basics',
    description: 'Grundkurs i funktionell kost',
    price: 1497,
    duration: '6 veckor',
    level: 'Nybörjare'
  },
  'functional-flow': {
    id: 'functional-flow',
    name: 'Functional Flow',
    description: 'Fördjupningskurs i mag- och tarmhälsa',
    price: 1497,
    duration: '6 veckor',
    level: 'Medel'
  },
  'functional-energy': {
    id: 'functional-energy',
    name: 'Functional Energy',
    description: 'Specialkurs för blodsockerkontroll',
    price: 1497,
    duration: '6 veckor',
    level: 'Avancerad'
  }
};

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // Hämta enrollments för varje kurs
    const enrollmentCounts = await Promise.all([
      prisma.purchase.count({ where: { courseProduct: { name: 'Functional Basics' } } }),
      prisma.purchase.count({ where: { courseProduct: { name: 'Functional Flow' } } }),
      prisma.purchase.count({ where: { courseProduct: { name: 'Functional Energy' } } })
    ]);

    // Hämta veckodata för varje kurs
    const weekData = await prisma.courseWeekMeta.findMany({
      orderBy: [{ course: 'asc' }, { weekNumber: 'asc' }]
    });

    // Organisera veckodata per kurs
    const weeksByCourse: Record<string, any[]> = {
      'basic': [],
      'flow': [],
      'energy': []
    };

    weekData.forEach(week => {
      if (weeksByCourse[week.course]) {
        weeksByCourse[week.course].push({
          weekNumber: week.weekNumber,
          title: week.weekTitle || `Vecka ${week.weekNumber}`,
          subtitle: week.weekSubtitle || '',
          welcomeMessage: '',
          videoUrl: week.videoUrl || '',
          heroImage: week.heroImage || ''
        });
      }
    });

    // Skapa kursobjekt med verklig data
    const courses = [
      {
        ...COURSES['functional-basics'],
        enrollments: enrollmentCounts[0],
        weeks: weeksByCourse['basic'].length > 0 ? weeksByCourse['basic'] : Array.from({ length: 6 }, (_, i) => ({
          weekNumber: i + 1,
          title: `Vecka ${i + 1}`,
          subtitle: '',
          welcomeMessage: '',
          videoUrl: '',
          heroImage: ''
        }))
      },
      {
        ...COURSES['functional-flow'],
        enrollments: enrollmentCounts[1],
        weeks: weeksByCourse['flow'].length > 0 ? weeksByCourse['flow'] : Array.from({ length: 6 }, (_, i) => ({
          weekNumber: i + 1,
          title: `Vecka ${i + 1}`,
          subtitle: '',
          welcomeMessage: '',
          videoUrl: '',
          heroImage: ''
        }))
      },
      {
        ...COURSES['functional-energy'],
        enrollments: enrollmentCounts[2],
        weeks: weeksByCourse['energy'].length > 0 ? weeksByCourse['energy'] : Array.from({ length: 6 }, (_, i) => ({
          weekNumber: i + 1,
          title: `Vecka ${i + 1}`,
          subtitle: '',
          welcomeMessage: '',
          videoUrl: '',
          heroImage: ''
        }))
      }
    ];

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Update course price
export async function PUT(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const body = await req.json();
    const { courseId, price } = body;

    // Map course IDs to database names
    const courseNameMap: Record<string, string> = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy'
    };

    const courseName = courseNameMap[courseId];
    if (!courseName) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Update price in CourseProduct table
    const updated = await prisma.courseProduct.updateMany({
      where: { name: courseName },
      data: { price: price }
    });

    return NextResponse.json({ success: true, updated: updated.count });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
