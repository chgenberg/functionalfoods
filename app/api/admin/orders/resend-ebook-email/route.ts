import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { emailService } from '@/app/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/resend-ebook-email
 * Resend e-book download email for a specific order
 * 
 * Body: { orderId: string } or { orderNumber: string }
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { orderId, orderNumber } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { error: 'Order ID or order number required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findFirst({
      where: orderId ? { id: orderId } : { orderNumber: orderNumber },
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

    // Check if order has e-books
    const bookItems = order.items.filter(item => item.type === 'book');
    if (bookItems.length === 0) {
      return NextResponse.json(
        { error: 'Order does not contain any e-books' },
        { status: 400 }
      );
    }

    const customerEmail = order.customerEmail || order.user?.email;
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      );
    }

    const customerName = order.customerName || order.user?.name || 'Kund';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
    const results: Array<{ book: string; status: string; downloadUrl?: string; error?: string }> = [];

    for (const book of bookItems) {
      try {
        // Check if download token already exists for this order
        let downloadRecord = await prisma.ebookDownload.findFirst({
          where: {
            orderNumber: order.orderNumber,
            ebookName: book.name
          }
        });

        // Create new download token if it doesn't exist
        if (!downloadRecord) {
          const crypto = await import('crypto');
          const downloadToken = crypto.randomBytes(16).toString('hex').toUpperCase();
          
          // Determine ebookId based on book name
          let ebookId = 'julbok-2025';
          if (book.name.toLowerCase().includes('julbord') || book.name.toLowerCase().includes('julbok')) {
            ebookId = 'julbok-2025';
          }
          
          downloadRecord = await prisma.ebookDownload.create({
            data: {
              token: downloadToken,
              orderNumber: order.orderNumber,
              customerEmail: customerEmail,
              ebookId,
              ebookName: book.name,
              maxDownloads: 5,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            }
          });
          console.log(`✅ Created new download token for ${book.name}`);
        }

        const downloadUrl = `${baseUrl}/julbok/ladda-ner?token=${downloadRecord.token}`;

        // Send e-book download email
        await emailService.sendEbookDownloadEmail({
          email: customerEmail,
          name: customerName,
          ebookName: book.name,
          downloadUrl,
          downloadPassword: downloadRecord.token,
          orderNumber: order.orderNumber
        });

        results.push({
          book: book.name,
          status: 'sent',
          downloadUrl
        });

        console.log(`✅ E-book download email sent for: ${book.name} to ${customerEmail}`);
      } catch (bookError) {
        console.error(`❌ Failed to send e-book email for ${book.name}:`, bookError);
        results.push({
          book: book.name,
          status: 'failed',
          error: bookError instanceof Error ? bookError.message : 'Unknown error'
        });
      }
    }

    // Update order metadata
    const metadata = (order.metadata as any) || {};
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...metadata,
          ebookEmailResentAt: new Date().toISOString(),
          ebookEmailResentBy: 'admin'
        }
      }
    });

    const successCount = results.filter(r => r.status === 'sent').length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Skickade ${successCount} av ${results.length} e-bok mejl till ${customerEmail}`,
      results,
      customerEmail,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('Error resending e-book email:', error);
    return NextResponse.json(
      { error: 'Failed to resend e-book email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

