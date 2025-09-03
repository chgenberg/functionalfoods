const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Known incorrect mappings that need to be fixed
const incorrectMappings = [
  {
    mealName: 'Lax med fetaost och rostade rotfrukter och brysselkål',
    wrongSlug: 'lax-fetaost-rostade',
    wrongTitle: 'Bananmuffin',
    correctSlug: 'lax-med-fetaost-och-rostade-rotfrukter',
    correctTitle: 'Lax med fetaost och rostade rotfrukter'
  },
  {
    mealName: 'Asiatiska köttbullar med nudelsallad',
    wrongSlug: 'jordgubbar-mango-vit',
    wrongTitle: 'Blåbärssmoothie',
    correctSlug: null, // Need to find
    correctTitle: null
  }
];

async function main() {
  try {
    console.log('🔧 Fixing incorrect slug mappings in meal plans...\n');

    // Read current meal plans
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf-8');

    let fixedCount = 0;

    // Check each known incorrect mapping
    for (const mapping of incorrectMappings) {
      console.log(`🔍 Checking: "${mapping.mealName}"`);
      
      // Verify the wrong mapping exists
      const wrongRecipe = await prisma.recipe.findUnique({
        where: { slug: mapping.wrongSlug },
        select: { title: true, slug: true }
      });

      if (wrongRecipe) {
        console.log(`❌ Confirmed wrong mapping: ${mapping.wrongSlug} -> "${wrongRecipe.title}"`);
      }

      // Find or verify the correct recipe
      let correctRecipe;
      if (mapping.correctSlug) {
        correctRecipe = await prisma.recipe.findUnique({
          where: { slug: mapping.correctSlug },
          select: { title: true, slug: true }
        });
      } else {
        // Search for the correct recipe by similarity
        const searchTerms = mapping.mealName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const recipes = await prisma.recipe.findMany({
          where: {
            OR: searchTerms.map(term => ({
              title: { contains: term, mode: 'insensitive' }
            }))
          },
          select: { title: true, slug: true }
        });

        // Find best match
        correctRecipe = recipes.find(r => 
          r.title.toLowerCase().includes('köttbull') && 
          r.title.toLowerCase().includes('nudel')
        ) || recipes[0];
      }

      if (correctRecipe) {
        console.log(`✅ Found correct recipe: ${correctRecipe.slug} -> "${correctRecipe.title}"`);
        
        // Replace in meal plans
        const oldPattern = `"recipeLink": "/kunskapsbank/recept/${mapping.wrongSlug}"`;
        const newPattern = `"recipeLink": "/kunskapsbank/recept/${correctRecipe.slug}"`;
        
        if (content.includes(oldPattern)) {
          content = content.replaceAll(oldPattern, newPattern);
          fixedCount++;
          console.log(`🔄 Updated meal plans: ${mapping.wrongSlug} -> ${correctRecipe.slug}`);
        } else {
          console.log(`⚠️  Pattern not found in meal plans: ${oldPattern}`);
        }
      } else {
        console.log(`❌ Could not find correct recipe for: "${mapping.mealName}"`);
      }
      
      console.log('');
    }

    // Write updated meal plans
    if (fixedCount > 0) {
      fs.writeFileSync(mealPlansPath, content, 'utf-8');
      console.log(`✨ Fixed ${fixedCount} incorrect slug mappings in meal plans!`);
      console.log('🎯 All meal plan links should now point to the correct recipes.');
    } else {
      console.log('❌ No mappings were fixed.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 