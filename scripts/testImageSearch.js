const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Enkel demonstration av image search utan API-nycklar
async function testImageSearch() {
  console.log('🧪 Testing image search concept for raw materials...\n');
  
  try {
    // Hämta de första 10 råvarorna som exempel
    const materials = await prisma.rawMaterial.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('📋 Sample raw materials that need images:\n');
    
    const imageSearchResults = [];
    
    materials.forEach((material, index) => {
      const hasImage = material.imageUrl && material.imageUrl !== '/images/placeholder-ingredient.jpg';
      
      console.log(`${index + 1}. ${material.name}`);
      console.log(`   Current image: ${material.imageUrl || 'None'}`);
      console.log(`   Status: ${hasImage ? '✅ Has image' : '❌ Needs image'}`);
      
      if (!hasImage) {
        // Generera söktermer för denna råvara
        const searchTerms = generateSearchTerms(material.name);
        console.log(`   Suggested search terms: ${searchTerms.join(', ')}`);
        
        // Föreslå gratis bildkällor
        const imageSources = [
          `https://unsplash.com/s/photos/${encodeURIComponent(searchTerms[0])}`,
          `https://pixabay.com/images/search/${encodeURIComponent(searchTerms[0])}/`,
          `https://commons.wikimedia.org/wiki/Special:Search/${encodeURIComponent(material.name)}`
        ];
        
        imageSearchResults.push({
          material: material.name,
          searchTerms,
          sources: imageSources
        });
      }
      
      console.log('');
    });
    
    console.log('\n🔍 Free image search URLs generated:');
    imageSearchResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.material}:`);
      result.sources.forEach((source, i) => {
        const sourceName = source.includes('unsplash') ? 'Unsplash' : 
                          source.includes('pixabay') ? 'Pixabay' : 'Wikimedia';
        console.log(`   ${sourceName}: ${source}`);
      });
    });
    
    console.log('\n💡 Next steps to get images automatically:');
    console.log('1. Get free API keys from:');
    console.log('   - Unsplash: https://unsplash.com/developers (50 requests/hour free)');
    console.log('   - Pixabay: https://pixabay.com/api/docs/ (5000 requests/hour free)');
    console.log('2. Set environment variables with your keys');
    console.log('3. Run: node scripts/findRawMaterialImages.js');
    console.log('4. Review and download the suggested images');
    
    console.log('\n📊 Summary:');
    const needsImages = materials.filter(m => !m.imageUrl || m.imageUrl === '/images/placeholder-ingredient.jpg').length;
    console.log(`- Materials checked: ${materials.length}`);
    console.log(`- Need images: ${needsImages}`);
    console.log(`- Already have images: ${materials.length - needsImages}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Generera söktermer för en råvara
function generateSearchTerms(materialName) {
  const swedishToEnglish = {
    'Apelsin': 'orange citrus',
    'Äpple': 'apple',
    'Aroniabär': 'aronia berry',
    'Ashwagandha': 'ashwagandha herb',
    'Astaxantin': 'astaxanthin algae',
    'Avokado': 'avocado',
    'Basilika': 'basil herb',
    'Blåbär': 'blueberry',
    'Broccoli': 'broccoli',
    'Chiafrön': 'chia seeds',
    'Gurkmeja': 'turmeric',
    'Ingefära': 'ginger root',
    'Kanel': 'cinnamon',
    'Kokosolja': 'coconut oil',
    'Lax': 'salmon fish',
    'Mandel': 'almond',
    'Spirulina': 'spirulina algae'
  };
  
  const cleanName = materialName.replace(/[\(\)]/g, '').trim();
  const englishTerm = swedishToEnglish[cleanName] || cleanName;
  
  return [
    `${englishTerm} ingredient`,
    `fresh ${englishTerm}`,
    englishTerm
  ];
}

// Kör testet
testImageSearch(); 