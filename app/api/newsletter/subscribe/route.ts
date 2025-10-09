import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/app/lib/email';

export const dynamic = 'force-dynamic';

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const;

type Lang = typeof SUPPORTED[number];

type Messages = Record<string, string>;

const M: Record<Lang, Messages> = {
  sv: {
    invalidEmail: 'Ogiltig e-postadress',
    missingConfig: 'Serverfel: Konfiguration saknas',
    memberExists: 'Du är redan prenumerant på vårt nyhetsbrev!',
    addFailed: 'Kunde inte lägga till prenumeration',
    success: 'Tack för din prenumeration! Du kommer snart få ett bekräftelsemail.',
    subscribeError: 'Ett fel uppstod vid prenumeration',
    emailRequired: 'E-postadress krävs',
    statusCheckFailed: 'Kunde inte kontrollera prenumerationsstatus',
    statusCheckError: 'Ett fel uppstod vid kontroll av prenumeration'
  },
  en: {
    invalidEmail: 'Invalid email address',
    missingConfig: 'Server error: Missing configuration',
    memberExists: 'You are already subscribed to our newsletter!',
    addFailed: 'Could not add subscription',
    success: 'Thank you for subscribing! You will receive a confirmation email shortly.',
    subscribeError: 'An error occurred during subscription',
    emailRequired: 'Email is required',
    statusCheckFailed: 'Could not check subscription status',
    statusCheckError: 'An error occurred while checking subscription'
  },
  es: {
    invalidEmail: 'Dirección de correo no válida',
    missingConfig: 'Error del servidor: Falta la configuración',
    memberExists: '¡Ya estás suscrito a nuestro boletín!',
    addFailed: 'No se pudo agregar la suscripción',
    success: '¡Gracias por suscribirte! Pronto recibirás un correo de confirmación.',
    subscribeError: 'Ocurrió un error durante la suscripción',
    emailRequired: 'Se requiere correo electrónico',
    statusCheckFailed: 'No se pudo comprobar el estado de la suscripción',
    statusCheckError: 'Ocurrió un error al comprobar la suscripción'
  },
  de: {
    invalidEmail: 'Ungültige E-Mail-Adresse',
    missingConfig: 'Serverfehler: Fehlende Konfiguration',
    memberExists: 'Du bist bereits für unseren Newsletter angemeldet!',
    addFailed: 'Abonnement konnte nicht hinzugefügt werden',
    success: 'Danke für deine Anmeldung! Du erhältst in Kürze eine Bestätigungs-E-Mail.',
    subscribeError: 'Beim Abonnieren ist ein Fehler aufgetreten',
    emailRequired: 'E-Mail-Adresse ist erforderlich',
    statusCheckFailed: 'Abonnementstatus konnte nicht geprüft werden',
    statusCheckError: 'Beim Prüfen des Abonnementstatus ist ein Fehler aufgetreten'
  },
  fr: {
    invalidEmail: 'Adresse e-mail invalide',
    missingConfig: 'Erreur serveur : configuration manquante',
    memberExists: 'Vous êtes déjà abonné à notre newsletter !',
    addFailed: 'Impossible d’ajouter l’abonnement',
    success: 'Merci pour votre abonnement ! Vous recevrez bientôt un e-mail de confirmation.',
    subscribeError: 'Une erreur s’est produite lors de l’abonnement',
    emailRequired: 'Adresse e-mail requise',
    statusCheckFailed: 'Impossible de vérifier le statut de l’abonnement',
    statusCheckError: 'Une erreur s’est produite lors de la vérification de l’abonnement'
  }
};

function getLang(request: NextRequest): Lang {
  const cookieLang = request.cookies.get('lang')?.value?.toLowerCase();
  if (cookieLang && (SUPPORTED as readonly string[]).includes(cookieLang)) {
    return cookieLang as Lang;
  }
  return 'sv';
}

export async function POST(request: NextRequest) {
  try {
    const lang = getLang(request);
    const { email, firstName, lastName, source } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: M[lang].invalidEmail },
        { status: 400 }
      );
    }

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
      console.error('Mailchimp env missing');
      return NextResponse.json(
        { error: M[lang].missingConfig },
        { status: 500 }
      );
    }

    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    const crypto = require('crypto');
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    const checkUrl = `${url}/${subscriberHash}`;
    
    const tags = ['Website Signup', 'Functional Foods', (lang || 'sv').toUpperCase()];
    if (source === 'health-quiz') {
      tags.push('Health Quiz');
      console.log('🏷️ Adding "Health Quiz" tag to subscriber:', email);
    }
    
    console.log('📧 Subscribing to Mailchimp with tags:', tags);
    
    const memberData = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || ''
      },
      tags
    } as any;

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
      if (data.title === 'Member Exists') {
        return NextResponse.json(
          { message: M[lang].memberExists },
          { status: 200 }
        );
      }
      console.error('Mailchimp API error:', data);
      return NextResponse.json(
        { error: data.detail || M[lang].addFailed },
        { status: response.status }
      );
    }

    // Send notification email to info@functionalfoods.se about new subscriber
    try {
      await emailService.sendNewsletterNotification({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        lang,
        source: source || 'website'
      });
      console.log('✅ Newsletter notification sent to info@functionalfoods.se');
    } catch (emailError) {
      console.error('⚠️ Failed to send newsletter notification email:', emailError);
      // Don't fail the whole request if notification fails
    }

    return NextResponse.json(
      { 
        message: M[lang].success,
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
    const lang = getLang(request);
    return NextResponse.json(
      { error: M[lang].subscribeError },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const lang = getLang(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: M[lang].emailRequired },
        { status: 400 }
      );
    }

    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
      return NextResponse.json(
        { error: M[lang].missingConfig },
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
        { error: M[lang].statusCheckFailed },
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
    const lang = getLang(request);
    return NextResponse.json(
      { error: M[lang].statusCheckError },
      { status: 500 }
    );
  }
} 