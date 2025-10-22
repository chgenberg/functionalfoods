import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type GaTrackBody = {
  eventName: string;
  params?: Record<string, any>;
  clientId?: string;
  userId?: string;
  debug?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA4_API_SECRET;

    // Soft no-op if GA4 is not configured
    if (!measurementId || !apiSecret) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'GA4 not configured' });
    }

    const body = (await req.json().catch(() => ({}))) as GaTrackBody;
    const { eventName, params = {}, clientId, userId, debug } = body || {};
    if (!eventName || typeof eventName !== 'string') {
      return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
    }

    // Generate a minimal client_id if not provided
    const cid = clientId || `cid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    // Basic hardening for required GA params
    const eventParams: Record<string, any> = { ...params };
    // Ensure currency/value types are compatible
    if (eventParams.value && typeof eventParams.value === 'string') {
      const v = Number(eventParams.value);
      if (!Number.isNaN(v)) eventParams.value = v;
    }
    if (eventParams.currency && typeof eventParams.currency !== 'string') {
      eventParams.currency = String(eventParams.currency);
    }
    // Attach page location if available from referer
    if (!eventParams.page_location) {
      const ref = req.headers.get('referer');
      if (ref) eventParams.page_location = ref;
    }

    const payload: any = {
      client_id: cid,
      events: [{ name: eventName, params: eventParams }]
    };
    if (userId) payload.user_id = userId;

    const base = debug ? 'https://www.google-analytics.com/debug/mp/collect' : 'https://www.google-analytics.com/mp/collect';
    const url = `${base}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;

    const gaResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await gaResp.text();
    // Log shortened response for diagnostics
    console.log('📬 GA4 MP response:', gaResp.status, text.slice(0, 300));

    if (!gaResp.ok) {
      return NextResponse.json({ error: 'GA4 collect failed', status: gaResp.status, body: text.slice(0, 500) }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('GA4 track error:', err);
    return NextResponse.json({ error: 'Failed to track GA4 event' }, { status: 500 });
  }
}


