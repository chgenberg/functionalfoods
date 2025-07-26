const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Funktion för att skapa slug från titel
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Funktion för att parsa receptinnehåll
function parseRecipeContent(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  let title = '';
  let ingredients = [];
  let instructions = '';
  let servings = null;
  let difficulty = 'medium';
  let prepTime = null;
  let cookTime = null;
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!title && trimmedLine) {
      title = trimmedLine;
      continue;
    }
    
    // Identifiera sektioner
    if (trimmedLine.toLowerCase().includes('ingrediens') || 
        trimmedLine.toLowerCase().includes('för ') && trimmedLine.includes(':')) {
      currentSection = 'ingredients';
      continue;
    }
    
    if (trimmedLine.toLowerCase().includes('gör så här') || 
        trimmedLine.toLowerCase().includes('instruktioner') ||
        trimmedLine.toLowerCase().includes('tillvägagång')) {
      currentSection = 'instructions';
      continue;
    }
    
    // Extrahera information
    if (trimmedLine.includes('portion')) {
      const match = trimmedLine.match(/(\d+)\s*portion/);
      if (match) {
        servings = parseInt(match[1]);
      }
    }
    
    if (currentSection === 'ingredients' && trimmedLine) {
      // Rensa bort onödiga tecken och formatera ingrediens
      let ingredient = trimmedLine.replace(/^[-•*]\s*/, '').trim();
      if (ingredient && !ingredient.toLowerCase().includes('för ') && !ingredient.includes(':')) {
        ingredients.push(ingredient);
      }
    }
    
    if (currentSection === 'instructions' && trimmedLine) {
      instructions += trimmedLine + '\n\n';
    }
  }
  
  // Rensa instruktioner
  instructions = instructions.trim();
  
  // Om vi inte hittade en titel, använd filnamnet
  if (!title && lines.length > 0) {
    title = lines[0].trim();
  }
  
  return {
    title: title || 'Untitled Recipe',
    ingredients: ingredients.filter(ing => ing.length > 0),
    instructions: instructions || 'Instruktioner saknas',
    servings: servings || 2,
    difficulty,
    prepTime: prepTime || '15 min',
    cookTime: cookTime || '30 min',
    totalTime: '45 min'
  };
}

// Funktion för att importera recept från en mapp
async function importRecipesFromFolder(folderPath, courseProductName, courseName) {
  console.log(`\n🍳 Importerar recept från ${folderPath} för ${courseProductName}...`);
  
  // Hitta kursprodukten
  const courseProduct = await prisma.courseProduct.findUnique({
    where: { name: courseProductName }
  });
  
  if (!courseProduct) {
    throw new Error(`Kursprodukt "${courseProductName}" hittades inte!`);
  }
  
  console.log(`✅ Hittade kursprodukt: ${courseProduct.name} (ID: ${courseProduct.id})`);
  
  // Läs alla .txt filer från mappen
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.txt'))
    .sort();
  
  console.log(`📄 Hittade ${files.length} receptfiler`);
  
  let importedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    try {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parsa receptet
      const recipeData = parseRecipeContent(content);
      
      // Skapa slug
      const slug = createSlug(recipeData.title);
      
      // Kontrollera om receptet redan finns
      const existingRecipe = await prisma.recipe.findUnique({
        where: { slug }
      });
      
      if (existingRecipe) {
        console.log(`⚠️  Receptet "${recipeData.title}" finns redan (slug: ${slug})`);
        skippedCount++;
        continue;
      }
      
      // Skapa söktext
      const searchText = [
        recipeData.title,
        ...recipeData.ingredients,
        recipeData.instructions,
        courseName,
        courseProductName
      ].join(' ').toLowerCase();
      
      // Kontrollera om det finns en matchande bild
      const imageExtensions = ['.jpg', '.jpeg', '.png'];
      const baseName = path.basename(file, '.txt');
      let imageUrl = null;
      
      for (const ext of imageExtensions) {
        const imagePath = path.join(folderPath, baseName + ext);
        if (fs.existsSync(imagePath)) {
          imageUrl = `/kurser/bilder/${baseName}${ext}`;
          break;
        }
      }
      
      // Skapa receptet
      const recipe = await prisma.recipe.create({
        data: {
          title: recipeData.title,
          slug,
          content: recipeData.instructions,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime,
          totalTime: recipeData.totalTime,
          imageUrl,
          imageAlt: `Bild på ${recipeData.title}`,
          categories: [courseName, 'Functional Foods'],
          tags: [courseName.toLowerCase(), 'premium', 'kurs'],
          status: 'PUBLISHED',
          isPremium: true,
          isFree: false,
          searchText,
          excerpt: `Hälsosamt recept från ${courseProductName}-kursen. ${recipeData.instructions.substring(0, 150)}...`,
          nutrition: {
            courseId: courseProduct.id,
            courseName: courseProductName
          }
        }
      });
      
      console.log(`✅ Importerade: ${recipe.title} (${recipe.slug})`);
      importedCount++;
      
    } catch (error) {
      console.error(`❌ Fel vid import av ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Import från ${folderPath} klar:`);
  console.log(`   ✅ Importerade: ${importedCount} recept`);
  console.log(`   ⚠️  Hoppade över: ${skippedCount} recept (finns redan)`);
  
  return { imported: importedCount, skipped: skippedCount };
}

async function main() {
  try {
    console.log('🚀 Startar import av kursrecept...\n');
    
    const receptBasePath = path.join(process.cwd(), 'Recept');
    
    // Kontrollera att mapparna finns
    const basicPath = path.join(receptBasePath, 'basic');
    const flowPath = path.join(receptBasePath, 'flow');
    
    if (!fs.existsSync(basicPath)) {
      throw new Error(`Mappen ${basicPath} hittades inte!`);
    }
    
    if (!fs.existsSync(flowPath)) {
      throw new Error(`Mappen ${flowPath} hittades inte!`);
    }
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    // Importera Basic-recept
    const basicResults = await importRecipesFromFolder(
      basicPath,
      'Functional Basics',
      'Functional Basics'
    );
    totalImported += basicResults.imported;
    totalSkipped += basicResults.skipped;
    
    // Importera Flow-recept  
    const flowResults = await importRecipesFromFolder(
      flowPath,
      'Functional Flow',
      'Functional Flow'
    );
    totalImported += flowResults.imported;
    totalSkipped += flowResults.skipped;
    
    console.log('\n🎉 Import klar!');
    console.log(`📊 Totalt resultat:`);
    console.log(`   ✅ Importerade: ${totalImported} recept`);
    console.log(`   ⚠️  Hoppade över: ${totalSkipped} recept`);
    
  } catch (error) {
    console.error('❌ Fel under import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 