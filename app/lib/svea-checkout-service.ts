/**
 * Svea Checkout Service - Complete rewrite
 * Documentation: https://www.svea.com/se/foretag/betallosningar/e-handel/svea-checkout/
 */

import { createHash, randomUUID } from 'crypto';

// Types according to Svea API documentation
export interface SveaConfig {
  merchantId: string;
  secretWord: string;
  testMode: boolean;
}

export interface SveaCartItem {
  articleNumber: string;
  name: string;
  quantity: number;
  unitPrice: number; // In minor units (öre)
  discountPercent?: number;
  vatPercent: number;
  unit: string;
  temporaryReference?: string;
}

export interface SveaMerchantSettings {
  termsUri: string;
  checkoutUri: string;
  confirmationUri: string;
  pushUri: string;
  checkoutValidationCallBackUri?: string;
  partnerKey?: string;
}

export interface SveaPresetValue {
  typeName: 'emailAddress' | 'postalCode' | 'nationalId' | 'phoneNumber' | 'isCompany';
  value: string;
  isReadonly: boolean;
}

export interface CreateCheckoutOrderRequest {
  countryCode: string;
  currency: string;
  locale: string;
  clientOrderNumber?: string;
  merchantSettings: SveaMerchantSettings;
  cart: {
    items: SveaCartItem[];
  };
  requireElectronicIdAuthentication?: boolean;
  presetValues?: SveaPresetValue[];
  identityFlags?: {
    hideNotYou?: boolean;
    hideChangeAddress?: boolean;
    hideAnonymous?: boolean;
  };
  partnerKey?: string;
  merchantData?: string;
}

export interface CheckoutOrderResponse {
  orderId: number;
  gui: {
    snippet: string;
    width: number;
    height: number;
  };
  status: string;
}

export interface GetOrderResponse {
  id: number;
  status: 'Created' | 'Confirmed' | 'Final' | 'Cancelled' | 'Expired';
  cart: {
    items: SveaCartItem[];
  };
  currency: string;
  customer: {
    nationalId?: string;
    email?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    streetAddress?: string;
    coAddress?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    streetAddress?: string;
    coAddress?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
  };
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    streetAddress?: string;
    coAddress?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
  };
  emailAddress?: string;
  phoneNumber?: string;
  paymentType?: string;
  payment?: {
    paymentMethodType?: string;
  };
  sveaWillBuyOrder?: boolean;
  customerReference?: string;
  creationDate?: string;
  merchantData?: string;
  clientOrderNumber?: string;
}

export interface WebhookPayload {
  orderId: number;
  status: string;
  paymentType?: string;
  creationDate: string;
  customerCountry?: string;
  currency?: string;
  orderAmount?: number;
  capturedAmount?: number;
  creditedAmount?: number;
  merchantData?: string;
}

export class SveaCheckoutService {
  private config: SveaConfig;
  private baseUrl: string;

  constructor(config: SveaConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://checkoutapistage.svea.com'
      : 'https://checkoutapi.svea.com';
  }

  /**
   * Create a new checkout order
   */
  async createOrder(request: CreateCheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders`;
    const requestId = randomUUID();
    const timestamp = new Date().toISOString();
    const requestBody = JSON.stringify(request);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader('POST', requestBody, timestamp),
          'X-Request-Id': requestId,
          'X-Timestamp': timestamp,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        },
        body: requestBody
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        const errorDetail = this.parseErrorResponse(responseText);
        throw new Error(`Svea API Error (${response.status}): ${errorDetail}`);
      }

      const result = JSON.parse(responseText) as CheckoutOrderResponse;
      
      if (!result.orderId || !result.gui?.snippet) {
        throw new Error('Invalid response from Svea: missing orderId or GUI snippet');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error creating Svea order');
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: number): Promise<GetOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders/${orderId}`;
    const requestId = randomUUID();
    const timestamp = new Date().toISOString();
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader('GET', '', timestamp),
          'X-Request-Id': requestId,
          'X-Timestamp': timestamp,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        }
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        const errorDetail = this.parseErrorResponse(responseText);
        throw new Error(`Svea API Error (${response.status}): ${errorDetail}`);
      }

      return JSON.parse(responseText) as GetOrderResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error fetching Svea order');
    }
  }

  /**
   * Update order with new items or amounts
   */
  async updateOrder(orderId: number, request: Partial<CreateCheckoutOrderRequest>): Promise<CheckoutOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders/${orderId}`;
    const timestamp = new Date().toISOString();
    const requestBody = JSON.stringify(request);
    
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader('PUT', requestBody, timestamp),
          'X-Timestamp': timestamp,
          'User-Agent': 'FunctionalFoods/1.0 (+ulrikafunctionalfoods.com)'
        },
        body: requestBody
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        const errorDetail = this.parseErrorResponse(responseText);
        throw new Error(`Svea API Error (${response.status}): ${errorDetail}`);
      }

      return JSON.parse(responseText) as CheckoutOrderResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error updating Svea order');
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(body: string, signature: string): boolean {
    // According to Svea docs: SHA-512(request body + secret)
    const expectedSignature = createHash('sha512')
      .update(body + this.config.secretWord)
      .digest('base64');
    
    // Constant time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    
    let match = true;
    for (let i = 0; i < signature.length; i++) {
      if (signature[i] !== expectedSignature[i]) {
        match = false;
      }
    }
    
    return match;
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(body: string): WebhookPayload {
    try {
      return JSON.parse(body) as WebhookPayload;
    } catch (error) {
      throw new Error('Invalid webhook payload');
    }
  }

  /**
   * Format price from kronor to öre
   */
  static formatPriceToMinorUnits(priceInKronor: number): number {
    return Math.round(priceInKronor * 100);
  }

  /**
   * Format price from öre to kronor
   */
  static formatPriceFromMinorUnits(priceInOre: number): number {
    return priceInOre / 100;
  }

  /**
   * Generate authorization header with timestamp and request body
   */
  private getAuthHeader(method: string = 'GET', requestBody: string = '', timestamp?: string): string {
    if (!timestamp) {
      timestamp = new Date().toISOString();
    }
    
    // According to Svea: Base64(MerchantId:Hash(SecretWord + requestBody + timestamp))
    const hashInput = this.config.secretWord + requestBody + timestamp;
    const hash = createHash('sha512').update(hashInput, 'utf8').digest('hex');
    const credentials = `${this.config.merchantId}:${hash}`;
    
    // Debug logging for SVEA troubleshooting
    console.log('🔐 SVEA Auth Debug:', {
      merchantId: this.config.merchantId,
      secretWordLength: this.config.secretWord.length,
      secretWordStart: this.config.secretWord.substring(0, 5) + '...',
      secretWordEnd: '...' + this.config.secretWord.substring(-5),
      timestamp,
      requestBodyLength: requestBody.length,
      hashInput: hashInput.substring(0, 50) + '...',
      hash: hash.substring(0, 20) + '...',
      method
    });
    
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  /**
   * Parse error response from Svea
   */
  private parseErrorResponse(responseText: string): string {
    try {
      const errorObj = JSON.parse(responseText);
      if (errorObj.message) {
        return errorObj.message;
      }
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        return errorObj.errors.map((e: any) => e.message || e.toString()).join(', ');
      }
      return responseText;
    } catch {
      return responseText || 'Unknown error';
    }
  }

  /**
   * Check if order is in final state
   */
  static isOrderCompleted(status: string): boolean {
    return status === 'Final' || status === 'Confirmed';
  }

  /**
   * Check if order can be updated
   */
  static canUpdateOrder(status: string): boolean {
    return status === 'Created';
  }
}

// Create singleton instance
let sveaCheckoutInstance: SveaCheckoutService | null = null;

export function getSveaCheckout(): SveaCheckoutService {
  if (!sveaCheckoutInstance) {
    const merchantId = process.env.SVEA_MERCHANT_ID;
    const secretWord = process.env.SVEA_SECRET_WORD;
    
    if (!merchantId || !secretWord) {
      throw new Error('Svea credentials not configured. Please set SVEA_MERCHANT_ID and SVEA_SECRET_WORD environment variables.');
    }
    
    sveaCheckoutInstance = new SveaCheckoutService({
      merchantId,
      secretWord,
      testMode: process.env.SVEA_TEST_MODE === 'true' || process.env.NODE_ENV !== 'production'
    });
  }
  
  return sveaCheckoutInstance;
}
