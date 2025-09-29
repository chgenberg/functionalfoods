import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    const data = await req.json();
    const { isPinned, isLocked } = data;

    const updateData: any = {};
    if (isPinned !== undefined) updateData.isSticky = isPinned;
    if (isLocked !== undefined) updateData.isLocked = isLocked;

    const thread = await prisma.forumThread.update({
      where: { id: params.threadId },
      data: updateData,
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
      isPinned: thread.isSticky,
      isLocked: thread.isLocked,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // First delete all replies
    await prisma.forumReply.deleteMany({
      where: { threadId: params.threadId }
    });

    // Then delete all likes
    await prisma.forumLike.deleteMany({
      where: { threadId: params.threadId }
    });

    // Finally delete the thread
    await prisma.forumThread.delete({
      where: { id: params.threadId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}