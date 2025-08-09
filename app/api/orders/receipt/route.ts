import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'orderId krävs' }, { status: 400 });

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Ingen auktorisering' }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true, user: true }
    });
    if (!order || order.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Order hittades inte' }, { status: 404 });
    }

    // Dynamisk import av pdfkit (Node only)
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 50 });

    // Samla PDF som buffer
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const pdfReady = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Innehåll
    doc.fontSize(18).text('Kvitto', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Ordernummer: ${order.orderNumber}`);
    doc.text(`Datum: ${new Date(order.createdAt).toLocaleDateString('sv-SE')}`);
    doc.text(`Kund: ${order.user.name || ''} <${order.user.email}>`);
    doc.moveDown();

    doc.fontSize(14).text('Produkter:');
    doc.moveDown(0.5);
    order.items.forEach((it) => {
      doc.fontSize(12).text(`${it.name} x${it.quantity} – ${it.price} kr`);
    });
    doc.moveDown();
    doc.fontSize(12).text(`Totalt: ${order.totalAmount} ${order.currency}`);
    if (order.payment) {
      doc.text(`Betalstatus: ${order.payment.status}`);
      if (order.payment.externalId) doc.text(`Transaktion: ${order.payment.externalId}`);
    }

    doc.end();
    const buffer = await pdfReady;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="kvitto_${order.orderNumber}.pdf"`
      }
    });
  } catch (e) {
    console.error('receipt error', e);
    return NextResponse.json({ error: 'Kunde inte generera kvitto' }, { status: 500 });
  }
} 