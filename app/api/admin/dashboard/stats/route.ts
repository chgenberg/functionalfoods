import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

// Helper to normalize course names (same as sales page)
function normalizeCourseNames(name: string): string {
  const lower = (name || '').toLowerCase().trim();
  
  if (lower.includes('e-bok') || lower.includes('ebook')) return 'E-bok';
  if (lower.includes('flow') || lower.includes('gut health')) {
    return 'Functional Flow';
  }
  if (lower.includes('energy') || lower.includes('insulin')) {
    return 'Functional Energy';
  }
  if (lower.includes('basic')) {
    return 'Functional Basics';
  }
  if (lower.includes('hormon')) {
    return 'Hormonell Balans';
  }
  
  return name.trim();
}

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
      courseBreakdown: {},
      pendingOrders: 0
    });
  }
  
  try {
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get orders with items for detailed stats
    const allOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      include: {
        items: true
      }
    });
    
    // Calculate stats (same logic as sales page)
    let totalRevenue = 0;
    const courseBreakdown: Record<string, { count: number; revenue: number }> = {};
    
    allOrders.forEach(order => {
      totalRevenue += order.totalAmount;
      
      // Count products per course
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const courseName = normalizeCourseNames(item.name || '');
          if (!courseName) return;
          
          if (!courseBreakdown[courseName]) {
            courseBreakdown[courseName] = { count: 0, revenue: 0 };
          }
          
          // Count quantity
          courseBreakdown[courseName].count += item.quantity || 1;
          
          // Calculate revenue with VAT
          const isBook = item.type === 'book' || item.name?.toLowerCase().includes('bok');
          const vatRate = isBook ? 0.06 : 0.25;
          const priceInclVAT = (item.price || 0) * (1 + vatRate);
          courseBreakdown[courseName].revenue += priceInclVAT * (item.quantity || 1);
        });
      }
    });
    
    const totalOrders = allOrders.length;
    
    // Get pending orders count
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });
    
    // Get total recipes
    const totalRecipes = await prisma.recipe.count();
    
    // Get total blog posts
    const totalBlogPosts = await prisma.blogPost.count();
    
    // Get recent orders (all statuses for visibility)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: true
      }
    }).then(orders => orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount || 0,
      currency: order.currency || 'SEK',
      createdAt: order.createdAt,
      user: order.user ? {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email
      } : null,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        type: item.type
      }))
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
    
    // Get stats for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const ordersThisMonth = await prisma.order.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      }
    });
    
    const revenueThisMonthOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth }
      },
      select: { totalAmount: true }
    });
    const revenueThisMonth = revenueThisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Get new users this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: startOfWeek } }
    });
    
    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalRecipes,
      totalBlogPosts,
      recentOrders,
      recentUsers,
      courseBreakdown,
      pendingOrders,
      ordersThisMonth,
      revenueThisMonth,
      newUsersThisWeek
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalRecipes: 0,
      totalBlogPosts: 0,
      recentOrders: [],
      recentUsers: [],
      courseBreakdown: {},
      pendingOrders: 0
    }, { status: 200 });
  }
} 