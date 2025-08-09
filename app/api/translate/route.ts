import { NextResponse } from 'next/server';

// Very lightweight translation proxy using LibreTranslate public instances.
// NOTE: Best-effort only; for production, switch to a paid, reliable provider and add API key/quotas.

export async function POST(req: Request) {
  try {
    const { q, target } = await req.json();
    if (!Array.isArray(q) || !target) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Map Next locales to LibreTranslate language codes
    const lang = target === 'en' ? 'en' : target === 'es' ? 'es' : 'sv';

    const endpoint = 'https://libretranslate.de/translate';

    const results: string[] = [];
    for (const text of q) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, source: 'sv', target: lang, format: 'text' }),
          // Cache modestly for a short time at edge level
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const data = await res.json();
          results.push(data?.translatedText || text);
        } else {
          results.push(text);
        }
      } catch {
        results.push(text);
      }
    }

    return NextResponse.json({ translations: results });
  } catch (e) {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
} 