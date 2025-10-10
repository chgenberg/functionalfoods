import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { emailService } from '@/app/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/send-platform-migration-email
 * 
 * Skickar välkomstmail till befintliga användare med länk för lösenordsåterställning
 * 
 * Body: {
 *   userIds?: string[];  // Optional: specific user IDs to send to
 *   testMode?: boolean;  // Optional: if true, only logs what would be sent
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, testMode = false } = body;

    // Fetch users to send emails to
    // NOTE: Email is non-nullable in schema, so no need for email: { not: null }
    // Select users who DO NOT have an active (unused, unexpired) password reset token
    const where: any = {
      passwordResets: {
        none: {
          used: false,
          expiresAt: { gt: new Date() }
        }
      }
    };

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      where.id = { in: userIds };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Inga användare att skicka till',
        sent: 0
      });
    }

    const results = {
      total: users.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
      users: [] as any[]
    };

    for (const user of users) {
      try {
        if (!user.email) {
          results.failed++;
          results.errors.push(`User ${user.id} has no email`);
          continue;
        }

        // Generate password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        if (testMode) {
          results.users.push({
            email: user.email,
            name: user.name,
            resetToken: 'TEST_MODE',
            action: 'Would send email'
          });
          results.sent++;
          continue;
        }

        // Upsert password reset token in PasswordReset table
        await prisma.passwordReset.upsert({
          where: { userId: user.id },
          update: {
            token: resetToken,
            expiresAt: resetTokenExpiry,
            used: false,
            createdAt: new Date()
          },
          create: {
            userId: user.id,
            token: resetToken,
            expiresAt: resetTokenExpiry,
            used: false
          }
        });

        // Send migration welcome email
        const emailSent = await sendPlatformMigrationEmail({
          email: user.email,
          name: user.name || user.email,
          resetToken
        });

        if (emailSent) {
          results.sent++;
          results.users.push({
            email: user.email,
            name: user.name,
            status: 'sent'
          });
        } else {
          results.failed++;
          results.errors.push(`Failed to send email to ${user.email}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.failed++;
        results.errors.push(`Error for user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration emails ${testMode ? 'simulated' : 'sent'}`,
      ...results
    });

  } catch (error) {
    console.error('Send platform migration email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send migration emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Send platform migration welcome email with password reset link
 */
async function sendPlatformMigrationEmail(params: {
  email: string;
  name: string;
  resetToken: string;
}): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.functionalfoods.se';
  const resetLink = `${baseUrl}/reset-password?token=${params.resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
        
        <!-- Header med gradient -->
        <div style="background: linear-gradient(135deg, #1a4324 0%, #2d5a3d 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(157, 196, 109, 0.2); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(157, 196, 109, 0.15); border-radius: 50%;"></div>
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; position: relative; z-index: 1;">Functional Foods</h1>
          <p style="color: #9dc46d; margin: 12px 0 0 0; font-size: 18px; position: relative; z-index: 1;">Välkommen till vår nya plattform! 🎉</p>
        </div>
        
        <!-- Grön accent-linje -->
        <div style="height: 4px; background: linear-gradient(90deg, #9dc46d 0%, #7fb05a 100%);"></div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Personlig hälsning -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1a4324; margin: 0 0 16px 0; font-size: 28px; font-weight: 600;">
              Hej ${params.name}! 👋
            </h2>
            <p style="color: #555; line-height: 1.8; font-size: 16px; margin: 0;">
              Vi har uppgraderat vår plattform och gjort den ännu bättre för dig!<br>
              Nu är det dags att aktivera ditt konto på den nya plattformen. 🌱
            </p>
          </div>

          <!-- Nytt innehåll box -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%); border: 2px solid #9dc46d; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
              <span style="font-size: 28px; margin-right: 12px;">✨</span>
              Vad är nytt?
            </h3>
            <ul style="color: #1a4324; line-height: 2; margin: 0; padding-left: 20px;">
              <li><strong>Modernare design</strong> – Enklare och snyggare att navigera</li>
              <li><strong>Bättre prestanda</strong> – Snabbare laddningstider</li>
              <li><strong>Förbättrad mobilupplevelse</strong> – Perfekt på alla enheter</li>
              <li><strong>Nya funktioner</strong> – Fler verktyg för din hälsoresa</li>
            </ul>
          </div>

          <!-- Aktivera konto sektion -->
          <div style="background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center;">
              <span style="display: inline-block; width: 32px; height: 32px; background: #9dc46d; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-size: 16px; margin-right: 12px;">🔐</span>
              Aktivera ditt konto
            </h3>
            <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">
              För att komma igång behöver du skapa ett nytt lösenord. Klicka på knappen nedan så guidar vi dig genom processen.
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Viktigt:</strong> Länken är giltig i 7 dagar. Om den går ut kan du begära en ny via "Glömt lösenord" på inloggningssidan.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #1a4324 0%, #2d5a3d 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(26, 67, 36, 0.3);">
              🚀 Skapa nytt lösenord
            </a>
          </div>

          <!-- Steg-för-steg -->
          <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0f7f5 100%); border-radius: 12px; padding: 24px; margin: 30px 0; border: 1px solid #d4e8df;">
            <h3 style="color: #1a4324; margin: 0 0 16px 0; font-size: 18px;">📚 Så här gör du:</h3>
            <ol style="color: #555; line-height: 2; margin: 0; padding-left: 20px;">
              <li>Klicka på knappen ovan</li>
              <li>Skapa ett nytt, säkert lösenord</li>
              <li>Logga in med din e-post och nya lösenord</li>
              <li>Utforska den nya plattformen!</li>
            </ol>
          </div>

          <!-- Help Section -->
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

          <!-- Security note -->
          <div style="background: #fff9e6; border-left: 4px solid #fbbf24; padding: 16px; margin: 30px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>🔒 Säkerhetstips:</strong> Vi ber aldrig om ditt lösenord via e-post. Om du inte begärt denna återställning kan du ignorera detta meddelande.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #1a4324; padding: 30px; text-align: center;">
          <p style="color: #9dc46d; font-size: 14px; margin: 0 0 8px 0;">
            Fortsätt din hälsoresa med Functional Foods
          </p>
          <p style="color: #7a9b84; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.
          </p>
          <p style="color: #6a8b74; font-size: 11px; margin: 8px 0 0 0;">
            Du får detta email eftersom du är en registrerad användare hos oss.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailService['sendEmail']({
    to: params.email,
    toName: params.name,
    subject: '🎉 Välkommen till nya Functional Foods – Aktivera ditt konto',
    html,
    tags: ['platform-migration', 'welcome', 'password-reset']
  });
}

/**
 * GET /api/admin/send-platform-migration-email
 * 
 * Get statistics about users who need migration emails
 */
export async function GET() {
  try {
    // Email is non-nullable in schema; count all users
    const totalUsers = await prisma.user.count();

    const usersNeedingMigration = await prisma.user.count({
      where: {
        passwordResets: {
          none: {
            used: false,
            expiresAt: { gt: new Date() }
          }
        }
      }
    });

    const usersMigrated = await prisma.user.count({
      where: {
        passwordResets: {
          some: {
            used: false,
            expiresAt: { gte: new Date() }
          }
        }
      }
    });

    return NextResponse.json({
      totalUsers,
      usersNeedingMigration,
      usersMigrated,
      percentageMigrated: totalUsers > 0 ? Math.round((usersMigrated / totalUsers) * 100) : 0
    });

  } catch (error) {
    console.error('Get migration stats error:', error);
    return NextResponse.json({
      error: 'Failed to get migration stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
