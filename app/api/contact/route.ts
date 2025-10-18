import { NextResponse } from 'next/server';
import { emailService } from '@/app/lib/email';
import { trackLeadServer } from '@/app/lib/server-analytics';

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const;
type Lang = typeof SUPPORTED[number];
const M: Record<Lang, Record<string,string>> = {
  sv: { missing: 'Alla fält måste fyllas i', sent: 'Meddelande skickat!', fail: 'Kunde inte skicka e-post just nu', subject: 'Kontakt från hemsidan', error: 'Ett fel uppstod. Försök igen senare.' },
  en: { missing: 'All fields are required', sent: 'Message sent!', fail: 'Could not send email right now', subject: 'Contact from website', error: 'An error occurred. Please try again later.' },
  es: { missing: 'Todos los campos son obligatorios', sent: '¡Mensaje enviado!', fail: 'No se pudo enviar el correo ahora', subject: 'Contacto desde el sitio web', error: 'Ocurrió un error. Inténtalo de nuevo más tarde.' },
  de: { missing: 'Alle Felder sind erforderlich', sent: 'Nachricht gesendet!', fail: 'E-Mail konnte derzeit nicht gesendet werden', subject: 'Kontakt von der Website', error: 'Es ist ein Fehler aufgetreten. Bitte später erneut versuchen.' },
  fr: { missing: 'Tous les champs sont obligatoires', sent: 'Message envoyé !', fail: "Impossible d'envoyer l'e-mail pour le moment", subject: 'Contact depuis le site web', error: 'Une erreur est survenue. Réessayez plus tard.' }
};
function getLang(request: Request): Lang {
  const cookie = (request as any).cookies?.get?.('lang')?.value || '';
  const hdr = (request as any).headers?.get?.('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (cookie || (m ? m[1] : '')).toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val) ? (val as Lang) : 'sv';
}

// Mailchimp Transactional API (Mandrill) för att skicka e-post
async function sendContactEmail(data: {
  namn: string;
  email: string;
  amne: string;
  meddelande: string;
  lang: Lang;
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
          tags: ['Contact Form', 'Functional Foods', data.lang.toUpperCase()],
        }),
      });
    } catch (error) {
      console.log('Mailchimp subscription error (might be duplicate):', error);
    }
  }

  const sent = await emailService.sendContactNotification({
    namn: data.namn,
    email: data.email,
    amne: data.amne || M[data.lang].subject,
    meddelande: data.meddelande,
  });

  return {
    success: sent,
    message: sent ? M[data.lang].sent : M[data.lang].fail,
  };
}

export async function POST(request: Request) {
  try {
    const lang = getLang(request);
    const data = await request.json();
    
    if (!data.namn || !data.email || !data.meddelande) {
      return NextResponse.json(
        { error: M[lang].missing },
        { status: 400 }
      );
    }

    const result = await sendContactEmail({
      namn: data.namn,
      email: data.email,
      amne: data.amne || M[lang].subject,
      meddelande: data.meddelande,
      lang
    });
    // Server-side GA4 Lead (deduped by UA if client fires too)
    try {
      await trackLeadServer({ source: 'contact_form', clientSeed: data.email });
    } catch {}
    // Return non-200 if email could not be sent so client can show error
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('Contact form error:', error);
    const lang = getLang(request);
    return NextResponse.json(
      { error: M[lang].error },
      { status: 500 }
    );
  }
} 