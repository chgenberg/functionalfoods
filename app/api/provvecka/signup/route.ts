import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Provvecka (Trial Week) Signup Endpoint
 * 
 * Adds subscribers with "Lead – Provvecka" tag to Mailchimp
 * for follow-up automations.
 */

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us4';
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || process.env.MAILCHIMP_AUDIENCE_ID;

const TAG_NAME = 'Lead – Provvecka';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      );
    }

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
      console.error('❌ Mailchimp not configured');
      return NextResponse.json(
        { error: 'E-posttjänsten är inte konfigurerad' },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Create MD5 hash for subscriber
    const crypto = require('crypto');
    const subscriberHash = crypto
      .createHash('md5')
      .update(normalizedEmail)
      .digest('hex');

    const baseUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;
    const memberUrl = `${baseUrl}/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;

    // Build tags array
    const tags = [TAG_NAME];
    if (source) {
      tags.push(`Provvecka – ${source}`);
    }

    // Add or update subscriber with tags
    const memberData = {
      email_address: normalizedEmail,
      status_if_new: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || ''
      },
      tags: tags
    };

    const response = await fetch(memberUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Mailchimp API error:', data);
      return NextResponse.json(
        { error: 'Kunde inte registrera din anmälan. Försök igen.' },
        { status: 500 }
      );
    }

    // Also add tags separately (PUT doesn't always apply tags for existing members)
    const tagsUrl = `${memberUrl}/tags`;
    await fetch(tagsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tags: tags.map(tag => ({ name: tag, status: 'active' }))
      })
    });

    console.log(`✅ Provvecka signup: ${normalizedEmail} tagged with "${TAG_NAME}"`);

    return NextResponse.json({
      success: true,
      message: 'Tack för din anmälan! Du får snart ett mejl med mer information.'
    });

  } catch (error) {
    console.error('❌ Provvecka signup error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod. Försök igen senare.' },
      { status: 500 }
    );
  }
}
