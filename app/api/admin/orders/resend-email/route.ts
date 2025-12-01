import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { emailService } from '@/app/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/resend-email
 * Resend order confirmation email for a specific order
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { orderId, includeCredentials } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const customerEmail = order.customerEmail || order.user?.email;
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      );
    }

    const VAT_RATE = 0.25;
    const emailCourses = order.items
      .filter(item => item.type === 'course')
      .map(item => ({
        name: item.name,
        price: Math.round(item.price * (1 + VAT_RATE) * 100) / 100 * (item.quantity || 1)
      }));

    // Generate new password if requested
    let loginCredentials = undefined;
    if (includeCredentials && order.user) {
      const bcrypt = require('bcryptjs');
      const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.user.update({
        where: { id: order.user.id },
        data: { 
          password: hashedPassword,
          mustChangePassword: true
        }
      });

      loginCredentials = {
        email: customerEmail,
        password: newPassword,
        loginUrl: 'https://www.functionalfoods.se/login'
      };
    }

    const result = await emailService.sendOrderConfirmation({
      customerEmail,
      customerName: order.customerName || order.user?.name || 'Kund',
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount || 0,
      courses: emailCourses,
      loginCredentials
    });

    if (result) {
      // Update metadata to mark email as sent
      await prisma.order.update({
        where: { id: order.id },
        data: {
          metadata: {
            ...(order.metadata as any || {}),
            confirmationEmailSent: true,
            confirmationEmailSentAt: new Date().toISOString(),
            emailResentByAdmin: true
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Email skickat till ${customerEmail}${includeCredentials ? ' med nya inloggningsuppgifter' : ''}`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Kunde inte skicka email - kontrollera API-konfiguration'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error resending email:', error);
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

