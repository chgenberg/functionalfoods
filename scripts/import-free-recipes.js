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

// Funktion för att parsa receptfil
function parseRecipeFile(content, filename) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let title = '';
  let servings = 1;
  let calories = '';
  let ingredients = [];
  let instructions = '';
  
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
      instructions += line + ' ';
    }
  }
  
  // Rensa och formatera instruktioner
  instructions = instructions.trim();
  
  // Försök att skapa en kort beskrivning från instruktionerna
  let excerpt = instructions.substring(0, 150);
  if (excerpt.length === 150) {
    excerpt += '...';
  }
  
  // Gissa kategori baserat på titel och ingredienser
  const categories = guessCategories(title, ingredients);
  
  // Gissa svårighetsgrad baserat på antal ingredienser och instruktioner
  const difficulty = guessDifficulty(ingredients.length, instructions.length);
  
  return {
    title: title || filename.replace('.txt', '').replace(/_/g, ' '),
    slug: createSlug(title || filename.replace('.txt', '')),
    excerpt,
    content: instructions,
    categories,
    ingredients,
    instructions: [instructions], // Hela instruktionen som en del
    difficulty,
    servings,
    status: 'PUBLISHED',
    isPremium: false,
    isFree: true
  };
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
function guessDifficulty(ingredientCount, instructionLength) {
  if (ingredientCount <= 5 && instructionLength < 200) {
    return 'Lätt';
  } else if (ingredientCount <= 10 && instructionLength < 500) {
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
    const files = await fs.readdir(recipesDir);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    console.log(`📋 Hittade ${txtFiles.length} receptfiler`);
    
    let imported = 0;
    let errors = 0;
    
    for (const file of txtFiles) {
      try {
        console.log(`📖 Importerar: ${file}`);
        
        const filePath = path.join(recipesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const recipeData = parseRecipeFile(content, file);
        
        // Kontrollera att vi har minst en titel
        if (!recipeData.title || recipeData.title.trim() === '') {
          console.log(`⚠️  Hoppar över ${file} - ingen titel hittades`);
          continue;
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