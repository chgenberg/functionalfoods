"use client";

// Lightweight helpers for GA4 and Meta Pixel events
// Capture Meta Test Events code from URL once per session for easier debugging
try {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const testCode = params.get('fb_test') || params.get('fbtest') || params.get('fbcapitest');
    if (testCode) sessionStorage.setItem('meta_test_code', testCode);
  }
} catch {}

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

async function fallbackServerTrack(eventName: string, params?: Record<string, any>) {
  try {
    let testEventCode: string | undefined;
    try { testEventCode = sessionStorage.getItem('meta_test_code') || undefined; } catch {}
    console.log('🚀 fallbackServerTrack firing:', eventName, { params, testEventCode });
    const res = await fetch('/api/meta/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, params, testEventCode })
    });
    console.log('📡 fallbackServerTrack response:', res.status, res.ok);
  } catch (e) {
    console.error('❌ fallbackServerTrack error:', e);
  }
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
  // Meta Pixel (works even when queued)
  const fbqReady = typeof (window as any).fbq === 'function';
  if (!fbqReady) fallbackServerTrack('Purchase', {
    value,
    currency,
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_ids: items.map((i) => i.id).filter(Boolean),
    content_type: 'product'
  });
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
  console.log('🛒 trackAddToCart called:', { id, name, quantity, price, currency });
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
  // Meta Pixel + server fallback (always fire server for reliability, pixel works even when queued)
  const fbqReady = typeof (window as any).fbq === 'function';
  console.log('📊 AddToCart: fbqReady?', fbqReady, '→ firing server fallback');
  fallbackServerTrack('AddToCart', {
    value: typeof price === 'number' ? price * quantity : undefined,
    currency,
    content_name: name,
    content_ids: id ? [id] : undefined,
    contents: [{ id, quantity, item_price: price }],
    content_type: 'product'
  }).catch(() => {}); // Don't block on server errors
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
  console.log('💳 trackInitiateCheckout called:', { items, value, currency });
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
  // Meta Pixel + server fallback (always fire server for reliability, pixel works even when queued)
  const fbqReady = typeof (window as any).fbq === 'function';
  console.log('📊 InitiateCheckout: fbqReady?', fbqReady, '→ firing server fallback');
  fallbackServerTrack('InitiateCheckout', {
    value,
    currency,
    content_ids: items.map(i => i.id).filter(Boolean),
    contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_type: 'product'
  }).catch(() => {}); // Don't block on server errors
  safeFbqTrack('InitiateCheckout', {
    value,
    currency,
    content_ids: items.map(i => i.id).filter(Boolean),
    contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_type: 'product'
  });
}

// ViewContent (product/content view)
export function trackViewContent(item: { id?: string; name?: string; price?: number }, currency: string = 'SEK'): void {
  const { id, name, price } = item || {};
  console.log('🔍 trackViewContent called:', { id, name, price, currency });
  // GA4
  safeGtagEvent('view_item', {
    currency,
    value: price,
    items: [{ item_id: id, item_name: name, price }]
  });
  // Meta Pixel + server fallback (always fire server for reliability, pixel works even when queued)
  const fbqReady = typeof (window as any).fbq === 'function';
  console.log('📊 ViewContent: fbqReady?', fbqReady, '→ firing server fallback');
  fallbackServerTrack('ViewContent', {
    content_name: name,
    content_ids: id ? [id] : undefined,
    contents: [{ id, item_price: price, quantity: 1 }],
    content_type: 'product',
    value: price,
    currency
  }).catch(() => {}); // Don't block on server errors
  safeFbqTrack('ViewContent', {
    content_name: name,
    content_ids: id ? [id] : undefined,
    contents: [{ id, item_price: price, quantity: 1 }],
    content_type: 'product',
    value: price,
    currency
  });
}

// Login
export function trackLogin(method: string = 'password'): void {
  // GA4
  safeGtagEvent('login', { method });
  // Meta Pixel + server fallback (pixel works even when queued)
  const fbqReady = typeof (window as any).fbq === 'function';
  if (!fbqReady) fallbackServerTrack('Login', { method });
  safeFbqTrack('Login', { method });
}

// CompleteRegistration (sign_up)
export function trackCompleteRegistration(method: string = 'password'): void {
  // GA4
  safeGtagEvent('sign_up', { method });
  // Meta Pixel + server fallback (pixel works even when queued)
  const fbqReady = typeof (window as any).fbq === 'function';
  if (!fbqReady) fallbackServerTrack('CompleteRegistration', { status: true, method });
  safeFbqTrack('CompleteRegistration', { status: true, method });
}


