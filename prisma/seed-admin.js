const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Hasha lösenordet
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Skapa admin-användare
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@functionalfoods.se' },
      update: {
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        isActive: true
      },
      create: {
        email: 'admin@functionalfoods.se',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        isActive: true
      }
    });

    console.log('✅ Admin-användare skapad/uppdaterad:', adminUser.email);
    console.log('📧 E-post: admin@functionalfoods.se');
    console.log('🔑 Lösenord: admin123');
    console.log('👤 Roll: admin');

  } catch (error) {
    console.error('❌ Fel vid skapande av admin-användare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin(); 