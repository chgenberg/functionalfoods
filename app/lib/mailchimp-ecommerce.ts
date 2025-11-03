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
  product_variant_id?: string;
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
  tracking_code?: string;
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
    const apiKey = process.env.MAILCHIMP_API_KEY;
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
      console.warn('Required: MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_STORE_ID');
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
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (getResponse.ok) {
        const customer = await getResponse.json();
        return customer.id;
      }
    } catch (error) {
      // Customer doesn't exist, will create below
    }

    // Create new customer
    const createResponse = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
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
   */
  async trackPurchase(params: {
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
  }): Promise<void> {
    if (!this.isConfigured()) {
      console.log('ℹ️ Mailchimp E-commerce not configured, skipping purchase tracking');
      return;
    }

    try {
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
        taxTotal = 0
      } = params;

      // Parse customer name
      const nameParts = customerName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Get or create customer
      const customerId = await this.getOrCreateCustomer(customerEmail, firstName, lastName);

      // Create order lines
      const orderLines: MailchimpOrderLine[] = items.map((item, index) => ({
        id: `${orderId}-${index + 1}`,
        product_id: item.id,
        product_title: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      // Create order
      const order: MailchimpOrder = {
        id: orderId,
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
        tax_total: taxTotal
      };

      // Send order to Mailchimp
      const orderUrl = `${this.baseUrl}/orders`;
      const response = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailchimp API error: ${response.status} ${errorText}`);
      }

      console.log('✅ Mailchimp purchase tracked:', {
        orderId,
        customerEmail,
        totalAmount,
        itemsCount: items.length
      });

    } catch (error) {
      // Don't throw - tracking failures shouldn't break the purchase flow
      console.error('⚠️ Failed to track purchase in Mailchimp:', error);
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
          'Authorization': `Bearer ${this.config!.apiKey}`,
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

