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
   * Format timestamp exactly as Svea's Postman pre-request script (UTC, YYYY-MM-DD HH:mm)
   */
  private formatSveaTimestamp(date: Date = new Date()): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }

  /**
   * Format using Europe/Stockholm local time. When padded=false, no zero padding per original snippet style.
   */
  private formatStockholmTimestamp(date: Date = new Date(), padded: boolean = false): string {
    // Extract parts using Intl for Europe/Stockholm
    const fmt = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const parts = fmt.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
    const y = parts.year;
    const m = padded ? parts.month : String(Number(parts.month));
    const d = padded ? parts.day : String(Number(parts.day));
    const hh = padded ? parts.hour : String(Number(parts.hour));
    const mm = padded ? parts.minute : String(Number(parts.minute));
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }

  /**
   * Build Authorization & Timestamp together using the exact Postman-style timestamp
   */
  private buildAuth(
    method: string,
    body: string = '',
    mode: 'localDate_utcTime' | 'utcDate_utcTime' | 'localDate_localTime' | 'utc_padded' | 'localDate_utcTime_padded' | 'stockholm_local' | 'stockholm_local_padded' = 'stockholm_local_padded'
  ): { auth: string; timestamp: string } {
    const d = new Date();
    let ts = '';
    if (mode === 'localDate_utcTime') {
      // Local Y-M-D with UTC HH:mm (no zero padding)
      ts = `${d.getFullYear()}-${(d.getMonth() + 1)}-${d.getDate()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
    } else if (mode === 'utcDate_utcTime') {
      // Pure UTC Y-M-D HH:mm (no zero padding)
      ts = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1)}-${d.getUTCDate()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
    } else {
      if (mode === 'localDate_localTime') {
        // Fully local Y-M-D HH:mm (no zero padding)
        ts = `${d.getFullYear()}-${(d.getMonth() + 1)}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
      } else if (mode === 'utc_padded') {
        // UTC padded YYYY-MM-DD HH:mm
        ts = this.formatSveaTimestamp(d);
      } else if (mode === 'localDate_utcTime_padded') {
        // Local Y-M-D with zero-padded UTC HH:mm
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mm = String(d.getUTCMinutes()).padStart(2, '0');
        ts = `${d.getFullYear()}-${(d.getMonth() + 1)}-${d.getDate()} ${hh}:${mm}`;
      } else if (mode === 'stockholm_local') {
        ts = this.formatStockholmTimestamp(d, false);
      } else if (mode === 'stockholm_local_padded') {
        ts = this.formatStockholmTimestamp(d, true);
      }
    }
    const auth = this.getAuthHeader(method, body, ts);
    return { auth, timestamp: ts };
  }

  /**
   * Create a new checkout order
   */
  async createOrder(request: CreateCheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders`;
    const requestBody = JSON.stringify(request);

    // Helper to try a request with a specific timestamp mode
    const tryRequest = async (
      mode: 'localDate_utcTime' | 'utcDate_utcTime' | 'localDate_localTime' | 'utc_padded' | 'localDate_utcTime_padded' | 'stockholm_local' | 'stockholm_local_padded'
    ) => {
      const { auth, timestamp } = this.buildAuth('POST', requestBody, mode);
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': auth,
        'Timestamp': timestamp
      };
      console.log('📤 SVEA createOrder attempt', { endpoint, mode, timestamp, baseUrl: this.baseUrl, authHeader: auth.substring(0, 50) + '...', headers });
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
      return { response, responseText };
    };

    // Basic Auth fallback used by some SVEA environments (merchantId:secretWord)
    const tryBasicAuth = async (overrideBaseUrl?: string) => {
      const basic = Buffer.from(`${this.config.merchantId}:${this.config.secretWord}`).toString('base64');
      const ep = `${overrideBaseUrl || this.baseUrl}/api/orders`;
      console.warn('🔁 SVEA falling back to Basic auth', { endpoint: ep });
      const response = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${basic}`
        },
        body: requestBody
      });
      const responseText = await response.text();
      console.log('📥 SVEA Basic createOrder Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
      });
      return { response, responseText };
    };

    // Try multiple formats, prioritizing Stockholm time
    const attempts: Array<'localDate_utcTime' | 'utcDate_utcTime' | 'localDate_localTime' | 'utc_padded' | 'localDate_utcTime_padded' | 'stockholm_local' | 'stockholm_local_padded'> = [
      'stockholm_local_padded',  // FIRST: Stockholm time with padding (YYYY-MM-DD HH:mm)
      'stockholm_local',         // Stockholm time without padding
      'utc_padded',              // UTC with padding
      'utcDate_utcTime',         // Pure UTC without padding
      'localDate_utcTime_padded',
      'localDate_utcTime',
      'localDate_localTime'
    ];

    for (let i = 0; i < attempts.length; i++) {
      const mode = attempts[i];
      const { response, responseText } = await tryRequest(mode);
      if (response.ok) {
        const result = JSON.parse(responseText) as any;
        // Handle both lowercase and uppercase field names from Svea
        const orderId = result.orderId || result.OrderId;
        const gui = result.gui || result.Gui;
        const snippet = gui?.snippet || gui?.Snippet;
        if (!orderId || !snippet) {
          console.error('❌ SVEA response missing fields:', { result, orderId, gui, snippet });
          throw new Error('Invalid response from Svea: missing orderId or GUI snippet');
        }
        return { orderId, gui: { snippet, width: gui.width || gui.Width || 600, height: gui.height || gui.Height || 800 }, status: result.status || result.Status || 'Created' } as CheckoutOrderResponse;
      }
      // If 401, try next mode; otherwise, stop early with the parsed error (after a Basic fallback attempt)
      if (response.status !== 401 || i === attempts.length - 1) {
        // Attempt Basic Auth fallback once before failing
        const { response: basicResp, responseText: basicText } = await tryBasicAuth();
        if (basicResp.ok) {
          const result = JSON.parse(basicText) as CheckoutOrderResponse;
          if (!result.orderId || !result.gui?.snippet) {
            throw new Error('Invalid response from Svea (Basic): missing orderId or GUI snippet');
          }
          return result;
        }

        // If still unauthorized, try alternate environment (swap stage/prod) with Basic auth
        let finalStatus = basicResp.status;
        let finalStatusText = basicResp.statusText;
        let finalBody = basicText;
        if (basicResp.status === 401) {
          const altBase = this.baseUrl.includes('checkoutapistage') ? 'https://checkoutapi.svea.com' : 'https://checkoutapistage.svea.com';
          console.warn('🔄 SVEA trying alternate environment with Basic auth', { altBase });
          const { response: altResp, responseText: altText } = await tryBasicAuth(altBase);
          if (altResp.ok) {
            const result = JSON.parse(altText) as CheckoutOrderResponse;
            if (!result.orderId || !result.gui?.snippet) {
              throw new Error('Invalid response from Svea (Alt Basic): missing orderId or GUI snippet');
            }
            return result;
          }
          finalStatus = altResp.status;
          finalStatusText = altResp.statusText;
          finalBody = altText;
        }

        const errorDetail = this.parseErrorResponse(finalBody || responseText);
        console.error('❌ SVEA createOrder Error (final):', {
          status: finalStatus || response.status,
          statusText: finalStatusText || response.statusText,
          responseBody: (finalBody || responseText),
          parsedError: errorDetail
        });
        throw new Error(`Svea API Error (${finalStatus || response.status}): ${errorDetail}`);
      } else {
        console.warn('⚠️ SVEA 401 with mode, retrying with next mode...', { mode, status: response.status });
      }
    }

    // Should not reach here due to early returns above
    throw new Error('Svea API Error: All attempts failed');
  }

  /**
   * Get order details
   */
  async getOrder(orderId: number): Promise<GetOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders/${orderId}`;
    
    // Generate auth + timestamp ONCE and reuse
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
    
    const { auth, timestamp } = this.buildAuth('PUT', requestBody);
    
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
   * Generate authorization header exactly like Svea's Postman pre-request script
   */
  private getAuthHeader(method: string = 'GET', requestBody: string = '', providedTimestamp?: string): string {
    // Use provided timestamp (generated once per request) to avoid drift
    // Match Postman script exactly: local Y-M-D + UTC hours and minutes, no zero-padding
    let formattedDate = providedTimestamp;
    if (!formattedDate) {
      const date = new Date();
      formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}`;
    }
    
    // For GET requests, requestBody should be empty string (from Svea's script)
    if (method === 'GET') {
      requestBody = '';
    }
    
    // Replicate Svea's createHash function exactly:
    // var signatureRawData = [requestBody, secret, timestamp].join("");
    const signatureRawData = [requestBody || '', this.config.secretWord, formattedDate].join('');
    
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
      requestBodyLength: (requestBody || '').length,
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
