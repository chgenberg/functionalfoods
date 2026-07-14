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

interface MailchimpCartLine {
  id: string;
  product_id: string;
  product_title: string;
  product_variant_id: string;
  product_variant_title?: string;
  quantity: number;
  price: number;
}

interface MailchimpCart {
  id: string;
  customer: {
    id: string;
    email_address: string;
    first_name?: string;
    last_name?: string;
    opt_in_status?: boolean;
  };
  checkout_url: string;
  currency_code: string;
  order_total: number;
  lines: MailchimpCartLine[];
  campaign_id?: string;
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

  private getSiteUrl(): string {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.functionalfoods.se'
    ).replace(/\/$/, '');
  }

  /**
   * Check if Mailchimp E-commerce is configured
   */
  isConfigured(): boolean {
    return this.config !== null && this.baseUrl !== null;
  }

  isAbandonedCartEnabled(): boolean {
    return process.env.MAILCHIMP_ABANDONED_CART_ENABLED === 'true';
  }

  private isValidCustomerEmail(email?: string | null): boolean {
    const normalized = (email || '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }

  private getSafeProductId(item: { id: string; name: string; type?: string }): string {
    const normalizedName = item.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (item.type === 'book' || normalizedName.includes('e-bok') || normalizedName.includes('ebook')) {
      if (normalizedName.includes('grill') && normalizedName.includes('sommarmat')) {
        return 'grill-sommarmat';
      }
      if (normalizedName.includes('baka') || normalizedName.includes('brodboken')) {
        return 'brodboken-2026';
      }
      if (normalizedName.includes('paskbuffe') || normalizedName.includes('pask')) {
        return 'paskbuffe';
      }
      if (normalizedName.includes('sota') || normalizedName.includes('sotsaker')) {
        return 'sota-godsaker';
      }
      if (normalizedName.includes('halsosamma') && normalizedName.includes('frukostar')) {
        return 'halsosamma-frukostar';
      }
    }

    const rawId = item.id || item.name;
    const safeId = rawId
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);

    return safeId || 'product';
  }

  private getProductImagePath(productId: string): string | undefined {
    const imageMap: Record<string, string> = {
      'brodboken-2026': '/baka-glutenfritt-square.png',
      paskbuffe: '/paskbuffe-square.jpg',
      'sota-godsaker': '/sota-godsaker-square.png',
      'grill-sommarmat': '/grill-sommarmat-square.png',
      'halsosamma-frukostar': '/halsosamma-frukostar-square.png',
      'functional-flow': '/Kurser_bilder/Functional_Gut Health.jpg',
      'functional-basics': '/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg',
      'functional-energy': '/Kurser_bilder/Functional_insulin balance.jpg',
      'functional-hormone': '/Hormonell_balans/hormonell_balans_kurssida.png',
      'hormonell-balans': '/Hormonell_balans/hormonell_balans_kurssida.png',
    };

    return imageMap[productId];
  }

  private getProductImageUrl(productId: string): string | undefined {
    const imagePath = this.getProductImagePath(productId);
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${this.getSiteUrl()}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  }

  /**
   * Get or create a customer in Mailchimp
   */
  private async getOrCreateCustomer(email: string, firstName?: string, lastName?: string): Promise<string> {
    if (!this.config || !this.baseUrl) {
      throw new Error('Mailchimp E-commerce not configured');
    }

    const customerId = email.toLowerCase().trim();
    const customerUrl = `${this.baseUrl}/customers/${encodeURIComponent(customerId)}`;

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
      const customerAlreadyExists =
        createResponse.status === 400 &&
        /customer with the id .* already exists/i.test(errorText);
    
      if (customerAlreadyExists) {
        console.log('ℹ️ Mailchimp customer already exists, using existing customer:', {
          customerId,
          email: customerId,
        });
        return customerId;
      }
      
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
      trackingCode?: string;   // Logged internally only; Mailchimp validates tracking_code strictly
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
      trackingCode: _trackingCode
    } = params;

    const safeOrderId = `mc-${Buffer.from(orderId).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`
    
    const usePut = options?.usePut === true;

    try {
      if (!this.isValidCustomerEmail(customerEmail)) {
        console.warn('⚠️ Mailchimp E-commerce purchase skipped: invalid customer email', {
          orderId,
          customerEmail,
        });
        return;
      }

      // Parse customer name and ensure Mailchimp can accept the customer before syncing products.
      const nameParts = customerName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const customerId = await this.getOrCreateCustomer(customerEmail, firstName, lastName);
      
      // Sync products first
      // IMPORTANT: We create a deterministic "default" variant id.
      for (const item of items) {
        const productId = this.getSafeProductId(item);
        const variantId = `${productId}-default`;

        try {
          const imageUrl = this.getProductImageUrl(productId);
          
          await this.syncProduct({
            id: productId,
            title: item.name,
            image_url: imageUrl,
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
          console.warn(`⚠️ Failed to sync product ${productId} before order tracking:`, error);
        }
      }

      // ✅ Create order lines with REQUIRED product_variant_id
      const orderLines: MailchimpOrderLine[] = items.map((item, index) => {
        const productId = this.getSafeProductId(item);
        
        return {
          id: String(index + 1),
          product_id: productId,
          product_title: item.name,
          product_variant_id: `${productId}-default`,
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
        landing_site: landingSite || undefined
      };

      // Send order to Mailchimp
      const orderUrl = usePut
        ? `${this.baseUrl}/orders/${encodeURIComponent(safeOrderId)}`
        : `${this.baseUrl}/orders`;
      
      let response = await fetch(orderUrl, {
        method: usePut ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });
      
      let responseText = await response.text();
      
      if (!response.ok) {
        const duplicateOrder =
          response.status === 400 &&
          /order with the provided id already exists/i.test(responseText);

        if (duplicateOrder) {
          console.log('ℹ️ Mailchimp purchase already exists, treating as tracked:', {
            orderId,
            safeOrderId,
            customerEmail,
          });
          return;
        }

        const invalidCampaignId =
          !!order.campaign_id &&
          response.status === 400 &&
          /campaign/i.test(responseText);

        if (invalidCampaignId) {
          console.warn('⚠️ Mailchimp campaign_id rejected, retrying purchase tracking without campaign attribution:', {
            orderId,
            campaignId: order.campaign_id,
            response: responseText,
          });

          delete order.campaign_id;

          response = await fetch(orderUrl, {
            method: usePut ? 'PUT' : 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
          });

          responseText = await response.text();
        }
      }

      if (!response.ok) {
        const duplicateOrder =
          response.status === 400 &&
          /order with the provided id already exists/i.test(responseText);

        if (duplicateOrder) {
          console.log('ℹ️ Mailchimp purchase already exists after retry, treating as tracked:', {
            orderId,
            safeOrderId,
            customerEmail,
          });
          return;
        }
        
        throw new Error(`Mailchimp API error: ${response.status} ${responseText}`);
      }

      // ✅ Only log success if Mailchimp accepted the order
      console.log('✅ Mailchimp purchase tracked:', {
        orderId,
        customerEmail,
        totalAmount,
        itemsCount: items.length,
        campaignId: order.campaign_id || 'none',
        trackingCode: _trackingCode || 'none'
      });

    } catch (error) {
      console.error('⚠️ Failed to track purchase in Mailchimp:', error);
      throw error;
    }
  }

  getSafeCartId(cartId: string): string {
    return `mc-cart-${Buffer.from(cartId).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 48)}`;
  }

  /**
   * Create or update an unfinished cart for Mailchimp abandoned cart automations.
   */
  async upsertCart(params: {
    cartId: string;
    customerEmail: string;
    customerName?: string;
    checkoutUrl: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      type?: string;
      vatRate?: number;
    }>;
    totalAmount: number;
    currency?: string;
    campaignId?: string;
    previousCartIds?: string[];
  }): Promise<string | null> {
    if (!this.isConfigured() || !this.isAbandonedCartEnabled()) {
      console.log('ℹ️ Mailchimp abandoned cart not configured/enabled, skipping cart sync');
      return null;
    }

    if (!params.customerEmail || params.customerEmail.startsWith('guest-')) {
      console.log('ℹ️ Mailchimp cart sync skipped: missing/guest email');
      return null;
    }

    if (!this.isValidCustomerEmail(params.customerEmail)) {
      console.warn('⚠️ Mailchimp cart sync skipped: invalid customer email', {
        cartId: params.cartId,
        customerEmail: params.customerEmail,
      });
      return null;
    }

    const safeCartId = params.cartId.startsWith('mc-cart-')
      ? params.cartId
      : this.getSafeCartId(params.cartId);

    try {
      const previousCartIds = Array.from(
        new Set((params.previousCartIds || []).filter(Boolean)),
      ).filter((cartId) => this.getSafeCartId(cartId) !== safeCartId && cartId !== safeCartId);

      for (const previousCartId of previousCartIds) {
        await this.deleteCart(previousCartId);
      }
      
      const cartItems = params.items.map((item) => {
        const productId = this.getSafeProductId(item);
        const variantId = `${item.id}-default`;
        const vatRate =
          typeof item.vatRate === 'number'
            ? item.vatRate
            : item.type === 'book'
              ? 0.06
              : 0.25;
        const grossPrice = Math.round(item.price * (1 + vatRate) * 100) / 100;
        
        return {
          item,
          productId,
          variantId,
          grossPrice,
        };
      });

      for (const { item, productId, variantId, grossPrice } of cartItems) {
        try {
          const imageUrl = this.getProductImageUrl(productId);
          
          await this.syncProduct({
            id: productId,
            title: item.name,
            image_url: imageUrl,
            description: `${item.type || 'course'} - ${item.name}`,
            type: item.type || 'course',
            vendor: 'Functional Foods',
            variants: [{
              id: variantId,
              title: item.name,
              price: grossPrice,
              inventory_quantity: 999
            }]
          });
        } catch (error) {
          console.warn(`⚠️ Failed to sync product ${productId} before cart sync:`, error);
        }
      }

      const nameParts = params.customerName?.trim().split(/\s+/).filter(Boolean) || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const customerId = await this.getOrCreateCustomer(params.customerEmail, firstName, lastName);

      const cart: MailchimpCart = {
        id: safeCartId,
        customer: {
          id: customerId,
          email_address: params.customerEmail.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          opt_in_status: false
        },
        checkout_url: params.checkoutUrl,
        currency_code: (params.currency || 'SEK').toUpperCase(),
        order_total: params.totalAmount,
        lines: cartItems.map(({ item, productId, variantId, grossPrice }, index) => ({
            id: String(index + 1),
            product_id: productId,
            product_title: item.name,
            product_variant_id: variantId,
            product_variant_title: item.name,
            quantity: item.quantity,
            price: grossPrice
        })),
        campaign_id: params.campaignId || undefined
      };

      console.log('🛒 Mailchimp cart checkout URL:', {
        cartId: safeCartId,
        sourceCartId: params.cartId,
        customerEmail: params.customerEmail,
        checkoutUrl: params.checkoutUrl,
        orderTotal: params.totalAmount,
        linePrices: cart.lines.map((line) => ({
          productId: line.product_id,
          price: line.price,
          quantity: line.quantity,
          imageUrl: this.getProductImageUrl(line.product_id),
        })),
      });

      const createResponse = await fetch(`${this.baseUrl}/carts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cart)
      });

      if (createResponse.ok) {
        console.log('✅ Mailchimp cart synced:', { cartId: safeCartId, customerEmail: params.customerEmail });
        return safeCartId;
      }

      const createText = await createResponse.text();
      if (createResponse.status !== 400 && createResponse.status !== 409) {
        throw new Error(`Mailchimp cart create failed: ${createResponse.status} ${createText}`);
      }

      const updateResponse = await fetch(`${this.baseUrl}/carts/${encodeURIComponent(safeCartId)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cart)
      });

      if (!updateResponse.ok) {
        const updateText = await updateResponse.text();
        throw new Error(`Mailchimp cart update failed: ${updateResponse.status} ${updateText}`);
      }

      console.log('✅ Mailchimp cart updated:', { cartId: safeCartId, customerEmail: params.customerEmail });
      return safeCartId;
    } catch (error) {
      console.warn('⚠️ Failed to sync Mailchimp cart:', error);
      return null;
    }
  }

  async deleteCart(cartId?: string | null): Promise<void> {
    if (!cartId || !this.isConfigured() || !this.isAbandonedCartEnabled()) {
      return;
    }

    const safeCartId = cartId.startsWith('mc-cart-')
      ? cartId
      : this.getSafeCartId(cartId);

    try {
      const response = await fetch(`${this.baseUrl}/carts/${encodeURIComponent(safeCartId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok && response.status !== 404) {
        const text = await response.text();
        throw new Error(`Mailchimp cart delete failed: ${response.status} ${text}`);
      }

      console.log('✅ Mailchimp cart removed:', safeCartId);
    } catch (error) {
      console.warn('⚠️ Failed to remove Mailchimp cart:', error);
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
          const updateResponse = await fetch(
            `${this.baseUrl}/products/${encodeURIComponent(product.id)}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${this.config!.apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(product)
            },
          );

          if (!updateResponse.ok) {
            const updateText = await updateResponse.text();
            console.warn(`⚠️ Mailchimp product update failed: ${product.id} ${updateResponse.status} ${updateText}`);
          } else {
            console.log(`✅ Product updated in Mailchimp: ${product.id}`);
          }
          
          if (product.variants?.length) {
            for (const variant of product.variants) {
              await this.syncProductVariant(product.id, variant);
            }
          }
          return;
        }
        throw new Error(`Mailchimp API error: ${response.status} ${errorText}`);
      }

      console.log(`✅ Product synced to Mailchimp: ${product.id}`);
    } catch (error) {
      console.error(`⚠️ Failed to sync product ${product.id} to Mailchimp:`, error);
    }
  }
  private async syncProductVariant(
    productId: string,
    variant: NonNullable<MailchimpProduct['variants']>[number],
  ): Promise<void> {
    if (!this.config || !this.baseUrl) {
      return;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/products/${encodeURIComponent(productId)}/variants`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variant)
        },
      );

      if (response.ok) {
        console.log(`✅ Product variant synced to Mailchimp: ${productId}/${variant.id}`);
        return;
      }

      const errorText = await response.text();
      if (response.status === 400 && errorText.includes('already exists')) {
        console.log(`ℹ️ Product variant ${productId}/${variant.id} already exists in Mailchimp`);
        const updateResponse = await fetch(
          `${this.baseUrl}/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variant.id)}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(variant)
          },
        );

        if (!updateResponse.ok) {
          const updateText = await updateResponse.text();
          throw new Error(`Mailchimp variant update failed: ${updateResponse.status} ${updateText}`);
        }

        console.log(`✅ Product variant updated in Mailchimp: ${productId}/${variant.id}`);
        return;
      }

      throw new Error(`Mailchimp variant API error: ${response.status} ${errorText}`);
    } catch (error) {
      console.error(`⚠️ Failed to sync product variant ${productId}/${variant.id} to Mailchimp:`, error);
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

export type { MailchimpProduct, MailchimpOrder, MailchimpOrderLine, MailchimpCart, MailchimpCartLine };
