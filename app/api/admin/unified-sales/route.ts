import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

interface UnifiedCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  country?: string;
  courses: string[];
  totalSpent: number;
  lastPurchase: Date | null;
  source: 'stripe' | 'manual' | 'import';
  status: 'active' | 'pending' | 'inactive';
  orderCount: number;
  createdAt: Date;
  orders: {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    date: Date;
    items: string[];
    paymentMethod?: string;
  }[];
}

export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ 
      customers: [],
      summary: {
        totalCustomers: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        courseBreakdown: {}
      }
    });
  }

  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const courseFilter = searchParams.get('course') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search') || '';

    // Fetch all users with their orders and course access
    const users = await prisma.user.findMany({
      include: {
        orders: {
          include: {
            items: {
              include: {
                course: true
              }
            },
            payment: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        purchases: {
          include: {
            course: true
          }
        }
      }
    });

    // Initialize unified customers map
    const customersMap = new Map<string, UnifiedCustomer>();

    // Process users from database
    for (const user of users) {
      const userCourses = new Set<string>();
      let totalSpent = 0;
      let lastPurchase: Date | null = null;
      const orders: UnifiedCustomer['orders'] = [];

      // Process orders
      for (const order of user.orders) {
        if (order.status === 'COMPLETED') {
          totalSpent += order.totalAmount;
          
          if (!lastPurchase || order.createdAt > lastPurchase) {
            lastPurchase = order.createdAt;
          }

          const orderItems = order.items.map(item => 
            item.course?.name || item.name
          ).filter(Boolean);

          // Add courses from order items
          order.items.forEach(item => {
            if (item.course?.name) {
              userCourses.add(item.course.name);
            }
          });

          orders.push({
            id: order.id,
            orderNumber: order.orderNumber,
            amount: order.totalAmount,
            status: order.status,
            date: order.createdAt,
            items: orderItems,
            paymentMethod: order.payment?.paymentMethod
          });
        }
      }

      // Add courses from direct purchases (manual additions)
      user.purchases.forEach(purchase => {
        if (purchase.course?.name) {
          userCourses.add(purchase.course.name);
        }
      });

      // Determine source
      let source: UnifiedCustomer['source'] = 'manual';
      if (user.orders.some(o => o.payment?.externalId?.startsWith('pi_'))) {
        source = 'stripe';
      } else if (user.createdAt && user.orders.length === 0 && user.purchases.length > 0) {
        // Users with purchases but no orders are likely imported
        source = 'import';
      }

      customersMap.set(user.email, {
        id: user.id,
        email: user.email,
        name: user.name || 'Okänd',
        phone: user.phone || undefined,
        country: user.country || 'SE',
        courses: Array.from(userCourses),
        totalSpent,
        lastPurchase,
        source,
        status: user.isActive ? 'active' : 'inactive',
        orderCount: orders.length,
        createdAt: user.createdAt,
        orders
      });
    }

    // If Stripe is configured, fetch additional payment data
    if (process.env.STRIPE_SECRET_KEY && (source === 'all' || source === 'stripe')) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Fetch recent payments from Stripe
        const paymentIntents = await stripe.paymentIntents.list({
          limit: 100,
          expand: ['data.customer']
        });

        // Process Stripe payments
        for (const pi of paymentIntents.data) {
          if (pi.status !== 'succeeded') continue;

          const email = pi.receipt_email || pi.customer?.email || pi.metadata?.customerEmail;
          if (!email) continue;

          const existing = customersMap.get(email);
          
          // Extract course info from metadata or description
          const courseInfo = pi.metadata?.courseNames || pi.description || '';
          const courses = courseInfo.split(',').map((c: string) => c.trim()).filter(Boolean);

          if (existing) {
            // Update existing customer with Stripe data if needed
            if (!existing.orders.find(o => o.id === pi.id)) {
              existing.orders.push({
                id: pi.id,
                orderNumber: pi.metadata?.orderNumber || pi.id,
                amount: pi.amount / 100,
                status: 'COMPLETED',
                date: new Date(pi.created * 1000),
                items: courses,
                paymentMethod: 'stripe'
              });
              existing.totalSpent += pi.amount / 100;
              existing.orderCount += 1;
              existing.source = 'stripe';
            }
          } else {
            // Create new customer from Stripe data
            customersMap.set(email, {
              id: pi.customer?.id || pi.id,
              email,
              name: pi.customer?.name || pi.metadata?.customerName || 'Okänd',
              phone: pi.customer?.phone || undefined,
              country: pi.customer?.address?.country || 'SE',
              courses,
              totalSpent: pi.amount / 100,
              lastPurchase: new Date(pi.created * 1000),
              source: 'stripe',
              status: 'active',
              orderCount: 1,
              createdAt: new Date(pi.created * 1000),
              orders: [{
                id: pi.id,
                orderNumber: pi.metadata?.orderNumber || pi.id,
                amount: pi.amount / 100,
                status: 'COMPLETED',
                date: new Date(pi.created * 1000),
                items: courses,
                paymentMethod: 'stripe'
              }]
            });
          }
        }
      } catch (stripeError) {
        console.error('Failed to fetch Stripe data:', stripeError);
        // Continue with database data only
      }
    }

    // Convert map to array and apply filters
    let customers = Array.from(customersMap.values());

    // Apply filters
    if (source !== 'all') {
      customers = customers.filter(c => c.source === source);
    }

    if (courseFilter !== 'all') {
      customers = customers.filter(c => 
        c.courses.some(course => 
          course.toLowerCase().includes(courseFilter.toLowerCase())
        )
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      customers = customers.filter(c => c.createdAt >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      customers = customers.filter(c => c.createdAt <= toDate);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(c => 
        c.email.toLowerCase().includes(searchLower) ||
        c.name.toLowerCase().includes(searchLower) ||
        c.phone?.includes(search)
      );
    }

    // Sort by last purchase date (most recent first)
    customers.sort((a, b) => {
      if (!a.lastPurchase && !b.lastPurchase) return 0;
      if (!a.lastPurchase) return 1;
      if (!b.lastPurchase) return -1;
      return b.lastPurchase.getTime() - a.lastPurchase.getTime();
    });

    // Calculate summary statistics
    const summary = {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageOrderValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.filter(c => c.orderCount > 0).length
        : 0,
      courseBreakdown: customers.reduce((acc, customer) => {
        customer.courses.forEach(course => {
          if (!acc[course]) {
            acc[course] = { count: 0, revenue: 0 };
          }
          acc[course].count += 1;
          acc[course].revenue += customer.totalSpent / customer.courses.length; // Distribute revenue
        });
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>),
      sourceBreakdown: {
        stripe: customers.filter(c => c.source === 'stripe').length,
        manual: customers.filter(c => c.source === 'manual').length,
        import: customers.filter(c => c.source === 'import').length
      }
    };

    return NextResponse.json({
      customers,
      summary
    });

  } catch (error) {
    console.error('Failed to fetch unified sales data:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch sales data',
      customers: [],
      summary: {
        totalCustomers: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        courseBreakdown: {}
      }
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/unified-sales - Add manual customer
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { email, name, courses, phone, country } = await request.json();

    if (!email || !courses || courses.length === 0) {
      return NextResponse.json({
        error: 'Email and at least one course are required'
      }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: '', // User will need to reset password
          mustChangePassword: true,
          phone,
          country: country || 'SE'
        }
      });
    }

    // Add course access
    const courseProducts = await prisma.courseProduct.findMany({
      where: {
        name: {
          in: courses
        }
      }
    });

    // Create purchase entries
    await Promise.all(courseProducts.map(course => 
      prisma.purchase.upsert({
        where: {
          userId_courseId: {
            userId: user!.id,
            courseId: course.id
          }
        },
        update: {},
        create: {
          userId: user!.id,
          courseId: course.id,
          amount: 0, // Manual addition, no payment
          status: 'completed',
          accessExpiresAt: null // No expiration for manual additions
        }
      })
    ));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        courses: courseProducts.map(c => c.name)
      }
    });

  } catch (error) {
    console.error('Failed to add manual customer:', error);
    
    return NextResponse.json({
      error: 'Failed to add customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
