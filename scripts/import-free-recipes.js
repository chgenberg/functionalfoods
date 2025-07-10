const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Funktion för att skapa slug från titel
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[é]/g, 'e')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Funktion för att hitta matchande bild baserat på recepttitel
function findMatchingImage(title, availableImages) {
  if (!title || availableImages.length === 0) return null;
  
  // Normalisera titel för jämförelse
  const normalizedTitle = title
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[é]/g, 'e')
    .replace(/\s+/g, '_')  // Först ersätt mellanslag med underscore
    .replace(/[^a-zA-Z0-9_]/g, '')  // Ta bort andra specialtecken men behåll underscore
    .toLowerCase();
  
  // Först: exakt matchning
  const exactMatch = availableImages.find(img => {
    const imgName = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[ü]/g, 'u')
      .replace(/[é]/g, 'e')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
    return imgName === normalizedTitle;
  });
  
  if (exactMatch) {
    return `/Recept/recipes_free/web_images/${exactMatch}`;
  }
  
  // Andra: försök hitta matchning baserat på viktiga ord
  const titleWords = normalizedTitle.split('_').filter(word => word.length > 3);
  
  // Först: kräv att minst 2 viktiga ord matchar
  let goodMatch = availableImages.find(img => {
    const imgName = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[ü]/g, 'u')
      .replace(/[é]/g, 'e')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
    const matchingWords = titleWords.filter(word => imgName.includes(word));
    return matchingWords.length >= Math.min(2, titleWords.length);
  });
  
  // Om inte: försök med bara 1 viktigt ord (mer flexibelt)
  if (!goodMatch && titleWords.length >= 1) {
    goodMatch = availableImages.find(img => {
      const imgName = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        .replace(/[åäà]/g, 'a')
        .replace(/[öø]/g, 'o')
        .replace(/[ü]/g, 'u')
        .replace(/[é]/g, 'e')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
      const matchingWords = titleWords.filter(word => imgName.includes(word) && word.length > 4);
      return matchingWords.length >= 1;
    });
  }
  
  if (goodMatch) {
    return `/Recept/recipes_free/web_images/${goodMatch}`;
  }
  
  // Tredje: försök hitta matchning med bara ett viktigt ord (för korta titlar)
  if (titleWords.length <= 2) {
    const singleMatch = availableImages.find(img => {
      const imgName = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
        .replace(/[åäà]/g, 'a')
        .replace(/[öø]/g, 'o')
        .replace(/[ü]/g, 'u')
        .replace(/[é]/g, 'e')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
      return titleWords.some(word => imgName.includes(word) && word.length > 4);
    });
    
    if (singleMatch) {
      return `/Recept/recipes_free/web_images/${singleMatch}`;
    }
  }
  
  // Ingen matchning hittad
  return null;
}

// Funktion för att rensa och dela upp instruktioner
function cleanAndSplitInstructions(rawInstructions) {
  if (!rawInstructions) return [];
  
  // Ta bort allt efter "kcal" eller siffror följt av "kcal" - detta indikerar slutet på receptet
  let cleanText = rawInstructions;
  const kcalMatch = cleanText.match(/(\d+\s*kcal)/i);
  if (kcalMatch) {
    cleanText = cleanText.substring(0, cleanText.indexOf(kcalMatch[0]) + kcalMatch[0].length);
  }
  
  // Ta bort text som verkar vara från andra recept (innehåller ord som "Dessert", "kladdkaka", etc.)
  const stopWords = [
    'Hormonell balans', 'Dessert', 'Glutenfri kladdkaka', 'Plånboksdieten', 
    'sockerfri', 'mandelmjöl', 'bakpulver', 'pajform', 'Lakritsbutiken'
  ];
  
  for (const stopWord of stopWords) {
    const index = cleanText.indexOf(stopWord);
    if (index !== -1) {
      cleanText = cleanText.substring(0, index);
      break;
    }
  }
  
  // Dela upp i meningar baserat på punkter och stora bokstäver
  let steps = [];
  
  // Först försök att dela på punkter följt av stor bokstav
  const sentences = cleanText.split(/\.\s+(?=[A-ZÅÄÖ])/);
  
  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (sentence && sentence.length > 10) { // Ignorera för korta fragment
      // Ta bort avslutande punkt om den finns
      if (sentence.endsWith('.')) {
        sentence = sentence.slice(0, -1);
      }
      steps.push(sentence.trim());
    }
  }
  
  // Om vi inte fick några steg, försök dela på andra sätt
  if (steps.length === 0) {
    // Försök dela på verbs som indikerar nya steg
    const verbPattern = /\b(Skär|Blanda|Tillsätt|Lägg|Placera|Hacka|Strö|Sätt|Smält|Vispa|Rör|Häll|Grädda|Toppa|Låt)\b/g;
    const parts = cleanText.split(verbPattern);
    
    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        const step = (parts[i] + parts[i + 1]).trim();
        if (step.length > 10) {
          steps.push(step);
        }
      }
    }
  }
  
  // Fallback: om fortfarande inga steg, returnera hela texten som ett steg
  if (steps.length === 0 && cleanText.trim()) {
    steps.push(cleanText.trim());
  }
  
  return steps.filter(step => step && step.length > 5); // Filtrera bort för korta steg
}

// Funktion för att parsa receptfil
function parseRecipeFile(content, filename, availableImages = []) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let title = '';
  let servings = 1;
  let calories = '';
  let ingredients = [];
  let rawInstructions = '';
  
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('Namn på rätt:')) {
      title = line.replace('Namn på rätt:', '').trim();
    } else if (line.startsWith('Antal portioner:')) {
      const portionText = line.replace('Antal portioner:', '').trim();
      const portionMatch = portionText.match(/(\d+)/);
      if (portionMatch) {
        servings = parseInt(portionMatch[1]);
      }
    } else if (line.startsWith('Kalorier per rätt:')) {
      calories = line.replace('Kalorier per rätt:', '').trim();
    } else if (line === 'Ingredienser:') {
      currentSection = 'ingredients';
    } else if (line === 'Beskrivning tillagning:') {
      currentSection = 'instructions';
    } else if (currentSection === 'ingredients' && line.startsWith('- ')) {
      const ingredient = line.replace('- ', '').trim();
      if (ingredient && !ingredient.match(/^\d+$/) && ingredient !== 'kcal') {
        ingredients.push(ingredient);
      }
    } else if (currentSection === 'instructions') {
      rawInstructions += line + ' ';
    }
  }
  
  // Rensa och dela upp instruktioner i steg
  const instructionSteps = cleanAndSplitInstructions(rawInstructions);
  
  // Skapa en beskrivande excerpt baserat på titel och ingredienser
  const mainIngredients = ingredients.slice(0, 3).join(', ');
  let excerpt = `Ett läckert recept med ${mainIngredients}`;
  if (ingredients.length > 3) {
    excerpt += ` och ${ingredients.length - 3} andra ingredienser`;
  }
  excerpt += `. Perfekt för ${servings} ${servings === 1 ? 'portion' : 'portioner'}.`;
  
  // Gissa kategori baserat på titel och ingredienser
  const categories = guessCategories(title, ingredients);
  
  // Gissa svårighetsgrad baserat på antal ingredienser och instruktioner
  const difficulty = guessDifficulty(ingredients.length, instructionSteps.length);
  
  // Gissa tillagnings- och förberedelsetid
  const { prepTime, cookTime } = guessTimes(rawInstructions, ingredients.length);
  
  // Hitta matchande bild
  const finalTitle = title || filename.replace('.txt', '').replace(/_/g, ' ');
  const imageUrl = findMatchingImage(finalTitle, availableImages);
  
  return {
    title: finalTitle,
    slug: createSlug(title || filename.replace('.txt', '')),
    excerpt,
    content: instructionSteps.join('\n'), // Steg separerade med newlines
    imageUrl, // Lägg till bild-URL
    categories,
    ingredients,
    instructions: instructionSteps.join('\n'), // Steg separerade med newlines
    difficulty,
    prepTime,
    cookTime,
    servings,
    status: 'PUBLISHED',
    isPremium: false,
    isFree: true
  };
}

// Funktion för att gissa tider
function guessTimes(instructions, ingredientCount) {
  const instructionsLower = instructions.toLowerCase();
  
  // Förberedelse tid baserat på antal ingredienser
  let prepTime = '10 min';
  if (ingredientCount > 8) {
    prepTime = '20 min';
  } else if (ingredientCount > 5) {
    prepTime = '15 min';
  }
  
  // Tillagnings tid baserat på instruktioner
  let cookTime = '15 min';
  if (instructionsLower.includes('ugn') || instructionsLower.includes('grädda')) {
    cookTime = '25 min';
  } else if (instructionsLower.includes('koka') || instructionsLower.includes('sjuda')) {
    cookTime = '20 min';
  } else if (instructionsLower.includes('stekning') || instructionsLower.includes('stek')) {
    cookTime = '15 min';
  } else if (instructionsLower.includes('blanda') && !instructionsLower.includes('värm')) {
    cookTime = '5 min';
  }
  
  return { prepTime, cookTime };
}

// Funktion för att gissa kategorier
function guessCategories(title, ingredients) {
  const titleLower = title.toLowerCase();
  const ingredientsText = ingredients.join(' ').toLowerCase();
  
  const categories = [];
  
  // Frukost
  if (titleLower.includes('smoothie') || titleLower.includes('gröt') || 
      titleLower.includes('müsli') || titleLower.includes('granola') ||
      ingredientsText.includes('yoghurt') || ingredientsText.includes('havregryn')) {
    categories.push('Frukost');
  }
  
  // Lunch/Middag
  if (titleLower.includes('sallad') || titleLower.includes('gryta') ||
      titleLower.includes('soppa') || titleLower.includes('fisk') ||
      titleLower.includes('kyckling') || titleLower.includes('kött')) {
    categories.push('Lunch', 'Middag');
  }
  
  // Dryck
  if (titleLower.includes('smoothie') || titleLower.includes('juice') ||
      titleLower.includes('drink')) {
    categories.push('Dryck');
  }
  
  // Efterrätt
  if (titleLower.includes('muffins') || titleLower.includes('kladdkaka') ||
      titleLower.includes('choklad') || titleLower.includes('dessert')) {
    categories.push('Efterrätt');
  }
  
  // Mellanmål
  if (titleLower.includes('smoothie') || titleLower.includes('nötter') ||
      categories.length === 0) {
    categories.push('Mellanmål');
  }
  
  return categories.length > 0 ? categories : ['Okategoriserad'];
}

// Funktion för att gissa svårighetsgrad
function guessDifficulty(ingredientCount, instructionSteps) {
  if (ingredientCount <= 5 && instructionSteps <= 5) {
    return 'Lätt';
  } else if (ingredientCount <= 10 && instructionSteps <= 8) {
    return 'Medel';
  } else {
    return 'Svår';
  }
}

async function importFreeRecipes() {
  try {
    console.log('🗑️  Rensar befintliga recept...');
    
    // Rensa alla befintliga recept
    await prisma.recipe.deleteMany({});
    console.log('✅ Alla befintliga recept har rensats');
    
    console.log('📁 Läser gratisrecept från public/Recept/recipes_free/...');
    
    const recipesDir = path.join(process.cwd(), 'public', 'Recept', 'recipes_free');
    const imagesDir = path.join(process.cwd(), 'public', 'Recept', 'recipes_free', 'web_images');
    
    const files = await fs.readdir(recipesDir);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    // Läs in tillgängliga bilder
    let availableImages = [];
    try {
      const imageFiles = await fs.readdir(imagesDir);
      availableImages = imageFiles.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      console.log(`🖼️  Hittade ${availableImages.length} bilder`);
    } catch (error) {
      console.log('⚠️  Kunde inte läsa bildmappen:', error.message);
    }
    
    console.log(`📋 Hittade ${txtFiles.length} receptfiler`);
    
    let imported = 0;
    let errors = 0;
    
    for (const file of txtFiles) {
      try {
        console.log(`📖 Importerar: ${file}`);
        
        const filePath = path.join(recipesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const recipeData = parseRecipeFile(content, file, availableImages);
        
        // Kontrollera att vi har minst en titel
        if (!recipeData.title || recipeData.title.trim() === '') {
          console.log(`⚠️  Hoppar över ${file} - ingen titel hittades`);
          continue;
        }
        
        // Debug: visa bildmatchning
        if (recipeData.imageUrl) {
          console.log(`🖼️  Matchade bild: ${recipeData.imageUrl}`);
        } else {
          console.log(`📷 Ingen bild hittades för: ${recipeData.title}`);
        }
        
        // Skapa receptet i databasen
        const recipe = await prisma.recipe.create({
          data: recipeData
        });
        
        console.log(`✅ Importerat: ${recipe.title} (${recipe.slug})`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Fel vid import av ${file}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n🎉 Import slutförd!');
    console.log(`✅ Importerade: ${imported} recept`);
    console.log(`❌ Fel: ${errors} recept`);
    
    // Visa statistik
    const totalRecipes = await prisma.recipe.count();
    const freeRecipes = await prisma.recipe.count({ where: { isFree: true } });
    const premiumRecipes = await prisma.recipe.count({ where: { isPremium: true } });
    
    console.log('\n📊 Statistik:');
    console.log(`Totalt antal recept: ${totalRecipes}`);
    console.log(`Gratis recept: ${freeRecipes}`);
    console.log(`Premium recept: ${premiumRecipes}`);
    
  } catch (error) {
    console.error('❌ Fel vid import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör importen
importFreeRecipes(); 