const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

async function fixCourseMappings() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixar kursmappningar för alla användare...');
    
    // Read Excel file to get original course data
    const workbook = XLSX.readFile('public/customers_2025_new.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const rows = data.slice(1).filter(row => row.length > 0 && row[4]); // Filter rows with email
    
    // Get course products from DB
    const courseProducts = await prisma.courseProduct.findMany({
      select: { id: true, name: true }
    });
    
    console.log('Tillgängliga kurser:');
    courseProducts.forEach(cp => console.log(`- ${cp.name} (${cp.id})`));
    
    // Course mapping from Excel names to DB names
    const courseMapping = {
      'Functional Flow': 'Functional Flow',
      'Functional Basics': 'Functional Basics', 
      'Functional Energy': 'Functional Energy',
      'Functional Insulin balance': 'Functional Energy'
    };
    
    let updated = 0;
    let created = 0;
    let skipped = 0;
    
    for (const row of rows) {
      try {
        const email = row[4]; // E-post
        const orders = String(row[7] || ''); // Beställningar
        
        if (!email) continue;
        
        // Find user
        const user = await prisma.user.findUnique({
          where: { email },
          include: { purchases: { include: { course: true } } }
        });
        
        if (!user) {
          console.log(`⚠️  Användare saknas: ${email}`);
          skipped++;
          continue;
        }
        
        // Parse what courses they should have from Excel
        const expectedCourses = [];
        for (const [excelCourseName, dbCourseName] of Object.entries(courseMapping)) {
          if (orders.includes(excelCourseName)) {
            const courseProduct = courseProducts.find(cp => cp.name === dbCourseName);
            if (courseProduct) {
              expectedCourses.push(courseProduct);
            }
          }
        }
        
        // Check current purchases
        const currentCourseIds = user.purchases.map(p => p.courseId);
        const expectedCourseIds = expectedCourses.map(c => c.id);
        
        // Add missing courses
        for (const course of expectedCourses) {
          if (!currentCourseIds.includes(course.id)) {
            await prisma.purchase.create({
              data: {
                userId: user.id,
                courseId: course.id,
                amount: 0, // Default amount since we don't have exact pricing from Excel
                status: 'completed'
              }
            });
            console.log(`✅ Lade till ${course.name} för ${email}`);
            created++;
          }
        }
        
        // Remove incorrect courses (courses they have but shouldn't)
        for (const purchase of user.purchases) {
          if (!expectedCourseIds.includes(purchase.courseId)) {
            await prisma.purchase.delete({
              where: { id: purchase.id }
            });
            console.log(`🗑️  Tog bort ${purchase.course.name} från ${email}`);
            updated++;
          }
        }
        
        if (expectedCourses.length === 0) {
          console.log(`ℹ️  ${email} har inga kurser i Excel-data`);
        }
        
      } catch (error) {
        console.error(`❌ Fel för ${row[4]}:`, error.message);
      }
    }
    
    console.log(`\n📊 Sammanfattning:`);
    console.log(`✅ Skapade nya köp: ${created}`);
    console.log(`🔄 Uppdaterade (tog bort): ${updated}`);
    console.log(`⚠️  Hoppade över: ${skipped}`);
    
    // Verify final state
    const usersWithCourses = await prisma.user.count({
      where: {
        role: 'customer',
        purchases: { some: {} }
      }
    });
    
    console.log(`\n🎯 Slutresultat: ${usersWithCourses} användare har nu kursaccess`);
    
  } catch (error) {
    console.error('❌ Kritiskt fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCourseMappings();
