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
    const apiKey = process.env.MAILCHIMP_MARKETING_API_KEY || process.env.MAILCHIMP_API_KEY;
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

      // Note: tags are NOT supported in PUT /members endpoint
      // They must be added via separate API call

      const auth = `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')}`;

      const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': auth,
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
        status: result.status
      });

      // Add tags via separate API call if provided
      if (params.tags && params.tags.length > 0) {
        await this.addTagsToSubscriber(email, params.tags);
      }

      return true;
    } catch (error) {
      console.error('❌ Error adding subscriber to Mailchimp:', error);
      return false;
    }
  }

  /**
   * Add tags to a subscriber via the tags endpoint
   */
  async addTagsToSubscriber(email: string, tags: string[]): Promise<boolean> {
    if (!this.isConfigured() || !this.config || !this.baseUrl) {
      return false;
    }

    try {
      const subscriberHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
      const url = `${this.baseUrl}/lists/${this.config.listId}/members/${subscriberHash}/tags`;

      // Mailchimp expects tags in format: [{ name: "tag", status: "active" }]
      const tagsData = {
        tags: tags.map(tag => ({
          name: tag,
          status: 'active'
        }))
      };

      const auth = `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString('base64')}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagsData)
      });



      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Mailchimp Tags API error:`, {
          status: response.status,
          error: errorText,
          email,
          tags
        });
        return false;
      }

      console.log(`🏷️ Tags added to ${email}:`, tags);
      return true;
    } catch (error) {
      console.error('❌ Error adding tags to subscriber:', error);
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

  /**
   * Add customer tag with course-specific tags
   * @param email - Customer email
   * @param courseNames - Array of course names purchased
   * @param firstName - Optional first name
   * @param lastName - Optional last name
   */
  async addCustomerWithCourseTags(
    email: string, 
    courseNames: string[],
    firstName?: string,
    lastName?: string
  ): Promise<boolean> {
    // Map course IDs/names to readable tag names
    const courseTagMap: Record<string, string> = {
      'functional-basics': 'Köp – Functional Basics',
      'functional-flow': 'Köp – Functional Flow',
      'functional-energy': 'Köp – Functional Energy',
      'functional-hormone': 'Köp – Hormonell Balans',
      'hormonell-balans': 'Köp – Hormonell Balans',
      'prova-pa-vecka': 'Köp – Prova på vecka',
      // Also handle display names
      'Functional Basics': 'Köp – Functional Basics',
      'Functional Gut Health/Flow': 'Köp – Functional Flow',
      'Functional Insulin balance/Energy': 'Köp – Functional Energy',
      'Hormonell Balans': 'Köp – Hormonell Balans',
      'Prova på vecka med Functional Foods!': 'Köp – Prova på vecka',
    };

    // Build tags array
    const tags = ['kund'];
    
    for (const courseName of courseNames) {
      // Try exact match first
      let tag = courseTagMap[courseName];
      
      // If no exact match, try case-insensitive partial match
      if (!tag) {
        const lowerName = courseName.toLowerCase();
        for (const [key, value] of Object.entries(courseTagMap)) {
          if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
            tag = value;
            break;
          }
        }
      }
      
      // Add tag if found and not already in array
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    }

    console.log(`🏷️ Adding tags to ${email}:`, tags);

    return this.addSubscriber({
      email,
      firstName,
      lastName,
      tags,
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

