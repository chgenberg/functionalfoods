import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Admin-only endpoint to create a new course skeleton without touching existing ones
export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const body = await req.json().catch(() => ({}));
    const name: string = body.name || 'Hormonell Balans';
    const courseCode: string = body.courseCode || 'hormone'; // used in CourseWeekMeta/MealPlanWeek.course
    const productSlugId: string = body.productId || 'hormonell-balans'; // used as admin id
    const weeks: number = Number(body.weeks || 6);
    const description: string = body.description || 'Kurs i 6 veckor för att stärka hormonell balans med functional foods.';
    const price: number = typeof body.price === 'number' ? body.price : 1836; // exkl. moms placeholder

    // 1) Create CourseProduct if missing
    const existingProduct = await prisma.courseProduct.findFirst({ where: { name } });
    let product = existingProduct;
    if (!product) {
      product = await prisma.courseProduct.create({
        data: {
          name,
          description,
          price,
          basePrice: price,
          content: {},
          features: {},
        }
      });
    }

    // 2) Create week metadata and meal plan weeks if missing
    const createdWeeks: number[] = [];
    for (let week = 1; week <= weeks; week++) {
      const meta = await prisma.courseWeekMeta.findUnique({ where: { course_weekNumber: { course: courseCode, weekNumber: week } } });
      if (!meta) {
        await prisma.courseWeekMeta.create({
          data: {
            course: courseCode,
            weekNumber: week,
            weekTitle: `Vecka ${week}`,
            weekSubtitle: `Hormonell Balans – Vecka ${week}`,
            heroImage: null,
            videoUrl: null,
            welcomeMessage: '',
            mainContent: '',
            keyTakeaways: [],
            weeklyChallenge: '',
            reflectionQuestions: []
          }
        });
        createdWeeks.push(week);
      }

      const mp = await prisma.mealPlanWeek.findUnique({ where: { course_weekNumber: { course: courseCode, weekNumber: week } } });
      if (!mp) {
        await prisma.mealPlanWeek.create({
          data: {
            course: courseCode,
            weekNumber: week,
            title: `Vecka ${week}`,
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
    }

    return NextResponse.json({
      ok: true,
      product: { id: product?.id, name: product?.name },
      courseId: productSlugId,
      courseCode,
      createdWeeks
    });
  } catch (error) {
    console.error('Create course skeleton error:', error);
    return NextResponse.json({ error: 'Failed to create course skeleton' }, { status: 500 });
  }
}


