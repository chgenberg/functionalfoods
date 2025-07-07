import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // Hämta token från headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Ingen giltig token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verifiera token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Ogiltig token' },
        { status: 401 }
      );
    }

    // Hitta kursen
    const course = await prisma.courseProduct.findUnique({
      where: { id: params.courseId },
      include: {
        purchases: {
          where: {
            userId: decoded.userId,
            status: 'completed'
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kursen hittades inte' },
        { status: 404 }
      );
    }

    // Kontrollera att användaren har köpt kursen
    if (course.purchases.length === 0) {
      return NextResponse.json(
        { error: 'Du har inte tillgång till denna kurs' },
        { status: 403 }
      );
    }

    // Skapa kursspecifikt innehåll baserat på kursnamn
    let courseContent;
    if (course.name === 'Functional Flow') {
      courseContent = {
        ...course,
        weeks: [
          {
            week: 1,
            title: "Introducering till Functional Flow",
            description: "Kom igång med din hälsoresa och förstå grunderna",
            lessons: [
              { id: 1, title: "Välkommen till Functional Flow", type: "video", duration: "15 min" },
              { id: 2, title: "Vad är anti-inflammatorisk kost?", type: "video", duration: "22 min" },
              { id: 3, title: "Functional Flow Handbok", type: "pdf", duration: "45 sidor" }
            ]
          },
          {
            week: 2,
            title: "Tarmhälsa och Mikrobiom",
            description: "Djupdykning i tarmens roll för din hälsa",
            lessons: [
              { id: 4, title: "Tarmens ekosystem", type: "video", duration: "25 min" },
              { id: 5, title: "Probiotika vs Prebiotika", type: "video", duration: "18 min" },
              { id: 6, title: "Receptsamling: Tarmvänliga rätter", type: "recipe", duration: "12 recept" }
            ]
          },
          {
            week: 3,
            title: "Anti-inflammatorisk Kost",
            description: "Minska inflammation genom medveten måltidsplanering",
            lessons: [
              { id: 7, title: "Inflammation och kost", type: "video", duration: "20 min" },
              { id: 8, title: "Omega-3 och dess betydelse", type: "video", duration: "16 min" },
              { id: 9, title: "Måltidsplanering - Anti-inflammatorisk vecka", type: "pdf", duration: "Veckoplan" }
            ]
          },
          {
            week: 4,
            title: "Stresshantering och Adaptogener",
            description: "Hantera stress genom kost och livsstil",
            lessons: [
              { id: 10, title: "Stress och inflammationens koppling", type: "video", duration: "19 min" },
              { id: 11, title: "Adaptogener - Naturens stresshanterare", type: "video", duration: "17 min" },
              { id: 12, title: "Smoothie-recept med adaptogener", type: "recipe", duration: "8 recept" }
            ]
          },
          {
            week: 5,
            title: "Energioptimering",
            description: "Få stabil energi hela dagen genom rätt näringsval",
            lessons: [
              { id: 13, title: "Blodsockerbalans", type: "video", duration: "21 min" },
              { id: 14, title: "Energigivande superfoods", type: "video", duration: "14 min" },
              { id: 15, title: "Energioptimerade måltider", type: "recipe", duration: "10 recept" }
            ]
          },
          {
            week: 6,
            title: "Långsiktig Hållbarhet",
            description: "Skapa hållbara vanor för livslång hälsa",
            lessons: [
              { id: 16, title: "Skapa hållbara vanor", type: "video", duration: "18 min" },
              { id: 17, title: "Månadsplanering för fortsatt framgång", type: "video", duration: "15 min" },
              { id: 18, title: "Functional Flow - Komplett receptbok", type: "pdf", duration: "85 recept" }
            ]
          }
        ]
      };
    } else if (course.name === 'Functional Basics') {
      courseContent = {
        ...course,
        weeks: [
          {
            week: 1,
            title: "Grunderna i Functional Foods",
            description: "En introduktion till funktionella livsmedel",
            lessons: [
              { id: 1, title: "Vad är Functional Foods?", type: "video", duration: "12 min" },
              { id: 2, title: "Kom igång med funktionell kost", type: "video", duration: "18 min" },
              { id: 3, title: "Basics Startguide", type: "pdf", duration: "25 sidor" }
            ]
          },
          {
            week: 2,
            title: "Näringsrikt Ätande",
            description: "Lär dig grunderna i näringsrik kost",
            lessons: [
              { id: 4, title: "Makronutrienter förklarade", type: "video", duration: "20 min" },
              { id: 5, title: "Micronutrienter och deras roll", type: "video", duration: "16 min" },
              { id: 6, title: "Grundrecept för nybörjare", type: "recipe", duration: "15 recept" }
            ]
          },
          {
            week: 3,
            title: "Måltidsplanering",
            description: "Planera för framgång med smarta måltider",
            lessons: [
              { id: 7, title: "Måltidsplanering 101", type: "video", duration: "22 min" },
              { id: 8, title: "Inköpstips för hälsosam mat", type: "video", duration: "14 min" },
              { id: 9, title: "Veckoplanering mall", type: "pdf", duration: "Mallar & listor" }
            ]
          },
          {
            week: 4,
            title: "Hållbara Vanor",
            description: "Bygg vanor som håller över tid",
            lessons: [
              { id: 10, title: "Vanor som fastnar", type: "video", duration: "17 min" },
              { id: 11, title: "Hantera motgångar", type: "video", duration: "13 min" },
              { id: 12, title: "Functional Basics - Receptsamling", type: "pdf", duration: "50 recept" }
            ]
          }
        ]
      };
    } else {
      // Fallback för andra kurser
      courseContent = {
        ...course,
        weeks: []
      };
    }

    // Ta bort sensitive data
    const { purchases, ...courseData } = courseContent;

    return NextResponse.json(courseData);

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av kurs' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 