/**
 * Mailchimp E-commerce Integration
 * Tracks purchases and conversions via Mailchimp E-commerce API
 * Documentation: https://mailchimp.com/developer/marketing/api/e-commerce-stores/
 */

interface MailchimpEcommerceConfig {
  apiKey: string;
  serverPrefix: string;
  storeId: string;
}

interface MailchimpProduct {
  id: string;
  title: string;
  url?: string;
  description?: string;
  type?: string;
  image_url?: string;
  vendor?: string;
  variants?: Array<{
    id: string;
    title: string;
    url?: string;
    sku?: string;
    price?: number;
    inventory_quantity?: number;
  }>;
}

interface MailchimpOrderLine {
  id: string;
  product_id: string;
  product_title: string;
  product_variant_id: string; // ✅ REQUIRED by Mailchimp for orders
  product_variant_title?: string;
  quantity: number;
  price: number;
}

interface MailchimpOrder {
  id: string;
  customer: {
    id: string;
    email_address: string;
    first_name?: string;
    last_name?: string;
    opt_in_status?: boolean;
  };
  currency_code: string;
  order_total: number;
  lines: MailchimpOrderLine[];
  // Campaign attribution
  campaign_id?: string;     // Mailchimp campaign ID (mc_cid)
  landing_site?: string;    // Original landing URL
  tracking_code?: string;   // Custom tracking code
  // Order status
  financial_status?: string;
  fulfillment_status?: string;
  order_date?: string;
  discount_total?: number;
  shipping_total?: number;
  tax_total?: number;
}

class MailchimpEcommerceService {
  private config: MailchimpEcommerceConfig | null = null;
  private baseUrl: string | null = null;

  constructor() {
    const apiKey = process.env.MAILCHIMP_MARKETING_API_KEY || process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
    const storeId = process.env.MAILCHIMP_STORE_ID;

    if (apiKey && serverPrefix && storeId) {
      this.config = {
        apiKey,
        serverPrefix,
        storeId
      };
      this.baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/ecommerce/stores/${storeId}`;
      console.log('✅ Mailchimp E-commerce configured');
    } else {
      console.warn('⚠️ Mailchimp E-commerce not configured - missing env vars');
      console.warn('Required: MAILCHIMP_API_KEY, MAILCHIMP_MARKETING_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_STORE_ID');
    }
  }

  /**
   * Check if Mailchimp E-commerce is configured
   */
  isConfigured(): boolean {
    return this.config !== null && this.baseUrl !== null;
  }

  /**
   * Get or create a customer in Mailchimp
   */
  private async getOrCreateCustomer(email: string, firstName?: string, lastName?: string): Promise<string> {
    if (!this.config || !this.baseUrl) {
      throw new Error('Mailchimp E-commerce not configured');
    }

    const customerId = email.toLowerCase().trim();
    const customerUrl = `${this.baseUrl}/customers/${customerId}`;

    try {
      // Try to get existing customer
      const getResponse = await fetch(customerUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (getResponse.ok) {
        const customer = await getResponse.json();
        return customer.id;
      }
    } catch {
      // Customer doesn't exist, will create below
    }

    // Create new customer
    const createResponse = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: customerId,
        email_address: email.toLowerCase().trim(),
        first_name: firstName || '',
        last_name: lastName || '',
        opt_in_status: false // Don't auto-opt-in
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create Mailchimp customer: ${createResponse.status} ${errorText}`);
    }

    const customer = await createResponse.json();
    return customer.id;
  }

  /**
   * Track a purchase/conversion
   * Automatically syncs products if they don't exist in Mailchimp
   */
  async trackPurchase(
    params: {
      orderId: string;
      customerEmail: string;
      customerName?: string;
      items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        type?: string;
      }>;
      totalAmount: number;
      currency?: string;
      orderDate?: Date;
      discountTotal?: number;
      shippingTotal?: number;
      taxTotal?: number;
      // Campaign attribution
      campaignId?: string;     // mc_cid from Mailchimp email links
      landingSite?: string;    // Original landing URL with UTM params
      trackingCode?: string;   // Custom tracking code (can be mc_cid or utm_campaign)
    },
    options?: {
      usePut?: boolean;
    }
  ): Promise<void> {
    if (!this.isConfigured()) {
      console.log('ℹ️ Mailchimp E-commerce not configured, skipping purchase tracking');
      return;
    }

    const {
      orderId,
      customerEmail,
      customerName,
      items,
      totalAmount,
      currency = 'SEK',
      orderDate = new Date(),
      discountTotal = 0,
      shippingTotal = 0,
      taxTotal = 0,
      campaignId,
      landingSite,
      trackingCode
    } = params;

    const safeOrderId = `mc-${Date.now()}`;

    console.log('Mailchimp safeOrderId:', safeOrderId);
    
    const usePut = options?.usePut === true;

    try {
      // Sync products first
      // IMPORTANT: We create a deterministic "default" variant id.
      for (const item of items) {
        const variantId = `${item.id}-default`;

        try {
          await this.syncProduct({
            id: item.id,
            title: item.name,
            description: `${item.type || 'course'} - ${item.name}`,
            type: item.type || 'course',
            vendor: 'Functional Foods',
            variants: [{
              id: variantId,
              title: item.name,
              price: item.price,
              inventory_quantity: 999
            }]
          });
        } catch (error) {
          // Product sync failure shouldn't block order tracking
          console.warn(`⚠️ Failed to sync product ${item.id} before order tracking:`, error);
        }
      }

      // Parse customer name
      const nameParts = customerName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Get or create customer
      const customerId = await this.getOrCreateCustomer(customerEmail, firstName, lastName);

      // ✅ Create order lines with REQUIRED product_variant_id
      const orderLines: MailchimpOrderLine[] = items.map((item, index) => {
        return {
          id: String(index + 1),
          product_id: item.id,
          product_title: item.name,
          product_variant_id: `${item.id}-default`,
          product_variant_title: item.name,
          quantity: item.quantity,
          price: item.price
        };
      });
      
      // Create order with campaign attribution
      const order: MailchimpOrder = {
        id: safeOrderId,
        customer: {
          id: customerId,
          email_address: customerEmail.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          opt_in_status: false
        },
        currency_code: currency.toUpperCase(),
        order_total: totalAmount,
        lines: orderLines,
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        order_date: orderDate.toISOString(),
        discount_total: discountTotal,
        shipping_total: shippingTotal,
        tax_total: taxTotal,
        campaign_id: campaignId || undefined,
        landing_site: landingSite || undefined,
        tracking_code: trackingCode || campaignId || undefined
      };

      // Send order to Mailchimp
      const orderUrl = usePut
        ? `${this.baseUrl}/orders/${encodeURIComponent(safeOrderId)}`
        : `${this.baseUrl}/orders`;
      
      console.log('📦 Mailchimp order request:', {
        method: usePut ? 'PUT' : 'POST',
        orderUrl,
        storeId: this.config?.storeId,
        order
      });
      
      const response = await fetch(orderUrl, {
        method: usePut ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });
      
      const responseText = await response.text();
      
      console.log('📬 Mailchimp order response:', {
        status: response.status,
        body: responseText
      });
      
      if (!response.ok) {
        throw new Error(`Mailchimp API error: ${response.status} ${responseText}`);
      }

      // ✅ Only log success if Mailchimp accepted the order
      console.log('✅ Mailchimp purchase tracked:', {
        orderId,
        customerEmail,
        totalAmount,
        itemsCount: items.length,
        campaignId: campaignId || 'none',
        trackingCode: trackingCode || campaignId || 'none'
      });

    } catch (error) {
      console.error('⚠️ Failed to track purchase in Mailchimp:', error);
      throw error;
    }
  }

  /**
   * Sync a product to Mailchimp store
   */
  async syncProduct(product: MailchimpProduct): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      const productUrl = `${this.baseUrl}/products`;
      const response = await fetch(productUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        const errorText = await response.text();
        // If product already exists, that's okay
        if (response.status === 400 && errorText.includes('already exists')) {
          console.log(`ℹ️ Product ${product.id} already exists in Mailchimp`);
          return;
        }
        throw new Error(`Mailchimp API error: ${response.status} ${errorText}`);
      }

      console.log(`✅ Product synced to Mailchimp: ${product.id}`);
    } catch (error) {
      console.error(`⚠️ Failed to sync product ${product.id} to Mailchimp:`, error);
    }
  }
}

// Singleton instance
let mailchimpEcommerceInstance: MailchimpEcommerceService | null = null;

export function getMailchimpEcommerce(): MailchimpEcommerceService {
  if (!mailchimpEcommerceInstance) {
    mailchimpEcommerceInstance = new MailchimpEcommerceService();
  }
  return mailchimpEcommerceInstance;
}

export type { MailchimpProduct, MailchimpOrder, MailchimpOrderLine };
