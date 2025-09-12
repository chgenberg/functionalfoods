import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth, ensureAdminUserExists } from '@/app/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalRecipes: 0,
      totalBlogPosts: 0,
      recentOrders: [],
      recentUsers: [],
      popularContent: []
    });
  }
  
  try {
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get total orders
    const totalOrders = await prisma.order.count({
      where: { status: 'COMPLETED' }
    });
    
    // Get total revenue
    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { totalAmount: true }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get total recipes
    const totalRecipes = await prisma.recipe.count();
    
    // Get total blog posts
    const totalBlogPosts = await prisma.blogPost.count();
    
    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: {
          include: {
            course: true
          }
        }
      }
    }).then(orders => orders.map(order => ({
      id: order.id,
      customerName: order.user?.name || 'Okänd kund',
      productName: order.items[0]?.course?.name || order.items[0]?.name || 'Okänd produkt',
      amount: order.totalAmount,
      createdAt: order.createdAt
    })));
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalRecipes,
      totalBlogPosts,
      recentOrders,
      recentUsers,
      popularContent: []
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 