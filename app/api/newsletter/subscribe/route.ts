import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    // Validera e-postadress
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      );
    }

    // Mailchimp konfiguration
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
      console.error('Mailchimp miljövariabler saknas');
      return NextResponse.json(
        { error: 'Serverfel: Konfiguration saknas' },
        { status: 500 }
      );
    }

    // Mailchimp API URL
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    // Skapa subscriber hash (används för att identifiera befintliga prenumeranter)
    const crypto = require('crypto');
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    // Försök först att uppdatera befintlig prenumerant
    const checkUrl = `${url}/${subscriberHash}`;
    
    const memberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || ''
      },
      tags: ['Website Signup', 'Functional Foods']
    };

    // Försök att lägga till eller uppdatera prenumeranten
    const response = await fetch(checkUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Om det är ett "already exists" fel, försök uppdatera istället
      if (data.title === 'Member Exists') {
        return NextResponse.json(
          { message: 'Du är redan prenumerant på vårt nyhetsbrev!' },
          { status: 200 }
        );
      }
      
      console.error('Mailchimp API fel:', data);
      return NextResponse.json(
        { error: data.detail || 'Kunde inte lägga till prenumeration' },
        { status: response.status }
      );
    }

    // Skicka välkomstmail (valfritt - kan konfigureras i Mailchimp istället)
    // Detta hanteras vanligtvis av Mailchimp's automation

    return NextResponse.json(
      { 
        message: 'Tack för din prenumeration! Du kommer snart få ett bekräftelsemail.',
        data: {
          id: data.id,
          email: data.email_address,
          status: data.status
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid prenumeration' },
      { status: 500 }
    );
  }
}

// GET endpoint för att kontrollera prenumerationsstatus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'E-postadress krävs' },
        { status: 400 }
      );
    }

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
      return NextResponse.json(
        { error: 'Serverfel: Konfiguration saknas' },
        { status: 500 }
      );
    }

    const crypto = require('crypto');
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { subscribed: false },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'Kunde inte kontrollera prenumerationsstatus' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        subscribed: data.status === 'subscribed',
        status: data.status,
        email: data.email_address
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter status check error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid kontroll av prenumeration' },
      { status: 500 }
    );
  }
} 