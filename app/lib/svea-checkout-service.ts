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
   * Format timestamp exactly as Svea requires: UTC, YYYY-MM-DD HH:mm
   * Note: Svea spec says single digits allowed, but some environments may require padding
   */
  private formatSveaTimestamp(date: Date = new Date(), padded: boolean = false): string {
    const y = date.getUTCFullYear();
    const m = padded ? String(date.getUTCMonth() + 1).padStart(2, '0') : (date.getUTCMonth() + 1);
    const d = padded ? String(date.getUTCDate()).padStart(2, '0') : date.getUTCDate();
    const hh = padded ? String(date.getUTCHours()).padStart(2, '0') : date.getUTCHours();
    const mm = padded ? String(date.getUTCMinutes()).padStart(2, '0') : date.getUTCMinutes();
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }


  /**
   * Build Authorization & Timestamp using exact Svea specification:
   * - Timestamp: UTC, YYYY-MM-DD HH:mm
   * - Authorization: Svea <base64(merchantId:sha512(requestBody + secret + timestamp))>
   * - Timestamp header must exactly match the one used in hash calculation
   * 
   * Note: Some Svea environments may require padding despite spec saying single digits allowed
   */
  private buildAuth(method: string, body: string = '', usePaddedTimestamp: boolean = true): { auth: string; timestamp: string } {
    // Generate timestamp ONCE - UTC format
    // Try padded first (most common requirement), can fallback to unpadded if needed
    const timestamp = this.formatSveaTimestamp(new Date(), usePaddedTimestamp);
    
    // For GET requests, requestBody should be empty string
    const requestBody = method === 'GET' ? '' : (body || '');
    
    // Create hash: SHA512(requestBody + secret + timestamp)
    // IMPORTANT: No whitespace changes between hash calculation and sending
    // The requestBody must be exactly as it will be sent (no extra formatting)
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
      padded: usePaddedTimestamp,
      method,
      requestBodyLength: requestBody.length,
      hashInputLength: hashInput.length,
      sha512HashFirst20: sha512Hash.substring(0, 20),
      authHeaderFirst50: authHeader.substring(0, 50) + '...',
      baseUrl: this.baseUrl,
      testMode: this.config.testMode
    });
    
    return { auth: authHeader, timestamp };
  }

  /**
   * Create a new checkout order
   */
  async createOrder(request: CreateCheckoutOrderRequest): Promise<CheckoutOrderResponse> {
    const endpoint = `${this.baseUrl}/api/orders`;
    const requestBody = JSON.stringify(request);

    // Try with padded timestamp first (most common requirement)
    // If that fails with 401, we can retry with unpadded
    let { auth, timestamp } = this.buildAuth('POST', requestBody, true);
    
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
      testMode: this.config.testMode,
      merchantId: this.config.merchantId,
      secretWordLength: this.config.secretWord.length,
      authHeader: auth.substring(0, 50) + '...',
      requestBodyPreview: requestBody.substring(0, 200) + '...'
    });
    
    let response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: requestBody
    });
    
    let responseText = await response.text();
    
    // If 401 with padded timestamp, try unpadded as fallback
    if (!response.ok && response.status === 401) {
      console.warn('⚠️ SVEA 401 with padded timestamp, trying unpadded format...');
      ({ auth, timestamp } = this.buildAuth('POST', requestBody, false));
      headers['Authorization'] = auth;
      headers['Timestamp'] = timestamp;
      
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: requestBody
      });
      responseText = await response.text();
    }
    
    console.log('📥 SVEA createOrder Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
    });
    
    if (!response.ok) {
      const errorDetail = this.parseErrorResponse(responseText);
      
      // Provide more helpful error messages
      let errorMessage = `Svea API Error (${response.status}): ${errorDetail}`;
      
      if (response.status === 401) {
        errorMessage += '\n\n❌ 401 Unauthorized - Detta betyder att autentiseringen misslyckades.\n';
        errorMessage += '\nMöjliga orsaker:';
        errorMessage += `\n1. ⚠️ Du använder ${this.config.testMode ? 'TEST' : 'PRODUKTION'} miljö (${this.baseUrl})`;
        errorMessage += `\n2. ❓ SVEA_SECRET_WORD är ${this.config.secretWord.length} tecken lång`;
        errorMessage += `\n3. ❓ SVEA_TEST_MODE är satt till: ${this.config.testMode ? 'true' : 'false'}`;
        errorMessage += `\n4. ❓ Merchant ID: ${this.config.merchantId}`;
        errorMessage += '\n\n🔧 Lösning:';
        if (!this.config.testMode) {
          errorMessage += '\n- Du använder PRODUKTION miljö (https://checkoutapi.svea.com)';
          errorMessage += '\n- ✅ Kontrollera att SVEA_SECRET_WORD är din PRODUKTIONS-nyckel (inte test-nyckel)';
          errorMessage += '\n- ✅ Kontrollera att SVEA_TEST_MODE är satt till "false" eller är osatt i Railway';
          errorMessage += '\n- ✅ Kontrollera att produktions-nyckeln är aktiverad hos Svea';
          errorMessage += '\n- ✅ Kontakta Svea support om produktions-nyckeln inte fungerar';
        } else {
          errorMessage += '\n- ⚠️ Du använder TEST miljö (https://checkoutapistage.svea.com)';
          errorMessage += '\n- ✅ Kontrollera att SVEA_SECRET_WORD är din TEST/STAGE-nyckel';
          errorMessage += '\n- ✅ Kontrollera att SVEA_TEST_MODE är satt till "true"';
          errorMessage += '\n\n💡 För PRODUKTION: Sätt SVEA_TEST_MODE=false eller ta bort variabeln i Railway';
        }
        errorMessage += `\n- Timestamp (första försöket): ${timestamp}`;
        errorMessage += '\n- Om både padded och unpadded timestamp gav 401, är problemet förmodligen fel nyckel för miljön';
      }
      
      console.error('❌ SVEA createOrder Error:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        parsedError: errorDetail,
        baseUrl: this.baseUrl,
        testMode: this.config.testMode,
        timestamp,
        merchantId: this.config.merchantId
      });
      
      throw new Error(errorMessage);
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
    
    // Build auth and timestamp using exact specification (try padded first)
    const { auth, timestamp } = this.buildAuth('GET', '', true);
    
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
    
    // Build auth and timestamp using exact specification (try padded first)
    const { auth, timestamp } = this.buildAuth('PUT', requestBody, true);
    
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
  
  // Default to production (false) if not explicitly set to 'true'
  // This is safer - production is the default, test must be explicitly enabled
  const testModeEnv = (process.env.SVEA_TEST_MODE || '').toLowerCase().trim();
  const testMode = testModeEnv === 'true';

  if (!merchantId || !secretWord) {
    throw new Error(
      'Svea configuration missing. Please set SVEA_MERCHANT_ID and SVEA_SECRET_WORD environment variables.'
    );
  }

  console.log('🔧 SVEA Configuration:', {
    merchantId,
    secretWordLength: secretWord?.length,
    testModeEnv,
    testMode,
    baseUrl: testMode ? 'https://checkoutapistage.svea.com' : 'https://checkoutapi.svea.com'
  });

  return new SveaCheckoutService({
    merchantId,
    secretWord,
    testMode
  });
}
