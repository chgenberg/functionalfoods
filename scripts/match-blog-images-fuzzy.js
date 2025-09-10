/*
  Smart fuzzy matching för att koppla blogginlägg till passande receptbilder
  Kör med: node scripts/match-blog-images-fuzzy.js
*/
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Hämta alla tillgängliga receptbilder
function getAvailableImages() {
  const imagesDir = path.join(process.cwd(), 'public', 'recept_images_optimized');
  const files = fs.readdirSync(imagesDir);
  
  // Filtrera bara card-medium bilder (perfekt storlek för blogginlägg)
  const cardImages = files
    .filter(file => file.includes('-card-medium.webp'))
    .map(file => ({
      filename: file,
      name: file.replace('-card-medium.webp', '').replace(/-/g, ' '),
      path: `/recept_images_optimized/${file}`
    }));
    
  return cardImages;
}

// Extrahera nyckelord från titel och innehåll
function extractKeywords(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  // Viktiga nyckelord för mat och ingredienser
  const keywords = [];
  
  // Kött och fisk
  if (text.match(/\b(lax|fisk|torsk|makrill|tonfisk|räkor|skaldjur)\b/)) keywords.push('fisk', 'lax', 'seafood');
  if (text.match(/\b(kött|nöt|lamm|fläsk|kalv|kyckling|kalkon|fågel)\b/)) keywords.push('kött', 'protein');
  if (text.match(/\b(kyckling|höns|fågel)\b/)) keywords.push('kyckling', 'fågel');
  
  // Grönsaker
  if (text.match(/\b(rotfrukter|morötter|potatis|sötpotatis|rödbetor|palsternacka)\b/)) keywords.push('rotfrukter', 'morötter');
  if (text.match(/\b(broccoli|blomkål|kål|grönkål|vitkål|rödkål|bladgrönsaker|spenat)\b/)) keywords.push('kål', 'broccoli', 'grönt');
  if (text.match(/\b(sallad|rucola|spenat|bladgrönt)\b/)) keywords.push('sallad', 'grönt');
  if (text.match(/\b(tomat|paprika|gurka|lök|vitlök)\b/)) keywords.push('grönsaker', 'paprika');
  if (text.match(/\b(svamp|champinjoner|kantareller)\b/)) keywords.push('svamp');
  
  // Frukt och bär
  if (text.match(/\b(äpplen|päron|bananer|citrus|apelsin|citron)\b/)) keywords.push('frukt', 'äpplen');
  if (text.match(/\b(bär|blåbär|jordgubbar|hallon|björnbär)\b/)) keywords.push('bär', 'blåbär', 'jordgubbar');
  if (text.match(/\b(avokado)\b/)) keywords.push('avokado');
  
  // Spannmål och baljväxter
  if (text.match(/\b(havre|havregröt|müsli|flingor|gröt)\b/)) keywords.push('havre', 'gröt', 'müsli');
  if (text.match(/\b(quinoa|bulgur|ris|pasta)\b/)) keywords.push('quinoa', 'spannmål');
  if (text.match(/\b(linser|bönor|kikärtor|baljväxter)\b/)) keywords.push('linser', 'bönor');
  
  // Mejeriprodukter
  if (text.match(/\b(yoghurt|kvarg|kefir|mjölk|probiotika)\b/)) keywords.push('yoghurt', 'mjölk');
  if (text.match(/\b(ost|feta|mozzarella|parmesan)\b/)) keywords.push('ost', 'feta');
  if (text.match(/\b(ägg|omelett|äggröra)\b/)) keywords.push('ägg');
  
  // Nötter och frön
  if (text.match(/\b(nötter|mandel|valnötter|hasselnötter)\b/)) keywords.push('nötter', 'mandel');
  if (text.match(/\b(frön|chia|sesam|linfrö|pumpafrön)\b/)) keywords.push('frön', 'chia');
  
  // Måltidstyper
  if (text.match(/\b(smoothie|juice|dryck)\b/)) keywords.push('smoothie', 'dryck');
  if (text.match(/\b(sallad|bowl|skål)\b/)) keywords.push('sallad', 'bowl');
  if (text.match(/\b(soppa|buljong|gryta)\b/)) keywords.push('soppa', 'gryta');
  if (text.match(/\b(pannkaka|våffla|muffin|kaka)\b/)) keywords.push('pannkaka', 'bakning');
  
  // Hälsokoncept som kan kopplas till specifika maträtter
  if (text.match(/\b(protein|aminosyror|bcaa|kollagen)\b/)) keywords.push('protein', 'kött', 'fisk', 'ägg');
  if (text.match(/\b(antioxidanter|polyfenoler)\b/)) keywords.push('bär', 'grönsaker', 'frukt');
  if (text.match(/\b(inflammation|antiinflammatorisk)\b/)) keywords.push('fisk', 'nötter', 'grönsaker');
  if (text.match(/\b(tarmflora|tarmhälsa|mag)\b/)) keywords.push('yoghurt', 'fermenterade');
  if (text.match(/\b(energi|blodsocker)\b/)) keywords.push('havre', 'gröt', 'quinoa');
  if (text.match(/\b(hjärta|kardiovaskulär)\b/)) keywords.push('fisk', 'nötter', 'avokado');
  
  // Fallback för abstrakta ämnen - använd allmänna hälsobilder
  if (keywords.length === 0) {
    if (text.match(/\b(hälsa|näring|functional|foods|kost)\b/)) {
      keywords.push('sallad', 'grönsaker', 'bowl'); // Allmänna hälsosamma bilder
    }
  }
  
  return [...new Set(keywords)]; // Ta bort dubbletter
}

// Beräkna matchningspoäng mellan nyckelord och bildnamn
function calculateMatch(keywords, imageName) {
  let score = 0;
  const imageWords = imageName.toLowerCase().split(/[\s-]+/);
  
  keywords.forEach(keyword => {
    imageWords.forEach(word => {
      // Exakt matchning
      if (word === keyword) {
        score += 10;
      }
      // Partiell matchning
      else if (word.includes(keyword) || keyword.includes(word)) {
        score += 5;
      }
      // Semantisk matchning för relaterade ord
      else if (areRelated(keyword, word)) {
        score += 3;
      }
    });
  });
  
  return score;
}

// Kolla om ord är relaterade (semantisk matchning)
function areRelated(word1, word2) {
  const relations = {
    'fisk': ['lax', 'torsk', 'makrill', 'seafood', 'havs'],
    'kött': ['lamm', 'nöt', 'fläsk', 'protein'],
    'kyckling': ['fågel', 'höns'],
    'rotfrukter': ['morötter', 'potatis', 'rödbetor', 'sötpotatis'],
    'grönsaker': ['paprika', 'tomat', 'gurka', 'lök'],
    'bär': ['blåbär', 'jordgubbar', 'hallon'],
    'frukt': ['äpplen', 'päron', 'citrus'],
    'yoghurt': ['kvarg', 'mjölk', 'probiotika'],
    'ägg': ['omelett', 'äggröra', 'protein'],
    'smoothie': ['bowl', 'dryck', 'juice'],
    'sallad': ['bowl', 'grönt', 'bladgrönt']
  };
  
  for (const [key, values] of Object.entries(relations)) {
    if ((key === word1 && values.includes(word2)) || 
        (key === word2 && values.includes(word1)) ||
        (values.includes(word1) && values.includes(word2))) {
      return true;
    }
  }
  
  return false;
}

// Hitta bästa bildmatchning för en blogpost
function findBestImageMatch(post, images) {
  const keywords = extractKeywords(post.title, post.excerpt || '');
  console.log(`🔍 Nyckelord för "${post.title}": ${keywords.join(', ')}`);
  
  if (keywords.length === 0) {
    return null;
  }
  
  let bestMatch = null;
  let bestScore = 0;
  
  images.forEach(image => {
    const score = calculateMatch(keywords, image.name);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = image;
    }
  });
  
  // Kräv minst poäng 3 för att acceptera matchning
  if (bestScore >= 3) {
    return { ...bestMatch, score: bestScore };
  }
  
  return null;
}

async function matchBlogImages() {
  console.log('🖼️ Matchar blogginlägg med passande receptbilder...\n');
  
  try {
    // Hämta alla blogginlägg
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        excerpt: true,
        coverImage: true,
        slug: true
      },
      where: {
        published: true
      }
    });
    
    console.log(`📚 Hittade ${posts.length} publicerade blogginlägg\n`);
    
    if (posts.length === 0) {
      console.log('ℹ️ Inga blogginlägg att bearbeta.');
      return;
    }
    
    // Hämta tillgängliga bilder
    const images = getAvailableImages();
    console.log(`🖼️ Hittade ${images.length} receptbilder\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Håll reda på använda bilder för att undvika dubbletter
    const usedImages = new Set();
    
    for (const post of posts) {
      console.log(`\n📝 Bearbetar: "${post.title}"`);
      
      // Skippa endast om redan har en lokal receptbild (inte Unsplash eller placeholder)
      if (post.coverImage && 
          post.coverImage.startsWith('/recept_images_') && 
          !post.coverImage.includes('placeholder')) {
        console.log(`⏭️ Har redan receptbild: ${post.coverImage}`);
        usedImages.add(post.coverImage);
        skippedCount++;
        continue;
      }
      
      let selectedImage = null;
      
      // Försök först hitta en smart matchning
      const match = findBestImageMatch(post, images);
      
      if (match && match.score >= 8) { // Högre krav för "smart" matchning
        selectedImage = match;
        console.log(`🎯 Smart matchning: "${match.name}" (poäng: ${match.score})`);
      } else {
        // Annars välj en slumpmässig bild som inte redan används
        const availableImages = images.filter(img => !usedImages.has(img.path));
        
        if (availableImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableImages.length);
          selectedImage = availableImages[randomIndex];
          console.log(`🎲 Slumpmässig bild: "${selectedImage.name}"`);
        }
      }
      
      if (selectedImage) {
        // Uppdatera blogginlägget med ny bild
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { coverImage: selectedImage.path }
        });
        
        usedImages.add(selectedImage.path);
        const oldImage = post.coverImage ? ` (ersatte: ${post.coverImage.substring(0, 50)}...)` : '';
        console.log(`✅ Uppdaterad${oldImage}`);
        console.log(`   Ny bild: ${selectedImage.path}`);
        updatedCount++;
      } else {
        console.log(`❌ Inga tillgängliga bilder kvar`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Resultat:`);
    console.log(`✅ Uppdaterade: ${updatedCount} blogginlägg`);
    console.log(`⏭️ Hoppade över: ${skippedCount} blogginlägg`);
    console.log(`🖼️ Totalt tillgängliga bilder: ${images.length}`);
    console.log(`🎯 Använda bilder: ${usedImages.size}`);
    
  } catch (error) {
    console.error('❌ Fel vid bildmatchning:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör scriptet
matchBlogImages().catch(console.error); 