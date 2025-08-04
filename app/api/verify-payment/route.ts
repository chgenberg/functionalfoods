import { NextResponse } from 'next/server';
import { PaymentService } from '../../lib/payment';

export const dynamic = 'force-dynamic';

const paymentService = new PaymentService();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentIntentId, paymentMethod } = body;

    if (!paymentIntentId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Payment Intent ID och betalningsmetod krävs' },
        { status: 400 }
      );
    }

    // Verify payment with the payment service
    const verificationResult = await paymentService.verifyPayment(paymentIntentId, paymentMethod);

    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        status: verificationResult.status,
        paymentId: verificationResult.paymentId,
        message: 'Betalning verifierad framgångsrikt'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: verificationResult.error || 'Betalningen kunde inte verifieras',
        status: verificationResult.status
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid verifiering av betalningen' },
      { status: 500 }
    );
  }
} 