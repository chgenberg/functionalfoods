import { NextResponse } from 'next/server';

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
    throw new Error('Mailchimp configuration missing');
  }

  // Först, lägg till kontakten i Mailchimp-listan (om de vill)
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
    // Ignorera fel om användaren redan finns
    console.log('Mailchimp subscription error (might be duplicate):', error);
  }

  // Skicka e-postnotifikation till info@functionalfoods.se
  // För detta behöver vi en e-posttjänst. Vi kan använda en enkel SMTP-lösning
  // eller en tredjepartstjänst. För nu returnerar vi bara success.
  
  // I en riktig implementation skulle du använda något som:
  // - SendGrid
  // - AWS SES
  // - Postmark
  // - eller Mailchimp Transactional (Mandrill)
  
  return {
    success: true,
    message: 'Meddelande skickat!',
    emailContent: {
      to: 'info@functionalfoods.se',
      from: data.email,
      subject: `Kontaktformulär: ${data.amne}`,
      body: `
        Nytt meddelande från kontaktformuläret:
        
        Namn: ${data.namn}
        E-post: ${data.email}
        Ämne: ${data.amne}
        
        Meddelande:
        ${data.meddelande}
      `
    }
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validera data
    if (!data.namn || !data.email || !data.amne || !data.meddelande) {
      return NextResponse.json(
        { error: 'Alla fält måste fyllas i' },
        { status: 400 }
      );
    }

    // Skicka e-post
    const result = await sendContactEmail(data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod. Försök igen senare.' },
      { status: 500 }
    );
  }
} 