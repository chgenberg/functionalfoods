/**
 * Svea Ekonomi Payment Integration
 * Replaces Stripe payment processing
 */

import { createHash } from 'crypto';

export interface SveaPaymentConfig {
  merchantId: string;
  secretWord: string;
  testMode: boolean;
}

export interface SveaOrderItem {
  articleNumber: string;
  description: string;
  pricePerUnit: number; // In öre (1 kr = 100 öre)
  quantity: number;
  unit: string;
  vatPercent: number;
  discountPercent?: number;
}

export interface SveaCustomer {
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    streetAddress: string;
    postalCode: string;
    city: string;
    countryCode: string;
  };
}

export interface SveaCheckoutOrder {
  orderId: string;
  merchantSettings: {
    termsUri: string;
    checkoutUri: string;
    confirmationUri: string;
    pushUri: string;
  };
  cart: {
    items: SveaOrderItem[];
  };
  customer?: Partial<SveaCustomer>;
  currency: string;
  countryCode: string;
  locale: string;
}

export class SveaPaymentService {
  private config: SveaPaymentConfig;
  private baseUrl: string;

  constructor(config: SveaPaymentConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://checkoutapistage.svea.com'
      : 'https://checkoutapi.svea.com';
  }

  /**
   * Create checkout order with Svea
   */
  async createCheckoutOrder(orderData: SveaCheckoutOrder): Promise<{ checkoutOrderId: number; checkoutUrl: string }> {
    const endpoint = `${this.baseUrl}/api/orders`;
    
    // Svea Checkout API payload structure
    const payload = {
      merchantSettings: {
        termsUri: orderData.merchantSettings.termsUri,
        checkoutUri: orderData.merchantSettings.checkoutUri,
        confirmationUri: orderData.merchantSettings.confirmationUri,
        pushUri: orderData.merchantSettings.pushUri
      },
      cart: {
        items: orderData.cart.items.map(item => ({
          articleNumber: item.articleNumber,
          name: item.description,
          quantity: item.quantity,
          unitPrice: item.pricePerUnit,
          vatPercent: item.vatPercent,
          unit: item.unit
        }))
      },
      presetValues: orderData.customer ? [
        {
          typeName: 'emailAddress',
          value: orderData.customer.email,
          isReadonly: false
        }
      ] : [],
      currency: orderData.currency,
      countryCode: orderData.countryCode,
      locale: orderData.locale,
      merchantData: orderData.orderId
    };

    console.log('🔄 Creating Svea checkout order:', {
      endpoint,
      merchantId: this.config.merchantId,
      hasSecret: !!this.config.secretWord,
      itemCount: payload.cart.items.length
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.config.merchantId}:${this.config.secretWord}`).toString('base64')}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📡 Svea API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 500)
    });

    if (!response.ok) {
      throw new Error(`Svea API Error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    return {
      checkoutOrderId: result.orderId,
      checkoutUrl: result.gui?.snippet || result.checkoutUrl || result.redirectUrl
    };
  }

  /**
   * Get order details from Svea
   */
  async getOrder(checkoutOrderId: number): Promise<any> {
    const endpoint = `${this.baseUrl}/api/orders/${checkoutOrderId}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.merchantId}:${this.config.secretWord}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get Svea order: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Validate webhook signature from Svea
   */
  validateWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = createHash('sha512')
      .update(body + this.config.secretWord)
      .digest('base64');
    
    return signature === expectedSignature;
  }

  /**
   * Process Svea webhook
   */
  async processWebhook(webhookData: any): Promise<{
    orderId: string;
    status: 'completed' | 'failed' | 'pending';
    amount: number;
    currency: string;
    customer: {
      email: string;
      name?: string;
      phone?: string;
    };
  }> {
    const { orderId, orderStatus, amount, currency, customer } = webhookData;

    // Map Svea status to our internal status
    let status: 'completed' | 'failed' | 'pending' = 'pending';
    
    switch (orderStatus?.toLowerCase()) {
      case 'delivered':
      case 'final':
        status = 'completed';
        break;
      case 'cancelled':
      case 'failed':
        status = 'failed';
        break;
      default:
        status = 'pending';
    }

    return {
      orderId: orderId.toString(),
      status,
      amount: Math.round(amount * 100), // Convert to öre
      currency: currency || 'SEK',
      customer: {
        email: customer?.emailAddress || '',
        name: customer?.fullName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
        phone: customer?.phoneNumber
      }
    };
  }
}

// Create singleton instance
export const sveaPayment = new SveaPaymentService({
  merchantId: process.env.SVEA_MERCHANT_ID || '',
  secretWord: process.env.SVEA_SECRET_WORD || 'eaOXejEoVzL2ts5v7LMp6ay0SoPa54GftfGka8TUr9kpTjki4pHHO24dLYf0EEt03FInVUu921770igIdHfPx8AAkCJm22pXPtvoL6wj4IPW57nDRHW7yND4ehdtlig9',
  testMode: process.env.NODE_ENV !== 'production'
});
