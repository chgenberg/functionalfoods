import { NextResponse } from 'next/server';
import { PrismaClient, BlogPost } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
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

    return NextResponse.json({
      message: `Publicerade ${updatedPosts.count} inlägg.`,
      publishedIds: postsToPublish.map((post: BlogPost) => post.id),
    });

  } catch (error) {
    console.error('Fel i cron-jobb för publicering:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Kunde inte publicera inlägg', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Ett okänt fel uppstod.' }, { status: 500 });
  }
} 