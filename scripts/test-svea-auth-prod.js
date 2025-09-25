const { createHash } = require('crypto');

function formatSveaTimestampPostmanStyle(date = new Date()) {
  // Local YYYY-M-D with UTC hours/minutes (no zero padding) per Postman script
  return `${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()} ${date.getUTCHours()}:${date.getMinutes()}`;
}

function getAuthHeader({ merchantId, secretWord, method = 'GET', body = '', timestamp }) {
  const ts = timestamp || formatSveaTimestampPostmanStyle();
  if (method === 'GET') body = '';
  const signatureRawData = [body || '', secretWord, ts].join('');
  const hash = createHash('sha512').update(signatureRawData, 'utf8').digest('hex');
  const j = [merchantId, ':', hash].join('');
  const hashInBase64 = Buffer.from(j, 'utf8').toString('base64');
  const authHeader = `Svea ${hashInBase64}`;
  console.log('Auth debug:', { ts, method, bodyLength: (body||'').length, hashFirst20: hash.slice(0,20), base64First40: hashInBase64.slice(0,40)+'...' });
  return { authHeader, timestamp: ts };
}

(async () => {
  try {
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD || process.env.SVEA_SECRET_WORD_PROD;
    if (!merchantId || !secretWord) { console.error('Missing SVEA_MERCHANT_ID / SVEA_SECRET_WORD'); process.exit(1); }

    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://ulrika-functional-foods-production.up.railway.app';
    const baseUrl = 'https://checkoutapi.svea.com';

    const orderReq = {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `FF-TEST-${Date.now()}`,
      merchantSettings: {
        termsUri: `${site}/anvandarvillkor`,
        checkoutUri: `${site}/checkout`,
        confirmationUri: `${site}/checkout/success/svea-v2`,
        pushUri: `${site}/api/checkout/svea-v2/webhook`
      },
      cart: {
        items: [
          { articleNumber: 'functional-energy', name: 'Functional Energy (TEST)', quantity: 1, unitPrice: 229500, vatPercent: 0, unit: 'st' }
        ]
      }
    };

    const body = JSON.stringify(orderReq);
    const { authHeader, timestamp } = getAuthHeader({ merchantId, secretWord, method: 'POST', body });
    console.log('Creating order @prod with ts:', timestamp);

    const createRes = await fetch(`${baseUrl}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader, 'Timestamp': timestamp }, body });
    const createText = await createRes.text();
    console.log('Create status:', createRes.status, createRes.statusText);
    console.log('Create head:', createText.slice(0, 500));
    if (!createRes.ok) process.exit(2);

    const created = JSON.parse(createText);
    const orderId = created.orderId;
    console.log('OrderId:', orderId);

    const getHeaders = getAuthHeader({ merchantId, secretWord, method: 'GET' });
    const getRes = await fetch(`${baseUrl}/api/orders/${orderId}`, { method: 'GET', headers: { 'Accept': 'application/json', 'Authorization': getHeaders.authHeader, 'Timestamp': getHeaders.timestamp } });
    const getText = await getRes.text();
    console.log('Get status:', getRes.status, getRes.statusText);
    console.log('Get head:', getText.slice(0, 500));
  } catch (e) {
    console.error('Prod test error:', e);
    process.exit(1);
  }
})();
