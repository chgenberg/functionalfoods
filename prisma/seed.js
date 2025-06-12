const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Skapa admin-användare
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@functionalfoods.se' },
    update: {},
    create: {
      email: 'admin@functionalfoods.se',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Skapa test-kund
  const customerPassword = await bcrypt.hash('test123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: customerPassword,
      role: 'customer',
    },
  });

  console.log({ admin, customer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 