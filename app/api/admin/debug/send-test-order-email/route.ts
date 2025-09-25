import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';
import { emailService } from '@/app/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  // If not authorized, requireAdminAuth already returned a response
  // but Next.js app routes need us to handle that explicitly
  if ((auth as any)?.status === 401) {
    return auth as unknown as NextResponse;
  }

  try {
    const body = await req.json();
    const to: string = String(body.to || '').trim();
    const customerName: string = String(body.customerName || 'Kund');
    const includeCredentials: boolean = Boolean(body.includeCredentials ?? true);
    const tempPassword: string = String(body.password || '').trim();

    if (!to) {
      return NextResponse.json({ error: 'Mottagaradress saknas (to)' }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://ulrika-functional-foods-production.up.railway.app';

    const orderNumber = `TEST-${Date.now()}`;
    const totalAmount = 2295;
    const courses = [
      { name: 'Functional Insulin balance/Energy', price: 2295 }
    ];

    const loginCredentials = includeCredentials
      ? {
          email: to,
          password: tempPassword || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase(),
          loginUrl: `${origin}/login`
        }
      : undefined;

    const sent = await emailService.sendOrderConfirmation({
      customerEmail: to,
      customerName,
      orderNumber,
      totalAmount,
      courses,
      loginCredentials
    });

    if (!sent) {
      return NextResponse.json({ ok: false, message: 'Kunde inte skicka e‑post (Mailchimp konfiguration?)' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orderNumber, to });
  } catch (error) {
    console.error('send-test-order-email error:', error);
    return NextResponse.json({ error: 'Internt fel vid testsändning' }, { status: 500 });
  }
}


