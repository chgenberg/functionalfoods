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
  // For existing users - show reminder to use existing credentials
  isExistingUser?: boolean;
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
      console.error('❌ Mailchimp Transactional not configured - MAILCHIMP_TRANSACTIONAL_API_KEY missing');
      console.error('❌ Please set MAILCHIMP_TRANSACTIONAL_API_KEY in environment variables');
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

      console.log('📧 Attempting to send email to:', data.to, 'Subject:', data.subject);
      const response = await mailchimpClient.messages.send({ message });
      console.log('✅ Email sent successfully:', JSON.stringify(response, null, 2));
      
      // Check if email was actually sent (Mailchimp returns status per recipient)
      if (Array.isArray(response) && response.length > 0) {
        const firstRecipient = response[0];
        if (firstRecipient.status === 'rejected' || firstRecipient.status === 'invalid') {
          console.error('❌ Email was rejected by Mailchimp:', firstRecipient);
          return false;
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        name: error?.name,
        status: error?.status,
        code: error?.code,
        response: error?.response?.body || error?.response
      });
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
    const COURSE_VAT = 0.25;

    // Compute exkl./inkl. moms per rad och totalsummera
    const coursesWithVat = data.courses.map(course => {
      const priceIncl = Math.round(course.price * 100) / 100;
      const priceExcl = Math.round((priceIncl / (1 + COURSE_VAT)) * 100) / 100;
      return { ...course, priceIncl, priceExcl };
    });

    const totalIncl = coursesWithVat.reduce((sum, c) => sum + c.priceIncl, 0);
    const totalExcl = coursesWithVat.reduce((sum, c) => sum + c.priceExcl, 0);

    const coursesHtml = coursesWithVat.map(course => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #1a4324; font-size: 15px;">
          <strong>${course.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a4324; font-size: 15px;">
          ${course.priceExcl.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a4324; font-size: 15px; font-weight: 600;">
          ${course.priceIncl.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
        </td>
      </tr>
    `).join('');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
    
    const loginSection = data.loginCredentials ? `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%); border: 2px solid #9dc46d; border-radius: 12px; padding: 24px; margin: 30px 0; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: #9dc46d; border-radius: 50%; opacity: 0.1;"></div>
        <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 32px; height: 32px; background: #9dc46d; border-radius: 50%; text-align: center; line-height: 36px; color: white; font-size: 18px; margin-right: 12px;">🔒</span>
          Dina inloggningsuppgifter
        </h3>
        <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 12px;">
          <p style="margin: 8px 0; color: #1a4324;"><strong>E-post:</strong> <span style="color: #555;">${data.loginCredentials.email}</span></p>
          <p style="margin: 8px 0; color: #1a4324;"><strong>Lösenord:</strong> <span style="font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #1a4324;">${data.loginCredentials.password}</span></p>
        </div>
        <p style="color: #666; font-size: 14px; margin: 16px 0 0 0; font-style: italic;">
          <span style="display: inline-block; width: 16px; height: 16px; background: #9dc46d; border-radius: 50%; text-align: center; line-height: 16px; color: white; font-size: 10px; margin-right: 6px;">i</span>
          Tips: Ändra ditt lösenord efter första inloggningen för ökad säkerhet.
        </p>
      </div>
    ` : (data.isExistingUser ? `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%); border: 2px solid #9dc46d; border-radius: 12px; padding: 24px; margin: 30px 0; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: #9dc46d; border-radius: 50%; opacity: 0.1;"></div>
        <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 32px; height: 32px; background: #9dc46d; border-radius: 50%; text-align: center; line-height: 36px; color: white; font-size: 18px; margin-right: 12px;">🔓</span>
          Logga in för att komma åt din kurs
        </h3>
        <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">
          Du har redan ett konto hos oss! Logga in med din e-postadress <strong>${data.customerEmail}</strong> och ditt befintliga lösenord för att komma åt din nya kurs.
        </p>
        <div style="text-align: center; margin-top: 16px;">
          <a href="${baseUrl}/login" 
             style="display: inline-block; background: #9dc46d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Logga in här
          </a>
        </div>
        <p style="color: #666; font-size: 14px; margin: 16px 0 0 0; font-style: italic;">
          <span style="display: inline-block; width: 16px; height: 16px; background: #9dc46d; border-radius: 50%; text-align: center; line-height: 16px; color: white; font-size: 10px; margin-right: 6px;">i</span>
          Har du glömt ditt lösenord? <a href="${baseUrl}/forgot-password" style="color: #1a4324;">Klicka här för att återställa det</a>.
        </p>
      </div>
    ` : '');

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
          
          <!-- Header med bild -->
          <div style="position: relative; width: 100%; height: auto; overflow: hidden;">
            <img 
              src="https://functionalfoods.se/mail/header.png" 
              alt="Functional Foods" 
              style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;"
            />
          </div>
          
          <!-- Grön accent-linje -->
          <div style="height: 4px; background: linear-gradient(90deg, #9dc46d 0%, #7fb05a 100%);"></div>
          
          <!-- Content -->
        <div style="padding: 40px 30px;">
            <!-- Personlig hälsning -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #9dc46d 0%, #7fb05a 100%); border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px; font-weight: bold;">✓</span>
              </div>
              <h2 style="color: #1a4324; margin: 0 0 16px 0; font-size: 28px; font-weight: 600;">
                ${data.loginCredentials ? 'Välkommen till Functional Foods!' : 'Tack för ditt förtroende!'}
              </h2>
              <p style="color: #555; line-height: 1.8; font-size: 16px; margin: 0;">
                ${data.loginCredentials 
                  ? `Hej ${data.customerName}!<br>Din beställning är bekräftad och du har nu tillgång till dina kurser.<br>Vi är så glada att du är med på denna hälsoresa!`
                  : `Hej ${data.customerName}!<br>Tack för ditt återkommande förtroende! Din nya beställning är bekräftad.<br>Vi är glada att du fortsätter din hälsoresa tillsammans med oss!`
                }
              </p>
            </div>

            <!-- Order Details med snygg box -->
            <div style="background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; margin: 30px 0;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                <span style="display: inline-block; width: 32px; height: 32px; background: #9dc46d; border-radius: 8px; text-align: center; line-height: 32px; color: white; font-size: 18px; margin-right: 12px;">□</span>
                Orderdetaljer
              </h3>
              
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e0e0e0;">
                <span style="color: #666; flex-shrink: 0;">Ordernummer:</span>
                <span style="color: #1a4324; font-weight: 600; word-break: break-all; overflow-wrap: break-word; flex: 1; min-width: 0;">${data.orderNumber}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span style="color: #666;">Datum:</span>
                <span style="color: #1a4324;">${new Date().toLocaleDateString('sv-SE')}</span>
              </div>
              
              <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 10px; color: #1a4324; font-size: 13px; border-bottom: 1px solid #e0e0e0;">Produkt</th>
                    <th style="text-align: right; padding: 10px; color: #1a4324; font-size: 13px; border-bottom: 1px solid #e0e0e0;">Exkl. moms</th>
                    <th style="text-align: right; padding: 10px; color: #1a4324; font-size: 13px; border-bottom: 1px solid #e0e0e0;">Inkl. moms</th>
                  </tr>
                </thead>
                <tbody>
                  ${coursesHtml}
                  <tr>
                    <td style="padding: 18px 12px 0 12px; border-top: 2px solid #1a4324; font-weight: bold; color: #1a4324; font-size: 16px;">
                      Totalt
                    </td>
                    <td style="padding: 18px 12px 0 12px; border-top: 2px solid #1a4324; text-align: right; font-weight: bold; color: #1a4324; font-size: 16px;">
                      ${totalExcl.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                    </td>
                    <td style="padding: 18px 12px 0 12px; border-top: 2px solid #1a4324; text-align: right; font-weight: bold; color: #1a4324; font-size: 18px;">
                      ${totalIncl.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style="margin-top: 12px; color: #6b7280; font-size: 12px;">Priser exkl./inkl. moms (25%).</p>
            </div>

            ${loginSection}

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://functionalfoods.se" 
                 style="display: inline-block; background: linear-gradient(135deg, #1a4324 0%, #2a5434 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(26, 67, 36, 0.3); transition: all 0.3s;">
                → Kom igång med dina kurser
              </a>
            </div>

            <!-- Nästa steg -->
            <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0f7f5 100%); border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px solid #d4e8df;">
              <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 18px;">
                <span style="display: inline-block; width: 24px; height: 24px; background: #9dc46d; border-radius: 6px; text-align: center; line-height: 24px; color: white; font-size: 14px; margin-right: 8px;">→</span>
                Dina nästa steg:
              </h3>
              ${data.loginCredentials ? `
                <ol style="color: #555; line-height: 2; margin: 0; padding-left: 20px;">
                  <li>Logga in med dina nya uppgifter</li>
                  <li>Utforska ditt kursmaterial</li>
                  <li>Börja med vecka 1</li>
                  <li>Anslut till vår community</li>
                </ol>
              ` : `
                <ol style="color: #555; line-height: 2; margin: 0; padding-left: 20px;">
                  <li>Logga in på ditt konto</li>
                  <li>Dina nya kurser finns redan i din dashboard</li>
                  <li>Börja där det passar dig bäst</li>
                  <li>Fortsätt din hälsoresa i din egen takt</li>
                </ol>
              `}
            </div>

            <!-- Help Section med ikoner -->
            <div style="border-top: 2px solid #f0f0f0; padding-top: 30px; margin-top: 40px;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0; text-align: center;">Behöver du hjälp? Vi finns här!</h3>
              
              <div style="display: table; width: 100%; text-align: center;">
                <div style="display: table-cell; padding: 0 10px;">
                  <div style="background: #f8fffe; border-radius: 8px; padding: 16px;">
                    <div style="width: 40px; height: 40px; background: #9dc46d; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 20px;">@</span>
                    </div>
                    <a href="mailto:info@functionalfoods.se" style="color: #1a4324; text-decoration: none; font-weight: 500;">info@functionalfoods.se</a>
                  </div>
                </div>
                <div style="display: table-cell; padding: 0 10px;">
                  <div style="background: #f8fffe; border-radius: 8px; padding: 16px;">
                    <div style="width: 40px; height: 40px; background: #9dc46d; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 20px;">?</span>
                    </div>
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
      subject: `Orderbekräftelse #${data.orderNumber} - Välkommen till Functional Foods`,
      html,
      tags: ['order-confirmation', 'transactional']
    });
  }

  // Send temporary password to a user (bulk reset helper)
  async sendTemporaryPasswordEmail(params: { email: string; name?: string | null; password: string }): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:Arial, sans-serif;background:#f7faf9;color:#1a4324;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e5efe2;border-radius:12px;overflow:hidden;">
          <div style="background:#1a4324;color:#fff;padding:22px 24px;">
            <h1 style="margin:0;font-size:20px;">Dina inloggningsuppgifter</h1>
          </div>
          <div style="padding:22px 24px;">
            <p style="margin:0 0 12px 0;">Hej ${params.name || params.email},</p>
            <p style="margin:0 0 12px 0;">Vi har skapat ett tillfälligt lösenord åt dig. Du kan logga in nedan och byta lösenord under Inställningar.</p>
            <div style="background:#f8fbf7;border:1px solid #e5efe2;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:6px 0;"><strong>E‑post:</strong> ${params.email}</p>
              <p style="margin:6px 0;"><strong>Tillfälligt lösenord:</strong> <span style="font-family:monospace;background:#f3f4f6;padding:3px 6px;border-radius:4px;">${params.password}</span></p>
            </div>
            <p style="margin:0 0 16px 0;">Logga in här:</p>
            <p style="margin:0 0 24px 0;"><a href="${baseUrl}/login" style="display:inline-block;background:#1a4324;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Logga in</a></p>
            <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;">Av säkerhetsskäl ber vi dig att byta lösenord efter första inloggningen.</p>
          </div>
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px;text-align:center;font-size:12px;color:#64748b;">© ${new Date().getFullYear()} Functional Foods</div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: params.email,
      toName: params.name || params.email,
      subject: 'Dina inloggningsuppgifter – Functional Foods',
      html,
      tags: ['temporary-password','account']
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

  // Send newsletter subscription notification
  async sendNewsletterNotification(params: { email: string; firstName: string; lastName: string; lang: string; source?: string; }): Promise<boolean> {
    const { email, firstName, lastName, lang, source } = params;
    const name = [firstName, lastName].filter(Boolean).join(' ') || 'Ingen namn angiven';
    const sourceLabel = source === 'health-quiz' ? '🧪 Hälsoquiz' : '🌐 Hemsida';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:20px;font-family:Arial, sans-serif;background:#f7faf7;color:#1a4324;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5efe2;border-radius:12px;box-shadow:0 8px 20px rgba(26,67,36,0.06);overflow:hidden;">
          <div style="background:linear-gradient(135deg,#FF7e70 0%,#e56b5e 100%);padding:24px;color:#fff;">
            <h1 style="margin:0;font-size:20px;">📬 Ny nyhetsbrevsprenumerant!</h1>
            <p style="margin:8px 0 0 0;opacity:0.9;">${new Date().toLocaleString('sv-SE')}</p>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 8px 0;"><strong>Namn:</strong> ${name}</p>
            <p style="margin:0 0 8px 0;"><strong>E-post:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin:0 0 8px 0;"><strong>Källa:</strong> ${sourceLabel}</p>
            <p style="margin:0 0 16px 0;"><strong>Språk:</strong> ${lang.toUpperCase()}</p>
            <div style="background:#f8fbf7;border:1px solid #e5efe2;border-radius:8px;padding:16px;">
              <p style="margin:0;color:#254a31;">✅ Prenumeranten har automatiskt lagts till i er Mailchimp audience lista${source === 'health-quiz' ? ' med tagg "Health Quiz"' : ''}.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: 'info@functionalfoods.se',
      toName: 'Functional Foods',
      subject: `📬 Ny nyhetsbrevsprenumerant: ${email}`,
      html,
      fromEmail: 'no-reply@functionalfoods.se',
      fromName: 'Functional Foods Nyhetsbrev',
      tags: ['newsletter', 'notification', 'website']
    });
  }

  // Send password reset email
  async sendCourseReviewRequest(data: { email: string; name: string; courseId: string; courseName: string; userId: string }): Promise<boolean> {
    const reviewLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se'}/review/email?courseId=${encodeURIComponent(data.courseId)}&userId=${encodeURIComponent(data.userId)}&courseName=${encodeURIComponent(data.courseName)}`;
    
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #014421 0%, #116530 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 20px 20px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Grattis ${data.name}!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Du har genomfört ${data.courseName}!</p>
        </div>
        
        <div style="padding: 40px 30px; background: #fff;">
          <h2 style="color: #014421; font-size: 24px; margin-bottom: 20px; text-align: center;">Hur upplevde du kursen?</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Vi hoppas att ${data.courseName} har gett dig värdefulla kunskaper och verktyg för din hälsoresa. 
            Din feedback är ovärderlig för oss och hjälper andra att fatta rätt beslut.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reviewLink}" 
               style="display: inline-block; background: #014421; color: white; padding: 15px 30px; 
                      border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;
                      box-shadow: 0 4px 15px rgba(1, 68, 33, 0.3);">
              ⭐ Lämna din recension
            </a>
          </div>
          
          <div style="background: #F7F1E8; padding: 20px; border-radius: 15px; margin: 25px 0;">
            <h3 style="color: #014421; font-size: 16px; margin-bottom: 10px;">💡 Din recension hjälper till att:</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Förbättra kursinnehållet för framtida deltagare</li>
              <li>Hjälpa andra att förstå vad kursen erbjuder</li>
              <li>Bygga vår community av hälsointresserade</li>
            </ul>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            Det tar bara 2-3 minuter och betyder mycket för oss! 🙏
          </p>
        </div>
        
        <div style="background: #F3EFE3; padding: 30px; text-align: center; border-radius: 0 0 20px 20px;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            © ${new Date().getFullYear()} Functional Foods med Ulrika Davidsson
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: data.email,
      toName: data.name,
      subject: `🎉 Grattis! Hur upplevde du ${data.courseName}?`,
      html,
      tags: ['course-completion', 'review-request']
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
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

  // Send platform live announcement email to existing customers
  async sendPlatformLiveEmail(params: { email: string; name: string; tempPassword: string; courses: string[] }): Promise<boolean> {
    const { email, name, tempPassword, courses } = params;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #333; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
              Hej!
            </p>
            
            <p style="color: #333; line-height: 1.8; font-size: 18px; margin-bottom: 30px; text-align: center;">
              🎉 Vi har skapat ett konto åt dig, och din kurs finns på plats. 🎉
            </p>
            
            <!-- Login Instructions -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0; font-size: 20px;">
                Så här loggar du in:
              </h3>
              <ol style="color: #333; line-height: 2; margin: 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Gå till <a href="https://www.functionalfoods.se" style="color: #1a4324; font-weight: 600;">functionalfoods.se</a>.</li>
                <li style="margin: 8px 0;">Fyll i din e-postadress: <strong style="color: #1a4324;">${email}</strong></li>
                <li style="margin: 8px 0;">Ange det temporära lösenordet: <span style="font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #1a4324; font-weight: 600;">${tempPassword}</span></li>
                <li style="margin: 8px 0;">Klicka på <strong>Logga in</strong>.</li>
              </ol>
            </div>
            
            <!-- Password Change Instructions -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%); border: 2px solid #9dc46d; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0; font-size: 18px;">
                Efter första inloggningen kommer du att uppmanas att byta lösenord:
              </h3>
              <ol style="color: #333; line-height: 2; margin: 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Ange det temporära lösenordet igen.</li>
                <li style="margin: 8px 0;">Välj ett nytt, personligt lösenord som du själv vill ha.</li>
                <li style="margin: 8px 0;">Bekräfta ditt nya lösenord.</li>
                <li style="margin: 8px 0;">Spara.</li>
              </ol>
            </div>
            
            <!-- Courses Location -->
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #856404; margin: 0; font-size: 16px;">
                <strong>Dina kurser ligger under → "Mina kurser"</strong>
              </p>
            </div>
            
            <!-- Support Section -->
            <div style="border-top: 2px solid #f0f0f0; padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="color: #555; margin-bottom: 20px; line-height: 1.8;">
                Om något saknas eller du stöter på problem – tveka inte att höra av dig på 
                <a href="mailto:info@functionalfoods.se" style="color: #1a4324; font-weight: 600; text-decoration: none;">info@functionalfoods.se</a>
              </p>
              
              <p style="color: #333; font-size: 18px; margin-top: 30px;">
                Vi hoppas du kommer trivas med den nya plattformen 💚
              </p>
              
              <p style="color: #555; margin-top: 20px; font-style: italic;">
                / Teamet på Functional Foods
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Functional Foods • functionalfoods.se
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      toName: name,
      subject: 'Nu är det dags: Vår nya plattform är live!',
      html,
      fromEmail: 'info@functionalfoods.se',
      fromName: 'Functional Foods',
      tags: ['platform-live', 'announcement', 'migration']
    });
  }

  // Send migration welcome email to existing customers
  async sendMigrationWelcomeEmail(params: { email: string; name: string; tempPassword: string; courses: string[] }): Promise<boolean> {
    const { email, name, tempPassword, courses } = params;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          
          <!-- Header Image -->
          <div style="position: relative; width: 100%; height: auto; overflow: hidden;">
            <img 
              src="${baseUrl}/mail/header.png" 
              alt="Functional Foods" 
              style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;"
            />
          </div>
          
          <!-- Green accent line -->
          <div style="height: 4px; background: linear-gradient(90deg, #9dc46d 0%, #7fb05a 100%);"></div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1a4324; font-size: 28px; font-weight: 700; margin-bottom: 20px; text-align: center;">
              Välkommen till nya Functional Foods! 🎉
            </h2>
            
            <p style="color: #555; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
              Hej ${name}!
            </p>
            
            <p style="color: #555; line-height: 1.8; font-size: 16px; margin-bottom: 20px;">
              Vi har uppgraderat vår plattform och migrerat ditt konto till det nya systemet! 
              Som befintlig kund har du fortfarande full tillgång till alla dina kurser.
            </p>
            
            <!-- Courses Box -->
            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #1a4324; margin: 0 0 15px 0; font-size: 18px;">📚 Dina kurser:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #2c3e50;">
                ${courses.map(course => `<li style="margin: 8px 0;">${course}</li>`).join('')}
              </ul>
            </div>
            
            <!-- Login Credentials Box -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%); border: 2px solid #9dc46d; border-radius: 12px; padding: 24px; margin: 30px 0;">
              <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 20px;">
                🔐 Dina nya inloggningsuppgifter
              </h3>
              <div style="background: white; border-radius: 8px; padding: 16px;">
                <p style="margin: 8px 0; color: #1a4324;"><strong>E-post:</strong> <span style="color: #555;">${email}</span></p>
                <p style="margin: 8px 0; color: #1a4324;"><strong>Tillfälligt lösenord:</strong> <span style="font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #1a4324;">${tempPassword}</span></p>
              </div>
              <p style="color: #666; font-size: 14px; margin: 16px 0 0 0; font-style: italic;">
                💡 Vi rekommenderar starkt att du byter lösenord efter första inloggningen.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${baseUrl}/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #1a4324 0%, #2d5a3d 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(26, 67, 36, 0.3);">
                ✨ Logga in nu
              </a>
            </div>
            
            <!-- What's New -->
            <div style="background: #f8fffe; border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px solid #d4e8df;">
              <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 18px;">🆕 Vad är nytt?</h3>
              <ul style="color: #555; line-height: 2; margin: 0; padding-left: 20px;">
                <li>Snabbare och mer stabil plattform</li>
                <li>Förbättrad användarupplevelse</li>
                <li>Enklare navigering mellan kurser</li>
                <li>PDF-nedladdning av måltidsplaner med recept</li>
                <li>Bättre mobil-anpassning</li>
              </ul>
            </div>
            
            <!-- Help Section -->
            <div style="border-top: 2px solid #f0f0f0; padding-top: 30px; margin-top: 40px; text-align: center;">
              <h3 style="color: #1a4324; margin: 0 0 20px 0;">Behöver du hjälp? Vi finns här! 💚</h3>
              <p style="color: #666; margin-bottom: 20px;">
                Har du frågor eller problem med inloggningen? Kontakta oss gärna!
              </p>
              <a href="${baseUrl}/kontakt" style="color: #1a4324; text-decoration: none; font-weight: 600;">
                Kontakta support →
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Functional Foods • functionalfoods.se
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      toName: name,
      subject: '🎉 Välkommen till nya Functional Foods - Dina inloggningsuppgifter',
      html,
      fromEmail: 'info@functionalfoods.se',
      fromName: 'Functional Foods',
      tags: ['migration', 'welcome', 'platform-upgrade']
    });
  }

  // Send e-book download email (for standalone e-book purchases)
  async sendEbookDownloadEmail(params: { 
    email: string; 
    name: string; 
    ebookName: string;
    downloadUrl: string;
    downloadPassword: string;
    orderNumber: string;
  }): Promise<boolean> {
    const { email, name, ebookName, downloadUrl, downloadPassword, orderNumber } = params;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0FDF4; color: #fff;">
        <div style="max-width: 600px; margin: 0 auto; background: #C0DEA3 ">
          
          <!-- Header -->
          <div style="text-align: center; padding: 40px 30px 30px;">
            <div style="display: inline-block; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 100px; padding: 8px 20px; margin-bottom: 20px;">
              <span style="color: #fca5a5; font-size: 14px; font-weight: 500;">Din E-bok är redo!</span>
            </div>
            <h1 style="color: #014421; font-size: 32px; font-weight: 700; margin: 0 0 10px 0;">
              Tack för ditt köp!
            </h1>
            <p style="color: #014421; font-size: 16px; margin: 0;">
              Ordernummer: ${orderNumber}
            </p>
          </div>
          
          <!-- Content Box -->
          <div style="background-color: #C0DEA3; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; margin: 0 20px 30px; padding: 30px; backdrop-filter: blur(10px);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 64px; height: 64px; background: #014421; border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
            </div>
            
            <h2 style="color: #014421; font-size: 26px; font-weight: 600; text-align: center; margin: 0 0 8px 0;">
              ${ebookName}
            </h2>
            <p style="color: #fff; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              Digital E-bok (PDF)
            </p>
            
            <!-- Download Info Box -->
            <div style="background-color: #014421; border: 2px solid rgba(147, 197, 96, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #93C560; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                Dina nedladdningsuppgifter
              </h3>
              <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 16px;">
                <p style="color: #d1d5db; margin: 0 0 8px 0; font-size: 14px;">
                  <strong style="color: #fff;">Lösenord:</strong>
                </p>
                <p style="color: #93C560; font-family: monospace; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 2px;">
                  ${downloadPassword}
                </p>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center;">
              <a href="${downloadUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #FF7E70 0%, #FF7E70 100%); color: #fff; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);">
                Ladda ner din E-bok
              </a>
            </div>
          </div>
          
          <!-- Instructions -->
          <div style="padding: 0 30px 30px;">
            <div style="background-color: #014421; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
              <h3 style="color: #fff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                Så här gör du:
              </h3>
              <ol style="color: #d1d5db; margin: 0; padding-left: 20px; line-height: 2;">
                <li>Klicka på "Ladda ner din E-bok" ovan</li>
                <li>Ange lösenordet: <strong style="color: #93C560;">${downloadPassword}</strong></li>
                <li>Klicka på "Lås upp" och sedan "Ladda ner"</li>
                <li>Spara PDF:en på din dator eller mobil</li>
              </ol>
            </div>
          </div>
          
          <!-- Help Section -->
          <div style="padding: 0 30px 30px; text-align: center;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              Problem med nedladdningen?<br>
              Kontakta oss på <a href="mailto:info@functionalfoods.se" style="color: #93C560; text-decoration: none;">info@functionalfoods.se</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #014421; padding: 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Functional Foods • functionalfoods.se
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      toName: name,
      subject: `Din e-bok är redo att laddas ner – ${ebookName}`,
      html,
      fromEmail: 'info@functionalfoods.se',
      fromName: 'Functional Foods',
      tags: ['ebook-download', 'transactional']
    });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 
