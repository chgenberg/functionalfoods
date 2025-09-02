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
    
    // Get existing recipes
    const existingRecipes = await prisma.recipe.findMany({
      select: { slug: true }
    });
    const existingSlugs = existingRecipes.map(r => r.slug);
    
    // Find missing recipes
    const missingRecipes = recipeLinks.filter(slug => !existingSlugs.includes(slug));
    
    console.log(`Found ${missingRecipes.length} missing recipes:`);
    
    // Create placeholder recipes for missing ones
    for (const slug of missingRecipes) {
      // Convert slug to readable title
      const title = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\b(Med|Och|I|Pa|Till|Av|For)\b/g, match => match.toLowerCase());
      
      console.log(`Creating: ${slug} -> ${title}`);
      
      await prisma.recipe.create({
        data: {
          title: title,
          slug: slug,
          excerpt: 'Ett näringsrikt och välbalanserat recept som stöder din hälsa.',
          content: 'Detta recept håller på att utvecklas. Återkom snart för fullständiga instruktioner!',
          imageUrl: '/images/recipe-placeholder.svg',
          imageAlt: title,
          categories: ['Huvudrätt'],
          ingredients: [
            '2 portioner huvudingrediens',
            '1 dl kryddor och smaker', 
            'Salt och peppar efter smak'
          ],
          instructions: 'Detaljerade instruktioner kommer snart. Kontakta oss om du behöver receptet akut.',
          prepTime: '15 min',
          cookTime: '30 min',
          servings: 2,
          difficulty: 'Medium',
          status: 'PUBLISHED',
          isFree: false,
          isPremium: true,
          tags: ['Basic', 'Flow'], // Will be adjusted by access control script
          searchText: `${title} ${slug.replace(/-/g, ' ')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    console.log(`\nCreated ${missingRecipes.length} placeholder recipes!`);
    console.log('Run npm run recipes:set-access to set proper access levels.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 