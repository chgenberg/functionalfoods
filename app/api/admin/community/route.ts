import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // Get all threads
    const threads = await prisma.forumThread.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        _count: {
          select: {
            replies: true,
            likes: true
          }
        }
      }
    });

    // Get stats
    const totalThreads = await prisma.forumThread.count();
    const totalUsers = await prisma.user.count();
    const totalReplies = await prisma.forumReply.count();
    
    // Get active users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const activeUsersThisWeek = await prisma.user.count({
      where: {
        OR: [
          { forumThreads: { some: { createdAt: { gte: oneWeekAgo } } } },
          { forumReplies: { some: { createdAt: { gte: oneWeekAgo } } } }
        ]
      }
    });
    const activeThisWeek = Math.round((activeUsersThisWeek / totalUsers) * 100) || 0;

    // Transform threads
    const transformedThreads = threads.map(thread => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      author: thread.author,
      category: thread.category,
      views: thread.views,
      replies: thread._count.replies,
      likes: thread._count.likes,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString()
    }));

    return NextResponse.json({
      threads: transformedThreads,
      stats: {
        totalThreads,
        totalUsers,
        activeThisWeek,
        totalReplies
      }
    });
  } catch (error) {
    console.error('Error fetching community data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
