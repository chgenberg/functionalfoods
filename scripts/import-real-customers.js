const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function importCustomers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Läser customers_2025_new.xlsx...');
    
    // Read Excel file
    const workbook = XLSX.readFile('public/customers_2025_new.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Parse headers and data
    const headers = data[0];
    const rows = data.slice(1).filter(row => row.length > 0 && row[4]); // Filter rows with email
    
    console.log(`📋 Kolumner: ${headers.join(', ')}`);
    console.log(`👥 Hittade ${rows.length} kunder att importera`);
    
    // Map course names to platform course IDs
    const courseMapping = {
      'Functional Flow': 'functional-flow',
      'Functional Basics': 'functional-basics', 
      'Functional Energy': 'functional-energy',
      'Functional Insulin balance': 'functional-energy'
    };
    
    // Get course products from DB
    const courseProducts = await prisma.courseProduct.findMany({
      select: { id: true, name: true }
    });
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const row of rows) {
      try {
        const [
          fullName,           // 0: Namn
          suggestedUsername,  // 1: Användarnamn
          lastActive,         // 2: Senast aktiv
          accountCreated,     // 3: Skapa konto
          email,              // 4: E-post
          displayName,        // 5: Kolumn2 (duplicate name)
          status,             // 6: Kolumn1 (new/existing)
          orders,             // 7: Beställningar
          totalSpent,         // 8: Totalt spenderat
          aov,                // 9: AOV
          country,            // 10: Land/Region
          city,               // 11: Ort
          region,             // 12: Landskap
          postalCode          // 13: Postnummer
        ] = row;
        
        if (!email || !fullName) {
          console.log(`⚠️  Hoppar över rad utan email/namn`);
          skipped++;
          continue;
        }
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
        
        if (existingUser) {
          console.log(`⚠️  Användare finns redan: ${email}`);
          skipped++;
          continue;
        }
        
        // Parse course purchases from orders column
        const orderText = String(orders || '');
        let courseAccess = [];
        
        for (const [courseName, courseId] of Object.entries(courseMapping)) {
          if (orderText.includes(courseName)) {
            const courseProduct = courseProducts.find(cp => 
              cp.name.toLowerCase().includes(courseName.toLowerCase().split(' ')[1]) // Match "Flow", "Basics", "Energy"
            );
            if (courseProduct) {
              courseAccess.push({
                id: courseProduct.id,
                price: courseProduct.price || 0
              });
            }
          }
        }
        
        // Generate temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            name: fullName,
            password: hashedPassword,
            role: 'customer',
            isActive: true,
            mustChangePassword: true, // Force password change on first login
            // Store additional customer info
            city: city || null,
            country: country || null,
            postalCode: postalCode ? String(postalCode) : null
          }
        });
        
        // Create course purchases
        for (const course of courseAccess) {
          await prisma.purchase.create({
            data: {
              userId: user.id,
              courseId: course.id,
              amount: course.price,
              status: 'completed'
            }
          });
        }
        
        console.log(`✅ Skapade: ${email} | Kurser: ${courseAccess.length} | Temp lösenord: ${tempPassword}`);
        created++;
        
      } catch (error) {
        console.error(`❌ Fel vid skapande av ${row[4]}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Sammanfattning:`);
    console.log(`✅ Skapade: ${created} användare`);
    console.log(`⚠️  Hoppade över: ${skipped} (finns redan)`);
    console.log(`❌ Fel: ${errors}`);
    console.log(`\n🔑 VIKTIGT: Alla användare har temporära lösenord som MÅSTE bytas vid första inloggning!`);
    
  } catch (error) {
    console.error('❌ Kritiskt fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCustomers();
