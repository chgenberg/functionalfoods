import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/users/remove-course?purchaseId=xxx
 * Remove course access for a user (delete a Purchase record)
 */
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchaseId');

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'purchaseId is required' },
        { status: 400 }
      );
    }

    // Find the purchase
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: true,
        course: true
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Delete the purchase
    await prisma.purchase.delete({
      where: { id: purchaseId }
    });

    console.log(`🗑️ Admin removed course access: ${purchase.user.email} -> ${purchase.course.name}`);

    return NextResponse.json({
      success: true,
      message: `Access to "${purchase.course.name}" removed from ${purchase.user.email}`
    });

  } catch (error) {
    console.error('Error removing course access:', error);
    return NextResponse.json(
      { error: 'Failed to remove course access' },
      { status: 500 }
    );
  }
}

