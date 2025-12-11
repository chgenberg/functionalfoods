import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const;
type Lang = typeof SUPPORTED[number];
const M: Record<Lang, Record<string,string>> = {
  sv: { receipt: 'Kvitto', orderNo: 'Ordernummer', date: 'Datum', customer: 'Kund', products: 'Produkter', total: 'Totalt', payStatus: 'Betalstatus', tx: 'Transaktion', missingOrderId: 'orderId krävs', noAuth: 'Ingen auktorisering', notFound: 'Order hittades inte', genErr: 'Kunde inte generera kvitto', subtotal: 'Summa exkl. moms', vat: 'Moms', vatAmount: '25%', exclVat: 'exkl. moms', inclVat: 'inkl. moms' },
  en: { receipt: 'Receipt', orderNo: 'Order number', date: 'Date', customer: 'Customer', products: 'Products', total: 'Total', payStatus: 'Payment status', tx: 'Transaction', missingOrderId: 'orderId is required', noAuth: 'No authorization', notFound: 'Order not found', genErr: 'Could not generate receipt', subtotal: 'Subtotal excl. VAT', vat: 'VAT', vatAmount: '25%', exclVat: 'excl. VAT', inclVat: 'incl. VAT' },
  es: { receipt: 'Recibo', orderNo: 'Número de pedido', date: 'Fecha', customer: 'Cliente', products: 'Productos', total: 'Total', payStatus: 'Estado de pago', tx: 'Transacción', missingOrderId: 'se requiere orderId', noAuth: 'Sin autorización', notFound: 'Pedido no encontrado', genErr: 'No se pudo generar el recibo', subtotal: 'Subtotal sin IVA', vat: 'IVA', vatAmount: '25%', exclVat: 'sin IVA', inclVat: 'con IVA' },
  de: { receipt: 'Quittung', orderNo: 'Bestellnummer', date: 'Datum', customer: 'Kunde', products: 'Produkte', total: 'Summe', payStatus: 'Zahlungsstatus', tx: 'Transaktion', missingOrderId: 'orderId erforderlich', noAuth: 'Keine Autorisierung', notFound: 'Bestellung nicht gefunden', genErr: 'Quittung konnte nicht erstellt werden', subtotal: 'Zwischensumme ohne MwSt.', vat: 'MwSt.', vatAmount: '25%', exclVat: 'ohne MwSt.', inclVat: 'inkl. MwSt.' },
  fr: { receipt: 'Reçu', orderNo: 'Numéro de commande', date: 'Date', customer: 'Client', products: 'Produits', total: 'Total', payStatus: 'Statut de paiement', tx: 'Transaction', missingOrderId: 'orderId requis', noAuth: 'Aucune autorisation', notFound: 'Commande introuvable', genErr: 'Impossible de générer le reçu', subtotal: 'Sous-total HT', vat: 'TVA', vatAmount: '25%', exclVat: 'HT', inclVat: 'TTC' }
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

    const PDFDocument = (await import('pdfkit/js/pdfkit.standalone.js') as any).default as any;
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
    
    // Calculate VAT per item based on type (book = 6%, course = 25%)
    let totalExclVat = 0;
    let totalVat25 = 0;
    let totalVat6 = 0;
    
    order.items.forEach((it) => {
      const isBook = it.type === 'book' || it.name.toLowerCase().includes('bok') || it.name.toLowerCase().includes('e-bok');
      const vatRate = isBook ? 0.06 : 0.25;
      const priceInclVat = it.price * it.quantity;
      const priceExclVat = priceInclVat / (1 + vatRate);
      const vatAmount = priceInclVat - priceExclVat;
      
      totalExclVat += priceExclVat;
      if (isBook) {
        totalVat6 += vatAmount;
      } else {
        totalVat25 += vatAmount;
      }
      
      doc.fontSize(12).text(`${it.name} x${it.quantity}`);
      doc.fontSize(10).text(`  ${priceExclVat.toFixed(2)} ${order.currency} ${L.exclVat} + ${(vatRate * 100).toFixed(0)}% ${L.vat} = ${priceInclVat.toFixed(2)} ${order.currency} ${L.inclVat}`);
    });
    doc.moveDown();
    
    doc.fontSize(11).text(`${L.subtotal}: ${totalExclVat.toFixed(2)} ${order.currency}`);
    if (totalVat25 > 0) {
      doc.text(`${L.vat} (25%): ${totalVat25.toFixed(2)} ${order.currency}`);
    }
    if (totalVat6 > 0) {
      doc.text(`${L.vat} (6%): ${totalVat6.toFixed(2)} ${order.currency}`);
    }
    doc.moveDown(0.5);
    doc.fontSize(12).text(`${L.total}: ${order.totalAmount.toFixed(2)} ${order.currency}`, { underline: true });
    if (order.payment) {
      doc.moveDown();
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