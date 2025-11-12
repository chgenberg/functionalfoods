import { NextRequest, NextResponse } from 'next/server';
import { getMailchimpMarketing } from '@/app/lib/mailchimp-marketing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const mailchimpMarketing = getMailchimpMarketing();
    
    if (!mailchimpMarketing.isConfigured()) {
      return NextResponse.json({
        error: 'Mailchimp Marketing not configured',
        details: 'Please set MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and MAILCHIMP_LIST_ID'
      }, { status: 500 });
    }

    console.log(`📧 Testing Mailchimp add for: ${email}`);

    const result = await mailchimpMarketing.addSubscriber({
      email,
      firstName: firstName || 'Test',
      lastName: lastName || 'Kund',
      tags: ['kund'],
      status: 'subscribed'
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Customer ${email} added to Mailchimp with tag "kund"`,
        instructions: [
          '1. Go to Mailchimp → Audience → All contacts',
          `2. Search for: ${email}`,
          '3. Verify that contact has tag "kund"'
        ]
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to add customer (check server logs for details)'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing Mailchimp add:', error);
    return NextResponse.json({
      error: 'Failed to add customer to Mailchimp',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

