import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/forum/threads/[threadId] - Get thread with replies
export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    // Increment view count
    await prisma.forumThread.update({
      where: { id: params.threadId },
      data: { views: { increment: 1 } }
    });

    const thread = await prisma.forumThread.findUnique({
      where: { id: params.threadId },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
} 