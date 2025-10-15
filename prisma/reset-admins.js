const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Resetting admin accounts...');

  // Desired admins
  const desiredAdmins = [
    { email: 'johanna@ff.se', name: 'Johanna' },
    { email: 'alberts@ff.se', name: 'Alberts' },
    { email: 'paula@ff.se', name: 'Paula' },
    { email: 'admin@ff.se', name: 'Admin' },
  ];

  const passwordPlain = 'FunctionalFoods1!';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  // 1) Try to delete existing admins; if FK constraints block deletion, demote instead
  try {
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    console.log(`🧹 Found ${admins.length} existing admin(s). Attempting delete...`);

    if (admins.length > 0) {
      const result = await prisma.user.deleteMany({ where: { role: 'admin' } });
      console.log(`✅ Deleted ${result.count} admin user(s).`);
    } else {
      console.log('ℹ️ No existing admins to delete.');
    }
  } catch (err) {
    console.warn('⚠️ Delete failed (likely due to FK constraints). Demoting admins instead...', err.message);
    const demote = await prisma.user.updateMany({
      where: { role: 'admin' },
      data: { role: 'customer', isActive: false }
    });
    console.log(`🟡 Demoted ${demote.count} admin(s) to customer and deactivated them.`);
  }

  // 2) Create the requested admins (idempotent via upsert)
  for (const admin of desiredAdmins) {
    const created = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        role: 'admin',
        isActive: true,
        name: admin.name,
        password: passwordHash,
        mustChangePassword: false,
      },
      create: {
        email: admin.email,
        name: admin.name,
        role: 'admin',
        isActive: true,
        password: passwordHash,
        mustChangePassword: false,
      },
    });
    console.log(`✅ Admin ensured: ${created.email}`);
  }

  console.log('🎉 Admin reset complete. New admins:');
  for (const admin of desiredAdmins) {
    console.log(`   • ${admin.email} / FunctionalFoods1!`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error in reset-admins:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


