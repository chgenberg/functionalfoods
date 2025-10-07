import { EmailService } from '../app/lib/email';
import * as fs from 'fs';
import * as path from 'path';

const emailService = new EmailService();

async function previewPlatformLiveEmail() {
  console.log('\n📧 Förhandsvisar "Platform Live" email...\n');

  // Test-data
  const testData = {
    email: 'test@example.com',
    name: 'Test Användare',
    tempPassword: 'TempPass123ABC',
    courses: ['Functional Basics', 'Functional Flow']
  };

  // Generera HTML (vi använder en privat metod här för test)
  const baseUrl = 'https://functionalfoods.se';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
        
        <!-- LIVE Banner Image -->
        <div style="position: relative; width: 100%; height: auto; overflow: hidden;">
          <img 
            src="${baseUrl}/mail/LIVE.png" 
            alt="LIVE - Functional Foods" 
            style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;"
          />
        </div>
        
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
              <li style="margin: 8px 0;">Gå till <a href="${baseUrl}/login" style="color: #1a4324; font-weight: 600;">inloggningssidan</a>.</li>
              <li style="margin: 8px 0;">Fyll i din e-postadress: <strong style="color: #1a4324;">${testData.email}</strong></li>
              <li style="margin: 8px 0;">Ange det temporära lösenordet: <span style="font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #1a4324; font-weight: 600;">${testData.tempPassword}</span></li>
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

  // Spara HTML-filen för förhandsgranskning
  const outputPath = path.join(process.cwd(), 'platform-live-email-preview.html');
  fs.writeFileSync(outputPath, html);

  console.log(`✅ Email-förhandsgranskning sparad till: ${outputPath}`);
  console.log(`\n📧 Test-data som användes:`);
  console.log(`   Email: ${testData.email}`);
  console.log(`   Namn: ${testData.name}`);
  console.log(`   Temp lösenord: ${testData.tempPassword}`);
  console.log(`   Kurser: ${testData.courses.join(', ')}`);
  console.log(`\n💡 Tips: Öppna HTML-filen i din webbläsare för att se hur emailet kommer se ut!`);
}

// Kör skriptet
previewPlatformLiveEmail();
