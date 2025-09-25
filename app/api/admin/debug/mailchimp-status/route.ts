import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/app/lib/admin-auth';

// @ts-expect-error - Mailchimp Transactional lacks TS types
import mailchimp from '@mailchimp/mailchimp_transactional';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if ((auth as any)?.status === 401) return auth as unknown as NextResponse;

  try {
    const apiKey = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || '';
    const configured = !!apiKey;
    if (!configured) {
      return NextResponse.json({ configured: false, message: 'MAILCHIMP_TRANSACTIONAL_API_KEY saknas' }, { status: 200 });
    }

    const client = mailchimp(apiKey);
    const results: any = { configured: true };

    // Ping
    try {
      const pingRes = await client.users.ping();
      results.ping = pingRes; // return 'PONG!'
    } catch (e: any) {
      results.pingError = String(e?.message || e);
    }

    // List sending domains, if supported
    try {
      if (client.senders && client.senders.domains) {
        results.domains = await client.senders.domains();
      } else if (client.senders && client.senders.list) {
        results.senders = await client.senders.list();
      }
    } catch (e: any) {
      results.domainError = String(e?.message || e);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('mailchimp-status error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


