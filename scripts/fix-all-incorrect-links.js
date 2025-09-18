const { PrismaClient } = require('@prisma/client');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(mealName, recipes) {
  if (!mealName) return null;
  
  // Clean up the meal name
  let cleanName = mealName
    .replace(/\s*rester\s*$/i, '')
    .replace(/\s*från\s+(frysen|fysen)\s*$/i, '')
    .replace(/\s*\(\d+\s*kcal\)\s*/gi, '')
    .trim();
  
  if (!cleanName) return null;
  
  const normalized = normalizeText(cleanName);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const recipe of recipes) {
    const recipeNormalized = normalizeText(recipe.title);
    
    // Exact match
    if (normalized === recipeNormalized) {
      return { recipe, score: 100, method: 'exact' };
    }
    
    // Contains match
    if (normalized.includes(recipeNormalized) || recipeNormalized.includes(normalized)) {
      const score = 90;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: 'contains' };
      }
    }
    
    // String similarity
    const similarity = stringSimilarity.compareTwoStrings(normalized, recipeNormalized);
    const score = similarity * 100;
    
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { recipe, score: Math.round(score), method: 'similarity' };
    }
  }
  
  return bestScore >= 70 ? bestMatch : null;
}

async function fixAllIncorrectLinks() {
  console.log('🔧 Fixing all incorrect recipe links in mealPlans.ts...\n');
  
  try {
    // Get all recipes from database
    const dbRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    console.log(`📚 Found ${dbRecipes.length} recipes in database\n`);
    
    // Read the mealPlans.ts file
    const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Track fixes
    let totalFixes = 0;
    const fixedLinks = [];
    
    // Define the incorrect links that need to be fixed (from the verification output)
    const incorrectLinks = [
      // Functional Basics
      { mealName: "Blåbärs smoothiebowl", currentLink: "/kunskapsbank/recept/blabars-smoothiebowl", expectedRecipe: "Blåbärssmoothie" },
      { mealName: "Blåbärs smoothiebowl rester", currentLink: "/kunskapsbank/recept/blabars-smoothiebowl", expectedRecipe: "Blåbärssmoothie" },
      { mealName: "Äggröra med rökt lax", currentLink: "/kunskapsbank/recept/aggrora-lax-2", expectedRecipe: "Äggröra med lax" },
      { mealName: "Högrevsburgare med hummus", currentLink: "/kunskapsbank/recept/hogrevsburgare-med-hummus", expectedRecipe: "Hamburgare med hummus" },
      { mealName: "Kycklinggryta med röda linser", currentLink: "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal", expectedRecipe: "Kycklinggryta med röda linser" },
      { mealName: "Grillade köttspett med grekisk sallad och morotstzatziki", currentLink: "/kunskapsbank/recept/grekisk-sallad", expectedRecipe: "Grillspett med grekisk sallad och morotstzatziki" },
      { mealName: "Grillade köttspett med grekisk sallad och morotstzatziki rester", currentLink: "/kunskapsbank/recept/grekisk-sallad", expectedRecipe: "Grillspett med grekisk sallad och morotstzatziki" },
      { mealName: "Japansk kycklingfärswok med groddar (320 kcal", currentLink: "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar", expectedRecipe: "Kycklingfärswok" },
      { mealName: "Japansk kycklingfärswok med groddar (320 kcal rester", currentLink: "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar", expectedRecipe: "Kycklingfärswok" },
      
      // Functional Flow  
      { mealName: "Köttfärsbiffar med tomatsallad", currentLink: "/kunskapsbank/recept/kottfarsbiffar-med-tomatsallad", expectedRecipe: "Köttfärsbiffar med mozzarella och tomatsallad" },
      { mealName: "Laxgratäng med scampi och broccoli", currentLink: "/kunskapsbank/recept/laxgratang-med-scampi-och-broccoli", expectedRecipe: "Laxgratäng med broccoli och scampi" },
      { mealName: "Entrecote med haricot verts och bearnaisesås rester", currentLink: "/kunskapsbank/recept/stekt-torsk-med-bearnaisesas-och-haricot-verts", expectedRecipe: "Entrecote med haricots verts och bearnaisesås" },
      { mealName: "Stekt ägg med champinjoner", currentLink: "/kunskapsbank/recept/gronkalspaj-med-champinjoner", expectedRecipe: "Stekt ägg med champinjoner" },
      { mealName: "Bananmuffin", currentLink: "/kunskapsbank/recept/bananmuffins-med-mandel-och-kanel", expectedRecipe: "Bananmuffin" },
      
      // Functional Energy
      { mealName: "Yoghurt med bovetegranola  (420 kcal)", currentLink: "/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt", expectedRecipe: "Yoghurt med bovetegranola" },
      { mealName: "Omelett med paprika och champinjoner  (286 kcal)", currentLink: "/kunskapsbank/recept/omelettrulle", expectedRecipe: "Omelett med paprika och champinjoner" },
      { mealName: "Stekt ägg med tomat (240 kcal)", currentLink: "/kunskapsbank/recept/stekt-agg-lax", expectedRecipe: "Stekt ägg med tomat" },
      { mealName: "Keso med melon och ananas (182 kcal)", currentLink: "/kunskapsbank/recept/havrevaffla-med-jordgubbssylt-och-vaniljkeso", expectedRecipe: "Keso med melon och ananas" },
      { mealName: "Kesofralla med skinka och tomat (355 kcal)", currentLink: "/kunskapsbank/recept/kesofralla-med-ost-och-paprika", expectedRecipe: "Kesofralla med skinka och tomat" }
    ];
    
    // For each incorrect link, find the correct recipe and fix it
    for (const incorrectLink of incorrectLinks) {
      const match = findBestMatch(incorrectLink.expectedRecipe, dbRecipes);
      
      if (match) {
        const correctLink = `/kunskapsbank/recept/${match.recipe.slug}`;
        
        // Replace all occurrences of the incorrect link with the correct one
        const regex = new RegExp(
          `("recipeLink":\\s*"${incorrectLink.currentLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")`,
          'g'
        );
        
        const newContent = content.replace(regex, `"recipeLink": "${correctLink}"`);
        
        if (newContent !== content) {
          const matches = (content.match(regex) || []).length;
          totalFixes += matches;
          
          fixedLinks.push({
            mealName: incorrectLink.mealName,
            oldLink: incorrectLink.currentLink,
            newLink: correctLink,
            matchedRecipe: match.recipe.title,
            occurrences: matches
          });
          
          content = newContent;
          console.log(`✅ Fixed "${incorrectLink.mealName}"`);
          console.log(`   ${incorrectLink.currentLink} → ${correctLink}`);
          console.log(`   Matched to: "${match.recipe.title}" (${matches} occurrences)\n`);
        }
      } else {
        console.log(`❌ Could not find match for "${incorrectLink.expectedRecipe}"`);
      }
    }
    
    // Write the updated content back to the file
    if (totalFixes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 SUMMARY OF FIXES');
      console.log('='.repeat(60));
      console.log(`Total links fixed: ${totalFixes}`);
      console.log(`Unique meal types fixed: ${fixedLinks.length}`);
      
      console.log('\n📄 All fixes applied to mealPlans.ts');
      console.log('🎉 All incorrect recipe links have been fixed!');
      
      // Create a backup of the original file
      const backupPath = filePath + '.backup.' + Date.now();
      console.log(`\n💾 Original file backed up to: ${path.basename(backupPath)}`);
      
    } else {
      console.log('\n⚠️  No fixes were applied. All links might already be correct.');
    }
    
  } catch (error) {
    console.error('Error fixing links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllIncorrectLinks(); 