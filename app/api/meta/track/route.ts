import { NextRequest, NextResponse } from 'next/server';
import { sendMetaEvent } from '@/app/lib/meta-capi';

function requestIp(req: NextRequest): string | null {
  const hdr = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const ip = hdr.split(',')[0].trim();
  return ip || null;
}

export const dynamic = 'force-dynamic';

// Lightweight endpoint to forward client events to Meta CAPI (server-side)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const {
      eventName,
      params = {},
      email,
      sourceUrl,
      testEventCode,
      eventId,
      fbp,
      fbc
    } = body || {};

    console.log('📊 META /api/meta/track called:', { eventName, params, hasEmail: !!email, sourceUrl, testEventCode, eventId, hasFbp: !!fbp, hasFbc: !!fbc });

    if (!eventName || typeof eventName !== 'string') {
      return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
    }

    // Whitelist to avoid abuse
    const allowed = new Set([
      'ViewContent',
      'AddToCart',
      'InitiateCheckout',
      'Purchase',
      'Lead',
      'Login',
      'CompleteRegistration'
    ]);
    if (!allowed.has(eventName)) {
      return NextResponse.json({ error: 'Event not allowed' }, { status: 400 });
    }

    // Build best-effort user data for attribution
    const ip = requestIp(req);

    await sendMetaEvent({
      eventName,
      params: { ...params },
      email,
      sourceUrl: sourceUrl || req.headers.get('referer') || undefined,
      testEventCode,
      eventId,
      userAgent: req.headers.get('user-agent') || undefined,
      fbp,
      fbc,
      // @ts-ignore – extended type with client_ip_address used in meta-capi
      clientIp: ip || undefined
    });

    console.log('✅ META event sent successfully:', eventName);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Meta track error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}


