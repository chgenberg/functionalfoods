"use client";

// Lightweight attribution capture and storage (gclid/gbraid/wbraid + utm params)

export type Attribution = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
  ts?: number; // epoch ms when captured
};

const COOKIE_NAME = "_ff_attr";
const COOKIE_MAX_AGE_DAYS = 180; // ~6 months

export function getAttributionFromUrl(url?: string): Attribution | null {
  try {
    const u = new URL(url || (typeof window !== 'undefined' ? window.location.href : ''));
    const p = u.searchParams;
    const attr: Attribution = {
      gclid: p.get('gclid') || undefined,
      gbraid: p.get('gbraid') || undefined,
      wbraid: p.get('wbraid') || undefined,
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      utm_term: p.get('utm_term') || undefined,
      utm_content: p.get('utm_content') || undefined,
      ref: (typeof document !== 'undefined' ? document.referrer : undefined) || undefined,
      ts: Date.now()
    };
    // If nothing present, return null
    const hasAny = Object.values({ ...attr, ts: undefined }).some(Boolean);
    return hasAny ? attr : null;
  } catch {
    return null;
  }
}

export function saveAttribution(attr: Attribution): void {
  try {
    if (typeof window === 'undefined') return;
    const sanitized: Attribution = Object.fromEntries(
      Object.entries(attr).filter(([_, v]) => v != null && String(v).length > 0)
    ) as Attribution;
    sanitized.ts = sanitized.ts || Date.now();
    // localStorage
    try { localStorage.setItem('ff_attribution', JSON.stringify(sanitized)); } catch {}
    // cookie (encoded JSON)
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + COOKIE_MAX_AGE_DAYS);
      const encoded = encodeURIComponent(JSON.stringify(sanitized));
      document.cookie = `${COOKIE_NAME}=${encoded}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    } catch {}
  } catch {}
}

export function readAttribution(): Attribution | null {
  try {
    if (typeof window === 'undefined') return null;
    // Try localStorage first
    try {
      const raw = localStorage.getItem('ff_attribution');
      if (raw) return JSON.parse(raw);
    } catch {}
    // Fallback to cookie
    try {
      const cookie = document.cookie || '';
      const m = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`).exec(cookie);
      if (m) {
        const decoded = decodeURIComponent(m[1]);
        return JSON.parse(decoded);
      }
    } catch {}
    return null;
  } catch {
    return null;
  }
}

export function attachAttributionToUrl(url: string, attr?: Attribution | null): string {
  try {
    const a = attr || readAttribution();
    if (!a) return url;
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    const keys: Array<keyof Attribution> = ['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
    for (const k of keys) {
      const v = a[k];
      if (v && !u.searchParams.get(k as string)) {
        u.searchParams.set(k as string, String(v));
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}


