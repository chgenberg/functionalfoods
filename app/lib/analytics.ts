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

export function trackAddToCart(item: { id?: string; name?: string; quantity?: number; price?: number; }, currency: string = 'SEK'): void {
  const { id, name, quantity = 1, price } = item || {};
  // GA4
  safeGtagEvent('add_to_cart', {
    currency,
    value: typeof price === 'number' ? price * quantity : undefined,
    items: [{
      item_id: id,
      item_name: name,
      quantity,
      price
    }]
  });
  // Meta Pixel
  safeFbqTrack('AddToCart', {
    value: typeof price === 'number' ? price * quantity : undefined,
    currency,
    content_name: name,
    content_ids: id ? [id] : undefined,
    contents: [{ id, quantity, item_price: price }],
    content_type: 'product'
  });
}

export function trackInitiateCheckout(params: {
  items: Array<{ id?: string; name?: string; quantity?: number; price?: number; }>,
  value?: number,
  currency?: string
}): void {
  const { items, value, currency = 'SEK' } = params;
  // GA4 (recommended event name is begin_checkout)
  safeGtagEvent('begin_checkout', {
    currency,
    value,
    items: items.map(i => ({
      item_id: i.id,
      item_name: i.name,
      quantity: i.quantity,
      price: i.price
    }))
  });
  // Meta Pixel
  safeFbqTrack('InitiateCheckout', {
    value,
    currency,
    content_ids: items.map(i => i.id).filter(Boolean),
    contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_type: 'product'
  });
}


