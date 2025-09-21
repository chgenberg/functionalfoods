import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users/find-duplicates - Find users with same email or potential duplicates
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (email) {
      // Find all users with the same email
      const users = await prisma.user.findMany({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        },
        include: {
          purchases: {
            include: {
              course: true
            }
          },
          orders: {
            include: {
              items: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return NextResponse.json({
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
          coursesCount: user.purchases.length,
          courses: user.purchases.map(p => ({
            id: p.courseId,
            name: p.course.name,
            purchaseDate: p.createdAt,
            amount: p.amount
          })),
          ordersCount: user.orders.length,
          totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
        }))
      });
    }

    if (userId) {
      // Find potential duplicates for a specific user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          purchases: {
            include: {
              course: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Find users with same email (case insensitive)
      const sameEmailUsers = await prisma.user.findMany({
        where: {
          AND: [
            {
              email: {
                equals: user.email,
                mode: 'insensitive'
              }
            },
            {
              id: {
                not: userId
              }
            }
          ]
        },
        include: {
          purchases: {
            include: {
              course: true
            }
          }
        }
      });

      // Find users with similar names
      const similarNameUsers = user.name ? await prisma.user.findMany({
        where: {
          AND: [
            {
              name: {
                contains: user.name,
                mode: 'insensitive'
              }
            },
            {
              id: {
                not: userId
              }
            },
            {
              email: {
                not: user.email
              }
            }
          ]
        },
        include: {
          purchases: {
            include: {
              course: true
            }
          }
        }
      }) : [];

      return NextResponse.json({
        currentUser: {
          id: user.id,
          email: user.email,
          name: user.name,
          courses: user.purchases.map(p => p.course.name)
        },
        sameEmailUsers: sameEmailUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt,
          courses: u.purchases.map(p => p.course.name),
          coursesCount: u.purchases.length
        })),
        similarNameUsers: similarNameUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt,
          courses: u.purchases.map(p => p.course.name),
          coursesCount: u.purchases.length
        }))
      });
    }

    // Find all potential duplicates in the system
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    });

    const duplicateGroups = await Promise.all(
      duplicateEmails.map(async (group) => {
        const users = await prisma.user.findMany({
          where: {
            email: group.email
          },
          include: {
            purchases: {
              include: {
                course: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        return {
          email: group.email,
          count: users.length,
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            coursesCount: user.purchases.length,
            courses: user.purchases.map(p => p.course.name)
          }))
        };
      })
    );

    return NextResponse.json({
      duplicateGroups,
      totalDuplicateEmails: duplicateEmails.length
    });

  } catch (error) {
    console.error('Error finding duplicate users:', error);
    return NextResponse.json(
      { error: 'Failed to find duplicate users' },
      { status: 500 }
    );
  }
}
