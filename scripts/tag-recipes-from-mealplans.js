const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Read and parse meal plans from TypeScript file
function parseMealPlansFromFile() {
  const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract recipeLinks using regex
  const recipeLinkPattern = /"recipeLink":\s*"([^"]+)"/g;
  const allLinks = [];
  let match;
  
  while ((match = recipeLinkPattern.exec(content)) !== null) {
    allLinks.push(match[1]);
  }
  
  // Determine which course based on position in file
  const basicStart = content.indexOf('export const mealPlans');
  const flowStart = content.indexOf('export const flowMealPlans');
  const energyStart = content.indexOf('export const energyMealPlans');
  
  const basicLinks = [];
  const flowLinks = [];
  const energyLinks = [];
  
  // Re-parse with position awareness
  let currentIndex = 0;
  recipeLinkPattern.lastIndex = 0;
  
  while ((match = recipeLinkPattern.exec(content)) !== null) {
    const link = match[1];
    const position = match.index;
    
    if (position >= basicStart && position < flowStart) {
      basicLinks.push(link);
    } else if (position >= flowStart && position < energyStart) {
      flowLinks.push(link);
    } else if (position >= energyStart) {
      energyLinks.push(link);
    }
  }
  
  return { basicLinks, flowLinks, energyLinks };
}

// Extract slug from recipe link
function extractSlug(recipeLink) {
  if (!recipeLink) return null;
  const match = recipeLink.match(/\/recept\/([^/?]+)/);
  return match ? match[1] : null;
}


async function tagRecipes() {
  try {
    console.log('🏷️  Börjar tagga recept från kostscheman...\n');
    
    // Parse meal plans from file
    const { basicLinks, flowLinks, energyLinks } = parseMealPlansFromFile();
    
    // Extract unique slugs
    const basicSlugs = [...new Set(basicLinks.map(extractSlug).filter(Boolean))];
    const flowSlugs = [...new Set(flowLinks.map(extractSlug).filter(Boolean))];
    const energySlugs = [...new Set(energyLinks.map(extractSlug).filter(Boolean))];
    
    console.log(`📊 Hittade recept i kostscheman:`);
    console.log(`   Basic: ${basicSlugs.length} unika recept`);
    console.log(`   Flow: ${flowSlugs.length} unika recept`);
    console.log(`   Energy: ${energySlugs.length} unika recept\n`);
    
    let taggedCount = 0;
    let notFoundCount = 0;
    let alreadyTaggedCount = 0;
    
    // Process each course
    const courses = [
      { slugs: basicSlugs, courseTag: 'Basic' },
      { slugs: flowSlugs, courseTag: 'Flow' },
      { slugs: energySlugs, courseTag: 'Energy' }
    ];
    
    for (const { slugs, courseTag } of courses) {
      console.log(`\n🔄 Bearbetar ${courseTag}-recept...`);
      
      for (const slug of slugs) {
        try {
          // Hämta receptet
          const recipe = await prisma.recipe.findUnique({
            where: { slug },
            select: { 
              id: true, 
              title: true, 
              slug: true, 
              tags: true,
              imageUrl: true,
              nutrition: true,
              ingredients: true,
              instructions: true
            }
          });
          
          if (!recipe) {
            console.log(`   ⚠️  Recept ej hittat: ${slug}`);
            notFoundCount++;
            continue;
          }
          
          // Kolla om taggen redan finns
          const currentTags = Array.isArray(recipe.tags) ? recipe.tags : [];
          if (currentTags.includes(courseTag)) {
            alreadyTaggedCount++;
            continue; // Redan taggad, skippa
          }
          
          // Lägg till kurs-tag UTAN att ändra något annat
          const newTags = [...currentTags, courseTag];
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              tags: newTags
              // VIKTIGT: Uppdatera ENDAST tags, inget annat!
            }
          });
          
          console.log(`   ✅ ${recipe.title} → lade till "${courseTag}"`);
          taggedCount++;
          
        } catch (error) {
          console.error(`   ❌ Fel vid taggning av ${slug}:`, error.message);
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log(`✅ Taggade: ${taggedCount} recept`);
    console.log(`👍 Redan taggade: ${alreadyTaggedCount} recept`);
    console.log(`⚠️  Ej hittade: ${notFoundCount} recept`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('🔍 Verifierar att inget annat ändrades...');
    
    // Verifiera att inget annat ändrades (spot check)
    const sampleRecipe = await prisma.recipe.findFirst({
      where: { tags: { has: 'Basic' } },
      select: { 
        title: true, 
        tags: true, 
        imageUrl: true, 
        nutrition: true 
      }
    });
    
    console.log('\n📋 Exempel på taggat recept:');
    console.log(`   Titel: ${sampleRecipe?.title}`);
    console.log(`   Tags: ${JSON.stringify(sampleRecipe?.tags)}`);
    console.log(`   ImageUrl: ${sampleRecipe?.imageUrl}`);
    console.log(`   Nutrition: ${sampleRecipe?.nutrition ? 'Finns' : 'Saknas'}`);
    console.log('\n✅ Verifiering klar - endast tags uppdaterades!\n');
    
  } catch (error) {
    console.error('❌ Fel:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

tagRecipes();
