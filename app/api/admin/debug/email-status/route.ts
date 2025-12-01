import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { emailService } from '@/app/lib/email';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/debug/email-status
 * Check email service configuration and recent email activity
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Check if API key is configured
    const hasApiKey = !!process.env.MAILCHIMP_TRANSACTIONAL_API_KEY;
    const apiKeyLength = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY?.length || 0;

    // Get recent orders and their email status
    const recentOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED'
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        customerEmail: true,
        metadata: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    const emailStats = {
      totalCompleted: recentOrders.length,
      emailSent: recentOrders.filter(o => (o.metadata as any)?.confirmationEmailSent).length,
      emailNotSent: recentOrders.filter(o => !(o.metadata as any)?.confirmationEmailSent).length
    };

    // Get orders without email sent
    const ordersWithoutEmail = recentOrders
      .filter(o => !(o.metadata as any)?.confirmationEmailSent)
      .map(o => ({
        orderNumber: o.orderNumber,
        customerEmail: o.customerEmail,
        createdAt: o.createdAt
      }));

    return NextResponse.json({
      emailService: {
        configured: hasApiKey,
        apiKeyLength: apiKeyLength,
        apiKeyPrefix: hasApiKey ? process.env.MAILCHIMP_TRANSACTIONAL_API_KEY?.substring(0, 4) + '...' : null
      },
      recentOrdersStats: emailStats,
      ordersWithoutEmailSent: ordersWithoutEmail,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
      }
    });

  } catch (error) {
    console.error('Error checking email status:', error);
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/admin/debug/email-status
 * Send a test email to verify configuration
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address required' },
        { status: 400 }
      );
    }

    // Try to send a test email
    const result = await emailService.sendOrderConfirmation({
      customerEmail: testEmail,
      customerName: 'Test',
      orderNumber: 'TEST-' + Date.now(),
      totalAmount: 0,
      courses: [{ name: 'Test-kurs', price: 0 }],
      loginCredentials: undefined
    });

    return NextResponse.json({
      success: result,
      message: result ? 'Testmejl skickat!' : 'Kunde inte skicka testmejl - kontrollera API-nyckel'
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

