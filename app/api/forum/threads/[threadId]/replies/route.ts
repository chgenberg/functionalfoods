import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// POST /api/forum/threads/[threadId]/replies - Create new reply
export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if thread exists
    const thread = await prisma.forumThread.findUnique({
      where: { id: params.threadId }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Check if thread is locked
    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Thread is locked' },
        { status: 403 }
      );
    }

    const reply = await prisma.forumReply.create({
      data: {
        content: content.trim(),
        authorId: decoded.userId,
        threadId: params.threadId
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    // Create notification for thread author if it's not their own reply
    if (thread.authorId !== decoded.userId) {
      const threadWithAuthor = await prisma.forumThread.findUnique({
        where: { id: params.threadId },
        include: {
          author: { select: { name: true } }
        }
      });

      await prisma.notification.create({
        data: {
          userId: thread.authorId,
          type: 'forum_reply',
          title: 'Nytt svar på din diskussion',
          message: `${reply.author.name} har svarat på "${thread.title}"`,
          link: `/dashboard/community/thread/${thread.id}`
        }
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
} 