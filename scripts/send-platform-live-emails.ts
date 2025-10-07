import { prisma } from '../app/lib/database';
import { EmailService } from '../app/lib/email';

const emailService = new EmailService();

async function sendPlatformLiveEmails() {
  console.log('\n🚀 Skickar "Platform Live" emails till befintliga kunder...\n');

  try {
    // Hämta alla kunder som ska få email
    const users = await prisma.user.findMany({
      where: {
        role: 'customer',
        // Exkludera test-konton
        email: {
          notIn: [
            'christopher@1753skincare.com',
            'ch.genberg@gmail.com',
            'test@example.com'
          ]
        }
      },
      include: {
        purchases: {
          where: {
            status: 'completed',
            OR: [
              { accessExpiresAt: null },
              { accessExpiresAt: { gt: new Date() } }
            ]
          },
          include: {
            course: true
          }
        }
      }
    });

    console.log(`📋 Hittade ${users.length} kunder att skicka email till\n`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        // Hämta användarens kurser
        const courses = user.purchases
          .map(p => p.course?.name)
          .filter(Boolean);

        if (courses.length === 0) {
          console.log(`⚠️  Hoppar över ${user.email} - inga kurser`);
          continue;
        }

        // Generera temporärt lösenord (om de inte redan har ett)
        // OBS: I produktion bör du kolla om användaren redan har ett lösenord
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();

        // Skicka email
        const sent = await emailService.sendPlatformLiveEmail({
          email: user.email,
          name: user.name || user.email.split('@')[0],
          tempPassword: tempPassword,
          courses: courses
        });

        if (sent) {
          successCount++;
          console.log(`✅ Email skickat till: ${user.email}`);
        } else {
          failCount++;
          console.log(`❌ Misslyckades skicka till: ${user.email}`);
        }

        // Vänta lite mellan varje email för att inte överbelasta
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        failCount++;
        console.error(`❌ Fel för ${user.email}:`, error);
      }
    }

    console.log('\n📊 Sammanfattning:');
    console.log(`✅ Lyckades: ${successCount}`);
    console.log(`❌ Misslyckades: ${failCount}`);
    console.log(`📧 Totalt: ${successCount + failCount}`);

  } catch (error) {
    console.error('Fel vid hämtning av användare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör endast om detta är huvudskriptet
if (require.main === module) {
  sendPlatformLiveEmails();
}

export { sendPlatformLiveEmails };
