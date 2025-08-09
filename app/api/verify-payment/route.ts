import { NextResponse } from 'next/server';
import { PaymentService } from '../../lib/payment';

export const dynamic = 'force-dynamic';

const paymentService = new PaymentService();

const SUPPORTED = ['sv', 'en', 'es', 'de', 'fr'] as const;
type Lang = typeof SUPPORTED[number];
const M: Record<Lang, Record<string,string>> = {
  sv: { missing: 'Payment Intent ID och betalningsmetod krävs', ok: 'Betalning verifierad framgångsrikt', notOk: 'Betalningen kunde inte verifieras', err: 'Ett fel uppstod vid verifiering av betalningen' },
  en: { missing: 'Payment Intent ID and payment method are required', ok: 'Payment verified successfully', notOk: 'The payment could not be verified', err: 'An error occurred while verifying the payment' },
  es: { missing: 'Se requieren Payment Intent ID y método de pago', ok: 'Pago verificado con éxito', notOk: 'No se pudo verificar el pago', err: 'Ocurrió un error al verificar el pago' },
  de: { missing: 'Payment Intent ID und Zahlungsmethode sind erforderlich', ok: 'Zahlung erfolgreich verifiziert', notOk: 'Die Zahlung konnte nicht verifiziert werden', err: 'Beim Verifizieren der Zahlung ist ein Fehler aufgetreten' },
  fr: { missing: "Payment Intent ID et mode de paiement requis", ok: 'Paiement vérifié avec succès', notOk: 'Le paiement n’a pas pu être vérifié', err: 'Une erreur est survenue lors de la vérification du paiement' }
};
function getLang(request: Request): Lang {
  const hdr = (request as any).headers?.get?.('cookie') || '';
  const m = /(?:^|;\s*)lang=([^;]+)/.exec(hdr);
  const val = (m ? m[1] : '').toLowerCase();
  return (SUPPORTED as readonly string[]).includes(val) ? (val as Lang) : 'sv';
}

export async function POST(request: Request) {
  try {
    const lang = getLang(request);
    const body = await request.json();
    const { paymentIntentId, paymentMethod } = body;

    if (!paymentIntentId || !paymentMethod) {
      return NextResponse.json(
        { error: M[lang].missing },
        { status: 400 }
      );
    }

    const verificationResult = await paymentService.verifyPayment(paymentIntentId, paymentMethod);

    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        status: verificationResult.status,
        paymentId: verificationResult.paymentId,
        message: M[lang].ok
      });
    } else {
      return NextResponse.json({
        success: false,
        error: verificationResult.error || M[lang].notOk,
        status: verificationResult.status
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    const lang = getLang(request);
    return NextResponse.json(
      { error: M[lang].err },
      { status: 500 }
    );
  }
} 