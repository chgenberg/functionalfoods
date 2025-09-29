import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import jwt from 'jsonwebtoken';

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
      margin: 15mm;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .page-container {
        page-break-inside: avoid;
        height: auto;
      }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      background: white;
      font-size: 13px;
      line-height: 1.4;
    }
    
    .page-container {
      width: 210mm;
      max-width: 100%;
      padding: 15mm 20mm;
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
      height: auto;
    }
    
    @media screen {
      .page-container {
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        margin: 20px auto;
      }
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #014421;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: #014421;
    }
    .logo-subtitle {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
    .receipt-info {
      text-align: right;
    }
    .receipt-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 3px;
      color: #014421;
    }
    .receipt-number {
      color: #666;
      font-size: 11px;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #014421;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      margin-bottom: 6px;
    }
    .label {
      font-weight: 600;
      color: #666;
      font-size: 11px;
    }
    .value {
      font-size: 13px;
      margin-top: 1px;
      color: #333;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .table th {
      background: #f8f9fa;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    .table td {
      padding: 10px;
      border-bottom: 1px solid #e9ecef;
      vertical-align: top;
      font-size: 13px;
    }
    .table .amount {
      text-align: right;
      white-space: nowrap;
    }
    .total-row {
      font-weight: bold;
      font-size: 14px;
    }
    .total-row td {
      padding-top: 12px;
      padding-bottom: 12px;
      border-bottom: none;
      border-top: 2px solid #014421;
    }
    .footer {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      text-align: center;
      color: #666;
      font-size: 11px;
      line-height: 1.5;
    }
    .company-info {
      margin-top: 20px;
      margin-bottom: 20px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
    }
    .badge {
      display: inline-block;
      background: #014421;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      margin-top: 5px;
    }
    .description-text {
      font-size: 12px;
      color: #666;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div>
        <div class="logo">Functional Foods</div>
        <div class="logo-subtitle">Hälsosam mat för kropp och själ</div>
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
            <th style="width: 60%">Beskrivning</th>
            <th style="width: 15%; text-align: center;">Antal</th>
            <th style="width: 25%;" class="amount">Belopp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${purchase.course.name}</strong><br>
              <span class="description-text">${purchase.course.description}</span>
              <div class="badge">Utbildningstjänst - Moms 25%</div>
            </td>
            <td style="text-align: center;">1</td>
            <td class="amount">${purchase.amount.toFixed(2)} kr</td>
          </tr>
          <tr style="border-bottom: none;">
            <td colspan="2" style="text-align: right; padding-top: 8px; padding-bottom: 3px;">Summa exkl. moms:</td>
            <td class="amount" style="padding-top: 8px; padding-bottom: 3px;">${(purchase.amount / 1.25).toFixed(2)} kr</td>
          </tr>
          <tr style="border-bottom: none;">
            <td colspan="2" style="text-align: right; padding-top: 3px; padding-bottom: 3px; color: #666;">Moms (25%):</td>
            <td class="amount" style="padding-top: 3px; padding-bottom: 3px; color: #666;">${(purchase.amount - (purchase.amount / 1.25)).toFixed(2)} kr</td>
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
      <div style="margin-top: 10px;">
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
      <p style="margin-top: 15px;">Tack för ditt köp! Vid frågor, kontakta oss på info@functionalfoods.se</p>
    </div>
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
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      decoded = jwt.verify(token, process.env.JWT_SECRET);
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
  }
} 