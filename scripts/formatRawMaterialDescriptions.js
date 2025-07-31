const { PrismaClient } = require('@prisma/client');

async function formatDescriptions() {
  const prisma = new PrismaClient();
  
  try {
    const materials = await prisma.rawMaterial.findMany({
      where: {
        description: {
          not: null
        }
      }
    });
    
    console.log(`Processing ${materials.length} raw materials with descriptions...\n`);
    
    let updatedCount = 0;
    
    for (const material of materials) {
      if (!material.description) continue;
      
      // Format the description with proper paragraph breaks
      let formattedDescription = material.description;
      
      // Split long sentences at logical points and add paragraph breaks
      formattedDescription = formattedDescription
        // Split after sentence endings followed by capital letters
        .replace(/\. ([A-ZÅÄÖ])/g, '.\n\n$1')
        // Split before common transitional phrases
        .replace(/ (Vanliga användningsområden|Användningsområden|Den används|De används|Det används|Dessutom|Utöver detta|Denna|Detta|Den innehåller också)/g, '\n\n$1')
        // Split before benefit descriptions
        .replace(/ (Den är känd för|Den har visat|Det har visat|Den bidrar till|Det bidrar till|Fördelarna inkluderar)/g, '\n\n$1')
        // Split before composition descriptions  
        .replace(/ (Den innehåller|Det innehåller|Denna frukt|Detta krydd|Denna ört)/g, '\n\n$1')
        // Clean up multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      // Only update if the description actually changed
      if (formattedDescription !== material.description) {
        await prisma.rawMaterial.update({
          where: { id: material.id },
          data: { description: formattedDescription }
        });
        
        updatedCount++;
        console.log(`✅ Updated: ${material.name}`);
        console.log(`   Before: ${material.description.slice(0, 100)}...`);
        console.log(`   After:  ${formattedDescription.slice(0, 100)}...`);
        console.log('');
      }
    }
    
    console.log(`\n🎉 Successfully formatted ${updatedCount} raw material descriptions!`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

formatDescriptions(); 