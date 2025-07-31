const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Konfiguration för olika API:er
const API_CONFIG = {
  unsplash: {
    accessKey: 'UNSPLASH_ACCESS_KEY', // Ersätt med din Unsplash Access Key
    baseUrl: 'https://api.unsplash.com/search/photos',
    rateLimit: 50, // requests per hour för demo-nycklar
  },
  pixabay: {
    apiKey: 'PIXABAY_API_KEY', // Ersätt med din Pixabay API Key
    baseUrl: 'https://pixabay.com/api/',
    rateLimit: 100, // requests per hour
  }
};

// Översättning från svenska till engelska för bättre sökresultat
const swedishToEnglish = {
  'Apelsin': 'orange citrus',
  'Äpple': 'apple',
  'Aroniabär': 'aronia berry chokeberry',
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
  'Nötter': 'nuts',
  'Olivolja': 'olive oil',
  'Quinoa': 'quinoa grain',
  'Rödbeta': 'beetroot',
  'Sallad': 'lettuce salad',
  'Spenat': 'spinach',
  'Spirulina': 'spirulina algae',
  'Tomater': 'tomatoes',
  'Valnötter': 'walnuts',
  'Örter': 'herbs',
  // Lägg till fler översättningar efter behov
};

// Förbättra söktermer för specifika råvaror
function createSearchTerms(materialName) {
  const cleanName = materialName.replace(/[\(\)]/g, '').trim();
  const englishTerm = swedishToEnglish[cleanName] || cleanName;
  
  // Skapa flera söktermer för bättre träffar
  const searchTerms = [
    `${englishTerm} food ingredient`,
    `fresh ${englishTerm}`,
    `organic ${englishTerm}`,
    englishTerm
  ];
  
  return searchTerms;
}

// Hämta bilder från Unsplash
async function searchUnsplash(query, accessKey) {
  const url = `${API_CONFIG.unsplash.baseUrl}?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error searching Unsplash for "${query}":`, error.message);
    return [];
  }
}

// Hämta bilder från Pixabay
async function searchPixabay(query, apiKey) {
  const url = `${API_CONFIG.pixabay.baseUrl}?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&category=food&per_page=3&min_width=640`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error(`Error searching Pixabay for "${query}":`, error.message);
    return [];
  }
}

// Ladda ner bild
async function downloadImage(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const outputPath = path.join(__dirname, '..', 'public', 'images', 'raw-materials', filename);
    
    // Skapa mapp om den inte finns
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return `/images/raw-materials/${filename}`;
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error.message);
    return null;
  }
}

// Huvudfunktion för att hitta bilder
async function findImagesForRawMaterials() {
  console.log('🔍 Starting image search for raw materials...\n');
  
  // Kontrollera API-nycklar
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || API_CONFIG.unsplash.accessKey;
  const pixabayKey = process.env.PIXABAY_API_KEY || API_CONFIG.pixabay.apiKey;
  
  if (unsplashKey === 'UNSPLASH_ACCESS_KEY' && pixabayKey === 'PIXABAY_API_KEY') {
    console.error('❌ Please set your API keys in environment variables or in the script');
    console.log('🔑 Get free API keys from:');
    console.log('   - Unsplash: https://unsplash.com/developers');
    console.log('   - Pixabay: https://pixabay.com/api/docs/');
    return;
  }
  
  try {
    // Hämta alla råvaror
    const rawMaterials = await prisma.rawMaterial.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${rawMaterials.length} raw materials to process\n`);
    
    const results = {
      processed: 0,
      imagesFound: 0,
      imagesSaved: 0,
      skipped: 0,
      errors: []
    };
    
    // Skapa resultatfil för att spara bildlänkar
    const imageResults = [];
    
    for (const material of rawMaterials) {
      console.log(`\n🔍 Processing: ${material.name}`);
      
      // Hoppa över om bild redan finns
      if (material.imageUrl && material.imageUrl !== '/images/placeholder-ingredient.jpg') {
        console.log(`   ⏭️  Already has image: ${material.imageUrl}`);
        results.skipped++;
        continue;
      }
      
      const searchTerms = createSearchTerms(material.name);
      let imageFound = false;
      
      // Prova olika söktermer
      for (const searchTerm of searchTerms) {
        if (imageFound) break;
        
        console.log(`   🔎 Searching for: "${searchTerm}"`);
        
        // Prova Unsplash först
        if (unsplashKey !== 'UNSPLASH_ACCESS_KEY') {
          const unsplashResults = await searchUnsplash(searchTerm, unsplashKey);
          
          if (unsplashResults.length > 0) {
            const bestImage = unsplashResults[0];
            console.log(`   ✅ Found Unsplash image: ${bestImage.description || 'No description'}`);
            
            imageResults.push({
              materialId: material.id,
              materialName: material.name,
              searchTerm: searchTerm,
              source: 'Unsplash',
              imageUrl: bestImage.urls.regular,
              downloadUrl: bestImage.urls.small,
              description: bestImage.description,
              photographer: bestImage.user.name,
              photographerUrl: bestImage.user.links.html
            });
            
            results.imagesFound++;
            imageFound = true;
            
            // Vänta lite mellan requests för att respektera rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }
        }
        
        // Prova Pixabay om Unsplash inte fungerade
        if (!imageFound && pixabayKey !== 'PIXABAY_API_KEY') {
          const pixabayResults = await searchPixabay(searchTerm, pixabayKey);
          
          if (pixabayResults.length > 0) {
            const bestImage = pixabayResults[0];
            console.log(`   ✅ Found Pixabay image: ${bestImage.tags}`);
            
            imageResults.push({
              materialId: material.id,
              materialName: material.name,
              searchTerm: searchTerm,
              source: 'Pixabay',
              imageUrl: bestImage.webformatURL,
              downloadUrl: bestImage.webformatURL,
              tags: bestImage.tags,
              photographer: bestImage.user
            });
            
            results.imagesFound++;
            imageFound = true;
            
            // Vänta lite mellan requests
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Vänta mellan olika söktermer
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      if (!imageFound) {
        console.log(`   ❌ No suitable image found for: ${material.name}`);
        results.errors.push(material.name);
      }
      
      results.processed++;
      
      // Paus varje 10:e material för att respektera rate limits
      if (results.processed % 10 === 0) {
        console.log(`\n⏸️  Taking a break after ${results.processed} materials...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Spara resultaten
    const resultsFilePath = path.join(__dirname, 'raw-material-images-results.json');
    fs.writeFileSync(resultsFilePath, JSON.stringify(imageResults, null, 2));
    
    console.log('\n✅ Image search completed!');
    console.log(`\n📊 Results:`);
    console.log(`   - Processed: ${results.processed} materials`);
    console.log(`   - Images found: ${results.imagesFound}`);
    console.log(`   - Skipped (already had images): ${results.skipped}`);
    console.log(`   - No images found: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Materials without images:`);
      results.errors.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log(`\n💾 Results saved to: ${resultsFilePath}`);
    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Review the results file`);
    console.log(`   2. Run the download script to save images`);
    console.log(`   3. Update database with image URLs`);
    
  } catch (error) {
    console.error('❌ Error during image search:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör scriptet
if (require.main === module) {
  findImagesForRawMaterials();
}

module.exports = { findImagesForRawMaterials, createSearchTerms }; 