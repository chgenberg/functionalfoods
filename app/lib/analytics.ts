"use client";

// Lightweight helpers for GA4 and Meta Pixel events

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function safeGtagEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as any).gtag;
  if (!gtag) return;
  const payload = GA_ID ? { ...params, send_to: GA_ID } : params;
  try {
    gtag('event', eventName, payload);
  } catch {}
}

function safeFbqTrack(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (!fbq) return;
  try {
    if (params) fbq('track', eventName, params);
    else fbq('track', eventName);
  } catch {}
}

export function trackGenerateLead(source: string): void {
  // GA4
  safeGtagEvent('generate_lead', { source });
  // Meta Pixel
  safeFbqTrack('Lead', { source });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  items?: Array<{ id?: string; name?: string; quantity?: number; price?: number; }>
}): void {
  const { transactionId, value, currency = 'SEK', items = [] } = params;
  // GA4
  safeGtagEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      quantity: i.quantity,
      price: i.price,
    }))
  });
  // Meta Pixel
  safeFbqTrack('Purchase', {
    value,
    currency,
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_ids: items.map((i) => i.id).filter(Boolean),
    content_type: 'product'
  });
}


