import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Bygg filter baserat på query params
    let where: any = {};
    
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const search = searchParams.get('search');

    if (status && status !== 'all') {
      where.status = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = paymentMethod;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59');
      }
    }

    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) {
        where.totalAmount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.totalAmount.lte = parseFloat(maxAmount);
      }
    }

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Hämta beställningar
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, createdAt: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, id: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Förbered data för Excel
    const excelData = orders.map(order => ({
      'Ordernummer': order.id.slice(0, 8),
      'Datum': order.createdAt.toLocaleDateString('sv-SE'),
      'Tid': order.createdAt.toLocaleTimeString('sv-SE'),
      'Kundnamn': order.user.name || 'Gäst',
      'E-post': order.user.email,
      'Kund sedan': order.user.createdAt.toLocaleDateString('sv-SE'),
      'Produkter': order.items.map(item => 
        `${item.product.name} (${item.quantity}x)`
      ).join(', '),
      'Antal produkter': order.items.reduce((sum, item) => sum + item.quantity, 0),
      'Totalt belopp (SEK)': order.totalAmount,
      'Status': order.status === 'completed' ? 'Slutförd' :
                order.status === 'pending' ? 'Väntande' :
                order.status === 'failed' ? 'Misslyckad' :
                order.status === 'refunded' ? 'Återbetald' : order.status,
      'Betalmetod': order.paymentMethod === 'stripe' ? 'Kort (Stripe)' :
                   order.paymentMethod === 'swish' ? 'Swish' :
                   order.paymentMethod === 'invoice' ? 'Faktura' : order.paymentMethod,
      'Uppdaterad': order.updatedAt.toLocaleDateString('sv-SE')
    }));

    // Skapa Excel-arbetsboken
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Formatera kolumnbredder
    const columnWidths = [
      { wch: 12 }, // Ordernummer
      { wch: 12 }, // Datum
      { wch: 10 }, // Tid
      { wch: 20 }, // Kundnamn
      { wch: 25 }, // E-post
      { wch: 12 }, // Kund sedan
      { wch: 30 }, // Produkter
      { wch: 8 },  // Antal
      { wch: 12 }, // Belopp
      { wch: 12 }, // Status
      { wch: 15 }, // Betalmetod
      { wch: 12 }  // Uppdaterad
    ];
    worksheet['!cols'] = columnWidths;

    // Lägg till sammanfattning på andra arket
    const summaryData = [
      { 'Statistik': 'Totalt antal beställningar', 'Värde': orders.length },
      { 'Statistik': 'Slutförda beställningar', 'Värde': orders.filter(o => o.status === 'completed').length },
      { 'Statistik': 'Väntande beställningar', 'Värde': orders.filter(o => o.status === 'pending').length },
      { 'Statistik': 'Misslyckade beställningar', 'Värde': orders.filter(o => o.status === 'failed').length },
      { 'Statistik': 'Total omsättning (SEK)', 'Värde': orders.reduce((sum, o) => sum + o.totalAmount, 0) },
      { 'Statistik': 'Genomsnittlig ordervalue (SEK)', 'Värde': orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length) : 0 },
      { 'Statistik': 'Exportdatum', 'Värde': new Date().toLocaleDateString('sv-SE') },
      { 'Statistik': 'Exporttid', 'Värde': new Date().toLocaleTimeString('sv-SE') }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    // Lägg till båda arken
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Beställningar');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Sammanfattning');

    // Generera Excel-fil
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Skapa filename med datum
    const filename = `bestallningar-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
