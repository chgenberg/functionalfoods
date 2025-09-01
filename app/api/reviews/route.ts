import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient() as any;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, courseId, rating, answers, consent, source } = body;
    const review = await prisma.courseReview.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { rating: rating ?? null, answers, consent: !!consent, source: source || 'IN_APP', status: 'PENDING' },
      create: { userId, courseId, rating: rating ?? null, answers, consent: !!consent, source: source || 'IN_APP' },
    });
    return NextResponse.json(review);
  } catch (e) {
    console.error('Review POST error', e);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId') || undefined;
    const status = searchParams.get('status') || undefined;

    const reviews = await prisma.courseReview.findMany({ where: { courseId, status }, orderBy: { createdAt: 'desc' } });

    const headers = new Headers();
    if (status === 'APPROVED') {
      // Publicly cache approved reviews at the CDN edge for 5 minutes
      headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    } else {
      // No caching for non-approved/admin queries
      headers.set('Cache-Control', 'no-store');
    }

    return NextResponse.json({ reviews }, { headers });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 