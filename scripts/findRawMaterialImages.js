// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Svenska till engelska översättningar för bättre sökresultat
const swedishToEnglish = {
  'Apelsin': 'orange citrus fruit',
  'Äpple': 'apple fruit',
  'Aroniabär': 'aronia berry chokeberry',
  'Ashwagandha': 'ashwagandha herb root',
  'Astaxantin': 'astaxanthin algae supplement',
  'Avokado': 'avocado fruit',
  'Basilika': 'basil herb leaves',
  'Blåbär': 'blueberry berry fruit',
  'Broccoli': 'broccoli vegetable green',
  'Chiafrön': 'chia seeds superfood',
  'Gurkmeja': 'turmeric root spice',
  'Ingefära': 'ginger root spice',
  'Kanel': 'cinnamon spice bark',
  'Kokosolja': 'coconut oil',
  'Lax': 'salmon fish',
  'Mandel': 'almond nuts',
  'Spirulina': 'spirulina algae powder',
  'Quinoa': 'quinoa grain',
  'Linfrön': 'flax seeds linseed',
  'Havre': 'oats grain',
  'Valnöt': 'walnut nuts',
  'Rödbetor': 'beetroot vegetable',
  'Spenat': 'spinach leafy greens',
  'Kål': 'kale leafy greens',
  'Tomater': 'tomatoes vegetables',
  'Morötter': 'carrots vegetables orange',
  'Citron': 'lemon citrus fruit',
  'Lime': 'lime citrus fruit',
  'Banan': 'banana fruit yellow',
  'Jordgubbar': 'strawberry berries fruit',
  'Hallon': 'raspberry berries fruit',
  'Björnbär': 'blackberry berries fruit',
  'Vinbär': 'currant berries',
  'Persika': 'peach fruit',
  'Plommon': 'plum fruit',
  'Körsbär': 'cherry fruit',
  'Vindruvor': 'grapes fruit',
  'Kiwi': 'kiwi fruit green',
  'Ananas': 'pineapple tropical fruit',
  'Mango': 'mango tropical fruit',
  'Papaya': 'papaya tropical fruit',
  'Passion': 'passion fruit',
  'Fikon': 'fig fruit',
  'Dadlar': 'dates dried fruit',
  'Russin': 'raisins dried grapes'
};

// Funktion för att översätta svenska namn till engelska söktermer
function getSearchTerm(swedishName) {
  const cleanName = swedishName.replace(/[\(\)]/g, '').trim();
  
  // Kolla om vi har en direkt översättning
  if (swedishToEnglish[cleanName]) {
    return swedishToEnglish[cleanName];
  }
  
  // Om inte, försök hitta delvis matchning
  for (const [swedish, english] of Object.entries(swedishToEnglish)) {
    if (cleanName.toLowerCase().includes(swedish.toLowerCase())) {
      return english;
    }
  }
  
  // Fallback: använd ursprungsnamnet
  return cleanName;
}

// Funktion för att söka bilder via Unsplash API
async function searchUnsplashImage(searchTerm) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable is required');
  }
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        imageUrl: data.results[0].urls.small,
        imageAlt: data.results[0].alt_description || searchTerm,
        photographer: data.results[0].user.name,
        unsplashUrl: data.results[0].links.html
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for "${searchTerm}":`, error.message);
    return null;
  }
}

// Huvudfunktion för att uppdatera bilder
async function updateRawMaterialImages() {
  console.log('🔍 Searching for images for raw materials...\n');
  
  try {
    // Hämta alla råvaror som saknar bilder eller har placeholder
    const materialsNeedingImages = await prisma.rawMaterial.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' },
          { imageUrl: '/images/placeholder-ingredient.jpg' }
        ]
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${materialsNeedingImages.length} materials that need images\n`);
    
    if (materialsNeedingImages.length === 0) {
      console.log('✅ All raw materials already have images!');
      return;
    }
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const material of materialsNeedingImages) {
      console.log(`Processing: ${material.name}`);
      
      const searchTerm = getSearchTerm(material.name);
      console.log(`  Search term: "${searchTerm}"`);
      
      const imageData = await searchUnsplashImage(searchTerm);
      
      if (imageData) {
        try {
          await prisma.rawMaterial.update({
            where: { id: material.id },
            data: {
              imageUrl: imageData.imageUrl,
              imageAlt: imageData.imageAlt
            }
          });
          
          console.log(`  ✅ Updated with image from ${imageData.photographer}`);
          successCount++;
          
          // Vänta lite mellan requests för att respektera API-gränser
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (dbError) {
          console.log(`  ❌ Database error: ${dbError.message}`);
          skipCount++;
        }
      } else {
        console.log(`  ⚠️  No image found`);
        skipCount++;
      }
      
      console.log('');
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully updated: ${successCount} materials`);
    console.log(`⚠️  Skipped: ${skipCount} materials`);
    console.log(`🔍 Total processed: ${materialsNeedingImages.length} materials`);
    
  } catch (error) {
    console.error('Error updating raw material images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Funktion för att testa en enskild sökning
async function testSingleSearch(materialName) {
  console.log(`🧪 Testing search for: ${materialName}\n`);
  
  const searchTerm = getSearchTerm(materialName);
  console.log(`Search term: "${searchTerm}"`);
  
  const imageData = await searchUnsplashImage(searchTerm);
  
  if (imageData) {
    console.log(`✅ Found image:`);
    console.log(`   URL: ${imageData.imageUrl}`);
    console.log(`   Alt text: ${imageData.imageAlt}`);
    console.log(`   Photographer: ${imageData.photographer}`);
    console.log(`   Unsplash link: ${imageData.unsplashUrl}`);
  } else {
    console.log(`❌ No image found for "${searchTerm}"`);
  }
  
  await prisma.$disconnect();
}

// Kontrollera kommandoradsargument
const args = process.argv.slice(2);

if (args.length > 0) {
  if (args[0] === '--test' && args[1]) {
    // Testa en enskild sökning
    testSingleSearch(args[1]);
  } else {
    console.log('Usage:');
    console.log('  node scripts/findRawMaterialImages.js           # Update all materials');
    console.log('  node scripts/findRawMaterialImages.js --test "Blåbär"  # Test single search');
  }
} else {
  // Kör huvudfunktionen
  updateRawMaterialImages();
} 