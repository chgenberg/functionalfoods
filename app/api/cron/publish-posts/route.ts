import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { BlogPost } from '@prisma/client';

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not configured, skipping cron job');
      return NextResponse.json({ message: 'Database not configured' });
    }

    const now = new Date();

    // Hitta alla inlägg som inte är publicerade än men har ett publishedAt datum som har passerat
    const postsToPublish = await prisma.blogPost.findMany({
      where: {
        published: false,
        publishedAt: {
          lte: now,
        },
      },
    });

    if (postsToPublish.length === 0) {
      return NextResponse.json({ message: 'Inga inlägg att publicera.' });
    }

    // Uppdatera published status för dessa inlägg
    const updatedPosts = await prisma.blogPost.updateMany({
      where: {
        id: {
          in: postsToPublish.map((post: BlogPost) => post.id),
        },
      },
      data: {
        published: true,
      },
    });

    const result = NextResponse.json({
      message: `Publicerade ${updatedPosts.count} inlägg.`,
      publishedIds: postsToPublish.map((post: BlogPost) => post.id),
    });

    return result;

  } catch (error) {
    console.error('Fel i cron-jobb för publicering:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Kunde inte publicera inlägg', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Ett okänt fel uppstod.' }, { status: 500 });
  }
} 