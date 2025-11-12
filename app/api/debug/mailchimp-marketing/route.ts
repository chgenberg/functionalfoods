import { NextRequest, NextResponse } from 'next/server';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const mailchimpMarketing = getMailchimpMarketing();
    
    const config = {
      isConfigured: mailchimpMarketing.isConfigured(),
      environment: {
        MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY ? `SET (${process.env.MAILCHIMP_API_KEY.length} chars)` : 'NOT SET',
        MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX || 'NOT SET',
        MAILCHIMP_LIST_ID: process.env.MAILCHIMP_LIST_ID || 'NOT SET'
      },
      message: mailchimpMarketing.isConfigured() 
        ? '✅ Mailchimp Marketing is configured and ready'
        : '❌ Mailchimp Marketing is NOT configured. Please set environment variables.'
    };

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check Mailchimp configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

