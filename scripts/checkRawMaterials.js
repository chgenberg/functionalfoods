const { PrismaClient } = require('@prisma/client');

async function checkRawMaterials() {
  const prisma = new PrismaClient();
  
  try {
    const materials = await prisma.rawMaterial.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${materials.length} raw materials\n`);
    
    materials.slice(0, 5).forEach((material, index) => {
      console.log(`${index + 1}. ${material.name}`);
      if (material.description) {
        console.log(`   Description: "${material.description.slice(0, 200)}..."`);
        console.log(`   Length: ${material.description.length} characters`);
        console.log(`   Contains periods: ${material.description.includes('.')}`);
        console.log(`   Number of sentences: ${material.description.split('.').filter(s => s.trim().length > 0).length}`);
      } else {
        console.log('   No description');
      }
      console.log('');
    });
    
    // Check for materials with very long descriptions
    const longDescriptions = materials.filter(m => m.description && m.description.length > 300);
    console.log(`Materials with descriptions longer than 300 chars: ${longDescriptions.length}`);
    
    if (longDescriptions.length > 0) {
      console.log('\nExample long descriptions:');
      longDescriptions.slice(0, 2).forEach(material => {
        console.log(`${material.name}: ${material.description.length} chars`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRawMaterials(); 