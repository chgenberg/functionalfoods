import { NextResponse } from 'next/server';
import { emailService } from '@/app/lib/email';

// Mailchimp Transactional API (Mandrill) för att skicka e-post
async function sendContactEmail(data: {
  namn: string;
  email: string;
  amne: string;
  meddelande: string;
}) {
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
  const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
    console.warn('Mailchimp audience config missing, skipping list subscribe');
  } else {
    try {
      const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;
      await fetch(mailchimpUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: data.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: data.namn.split(' ')[0],
            LNAME: data.namn.split(' ').slice(1).join(' '),
          },
          tags: ['Contact Form', 'Functional Foods'],
        }),
      });
    } catch (error) {
      console.log('Mailchimp subscription error (might be duplicate):', error);
    }
  }

  // Skicka riktig e-postnotifikation till info@functionalfoods.se
  const sent = await emailService.sendContactNotification({
    namn: data.namn,
    email: data.email,
    amne: data.amne || 'Kontakt från hemsidan',
    meddelande: data.meddelande,
  });

  return {
    success: sent,
    message: sent ? 'Meddelande skickat!' : 'Kunde inte skicka e-post just nu',
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validera data
    if (!data.namn || !data.email || !data.meddelande) {
      return NextResponse.json(
        { error: 'Alla fält måste fyllas i' },
        { status: 400 }
      );
    }

    // Skicka e-post
    const result = await sendContactEmail({
      namn: data.namn,
      email: data.email,
      amne: data.amne || 'Kontakt från hemsidan',
      meddelande: data.meddelande,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod. Försök igen senare.' },
      { status: 500 }
    );
  }
} 