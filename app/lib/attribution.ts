"use client";

// Lightweight attribution capture and storage (gclid/gbraid/wbraid/fbclid + utm params)

export type Attribution = {
  // Google Ads click identifiers
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  // Meta/Facebook click identifier
  fbclid?: string;
  // Mailchimp campaign identifiers
  mc_cid?: string;  // Mailchimp campaign ID
  mc_eid?: string;  // Mailchimp subscriber/email ID
  // UTM parameters (all platforms)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  // Addrevenue affiliate tracking
  addrevenue_clickId?: string;
  addrevenue_channelId?: string;
  addrevenue_advertiserId?: string;
  addrevenue_market?: string;
  addrevenue_clickRef?: string;
  // Referrer
  ref?: string;
  // Timestamp when captured
  ts?: number;
};

const COOKIE_NAME = "_ff_attr";
const COOKIE_MAX_AGE_DAYS = 180; // ~6 months

export function getAttributionFromUrl(url?: string): Attribution | null {
  try {
    const u = new URL(url || (typeof window !== 'undefined' ? window.location.href : ''));
    const p = u.searchParams;
    const attr: Attribution = {
      // Google Ads
      gclid: p.get('gclid') || undefined,
      gbraid: p.get('gbraid') || undefined,
      wbraid: p.get('wbraid') || undefined,
      // Meta/Facebook
      fbclid: p.get('fbclid') || undefined,
      // Mailchimp campaign tracking
      mc_cid: p.get('mc_cid') || undefined,
      mc_eid: p.get('mc_eid') || undefined,
      // UTM parameters
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      utm_term: p.get('utm_term') || undefined,
      utm_content: p.get('utm_content') || undefined,
      // Addrevenue may redirect with explicit names, while their own
      // tracking links use short aliases before the redirect.
      addrevenue_clickId: p.get('clickId') || p.get('clickid') || undefined,
      addrevenue_channelId: p.get('channelId') || p.get('channelid') || p.get('c') || undefined,
      addrevenue_advertiserId: p.get('advertiserId') || p.get('advertiserid') || p.get('a') || undefined,
      addrevenue_market: p.get('market') || p.get('m') || undefined,
      addrevenue_clickRef: p.get('clickRef') || p.get('clickref') || p.get('r') || undefined,
      // Referrer
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
    const keys: Array<keyof Attribution> = ['gclid','gbraid','wbraid','fbclid','mc_cid','mc_eid','utm_source','utm_medium','utm_campaign','utm_term','utm_content','addrevenue_clickId','addrevenue_channelId','addrevenue_advertiserId','addrevenue_market','addrevenue_clickRef'];
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


