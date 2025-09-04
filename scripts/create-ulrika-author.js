const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUlrikaAuthor() {
  try {
    console.log('👤 Skapar Ulrika som författare...');
    
    // Kolla om användaren redan finns
    const existing = await prisma.user.findUnique({
      where: { email: 'ulrika@functionalfoods.se' }
    });
    
    if (existing) {
      console.log('✅ Ulrika finns redan i databasen');
      return existing;
    }
    
    // Skapa Ulrika som användare
    const hashedPassword = await bcrypt.hash('UlrikaAuthor2025!', 10);
    const ulrika = await prisma.user.create({
      data: {
        email: 'ulrika@functionalfoods.se',
        name: 'Ulrika Davidsson',
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Ulrika skapad som författare');
    return ulrika;
    
  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createUlrikaAuthor();
}

module.exports = { createUlrikaAuthor }; 