/*
  Minimal server-side GA4 Measurement Protocol helpers.
  Used to guarantee tracking even when client scripts are blocked.
*/

export type Ga4Item = {
  item_id?: string;
  item_name?: string;
  quantity?: number;
  price?: number;
};

function getGaConfig() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) {
    return null;
  }
  return { measurementId, apiSecret };
}

function generateClientId(seed?: string): string {
  // GA4 accepts any string client_id; keep it stable if a seed is provided
  try {
    if (seed) return `srv.${seed}`;
    const rand = Math.random().toString(36).slice(2);
    const ts = Date.now().toString(36);
    return `srv.${ts}.${rand}`;
  } catch {
    return `srv.${Date.now()}`;
  }
}

async function sendGa4Event(eventName: string, params: Record<string, any>, opts?: { userId?: string; clientId?: string; }): Promise<void> {
  const cfg = getGaConfig();
  if (!cfg) return; // silently no-op if GA not configured on server

  const { measurementId, apiSecret } = cfg;
  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;

  const body = {
    client_id: opts?.clientId || generateClientId(),
    user_id: opts?.userId,
    non_personalized_ads: true,
    events: [
      {
        name: eventName,
        params: {
          ...params,
          debug_mode: process.env.NODE_ENV !== 'production',
        }
      }
    ]
  } as any;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    // Do not throw; tracking must never break the request
    console.warn('GA4 MP send error:', e);
  }
}

export async function trackPurchaseServer(args: {
  transactionId: string;
  value: number;
  currency?: string;
  items?: Ga4Item[];
  userId?: string;
  clientSeed?: string; // e.g., hashed email
}): Promise<void> {
  const { transactionId, value, currency = 'SEK', items = [], userId, clientSeed } = args;
  await sendGa4Event('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  }, { userId, clientId: generateClientId(clientSeed) });
}

export async function trackLeadServer(args: {
  source?: string;
  userId?: string;
  clientSeed?: string;
}): Promise<void> {
  const { source = 'server', userId, clientSeed } = args;
  await sendGa4Event('generate_lead', { source }, { userId, clientId: generateClientId(clientSeed) });
}


