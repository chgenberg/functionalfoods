const { createHash } = require('crypto');

function formatSveaTimestamp(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function getAuthHeader({ merchantId, secretWord, method = 'GET', body = '', timestamp }) {
  const ts = timestamp || formatSveaTimestamp();
  if (method === 'GET') body = '';
  const signatureRawData = [body || '', secretWord, ts].join('');
  const hash = createHash('sha512').update(signatureRawData, 'utf8').digest('hex');
  const j = [merchantId, ':', hash].join('');
  const hashInBase64 = Buffer.from(j, 'utf8').toString('base64');
  const authHeader = `Svea ${hashInBase64}`;
  console.log('Auth debug:', {
    timestamp: ts,
    method,
    bodyLength: (body || '').length,
    signatureRawFirst50: signatureRawData.slice(0,50)+'...',
    hashFirst20: hash.slice(0,20),
    base64First40: hashInBase64.slice(0,40)+'...'
  });
  return { authHeader, timestamp: ts };
}

(async () => {
  try {
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    if (!merchantId || !secretWord) {
      console.error('Missing SVEA_MERCHANT_ID or SVEA_SECRET_WORD in environment.');
      process.exit(1);
    }

    const baseUrl = 'https://checkoutapistage.svea.com';

    const orderReq = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `FF-TEST-${Date.now()}`,
      merchantSettings: {
        termsUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/anvandarvillkor` : 'https://functionalfoods.se/anvandarvillkor',
        checkoutUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout` : 'https://functionalfoods.se/checkout',
        confirmationUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success/svea-v2` : 'https://functionalfoods.se/checkout/success/svea-v2',
        pushUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/svea-v2/webhook` : 'https://functionalfoods.se/api/checkout/svea-v2/webhook'
      },
      cart: {
        items: [
          {
            articleNumber: 'functional-energy',
            name: 'Functional Energy (TEST)',
            quantity: 1,
            unitPrice: 229500, // 2295.00 SEK in öre
            vatPercent: 0,
            unit: 'st'
          }
        ]
      }
    };

    const body = JSON.stringify(orderReq);
    const { authHeader, timestamp } = getAuthHeader({ merchantId, secretWord, method: 'POST', body });

    console.log('Creating order with timestamp:', timestamp);

    const createRes = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Timestamp': timestamp
      },
      body
    });

    const createText = await createRes.text();
    console.log('Create status:', createRes.status, createRes.statusText);
    console.log('Create body head:', createText.slice(0, 400));

    if (!createRes.ok) {
      console.error('Create failed.');
      process.exit(2);
    }

    const created = JSON.parse(createText);
    const orderId = created.orderId;
    console.log('OrderId:', orderId);

    // GET order
    const getHeaders = getAuthHeader({ merchantId, secretWord, method: 'GET' });
    const getRes = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': getHeaders.authHeader,
        'Timestamp': getHeaders.timestamp
      }
    });
    const getText = await getRes.text();
    console.log('Get status:', getRes.status, getRes.statusText);
    console.log('Get body head:', getText.slice(0, 400));
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
})();
