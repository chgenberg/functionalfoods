// Payment service structure - ready for real APIs
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'klarna' | 'swish' | 'stripe' | 'paypal';
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'course' | 'book';
  }>;
  customer: {
    userId: string;
    email: string;
    name?: string;
  };
  paymentMethod: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  redirectUrl?: string;
  error?: string;
  transactionId?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'klarna',
    name: 'Klarna',
    type: 'klarna',
    description: 'Betala senare eller i delbetalningar',
    icon: '💳',
    enabled: true
  },
  {
    id: 'swish',
    name: 'Swish',
    type: 'swish', 
    description: 'Betala direkt med Swish',
    icon: '📱',
    enabled: true
  },
  {
    id: 'stripe',
    name: 'Kort',
    type: 'stripe',
    description: 'Betala med kort via Stripe',
    icon: '💳',
    enabled: true // Aktiverar Stripe
  }
];

// Payment service class - easy to extend with real APIs
export class PaymentService {
  private isProduction = process.env.NODE_ENV === 'production';
  private klarnaApiKey = process.env.KLARNA_API_KEY;
  private stripeApiKey = process.env.STRIPE_SECRET_KEY;

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Always use real payment APIs for Stripe (test mode keys work in development)
      switch (request.paymentMethod) {
        case 'klarna':
          // In development/testing, simulate Klarna payment
          if (!this.isProduction) {
            return this.simulatePayment(request);
          }
          return this.processKlarnaPayment(request);
        case 'swish':
          // In development/testing, simulate Swish payment
          if (!this.isProduction) {
            return this.simulatePayment(request);
          }
          return this.processSwishPayment(request);
        case 'stripe':
          // Always use real Stripe API (test keys work in development)
          return this.processStripePayment(request);
        default:
          throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Simulation for development - remove/replace when going live
  private async simulatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate (for testing failure scenarios)
    const shouldFail = Math.random() < 0.05;
    
    if (shouldFail) {
      return {
        success: false,
        status: 'failed',
        error: 'Betalningen misslyckades (simulerat fel för test)'
      };
    }

    const transactionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      status: 'completed',
      paymentId: transactionId,
      transactionId: transactionId
    };
  }

  // Ready for Klarna integration
  private async processKlarnaPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.klarnaApiKey) {
      throw new Error('Klarna API key not configured');
    }

    // TODO: Implement real Klarna integration
    // Example structure:
    /*
    const klarnaPayload = {
      purchase_country: 'SE',
      purchase_currency: request.currency,
      locale: 'sv-SE',
      order_amount: request.amount * 100, // Klarna uses öre
      order_lines: request.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price * 100,
        total_amount: item.price * item.quantity * 100
      })),
      merchant_urls: {
        terms: 'https://yoursite.com/terms',
        checkout: 'https://yoursite.com/checkout',
        confirmation: 'https://yoursite.com/confirmation',
        push: 'https://yoursite.com/api/klarna/push'
      }
    };

    const response = await fetch('https://api.klarna.com/checkout/v3/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.klarnaApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(klarnaPayload)
    });
    */

    throw new Error('Klarna integration not yet implemented');
  }

  // Ready for Swish integration
  private async processSwishPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // TODO: Implement real Swish integration
    throw new Error('Swish integration not yet implemented');
  }

  // Implementerar riktig Stripe-integration
  private async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.stripeApiKey) {
      throw new Error('Stripe API key not configured');
    }

    try {
      const stripe = require('stripe')(this.stripeApiKey);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Stripe använder öre
        currency: request.currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: request.customer.userId,
          customerEmail: request.customer.email,
          items: JSON.stringify(request.items),
          orderType: 'course_purchase',
          website: 'ulrika-functional-foods', // Identifierar nya sajten
          platform: 'new-site' // För att särskilja från gamla sajten
        },
        receipt_email: request.customer.email,
        description: `Ulrika Functional Foods - ${request.items.map(item => item.name).join(', ')}` // Uppdaterad beskrivning
      });

      return {
        success: true,
        status: 'pending',
        paymentId: paymentIntent.id,
        redirectUrl: paymentIntent.client_secret ? `/checkout/stripe?client_secret=${paymentIntent.client_secret}` : undefined
      };

    } catch (error) {
      console.error('Stripe payment error:', error);
      throw new Error(`Stripe payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verifierar Stripe-betalning
  private async verifyStripePayment(paymentId: string): Promise<PaymentResponse> {
    if (!this.stripeApiKey) {
      throw new Error('Stripe API key not configured');
    }

    try {
      const stripe = require('stripe')(this.stripeApiKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status === 'succeeded' ? 'completed' : 
                paymentIntent.status === 'canceled' ? 'cancelled' : 'pending',
        paymentId: paymentIntent.id,
        transactionId: paymentIntent.id
      };

    } catch (error) {
      console.error('Stripe verification error:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  // Verify payment status - useful for webhooks
  async verifyPayment(paymentId: string, paymentMethod: string): Promise<PaymentResponse> {
    if (!this.isProduction) {
      // In development, assume all payments are completed
      return {
        success: true,
        status: 'completed',
        paymentId: paymentId
      };
    }

    // Implementerar riktig payment verification för varje metod
    switch (paymentMethod) {
      case 'klarna':
        // return this.verifyKlarnaPayment(paymentId);
        throw new Error('Klarna verification not yet implemented');
      case 'swish':
        // return this.verifySwishPayment(paymentId);
        throw new Error('Swish verification not yet implemented');
      case 'stripe':
        return this.verifyStripePayment(paymentId);
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  }
} 