import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
        orderItems: {
          include: {
            courseProduct: true
          }
        }
      }
    }).then(orders => orders.map(order => ({
      id: order.id,
      customerName: order.user?.name || order.customerEmail,
      productName: order.orderItems[0]?.courseProduct?.name || 'Unknown',
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
  }
} 