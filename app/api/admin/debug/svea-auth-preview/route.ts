import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

type Mode = 'localDate_utcTime' | 'utcDate_utcTime' | 'localDate_localTime' | 'utc_padded' | 'localDate_utcTime_padded' | 'stockholm_local' | 'stockholm_local_padded';

function formatUtcPadded(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function formatStockholm(date = new Date(), padded = false): string {
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  const parts = fmt.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  const y = parts.year;
  const m = padded ? parts.month : String(Number(parts.month));
  const d = padded ? parts.day : String(Number(parts.day));
  const hh = padded ? parts.hour : String(Number(parts.hour));
  const mm = padded ? parts.minute : String(Number(parts.minute));
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function buildTimestamp(mode: Mode, now = new Date()): string {
  if (mode === 'localDate_utcTime') return `${now.getFullYear()}-${(now.getMonth()+1)}-${now.getDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}`;
  if (mode === 'utcDate_utcTime') return `${now.getUTCFullYear()}-${(now.getUTCMonth()+1)}-${now.getUTCDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}`;
  if (mode === 'localDate_localTime') return `${now.getFullYear()}-${(now.getMonth()+1)}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
  if (mode === 'utc_padded') return formatUtcPadded(now);
  if (mode === 'localDate_utcTime_padded') return `${now.getFullYear()}-${(now.getMonth()+1)}-${now.getDate()} ${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;
  if (mode === 'stockholm_local') return formatStockholm(now, false);
  return formatStockholm(now, true);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if ((auth as any)?.status === 401) return auth as unknown as NextResponse;

  try {
    const body = await req.json().catch(() => ({}));
    const merchantId = process.env.SVEA_MERCHANT_ID || '';
    const secret = (process.env.SVEA_TEST_MODE === 'true' || process.env.NODE_ENV !== 'production')
      ? (process.env.SVEA_SECRET_WORD_TEST || process.env.SVEA_SECRET_WORD || '')
      : (process.env.SVEA_SECRET_WORD_PROD || process.env.SVEA_SECRET_WORD || '');

    const request = body.request || {
      countryCode: 'SE',
      currency: 'SEK',
      locale: 'sv-SE',
      clientOrderNumber: `AUTH-PREVIEW-${Date.now()}`,
      merchantSettings: {
        termsUri: 'https://example.com/terms',
        checkoutUri: 'https://example.com/checkout',
        confirmationUri: 'https://example.com/ok',
        pushUri: 'https://example.com/push'
      },
      cart: { items: [] },
      merchantData: 'auth-preview'
    };
    const requestBody = JSON.stringify(request);

    const modes: Mode[] = ['localDate_utcTime','utcDate_utcTime','localDate_localTime','utc_padded','localDate_utcTime_padded','stockholm_local','stockholm_local_padded'];
    const now = new Date();

    const results = modes.map(mode => {
      const timestamp = buildTimestamp(mode, now);
      const signatureRawData = [requestBody, secret, timestamp].join('');
      const hash = createHash('sha512').update(signatureRawData, 'utf8').digest('hex');
      const j = [merchantId, ':', hash].join('');
      const authHeader = `Svea ${Buffer.from(j, 'utf8').toString('base64')}`;
      return {
        mode,
        timestamp,
        authHeader,
        merchantId,
        requestBodyLength: requestBody.length,
        signatureRawDataLength: signatureRawData.length,
        hashFirst20: hash.substring(0,20),
        authHeaderFirst50: authHeader.substring(0,50) + '...'
      };
    });

    return NextResponse.json({ ok: true, results, sampleEndpoint: (process.env.SVEA_TEST_MODE === 'true' || process.env.NODE_ENV !== 'production') ? 'https://checkoutapistage.svea.com/api/orders' : 'https://checkoutapi.svea.com/api/orders', request });
  } catch (error) {
    console.error('svea-auth-preview error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to build auth preview' }, { status: 500 });
  }
}


