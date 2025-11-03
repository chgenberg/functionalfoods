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
   * Format timestamp exactly as Svea requires: UTC, YYYY-MM-DD HH:mm (no padding, single digits allowed)
   */
  private formatSveaTimestamp(date: Date = new Date()): string {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1; // No padding
    const d = date.getUTCDate(); // No padding
    const hh = date.getUTCHours(); // No padding
    const mm = date.getUTCMinutes(); // No padding
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }


  /**
   * Build Authorization & Timestamp using exact Svea specification:
   * - Timestamp: UTC, YYYY-MM-DD HH:mm (no padding, single digits allowed)
   * - Authorization: Svea <base64(merchantId:sha512(requestBody + secret + timestamp))>
   * - Timestamp header must exactly match the one used in hash calculation
   */
  private buildAuth(method: string, body: string = ''): { auth: string; timestamp: string } {
    // Generate timestamp ONCE - UTC format without padding
    const timestamp = this.formatSveaTimestamp();
    
    // For GET requests, requestBody should be empty string
    const requestBody = method === 'GET' ? '' : (body || '');
    
    // Create hash: SHA512(requestBody + secret + timestamp)
    // IMPORTANT: No whitespace changes between hash calculation and sending
    const hashInput = requestBody + this.config.secretWord + timestamp;
    const sha512Hash = createHash('sha512').update(hashInput, 'utf8').digest('hex');
    
    // Create base64 string: base64(merchantId:sha512hash)
    const base64Input = `${this.config.merchantId}:${sha512Hash}`;
    const base64String = Buffer.from(base64Input, 'utf8').toString('base64');
    
    // Authorization header: Svea <base64-string>
    const authHeader = `Svea ${base64String}`;
    
    console.log('🔐 SVEA Auth (Exact Spec):', {
      merchantId: this.config.merchantId,
      timestamp,
      method,
      requestBodyLength: requestBody.length,
      hashInputLength: hashInput.length,
      sha512HashFirst20: sha512Hash.substring(0, 20),
      authHeaderFirst50: authHeader.substring(0, 50) + '...'
    });
    
    return { auth: authHeader, timestamp };
  }

  /**
   * Create a new checkout order
   */
  async createOrder(request: CreateCheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders`;
    const requestBody = JSON.stringify(request);

    // Build auth and timestamp using exact specification
    const { auth, timestamp } = this.buildAuth('POST', requestBody);
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': auth,
      'Timestamp': timestamp
    };
    
    console.log('📤 SVEA createOrder:', { 
      endpoint, 
      timestamp, 
      baseUrl: this.baseUrl, 
      authHeader: auth.substring(0, 50) + '...' 
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: requestBody
    });
    
    const responseText = await response.text();
    
    console.log('📥 SVEA createOrder Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
    });
    
    if (!response.ok) {
      const errorDetail = this.parseErrorResponse(responseText);
      console.error('❌ SVEA createOrder Error:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        parsedError: errorDetail
      });
      throw new Error(`Svea API Error (${response.status}): ${errorDetail}`);
    }
    
    const result = JSON.parse(responseText) as any;
    // Handle both lowercase and uppercase field names from Svea
    const orderId = result.orderId || result.OrderId;
    const gui = result.gui || result.Gui;
    const snippet = gui?.snippet || gui?.Snippet;
    
    if (!orderId || !snippet) {
      console.error('❌ SVEA response missing fields:', { result, orderId, gui, snippet });
      throw new Error('Invalid response from Svea: missing orderId or GUI snippet');
    }
    
    return { 
      orderId, 
      gui: { 
        snippet, 
        width: gui.width || gui.Width || 600, 
        height: gui.height || gui.Height || 800 
      }, 
      status: result.status || result.Status || 'Created' 
    } as CheckoutOrderResponse;
  }

  /**
   * Get order details
   */
  async getOrder(orderId: number): Promise<GetOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders/${orderId}`;
    
    // Build auth and timestamp using exact specification
    const { auth, timestamp } = this.buildAuth('GET', '');
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': auth,
          'Timestamp': timestamp
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
    const requestBody = JSON.stringify(request);
    
    // Build auth and timestamp using exact specification
    const { auth, timestamp } = this.buildAuth('PUT', requestBody);
    
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': auth,
          'Timestamp': timestamp
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
   * Parse error response from Svea
   */
  private parseErrorResponse(responseText: string): string {
    if (!responseText || responseText.trim() === '') {
      return 'Empty response from SVEA';
    }
    
    try {
      const errorObj = JSON.parse(responseText);
      console.log('🔍 Parsed SVEA error object:', errorObj);
      
      if (errorObj.message) {
        return errorObj.message;
      }
      if (errorObj.error) {
        return errorObj.error;
      }
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        return errorObj.errors.map((e: any) => e.message || e.toString()).join(', ');
      }
      if (errorObj.title) {
        return errorObj.title;
      }
      
      // Return the whole object as string if no specific error field found
      return JSON.stringify(errorObj);
    } catch (parseError) {
      console.log('🔍 Raw SVEA response (not JSON):', responseText);
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

/**
 * Factory function to get configured Svea service
 */
export function getSveaCheckout(): SveaCheckoutService {
  const merchantId = process.env.SVEA_MERCHANT_ID;
  const secretWord = process.env.SVEA_SECRET_WORD;
  const testMode = (process.env.SVEA_TEST_MODE || '').toLowerCase() === 'true';

  if (!merchantId || !secretWord) {
    throw new Error(
      'Svea configuration missing. Please set SVEA_MERCHANT_ID and SVEA_SECRET_WORD environment variables.'
    );
  }

  return new SveaCheckoutService({
    merchantId,
    secretWord,
    testMode
  });
}
