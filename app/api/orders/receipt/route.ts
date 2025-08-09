import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const;
type Lang = typeof SUPPORTED[number];
const M: Record<Lang, Record<string,string>> = {
  sv: { receipt: 'Kvitto', orderNo: 'Ordernummer', date: 'Datum', customer: 'Kund', products: 'Produkter', total: 'Totalt', payStatus: 'Betalstatus', tx: 'Transaktion', missingOrderId: 'orderId krävs', noAuth: 'Ingen auktorisering', notFound: 'Order hittades inte', genErr: 'Kunde inte generera kvitto' },
  en: { receipt: 'Receipt', orderNo: 'Order number', date: 'Date', customer: 'Customer', products: 'Products', total: 'Total', payStatus: 'Payment status', tx: 'Transaction', missingOrderId: 'orderId is required', noAuth: 'No authorization', notFound: 'Order not found', genErr: 'Could not generate receipt' },
  es: { receipt: 'Recibo', orderNo: 'Número de pedido', date: 'Fecha', customer: 'Cliente', products: 'Productos', total: 'Total', payStatus: 'Estado de pago', tx: 'Transacción', missingOrderId: 'se requiere orderId', noAuth: 'Sin autorización', notFound: 'Pedido no encontrado', genErr: 'No se pudo generar el recibo' },
  de: { receipt: 'Quittung', orderNo: 'Bestellnummer', date: 'Datum', customer: 'Kunde', products: 'Produkte', total: 'Summe', payStatus: 'Zahlungsstatus', tx: 'Transaktion', missingOrderId: 'orderId erforderlich', noAuth: 'Keine Autorisierung', notFound: 'Bestellung nicht gefunden', genErr: 'Quittung konnte nicht erstellt werden' },
  fr: { receipt: 'Reçu', orderNo: 'Numéro de commande', date: 'Date', customer: 'Client', products: 'Produits', total: 'Total', payStatus: 'Statut de paiement', tx: 'Transaction', missingOrderId: 'orderId requis', noAuth: 'Aucune autorisation', notFound: 'Commande introuvable', genErr: 'Impossible de générer le reçu' }
};
function getLang(req: NextRequest): Lang {
  const hdr = req.headers.get('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val) ? (val as Lang) : 'sv';
}
function toLocaleTag(lang: Lang): string {
  return lang === 'sv' ? 'sv-SE' : lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'fr-FR';
}

export async function GET(req: NextRequest) {
  try {
    const lang = getLang(req);
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: M[lang].missingOrderId }, { status: 400 });

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: M[lang].noAuth }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true, user: true }
    });
    if (!order || order.userId !== decoded.userId) {
      return NextResponse.json({ error: M[lang].notFound }, { status: 404 });
    }

    const PDFDocument = (await import('pdfkit') as any).default as any;
    const doc = new PDFDocument({ margin: 50 });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const pdfReady = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const L = M[lang];
    const localeTag = toLocaleTag(lang);

    doc.fontSize(18).text(L.receipt, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`${L.orderNo}: ${order.orderNumber}`);
    doc.text(`${L.date}: ${new Date(order.createdAt).toLocaleDateString(localeTag)}`);
    doc.text(`${L.customer}: ${order.user.name || ''} <${order.user.email}>`);
    doc.moveDown();

    doc.fontSize(14).text(`${L.products}:`);
    doc.moveDown(0.5);
    order.items.forEach((it) => {
      doc.fontSize(12).text(`${it.name} x${it.quantity} – ${it.price} ${order.currency}`);
    });
    doc.moveDown();
    doc.fontSize(12).text(`${L.total}: ${order.totalAmount} ${order.currency}`);
    if (order.payment) {
      doc.text(`${L.payStatus}: ${order.payment.status}`);
      if (order.payment.externalId) doc.text(`${L.tx}: ${order.payment.externalId}`);
    }

    doc.end();
    const buffer = await pdfReady;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt_${order.orderNumber}.pdf"`
      }
    });
  } catch (e) {
    console.error('receipt error', e);
    const lang = getLang(req);
    return NextResponse.json({ error: M[lang].genErr }, { status: 500 });
  }
} 