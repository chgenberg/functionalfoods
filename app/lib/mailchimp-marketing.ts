/**
 * Mailchimp Marketing API Service
 * Handles adding subscribers to lists with tags
 */

import crypto from 'crypto';

interface MailchimpMarketingConfig {
  apiKey: string;
  serverPrefix: string;
  listId: string;
}

interface AddSubscriberParams {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  status?: 'subscribed' | 'pending' | 'unsubscribed';
}

class MailchimpMarketingService {
  private config: MailchimpMarketingConfig | null = null;
  private baseUrl: string | null = null;

  constructor() {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
    // Support both names to avoid misconfiguration across environments
    // (Mailchimp calls this an "Audience", but the API path uses /lists/:id)
    const listId = process.env.MAILCHIMP_LIST_ID || process.env.MAILCHIMP_AUDIENCE_ID;

    if (apiKey && serverPrefix && listId) {
      this.config = {
        apiKey,
        serverPrefix,
        listId
      };
      this.baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;
      console.log('✅ Mailchimp Marketing configured');
    } else {
      console.warn('⚠️ Mailchimp Marketing not configured - missing env vars');
      console.warn('Required: MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and (MAILCHIMP_LIST_ID or MAILCHIMP_AUDIENCE_ID)');
    }
  }

  /**
   * Check if Mailchimp Marketing is configured
   */
  isConfigured(): boolean {
    return this.config !== null && this.baseUrl !== null;
  }

  /**
   * Add or update a subscriber in the list
   */
  async addSubscriber(params: AddSubscriberParams): Promise<boolean> {
    if (!this.isConfigured() || !this.config || !this.baseUrl) {
      console.warn('⚠️ Mailchimp Marketing not configured - skipping subscriber add');
      return false;
    }

    try {
      const email = params.email.toLowerCase().trim();
      const subscriberHash = crypto.createHash('md5').update(email).digest('hex');
      
      // Use PUT with subscriber hash for upsert behavior
      const url = `${this.baseUrl}/lists/${this.config.listId}/members/${subscriberHash}`;
      
      const data: any = {
        email_address: email,
        status_if_new: params.status || 'subscribed',
        merge_fields: {}
      };

      if (params.firstName) data.merge_fields.FNAME = params.firstName;
      if (params.lastName) data.merge_fields.LNAME = params.lastName;

      // Add tags if provided
      if (params.tags && params.tags.length > 0) {
        data.tags = params.tags;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Mailchimp Marketing API error:`, {
          status: response.status,
          error: errorText,
          email
        });
        return false;
      }

      const result = await response.json();
      console.log(`✅ Subscriber added/updated in Mailchimp:`, {
        email,
        status: result.status,
        tags: params.tags
      });

      return true;
    } catch (error) {
      console.error('❌ Error adding subscriber to Mailchimp:', error);
      return false;
    }
  }

  /**
   * Add a customer tag to a subscriber
   */
  async addCustomerTag(email: string): Promise<boolean> {
    return this.addSubscriber({
      email,
      tags: ['kund'],
      status: 'subscribed'
    });
  }
}

// Singleton instance
let mailchimpMarketingInstance: MailchimpMarketingService | null = null;

export function getMailchimpMarketing(): MailchimpMarketingService {
  if (!mailchimpMarketingInstance) {
    mailchimpMarketingInstance = new MailchimpMarketingService();
  }
  return mailchimpMarketingInstance;
}

export { MailchimpMarketingService };

