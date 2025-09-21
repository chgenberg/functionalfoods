import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'latest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query filters
    const where: any = {};
    if (category && category !== 'all') {
      where.categoryId = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Sorting
    let orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { views: 'desc' };
        break;
      case 'active':
        orderBy = { updatedAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get threads
    const threads = await prisma.forumThread.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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
    const totalMembers = await prisma.user.count();
    const totalThreads = await prisma.forumThread.count();
    
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
    const activeThisWeek = Math.round((activeUsersThisWeek / totalMembers) * 100) || 0;

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
        totalMembers,
        totalThreads,
        activeThisWeek
      }
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { title, content, categoryId } = data;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const thread = await prisma.forumThread.create({
      data: {
        title,
        content,
        categoryId,
        authorId: token.userId,
        views: 0,
        isPinned: false,
        isLocked: false
      },
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
