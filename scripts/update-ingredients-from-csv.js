/*
  Script för att uppdatera ingrediensmängder från ingredients.csv
  Kör med: node scripts/update-ingredients-from-csv.js
  Dry run: node scripts/update-ingredients-from-csv.js --dry-run
*/

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - Inga ändringar kommer att sparas\n');
}

// Hjälpfunktion för att formatera mängd och enhet
function formatIngredient(amount, unit, name, note) {
  // Hantera specialfall där amount eller unit är null/None
  if (!amount || amount === 'None' || !unit || unit === 'None') {
    return name; // Returnera bara namnet för t.ex. "salt och svartpeppar"
  }
  
  // Formatera mängden
  let formattedAmount = amount;
  if (typeof amount === 'number') {
    // Ta bort decimaler om det är heltal
    formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toString().replace('.', ',');
  }
  
  // Bygg ihop ingredienssträngen
  let result = `${formattedAmount} ${unit} ${name}`;
  
  // Lägg till not om den finns
  if (note && note.trim()) {
    result += ` (${note})`;
  }
  
  return result;
}

// Läs och parsa CSV-filen manuellt (tab-separerad)
async function loadIngredientsFromCSV() {
  const csvPath = path.join(process.cwd(), 'public', 'Ingredienser', 'ingredients.csv');
  const ingredientsByRecipe = {};
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split('\t');
    
    // Hitta index för varje kolumn
    const postIdIdx = headers.indexOf('post_id');
    const titleIdx = headers.indexOf('title');
    const labelIdx = headers.indexOf('ingredient_label');
    const finalAmountIdx = headers.indexOf('final_amount');
    const finalUnitIdx = headers.indexOf('final_unit');
    const noteIdx = headers.indexOf('note');
    const functionalIdx = headers.indexOf('is_functional');
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t');
      if (row.length < headers.length) continue;
      
      const title = row[titleIdx];
      
      if (!ingredientsByRecipe[title]) {
        ingredientsByRecipe[title] = {
          postId: row[postIdIdx],
          ingredients: []
        };
      }
      
      // Extrahera namn från label (ta bort mängd i parentes)
      let name = row[labelIdx];
      const parenMatch = name.match(/^(.+?)\s*\([^)]+\)$/);
      if (parenMatch) {
        name = parenMatch[1].trim();
      }
      
      // Använd final_amount och final_unit från CSV:n
      const ingredient = formatIngredient(
        row[finalAmountIdx],
        row[finalUnitIdx],
        name,
        row[noteIdx]
      );
      
      ingredientsByRecipe[title].ingredients.push({
        original: ingredient,
        structured: {
          amount: row[finalAmountIdx] !== 'None' ? parseFloat(row[finalAmountIdx]) : null,
          unit: row[finalUnitIdx] !== 'None' ? row[finalUnitIdx] : null,
          name: name,
          note: row[noteIdx],
          isFunctional: row[functionalIdx] === '1'
        }
      });
    }
    
    console.log(`✅ Läste ${Object.keys(ingredientsByRecipe).length} recept från CSV`);
    return ingredientsByRecipe;
    
  } catch (error) {
    console.error('❌ Fel vid läsning av CSV:', error);
    throw error;
  }
}

async function updateRecipeIngredients() {
  try {
    console.log('🔍 Läser ingredienser från CSV...');
    const csvIngredients = await loadIngredientsFromCSV();
    
    // Hämta alla recept från databasen
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        ingredients: true,
        ingredientsStructured: true
      }
    });
    
    console.log(`📚 Hittade ${recipes.length} recept i databasen`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Exempel på Bananplättar
    const exampleRecipe = 'Bananplättar med keso och hallon';
    if (csvIngredients[exampleRecipe]) {
      console.log(`\n🥞 Exempel - ${exampleRecipe}:`);
      console.log('CSV ingredienser:', csvIngredients[exampleRecipe].ingredients.map(i => i.original));
    }
    
    for (const recipe of recipes) {
      // Hitta matchande recept i CSV
      const csvData = csvIngredients[recipe.title];
      
      if (!csvData) {
        if (recipe.title.toLowerCase().includes('banan')) {
          console.log(`⚠️  Inget CSV-data för: ${recipe.title}`);
        }
        notFoundCount++;
        continue;
      }
      
      // Bygg ny ingredienslista
      const newIngredients = csvData.ingredients.map(ing => ing.original);
      const newStructured = csvData.ingredients.map(ing => ing.structured);
      
      // Jämför med befintliga ingredienser
      const oldIngredientsStr = JSON.stringify(recipe.ingredients);
      const newIngredientsStr = JSON.stringify(newIngredients);
      
      if (oldIngredientsStr !== newIngredientsStr) {
        console.log(`\n📝 ${isDryRun ? '[DRY RUN] ' : ''}Uppdaterar: ${recipe.title}`);
        console.log('   Gamla ingredienser:', recipe.ingredients);
        console.log('   Nya ingredienser:', newIngredients);
        
        if (!isDryRun) {
          // Uppdatera receptet
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              ingredients: newIngredients,
              ingredientsStructured: newStructured
            }
          });
        }
        
        updatedCount++;
      }
    }
    
    console.log(`\n✅ ${isDryRun ? '[DRY RUN] ' : ''}Klart! ${isDryRun ? 'Skulle uppdatera' : 'Uppdaterade'} ${updatedCount} recept`);
    console.log(`⚠️  ${notFoundCount} recept hittades inte i CSV:n`);
    
  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör scriptet
updateRecipeIngredients(); 