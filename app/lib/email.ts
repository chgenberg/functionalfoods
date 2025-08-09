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
    loginUrl: string;
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
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; color: #1a4324; font-size: 16px;">
          <strong>${course.name}</strong>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a4324; font-size: 16px; font-weight: 600;">
          ${course.price} kr
        </td>
      </tr>
    `).join('');

    const loginSection = data.loginCredentials ? `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%); border: 2px solid #9dc46d; border-radius: 12px; padding: 24px; margin: 30px 0; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: #9dc46d; border-radius: 50%; opacity: 0.1;"></div>
        <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
          <span style="font-size: 28px; margin-right: 12px;">🔐</span>
          Dina inloggningsuppgifter
        </h3>
        <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 12px;">
          <p style="margin: 8px 0; color: #1a4324;"><strong>E-post:</strong> <span style="color: #555;">${data.loginCredentials.email}</span></p>
          <p style="margin: 8px 0; color: #1a4324;"><strong>Lösenord:</strong> <span style="font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #1a4324;">${data.loginCredentials.password}</span></p>
        </div>
        <p style="color: #666; font-size: 14px; margin: 16px 0 0 0; font-style: italic;">
          💡 Tips: Ändra ditt lösenord efter första inloggningen för ökad säkerhet.
        </p>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header med gradient -->
          <div style="background: linear-gradient(135deg, #1a4324 0%, #2d5a3d 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(157, 196, 109, 0.2); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(157, 196, 109, 0.15); border-radius: 50%;"></div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; position: relative; z-index: 1;">Functional Foods</h1>
            <p style="color: #9dc46d; margin: 12px 0 0 0; font-size: 18px; position: relative; z-index: 1;">Tack för din beställning! 🎉</p>
          </div>
          
          <!-- Grön accent-linje -->
          <div style="height: 4px; background: linear-gradient(90deg, #9dc46d 0%, #7fb05a 100%);"></div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Personlig hälsning -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1a4324; margin: 0 0 16px 0; font-size: 28px; font-weight: 600;">
                Hej ${data.customerName}! 👋
              </h2>
              <p style="color: #555; line-height: 1.8; font-size: 16px; margin: 0;">
                Din beställning är bekräftad och du har nu tillgång till dina kurser.<br>
                Vi är så glada att du är med på denna hälsoresa! 🌱
              </p>
            </div>

            <!-- Order Details med snygg box -->
            <div style="background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; margin: 30px 0;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                <span style="display: inline-block; width: 32px; height: 32px; background: #9dc46d; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-size: 16px; margin-right: 12px;">📦</span>
                Orderdetaljer
              </h3>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                <span style="color: #666;">Ordernummer:</span>
                <span style="color: #1a4324; font-weight: 600;">${data.orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span style="color: #666;">Datum:</span>
                <span style="color: #1a4324;">${new Date().toLocaleDateString('sv-SE')}</span>
              </div>
              
              <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                ${coursesHtml}
                <tr>
                  <td style="padding: 20px 16px 0 16px; border-top: 2px solid #1a4324; font-weight: bold; color: #1a4324; font-size: 18px;">
                    Totalt
                  </td>
                  <td style="padding: 20px 16px 0 16px; border-top: 2px solid #1a4324; text-align: right; font-weight: bold; color: #1a4324; font-size: 22px;">
                    ${data.totalAmount} kr
                  </td>
                </tr>
              </table>
            </div>

            ${loginSection}

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://ulrika-functional-foods-production.up.railway.app/dashboard" 
                 style="display: inline-block; background: linear-gradient(135deg, #1a4324 0%, #2d5a3d 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(26, 67, 36, 0.3); transition: all 0.3s;">
                ✨ Kom igång med dina kurser
              </a>
            </div>

            <!-- Nästa steg -->
            <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0f7f5 100%); border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px solid #d4e8df;">
              <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 18px;">📚 Dina nästa steg:</h3>
              <ol style="color: #555; line-height: 2; margin: 0; padding-left: 20px;">
                <li>Logga in på ditt konto</li>
                <li>Utforska ditt kursmaterial</li>
                <li>Börja med vecka 1</li>
                <li>Anslut till vår community</li>
              </ol>
            </div>

            <!-- Help Section med ikoner -->
            <div style="border-top: 2px solid #f0f0f0; padding-top: 30px; margin-top: 40px;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0; text-align: center;">Behöver du hjälp? Vi finns här! 💚</h3>
              
              <div style="display: table; width: 100%; text-align: center;">
                <div style="display: table-cell; padding: 0 10px;">
                  <div style="background: #f8fffe; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📧</div>
                    <a href="mailto:info@functionalfoods.se" style="color: #1a4324; text-decoration: none; font-weight: 500;">info@functionalfoods.se</a>
                  </div>
                </div>
                <div style="display: table-cell; padding: 0 10px;">
                  <div style="background: #f8fffe; border-radius: 8px; padding: 16px;">
                    <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
                    <span style="color: #1a4324; font-weight: 500;">Chatt på hemsidan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #1a4324; padding: 30px; text-align: center;">
            <p style="color: #9dc46d; font-size: 14px; margin: 0 0 8px 0;">
              Följ din hälsoresa med Functional Foods
            </p>
            <p style="color: #7a9b84; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.
            </p>
            <p style="color: #6a8b74; font-size: 11px; margin: 8px 0 0 0;">
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
      subject: `✅ Orderbekräftelse #${data.orderNumber} - Välkommen till Functional Foods!`,
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

  // Publik metod: skicka notifiering från kontaktformulär
  async sendContactNotification(params: { namn: string; email: string; amne: string; meddelande: string; }): Promise<boolean> {
    const { namn, email, amne, meddelande } = params;
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:20px;font-family:Arial, sans-serif;background:#f7faf7;color:#1a4324;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5efe2;border-radius:12px;box-shadow:0 8px 20px rgba(26,67,36,0.06);overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1a4324 0%,#2d5a3d 100%);padding:24px;color:#fff;">
            <h1 style="margin:0;font-size:20px;">Nytt meddelande från kontaktformuläret</h1>
            <p style="margin:8px 0 0 0;opacity:0.9;">${new Date().toLocaleString('sv-SE')}</p>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 8px 0;"><strong>Namn:</strong> ${namn}</p>
            <p style="margin:0 0 8px 0;"><strong>E‑post:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin:0 0 16px 0;"><strong>Ämne:</strong> ${amne}</p>
            <div style="background:#f8fbf7;border:1px solid #e5efe2;border-radius:8px;padding:16px;">
              <p style="white-space:pre-line;margin:0;color:#254a31;">${meddelande}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: 'info@functionalfoods.se',
      toName: 'Functional Foods',
      subject: `Kontaktformulär: ${amne}`,
      html,
      fromEmail: 'no-reply@functionalfoods.se',
      fromName: 'Functional Foods Kontaktformulär',
      replyTo: email,
      tags: ['contact-form', 'website']
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