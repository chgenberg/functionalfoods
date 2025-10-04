const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProductionAdmin() {
  try {
    console.log('🔧 Skapar produktions-admin-användare...\n');

    // Hasha ett säkert lösenord
    const hashedPassword = await bcrypt.hash('UlrikaAdmin2024!', 10);

    // Skapa eller uppdatera admin-användare
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@ulrikafunctionalfoods.se' },
      update: {
        password: hashedPassword,
        role: 'admin',
        name: 'Ulrika Admin',
        isActive: true
      },
      create: {
        email: 'admin@ulrikafunctionalfoods.se',
        password: hashedPassword,
        role: 'admin',
        name: 'Ulrika Admin',
        isActive: true
      }
    });

    console.log('✅ Admin-användare skapad/uppdaterad!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 E-post: admin@ulrikafunctionalfoods.se');
    console.log('🔑 Lösenord: UlrikaAdmin2024!');
    console.log('👤 Roll: admin');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  VIKTIGT: Ändra lösenordet efter första inloggningen!\n');
    console.log('💡 Logga in på: /admin/login\n');

  } catch (error) {
    console.error('❌ Fel vid skapande av admin-användare:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createProductionAdmin();
