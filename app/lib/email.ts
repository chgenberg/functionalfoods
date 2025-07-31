// @ts-expect-error - Mailchimp Transactional doesn't have TypeScript types
import mailchimp from '@mailchimp/mailchimp_transactional';

// Initialize Mailchimp Transactional client
const mailchimpClient = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY 
  ? mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY)
  : null;

export interface EmailData {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  tags?: string[];
}

export interface OrderConfirmationData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  courses: Array<{
    name: string;
    price: number;
  }>;
  loginCredentials?: {
    email: string;
    password: string;
  };
}

export interface WelcomeEmailData {
  email: string;
  name: string;
  courseName: string;
  courseLink: string;
}

export class EmailService {
  private static instance: EmailService;
  
  private constructor() {}
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail(data: EmailData): Promise<boolean> {
    if (!mailchimpClient) {
      console.error('Mailchimp Transactional not configured');
      return false;
    }

    try {
      const message = {
        from_email: data.fromEmail || 'info@functionalfoods.se',
        from_name: data.fromName || 'Functional Foods',
        to: [{
          email: data.to,
          name: data.toName || data.to,
          type: 'to' as const
        }],
        subject: data.subject,
        html: data.html,
        text: data.text || this.htmlToText(data.html),
        important: true,
        track_opens: true,
        track_clicks: true,
        tags: data.tags || ['transactional'],
        merge_language: 'handlebars',
        global_merge_vars: []
      };

      const response = await mailchimpClient.messages.send({ message });
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Convert HTML to plain text (basic implementation)
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Send order confirmation email
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    const coursesHtml = data.courses.map(course => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          ${course.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${course.price} kr
        </td>
      </tr>
    `).join('');

    const loginSection = data.loginCredentials ? `
      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1a4324; margin-top: 0;">🔑 Dina inloggningsuppgifter</h3>
        <p><strong>E-post:</strong> ${data.loginCredentials.email}</p>
        <p><strong>Lösenord:</strong> ${data.loginCredentials.password}</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">
          Vi rekommenderar att du ändrar ditt lösenord efter första inloggningen.
        </p>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: #1a4324; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Functional Foods</h1>
            <p style="color: #86efac; margin: 10px 0 0 0;">Tack för din beställning!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1a4324; margin-bottom: 20px;">Hej ${data.customerName}! 👋</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Din beställning har bekräftats och du har nu tillgång till dina kurser. 
              Nedan hittar du all information du behöver för att komma igång.
            </p>

            <!-- Order Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1a4324; margin-top: 0;">Orderdetaljer</h3>
              <p><strong>Ordernummer:</strong> ${data.orderNumber}</p>
              <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
              
              <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                ${coursesHtml}
                <tr>
                  <td style="padding: 10px; font-weight: bold;">
                    Totalt
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: #1a4324; font-size: 18px;">
                    ${data.totalAmount} kr
                  </td>
                </tr>
              </table>
            </div>

            ${loginSection}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://functionalfoods.se/mina-kurser" 
                 style="display: inline-block; background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Kom igång med dina kurser →
              </a>
            </div>

            <!-- Help Section -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: #1a4324;">Behöver du hjälp?</h3>
              <p style="color: #666; line-height: 1.6;">
                Om du har några frågor eller behöver hjälp är du alltid välkommen att kontakta oss:
              </p>
              <ul style="color: #666; line-height: 1.8;">
                <li>E-post: <a href="mailto:info@functionalfoods.se" style="color: #22c55e;">info@functionalfoods.se</a></li>
                <li>Telefon: +46 XX XXX XX XX</li>
                <li>Chatt: Använd chatten på hemsidan</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              Du får detta email eftersom du har gjort en beställning hos oss.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.customerEmail,
      toName: data.customerName,
      subject: `Orderbekräftelse #${data.orderNumber} - Functional Foods`,
      html,
      tags: ['order-confirmation', 'transactional']
    });
  }

  // Send welcome email for new course access
  async sendCourseWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: #22c55e; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Välkommen till ${data.courseName}!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1a4324; margin-bottom: 20px;">Grattis ${data.name}! 🎉</h2>
            
            <p style="color: #333; line-height: 1.6;">
              Du har nu tillgång till ${data.courseName}. Vi är så glada att du är med på denna resa 
              mot bättre hälsa och välmående!
            </p>

            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1a4324; margin-top: 0;">Vad händer nu?</h3>
              <ol style="color: #333; line-height: 1.8;">
                <li>Logga in på ditt konto</li>
                <li>Gå till kurssidan</li>
                <li>Titta på introduktionsvideon</li>
                <li>Börja med vecka 1</li>
              </ol>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.courseLink}" 
                 style="display: inline-block; background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Starta kursen nu →
              </a>
            </div>

            <p style="color: #666; line-height: 1.6;">
              Kom ihåg att du har livstids tillgång till kursen, så du kan gå i din egen takt.
              Vi finns här för att stötta dig hela vägen!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      toName: data.name,
      subject: `Välkommen till ${data.courseName}! 🎉`,
      html,
      tags: ['welcome-email', 'course-access']
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetLink = `https://functionalfoods.se/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: #1a4324; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Återställ lösenord</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #333; line-height: 1.6;">
              Vi har fått en begäran om att återställa lösenordet för ditt konto. 
              Om du inte gjort denna begäran kan du ignorera detta email.
            </p>

            <p style="color: #333; line-height: 1.6;">
              För att återställa ditt lösenord, klicka på knappen nedan:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Återställ lösenord
              </a>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Länken är giltig i 1 timme. Om länken har gått ut kan du begära en ny återställning.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Återställ ditt lösenord - Functional Foods',
      html,
      tags: ['password-reset', 'transactional']
    });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 