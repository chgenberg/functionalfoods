/**
 * Mailchimp Marketing API Service
 * Handles adding subscribers to lists with tags
 */

import crypto from "crypto";

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
  status?: "subscribed" | "pending" | "unsubscribed";
}

class MailchimpMarketingService {
  private config: MailchimpMarketingConfig | null = null;
  private baseUrl: string | null = null;

  constructor() {
    const apiKey =
      process.env.MAILCHIMP_MARKETING_API_KEY || process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
    // Support both names to avoid misconfiguration across environments
    // (Mailchimp calls this an "Audience", but the API path uses /lists/:id)
    const listId =
      process.env.MAILCHIMP_LIST_ID || process.env.MAILCHIMP_AUDIENCE_ID;

    if (apiKey && serverPrefix && listId) {
      this.config = {
        apiKey,
        serverPrefix,
        listId,
      };
      this.baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;
      console.log("✅ Mailchimp Marketing configured");
    } else {
      console.warn("⚠️ Mailchimp Marketing not configured - missing env vars");
      console.warn(
        "Required: MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, and (MAILCHIMP_LIST_ID or MAILCHIMP_AUDIENCE_ID)",
      );
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
      console.warn(
        "⚠️ Mailchimp Marketing not configured - skipping subscriber add",
      );
      return false;
    }

    try {
      const email = params.email.toLowerCase().trim();
      const subscriberHash = crypto
        .createHash("md5")
        .update(email)
        .digest("hex");

      // Use PUT with subscriber hash for upsert behavior
      const url = `${this.baseUrl}/lists/${this.config.listId}/members/${subscriberHash}`;

      const data: any = {
        email_address: email,
        status_if_new: params.status || "subscribed",
        merge_fields: {},
      };

      if (params.firstName) data.merge_fields.FNAME = params.firstName;
      if (params.lastName) data.merge_fields.LNAME = params.lastName;

      // Note: tags are NOT supported in PUT /members endpoint
      // They must be added via separate API call

      const auth = `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString("base64")}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Mailchimp Marketing API error:`, {
          status: response.status,
          error: errorText,
          email,
        });
        return false;
      }

      const result = await response.json();
      console.log(`✅ Subscriber added/updated in Mailchimp:`, {
        email,
        status: result.status,
      });

      // Add tags via separate API call if provided
      if (params.tags && params.tags.length > 0) {
        await this.addTagsToSubscriber(email, params.tags);
      }

      return true;
    } catch (error) {
      console.error("❌ Error adding subscriber to Mailchimp:", error);
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
      const subscriberHash = crypto
        .createHash("md5")
        .update(email.toLowerCase().trim())
        .digest("hex");
      const url = `${this.baseUrl}/lists/${this.config.listId}/members/${subscriberHash}/tags`;

      // Mailchimp expects tags in format: [{ name: "tag", status: "active" }]
      const tagsData = {
        tags: tags.map((tag) => ({
          name: tag,
          status: "active",
        })),
      };

      const auth = `Basic ${Buffer.from(`anystring:${this.config.apiKey}`).toString("base64")}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagsData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Mailchimp Tags API error:`, {
          status: response.status,
          error: errorText,
          email,
          tags,
        });
        return false;
      }

      console.log(`🏷️ Tags added to ${email}:`, tags);
      return true;
    } catch (error) {
      console.error("❌ Error adding tags to subscriber:", error);
      return false;
    }
  }

  /**
   * Add a customer tag to a subscriber
   */
  async addCustomerTag(email: string): Promise<boolean> {
    return this.addSubscriber({
      email,
      tags: ["kund"],
      status: "subscribed",
    });
  }

  /**
   * Add customer tag with course-specific tags
   */
  async addCustomerWithCourseTags(
    email: string,
    courseNames: string[],
    firstName?: string,
    lastName?: string,
  ): Promise<boolean> {
    // --- helpers ---
    const stripInvisible = (s: string) =>
      s.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ");

    const normalize = (s: string) =>
      stripInvisible(s)
        .toLowerCase()
        .trim()
        // Remove diacritics
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        // Normalize separators
        .replace(/[–—]/g, "-") // long dashes -> hyphen
        .replace(/[\/]+/g, " ") // "/" -> space
        .replace(/[&]+/g, " and ") // "&" -> "and"
        .replace(/[^a-z0-9\s-]/g, "") // drop remaining punctuation
        .replace(/\s+/g, " ") // collapse whitespace
        .trim();

    const courseTagMap: Record<string, string> = {
      // Slugs / ids / short keys (normalized)
      [normalize("functional-basics")]: "Köp – Functional Basics",
      [normalize("functional-flow")]: "Köp – Functional Flow",
      [normalize("functional-energy")]: "Köp – Functional Energy",
      [normalize("functional-hormone")]: "Köp – Hormonell Balans",
      [normalize("hormonell-balans")]: "Köp – Hormonell Balans",
      [normalize("prova-pa-vecka")]: "Köp – Prova på vecka",

      // Display names (normalized)
      [normalize("Functional Basics")]: "Köp – Functional Basics",
      [normalize("Functional Flow")]: "Köp – Functional Flow",
      [normalize("Functional Gut Health/Flow")]: "Köp – Functional Flow",
      [normalize("Functional Insulin balance/Energy")]:
        "Köp – Functional Energy",
      [normalize("Functional Energy")]: "Köp – Functional Energy",
      [normalize("Hormonell Balans")]: "Köp – Hormonell Balans",
      [normalize("Prova på vecka med Functional Foods!")]:
        "Köp – Prova på vecka",

      // A few extra common variants (normalized)
      [normalize("Hormonell balans")]: "Köp – Hormonell Balans",
      [normalize("Prova på vecka")]: "Köp – Prova på vecka",

      // Brödboken (ebook)
      [normalize("brodboken")]: "Köp – Brödboken",
      [normalize("brödboken")]: "Köp – Brödboken",
      [normalize("Brödboken")]: "Köp – Brödboken",
      [normalize("Brödboken (E-bok)")]: "Köp – Brödboken",
      [normalize("Brödboken ebook")]: "Köp – Brödboken",
      [normalize("Brödboken e-bok")]: "Köp – Brödboken",
      [normalize("E-bok Brödboken")]: "Köp – Brödboken",
      [normalize("Ebok Brödboken")]: "Köp – Brödboken",
      [normalize("Brödboken - e-bok")]: "Köp – Brödboken",
      [normalize("Brödboken – e-bok")]: "Köp – Brödboken",
      [normalize("Baka Glutenfritt - E-bok")]: "Köp – Brödboken",
      [normalize("baka glutenfritt - e-bok")]: "Köp – Brödboken",
      [normalize("Baka Glutenfritt ebook")]: "Köp – Brödboken",
      [normalize("E-bok Baka Glutenfritt")]: "Köp – Brödboken",
      [normalize("baka glutenfritt")]: "Köp – Brödboken",

      // Påskbuffé (ebook)
      [normalize("paskbuffe")]: "Köp – Påskbuffé",
      [normalize("påskbuffe")]: "Köp – Påskbuffé",
      [normalize("påskbuffé")]: "Köp – Påskbuffé",
      [normalize("Påskbuffe (E-bok)")]: "Köp – Påskbuffé",
      [normalize("Påskbuffé ebook")]: "Köp – Påskbuffé",
      [normalize("Påskbuffé e-bok")]: "Köp – Påskbuffé",
      [normalize("E-bok Påskbuffe")]: "Köp – Påskbuffé",
      [normalize("Ebok Påskbuffé")]: "Köp – Påskbuffé",
      [normalize("Påskbuffé - e-bok")]: "Köp – Påskbuffé",
      [normalize("Påskbuffe – e-bok")]: "Köp – Påskbuffé",

      // Söta godsaker (ebook)
      [normalize("sota-godsaker")]: "Köp - Sötsaker",
      [normalize("söta godsaker")]: "Köp - Sötsaker",
      [normalize("sota godsaker")]: "Köp - Sötsaker",
      [normalize("Sota Godsaker")]: "Köp - Sötsaker",
      [normalize("Söta Godsaker")]: "Köp - Sötsaker",
      [normalize("Söta godsaker (E-bok)")]: "Köp - Sötsaker",
      [normalize("Söta godsaker ebook")]: "Köp - Sötsaker",
      [normalize("Söta godsaker e-bok")]: "Köp - Sötsaker",
      [normalize("E-bok Söta godsaker")]: "Köp - Sötsaker",
      [normalize("Ebok Söta godsaker")]: "Köp - Sötsaker",
      [normalize("Söta godsaker - e-bok")]: "Köp - Sötsaker",
      [normalize("Söta godsaker – e-bok")]: "Köp - Sötsaker",
    };

    const tags: string[] = ["kund"];

    const debugCourseNames = (courseNames || []).filter(Boolean);
    if (debugCourseNames.length === 0) {
      console.warn(
        '⚠️ Mailchimp Marketing: courseNames empty (only tagging "kund")',
        { email },
      );
    }

    for (const rawName of debugCourseNames) {
      const key = normalize(rawName);

      // 1) Exact match
      let tag = courseTagMap[key];

      // 2) Partial match (normalized)
      if (!tag) {
        for (const [mapKey, mapValue] of Object.entries(courseTagMap)) {
          if (key.includes(mapKey) || mapKey.includes(key)) {
            tag = mapValue;
            break;
          }
        }
      }

      if (!tag) {
        console.warn(
          "⚠️ Mailchimp Marketing: no courseTagMap match for course name:",
          {
            email,
            rawName,
            normalized: key,
          },
        );
        continue;
      }

      if (!tags.includes(tag)) tags.push(tag);
    }

    console.log("🏷️ Mailchimp Marketing tags computed:", { email, tags });

    return this.addSubscriber({
      email,
      firstName,
      lastName,
      tags,
      status: "subscribed",
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
