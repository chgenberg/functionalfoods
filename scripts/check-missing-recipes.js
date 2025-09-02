const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    // Read meal plans data
    const mealPlansPath = path.join(process.cwd(), 'app/data/mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');
    
    // Extract recipe links from the meal plans
    const recipeLinks = [];
    const linkMatches = mealPlansContent.match(/recipeLink[^}]+?\/kunskapsbank\/recept\/([^"]+)/g);
    
    if (linkMatches) {
      for (const match of linkMatches) {
        const slug = match.split('/').pop().replace(/["}]/, '');
        if (slug && !recipeLinks.includes(slug)) {
          recipeLinks.push(slug);
        }
      }
    }
    
    console.log(`Found ${recipeLinks.length} unique recipe links in meal plans`);
    
    // Check which recipes exist in database
    const existingRecipes = await prisma.recipe.findMany({
      select: { slug: true, title: true }
    });
    
    const existingSlugs = existingRecipes.map(r => r.slug);
    const missingRecipes = recipeLinks.filter(slug => !existingSlugs.includes(slug));
    
    console.log(`\nExisting recipes: ${existingSlugs.length}`);
    console.log(`Missing recipes: ${missingRecipes.length}`);
    
    if (missingRecipes.length > 0) {
      console.log('\nMissing recipe slugs:');
      missingRecipes.forEach(slug => console.log(`- ${slug}`));
    }
    
    // Check specific torsk/skaldjur recipes
    const torskRecipes = existingRecipes.filter(r => 
      r.slug.includes('torsk') || r.title.toLowerCase().includes('torsk') ||
      r.slug.includes('skaldjur') || r.title.toLowerCase().includes('skaldjur')
    );
    
    console.log('\nTorsk/Skaldjur recipes in database:');
    torskRecipes.forEach(r => console.log(`- ${r.slug}: ${r.title}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 