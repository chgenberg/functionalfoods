import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import { emailService } from '../app/lib/email';

const prisma = new PrismaClient();

// Test accounts to keep
const KEEP_ACCOUNTS = [
  'admin@functionalfoods.se',
  'basics.demo@functionalfoods.se',
  'flow.demo@functionalfoods.se',
  'energy.demo@functionalfoods.se',
  'basics@test.se',
  'flow@test.se',
  'energy@test.se'
];

interface CustomerRow {
  email: string;
  name?: string;
  courses: string[]; // Array of course names
}

async function importCustomers() {
  console.log('\n📥 IMPORTING CUSTOMERS FROM EXCEL\n');
  console.log('='.repeat(60));

  // 1. Read Excel file
  console.log('\n1️⃣ Reading Excel file...\n');
  
  const filePath = path.join(process.cwd(), 'public', 'final_customers_2025.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`✅ Found ${data.length} rows in Excel\n`);
  
  // Log first few rows to understand structure
  console.log('📋 First 3 rows (to verify structure):');
  data.slice(0, 3).forEach((row: any, i) => {
    console.log(`\n  Row ${i + 1}:`, JSON.stringify(row, null, 2));
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n⚠️  PLEASE VERIFY THE STRUCTURE ABOVE IS CORRECT');
  console.log('Expected columns: email, name, course(s)');
  console.log('\nIf structure looks good, press ENTER to continue...');
  console.log('Or Ctrl+C to abort\n');

  // Wait for user confirmation
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve(null));
  });

  console.log('\n2️⃣ Processing customers...\n');
  
  // Parse customer data
  const customers: CustomerRow[] = [];
  const errors: string[] = [];

  data.forEach((row: any, index) => {
    // Get email and fix common issues
    let email = row['E-post'] || row.email || row.Email;
    if (email) {
      // Fix comma instead of dot in emails
      email = email.replace(/,/g, '.');
      email = email.toLowerCase().trim();
    }
    
    // Get name
    const name = row['Kolumn2'] || row.Namn || row.Name || row.name || email?.split('@')[0];
    
    // Parse courses from "Beställningar" column
    const orderText = row['Beställningar'] || row.orders || row.Orders || '';
    let courses: string[] = [];
    
    if (typeof orderText === 'string' && orderText.trim()) {
      // Parse "1× Functional Flow - 6 veckor" format
      if (orderText.includes('Functional Basics') || orderText.includes('Basic')) {
        courses.push('Functional Basics');
      }
      if (orderText.includes('Functional Flow') || orderText.includes('Flow')) {
        courses.push('Functional Flow');
      }
      if (orderText.includes('Functional Energy') || orderText.includes('Energy') || orderText.includes('Insulin')) {
        courses.push('Functional Energy');
      }
    }

    // Validate email
    if (!email || !email.includes('@') || email.includes(',')) {
      errors.push(`Row ${index + 1}: Invalid email "${email}"`);
      return;
    }

    // Skip if no courses
    if (courses.length === 0) {
      errors.push(`Row ${index + 1}: No courses found for ${email}`);
      return;
    }

    customers.push({ email, name, courses });
  });

  console.log(`✅ Parsed ${customers.length} valid customers`);
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} errors:`);
    errors.slice(0, 10).forEach(err => console.log(`   ${err}`));
  }

  // 3. Clean old customers
  console.log(`\n3️⃣ Cleaning old customers (keeping test accounts)...\n`);
  
  const existingCustomers = await prisma.user.findMany({
    where: {
      role: 'customer',
      email: { notIn: KEEP_ACCOUNTS }
    },
    select: { id: true, email: true }
  });

  console.log(`Found ${existingCustomers.length} old customers to remove`);
  console.log(`Keeping ${KEEP_ACCOUNTS.length} test/admin accounts\n`);

  // Delete old customers in transaction
  for (const customer of existingCustomers) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.purchase.deleteMany({ where: { userId: customer.id } });
        await tx.order.deleteMany({ where: { userId: customer.id } });
        await tx.mealProgress.deleteMany({ where: { userId: customer.id } });
        await tx.quizResult.deleteMany({ where: { userId: customer.id } });
        await tx.passwordReset.deleteMany({ where: { userId: customer.id } });
        await tx.user.delete({ where: { id: customer.id } });
      });
      console.log(`✅ Deleted: ${customer.email}`);
    } catch (error) {
      console.error(`❌ Error deleting ${customer.email}:`, error);
    }
  }

  // 4. Get course IDs
  console.log(`\n4️⃣ Fetching course IDs...\n`);
  
  const allCourses = await prisma.courseProduct.findMany();
  const courseMap = new Map<string, { id: string; name: string }>();
  
  allCourses.forEach(course => {
    const key = course.name.toLowerCase();
    courseMap.set(key, { id: course.id, name: course.name });
    
    // Add aliases
    if (key.includes('basics')) courseMap.set('basic', { id: course.id, name: course.name });
    if (key.includes('flow')) courseMap.set('flow', { id: course.id, name: course.name });
    if (key.includes('energy') || key.includes('insulin')) courseMap.set('energy', { id: course.id, name: course.name });
  });

  console.log(`✅ Found ${allCourses.length} courses in database\n`);

  // 5. Import new customers
  console.log(`5️⃣ Importing ${customers.length} new customers...\n`);
  
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const customer of customers) {
    try {
      // Skip if test account
      if (KEEP_ACCOUNTS.includes(customer.email)) {
        console.log(`⏭️  Skipped (test account): ${customer.email}`);
        skipped++;
        continue;
      }

      // Check if already exists
      const existing = await prisma.user.findUnique({
        where: { email: customer.email }
      });

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${customer.email}`);
        skipped++;
        continue;
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user in transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: customer.email,
            name: customer.name || customer.email.split('@')[0],
            password: hashedPassword,
            role: 'customer'
          }
        });

        // Create purchases for each course
        for (const courseName of customer.courses) {
          const course = courseMap.get(courseName.toLowerCase().trim());
          
          if (!course) {
            console.warn(`   ⚠️  Course not found: "${courseName}" for ${customer.email}`);
            continue;
          }

          // Create purchase
          await tx.purchase.create({
            data: {
              userId: user.id,
              courseId: course.id,
              amount: 0, // Legacy customer - free access
              status: 'completed',
              accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
          });
        }

        // Send welcome email
        try {
          await emailService.sendMigrationWelcomeEmail({
            email: user.email,
            name: user.name,
            tempPassword: tempPassword,
            courses: customer.courses
          });
          console.log(`✅ Imported + Email sent: ${user.email} (${customer.courses.join(', ')})`);
        } catch (emailError) {
          console.warn(`✅ Imported (email failed): ${user.email}`);
        }
      });

      imported++;
    } catch (error) {
      console.error(`❌ Failed to import ${customer.email}:`, error);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 IMPORT SUMMARY:`);
  console.log(`   ✅ Imported: ${imported} customers`);
  console.log(`   ⏭️  Skipped: ${skipped} (test accounts or duplicates)`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`\n✨ Done! New customers imported with email notifications.\n`);

  await prisma.$disconnect();
}

importCustomers().catch(console.error);
