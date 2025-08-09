import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const headers = new Headers(req.headers);
  const acceptLanguage = headers.get('accept-language') || '';
  const xff = headers.get('x-forwarded-for') || '';
  const ip = (xff.split(',')[0] || '').trim();

  let country = '';
  try {
    // Lightweight geo lookup (best effort). Free services often rate-limit; handle failures gracefully.
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      country = data?.country_code || '';
    }
  } catch {}

  const preferEs = acceptLanguage.toLowerCase().includes('es');
  const preferEn = acceptLanguage.toLowerCase().includes('en');

  let suggested: 'sv'|'en'|'es'|null = null;
  if (country === 'ES' || preferEs) suggested = 'es';
  else if (preferEn) suggested = 'en';

  return NextResponse.json({ country, suggested });
} 