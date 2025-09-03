const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@functionalfoods.se' }
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@functionalfoods.se');
      console.log('Password: admin123');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@functionalfoods.se',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@functionalfoods.se');
    console.log('🔑 Password: admin123');
    console.log('🚀 You can now access the admin panel at /admin/login');
    console.log('⚠️  Remember to change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 