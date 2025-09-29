import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/users/merge-courses - Merge courses from one user to another
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { sourceUserId, targetUserId } = await request.json();

    if (!sourceUserId || !targetUserId) {
      return NextResponse.json(
        { error: 'Source and target user IDs are required' },
        { status: 400 }
      );
    }

    if (sourceUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot merge user with themselves' },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get both users
      const sourceUser = await tx.user.findUnique({
        where: { id: sourceUserId },
        include: {
          purchases: { include: { course: true } },
          orders: { include: { items: true } }
        }
      });

      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
        include: {
          purchases: { include: { course: true } }
        }
      });

      if (!sourceUser || !targetUser) {
        throw new Error('One or both users not found');
      }

      // Get target user's existing course IDs
      const targetCourseIds = targetUser.purchases.map(p => p.courseId);

      // Transfer purchases that don't already exist for target user
      const purchasesToTransfer = sourceUser.purchases.filter(
        purchase => !targetCourseIds.includes(purchase.courseId)
      );

      // Update purchases to point to target user
      for (const purchase of purchasesToTransfer) {
        await tx.purchase.update({ where: { id: purchase.id }, data: { userId: targetUserId } });
      }

      // Transfer orders
      await tx.order.updateMany({ where: { userId: sourceUserId }, data: { userId: targetUserId } });

      // Transfer other related data
      await tx.goal.updateMany({ where: { userId: sourceUserId }, data: { userId: targetUserId } });
      await tx.quizResult.updateMany({ where: { userId: sourceUserId }, data: { userId: targetUserId } });
      await tx.notification.updateMany({ where: { userId: sourceUserId }, data: { userId: targetUserId } });

      // Update any forum-related data
      await tx.forumThread.updateMany({ where: { authorId: sourceUserId }, data: { authorId: targetUserId } });
      await tx.forumReply.updateMany({ where: { authorId: sourceUserId }, data: { authorId: targetUserId } });
      await tx.forumLike.updateMany({ where: { userId: sourceUserId }, data: { userId: targetUserId } });

      // Delete duplicate purchases if any were created
      const duplicatePurchases = await tx.purchase.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'asc' }
      });

      // Group by courseId and keep only the earliest purchase for each course
      const courseGroups: { [courseId: string]: any[] } = {};
      duplicatePurchases.forEach(purchase => {
        if (!courseGroups[purchase.courseId]) courseGroups[purchase.courseId] = [];
        courseGroups[purchase.courseId].push(purchase);
      });

      // Delete duplicates (keep first one for each course)
      for (const courseId in courseGroups) {
        const purchases = courseGroups[courseId];
        if (purchases.length > 1) {
          const toDelete = purchases.slice(1); // Keep first, delete rest
          for (const purchase of toDelete) {
            await tx.purchase.delete({ where: { id: purchase.id } });
          }
        }
      }

      // Get final purchase count for target user
      const finalPurchases = await tx.purchase.findMany({
        where: { userId: targetUserId },
        include: { course: true }
      });

      return {
        sourceUser: sourceUser.email,
        targetUser: targetUser.email,
        transferredPurchases: purchasesToTransfer.length,
        totalCoursesAfterMerge: finalPurchases.length,
        courses: finalPurchases.map(p => p.course.name)
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully merged courses from ${result.sourceUser} to ${result.targetUser}`,
      details: result
    });

  } catch (error) {
    console.error('Error merging user courses:', error);
    return NextResponse.json(
      { error: 'Failed to merge user courses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}