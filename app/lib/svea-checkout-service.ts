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
    const requestBody = JSON.stringify(request);
    
    // Format timestamp exactly like Svea's Postman script
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()} ${date.getUTCHours()}:${date.getMinutes()}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader('POST', requestBody, timestamp),
          'Timestamp': timestamp
        },
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
    
    // Format timestamp exactly like Svea's Postman script
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()} ${date.getUTCHours()}:${date.getMinutes()}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader('GET', '', timestamp),
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
    
    // Format timestamp exactly like Svea's Postman script
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()} ${date.getUTCHours()}:${date.getMinutes()}`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader('PUT', requestBody, timestamp),
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
   * Generate authorization header exactly like Svea's Postman pre-request script
   */
  private getAuthHeader(method: string = 'GET', requestBody: string = '', providedTimestamp?: string): string {
    // Format timestamp exactly like Svea's Postman script
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()} ${date.getUTCHours()}:${date.getMinutes()}`;
    
    // For GET requests, requestBody should be empty string (from Svea's script)
    if (method === 'GET' || !requestBody) {
      requestBody = '';
    }
    
    // Replicate Svea's createHash function exactly:
    // var signatureRawData = [requestBody, secret, timestamp].join("");
    const signatureRawData = [requestBody, this.config.secretWord, formattedDate].join('');
    
    // Create SHA512 hash exactly like CryptoJS.SHA512 in Postman
    const hash = createHash('sha512').update(signatureRawData, 'utf8').digest('hex');
    
    // Replicate: var j = [checkoutMerchantId, ':', hash.toString()].join("");
    const j = [this.config.merchantId, ':', hash].join('');
    
    // Replicate: var hashInBase64 = CryptoJS.enc.Base64.stringify(words);
    // where words = CryptoJS.enc.Utf8.parse(j);
    const hashInBase64 = Buffer.from(j, 'utf8').toString('base64');
    
    // Final auth header with "Svea " prefix
    const authHeader = `Svea ${hashInBase64}`;
    
    // Debug logging
    console.log('🔐 SVEA Auth (Postman replica):', {
      merchantId: this.config.merchantId,
      timestamp: formattedDate,
      method,
      requestBodyLength: requestBody.length,
      signatureRawData: signatureRawData.substring(0, 50) + '...',
      signatureRawDataLength: signatureRawData.length,
      hashFirst20: hash.substring(0, 20),
      j: j.substring(0, 50) + '...',
      hashInBase64First50: hashInBase64.substring(0, 50) + '...',
      authHeaderFirst50: authHeader.substring(0, 50) + '...'
    });
    
    return authHeader;
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
