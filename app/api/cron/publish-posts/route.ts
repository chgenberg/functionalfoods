import { NextResponse } from 'next/server';
import { PrismaClient, BlogPost } from '@prisma/client';

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not configured, skipping cron job');
      return NextResponse.json({ message: 'Database not configured' });
    }

    const prisma = new PrismaClient();
    const now = new Date();

    // Hitta alla inlägg som är schemalagda att publiceras nu eller tidigare
    // och som fortfarande har status 'scheduled'.
    const postsToPublish = await prisma.blogPost.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({ message: 'Inga inlägg att publicera.' });
    }

    // Uppdatera status för dessa inlägg till 'published'
    const updatedPosts = await prisma.blogPost.updateMany({
      where: {
        id: {
          in: postsToPublish.map((post: BlogPost) => post.id),
        },
      },
      data: {
        status: 'published',
        publishedAt: now,
      },
    });

    const result = NextResponse.json({
      message: `Publicerade ${updatedPosts.count} inlägg.`,
      publishedIds: postsToPublish.map((post: BlogPost) => post.id),
    });

    await prisma.$disconnect();
    return result;

  } catch (error) {
    console.error('Fel i cron-jobb för publicering:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Kunde inte publicera inlägg', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Ett okänt fel uppstod.' }, { status: 500 });
  }
} 