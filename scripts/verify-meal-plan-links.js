const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verifying meal plan links against database...\n');

    // Read meal plans
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf-8');

    // Extract all recipe links from both basic and flow meal plans
    const linkPattern = /"recipeLink":\s*"([^"]+)"/g;
    const allLinks = [];
    let match;
    
    while ((match = linkPattern.exec(mealPlansContent)) !== null) {
      const link = match[1];
      if (link && link !== '#') {
        allLinks.push(link);
      }
    }

    // Extract slugs from links
    const slugs = allLinks.map(link => link.replace(/^\/kunskapsbank\/recept\//, '')).filter(slug => slug.length > 0);
    const uniqueSlugs = [...new Set(slugs)];

    console.log(`📊 Found ${allLinks.length} total recipe links (${uniqueSlugs.length} unique slugs)\n`);

    // Check which recipes exist in database
    const existingRecipes = await prisma.recipe.findMany({
      where: {
        slug: { in: uniqueSlugs }
      },
      select: {
        slug: true,
        title: true,
        imageUrl: true,
        isFree: true,
        isPremium: true,
        tags: true
      }
    });

    const existingSlugs = new Set(existingRecipes.map(r => r.slug));
    const missingRecipes = uniqueSlugs.filter(slug => !existingSlugs.has(slug));

    console.log('✅ EXISTING RECIPES:');
    existingRecipes.forEach(recipe => {
      const hasImage = recipe.imageUrl && !recipe.imageUrl.includes('placeholder');
      const accessType = recipe.isFree ? 'FREE' : recipe.isPremium ? 'PREMIUM' : 'UNKNOWN';
      const tags = recipe.tags && recipe.tags.length > 0 ? `[${recipe.tags.join(', ')}]` : '';
      console.log(`  ✓ ${recipe.slug} - "${recipe.title}" ${accessType} ${tags} ${hasImage ? '🖼️' : '❌'}`);
    });

    if (missingRecipes.length > 0) {
      console.log('\n❌ MISSING RECIPES:');
      missingRecipes.forEach(slug => {
        console.log(`  ❌ ${slug} - NOT FOUND IN DATABASE`);
      });
    }

    // Now check specific meal plan structure
    console.log('\n🔍 DETAILED MEAL PLAN VERIFICATION:\n');

    // Parse meal plans more specifically
    const basicMatch = mealPlansContent.match(/export const mealPlans[^}]+(\{[\s\S]*?\n\};)/);
    const flowMatch = mealPlansContent.match(/export const flowMealPlans[^}]+(\{[\s\S]*?\n\};)/);

    if (basicMatch) {
      console.log('📋 FUNCTIONAL BASICS:');
      await verifyCourseMealPlan(basicMatch[1], 'basics', existingSlugs);
    }

    if (flowMatch) {
      console.log('\n📋 FUNCTIONAL FLOW:');
      await verifyCourseMealPlan(flowMatch[1], 'flow', existingSlugs);
    }

    console.log('\n📈 SUMMARY:');
    console.log(`Total links: ${allLinks.length}`);
    console.log(`Unique recipes: ${uniqueSlugs.length}`);
    console.log(`Found in DB: ${existingRecipes.length}`);
    console.log(`Missing: ${missingRecipes.length}`);
    console.log(`Success rate: ${((existingRecipes.length / uniqueSlugs.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyCourseMealPlan(mealPlanText, courseType, existingSlugs) {
  // Extract week patterns
  const weekPattern = /week(\d+):\s*\{[\s\S]*?\n\s*\}/g;
  let weekMatch;
  
  while ((weekMatch = weekPattern.exec(mealPlanText)) !== null) {
    const weekNum = weekMatch[1];
    const weekContent = weekMatch[0];
    
    console.log(`  Week ${weekNum}:`);
    
    // Extract days from this week
    const dayPattern = /(Måndag|Tisdag|Onsdag|Torsdag|Fredag|Lördag|Söndag|day\d+):\s*\{[\s\S]*?\n\s*\}/g;
    let dayMatch;
    let dayCount = 0;
    let brokenLinks = 0;
    
    while ((dayMatch = dayPattern.exec(weekContent)) !== null) {
      const dayName = dayMatch[1];
      const dayContent = dayMatch[0];
      dayCount++;
      
      // Extract meal links from this day
      const mealLinkPattern = /"recipeLink":\s*"([^"]+)"/g;
      let mealMatch;
      
      while ((mealMatch = mealLinkPattern.exec(dayContent)) !== null) {
        const link = mealMatch[1];
        if (link === '#') continue;
        
        const slug = link.replace(/^\/kunskapsbank\/recept\//, '');
        const exists = existingSlugs.has(slug);
        
        if (!exists) {
          console.log(`    ❌ ${dayName}: ${slug} (${link})`);
          brokenLinks++;
        }
      }
    }
    
    if (brokenLinks === 0) {
      console.log(`    ✅ All links working (${dayCount} days checked)`);
    } else {
      console.log(`    ⚠️  ${brokenLinks} broken links found`);
    }
  }
}

if (require.main === module) {
  main();
} 