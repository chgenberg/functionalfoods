import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// HTML template for the receipt
function generateReceiptHTML(purchase: any, user: any) {
  const purchaseDate = new Date(purchase.createdAt);
  const receiptNumber = `KV-${purchaseDate.getFullYear()}${(purchaseDate.getMonth() + 1).toString().padStart(2, '0')}${purchaseDate.getDate().toString().padStart(2, '0')}-${purchase.id.slice(-6).toUpperCase()}`;
  
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kvitto - Functional Foods</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      color: #333;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #014421;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #014421;
    }
    .receipt-info {
      text-align: right;
    }
    .receipt-title {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .receipt-number {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #014421;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }
    .value {
      font-size: 16px;
      margin-top: 2px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
    }
    .table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }
    .table .amount {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      font-size: 18px;
    }
    .total-row td {
      padding-top: 20px;
      border-bottom: none;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e9ecef;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .company-info {
      margin-top: 40px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .badge {
      display: inline-block;
      background: #014421;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🥗 Functional Foods</div>
      <div style="margin-top: 10px; color: #666;">
        Hälsosam mat för kropp och själ
      </div>
    </div>
    <div class="receipt-info">
      <div class="receipt-title">KVITTO</div>
      <div class="receipt-number">${receiptNumber}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="section">
      <div class="section-title">Kundinformation</div>
      <div class="info-item">
        <div class="label">Namn</div>
        <div class="value">${user.name || 'Ej angivet'}</div>
      </div>
      <div class="info-item">
        <div class="label">E-post</div>
        <div class="value">${user.email}</div>
      </div>
      ${user.addressLine1 ? `
      <div class="info-item">
        <div class="label">Adress</div>
        <div class="value">
          ${user.addressLine1}<br>
          ${user.addressLine2 ? user.addressLine2 + '<br>' : ''}
          ${user.postalCode} ${user.city}<br>
          ${user.country || 'Sverige'}
        </div>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">Kvittoinformation</div>
      <div class="info-item">
        <div class="label">Kvittonummer</div>
        <div class="value">${receiptNumber}</div>
      </div>
      <div class="info-item">
        <div class="label">Datum</div>
        <div class="value">${purchaseDate.toLocaleDateString('sv-SE', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>
      <div class="info-item">
        <div class="label">Betalsätt</div>
        <div class="value">Kort/Swish</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Orderdetaljer</div>
    <table class="table">
      <thead>
        <tr>
          <th>Beskrivning</th>
          <th style="text-align: center;">Antal</th>
          <th class="amount">Belopp</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${purchase.course.name}</strong><br>
            <span style="color: #666; font-size: 14px;">${purchase.course.description}</span>
            <div class="badge">Utbildning - Momsfri enligt 3 kap. 8 § ML</div>
          </td>
          <td style="text-align: center;">1</td>
          <td class="amount">${purchase.amount.toFixed(2)} kr</td>
        </tr>
        <tr class="total-row">
          <td colspan="2">Totalt att betala</td>
          <td class="amount">${purchase.amount.toFixed(2)} kr</td>
        </tr>
      </tbody>
    </table>
  </div>

      <div class="company-info">
      <div class="section-title">Företagsinformation</div>
      <div style="margin-top: 15px;">
        <div class="info-item">
          <div class="label">Företag</div>
          <div class="value">Ulrikas Kickstart AB</div>
        </div>
        <div class="info-item">
          <div class="label">Org. nummer</div>
          <div class="value">559051-3387</div>
        </div>
        <div class="info-item">
          <div class="label">Adress</div>
          <div class="value">Odengatan 106 Lgh 1603<br/>113 22, Stockholm</div>
        </div>
      </div>
    </div>

  <div class="footer">
    <p><strong>Viktigt för friskvårdsbidrag:</strong></p>
    <p>Detta kvitto avser en hälsofrämjande utbildning och kan användas för friskvårdsbidrag enligt Skatteverkets regler.</p>
    <p style="margin-top: 20px;">Tack för ditt köp! Vid frågor, kontakta oss på info@functionalfoods.se</p>
  </div>
</body>
</html>
  `;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Ingen giltig token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Ogiltig token' },
        { status: 401 }
      );
    }

    // Fetch the purchase
    const purchase = await prisma.purchase.findUnique({
      where: {
        id: params.id
      },
      include: {
        course: true,
        user: true
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Köp hittades inte' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (purchase.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Ingen behörighet' },
        { status: 403 }
      );
    }

    // Generate HTML
    const html = generateReceiptHTML(purchase, purchase.user);

    // For now, return HTML that can be converted to PDF client-side
    // In production, you would use a library like Puppeteer or react-pdf
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="kvitto-${params.id}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid generering av kvitto' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 