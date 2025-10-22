/*
  Lightweight Meta Conversions API helper (server-side only).
  Sends events to Facebook Pixel via Graph API with optional user_data hashing.
*/

type MetaEvent = {
  event_name: string;
  event_time?: number; // seconds
  event_id?: string;
  event_source_url?: string;
  action_source?: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | string;
  user_data?: {
    em?: string[]; // sha256 hashed emails
    ph?: string[]; // sha256 hashed phones
    external_id?: string[];
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: Record<string, any>;
};

function sha256(input: string): string {
  const nodeCrypto = require('crypto');
  return nodeCrypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

export async function sendMetaEvent(args: {
  eventName: string;
  params?: Record<string, any>;
  eventId?: string;
  email?: string; // optional for hashing
  sourceUrl?: string;
  testEventCode?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}): Promise<void> {
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
  if (!PIXEL_ID || !ACCESS_TOKEN) return; // silently no-op if not configured

  const payload: MetaEvent = {
    event_name: args.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: args.eventId,
    event_source_url: args.sourceUrl,
    action_source: 'website',
    custom_data: args.params || {},
    user_data: {}
  };

  if (args.email) {
    try { payload.user_data!.em = [sha256(args.email)]; } catch {}
  }
  if (args.userAgent) {
    payload.user_data!.client_user_agent = args.userAgent;
  }
  if (args.fbp) {
    try { payload.user_data!.fbp = args.fbp; } catch {}
  }
  if (args.fbc) {
    try { payload.user_data!.fbc = args.fbc; } catch {}
  }

  const endpoint = `https://graph.facebook.com/v17.0/${encodeURIComponent(PIXEL_ID)}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`
    + (args.testEventCode ? `&test_event_code=${encodeURIComponent(args.testEventCode)}` : '');

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [payload] })
    });
    const txt = await resp.text();
    console.log('📬 Meta CAPI response:', resp.status, txt.substring(0, 200));
  } catch (e) {
    console.warn('Meta CAPI send error:', e);
  }
}


