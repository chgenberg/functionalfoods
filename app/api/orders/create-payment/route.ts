import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/app/lib/payment';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // For now, we'll skip session checking since auth is not yet configured
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const amount = body.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create payment request
    const paymentService = new PaymentService();
    const paymentRequest = {
      amount,
      currency: 'SEK',
      items: body.items,
      customer: {
        userId: body.customerId || 'guest',
        email: body.customerEmail || 'guest@example.com',
        name: body.customerName || 'Guest User'
      },
      paymentMethod: body.paymentMethod,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`
    };

    const response = await paymentService.processPayment(paymentRequest);

    // Extract client secret from redirect URL if present
    let clientSecret: string | undefined;
    if (response.redirectUrl?.includes('client_secret=')) {
      const url = new URL(response.redirectUrl, 'http://localhost:3000');
      clientSecret = url.searchParams.get('client_secret') || undefined;
    }

    return NextResponse.json({
      success: response.success,
      paymentId: response.paymentId,
      clientSecret,
      redirectUrl: response.redirectUrl,
      status: response.status
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment creation failed' },
      { status: 500 }
    );
  }
} 