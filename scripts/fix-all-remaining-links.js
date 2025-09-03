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
    
    if (normalized === recipeNormalized) {
      return { recipe, score: 100, method: 'exact' };
    }
    
    if (normalized.includes(recipeNormalized) || recipeNormalized.includes(normalized)) {
      const score = 90;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: 'contains' };
      }
    }
    
    const similarity = stringSimilarity.compareTwoStrings(normalized, recipeNormalized);
    const score = similarity * 100;
    
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { recipe, score: Math.round(score), method: 'similarity' };
    }
  }
  
  return bestScore >= 70 ? bestMatch : null;
}

async function fixAllRemainingLinks() {
  console.log('🔧 Fixing ALL remaining incorrect recipe links...\n');
  
  try {
    const dbRecipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true }
    });
    
    console.log(`📚 Found ${dbRecipes.length} recipes in database\n`);
    
    const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
    let content = fs.readFileSync(filePath, 'utf8');
    
    let totalFixes = 0;
    const fixedLinks = [];
    
    // Comprehensive list of all incorrect links from verification
    const incorrectMappings = [
      // From the verification output - mapping expected recipe name to meal name and current link
      { expectedRecipe: "Köttfärsbiffar med mozzarella och tomatsallad", currentLink: "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" },
      { expectedRecipe: "Entrecote med haricots verts och bearnaisesås", currentLink: "/kunskapsbank/recept/entrecote-med-haricot-verts-och-bearnaisesas" },
      { expectedRecipe: "Citronkaka med äpple och kardemumma", currentLink: "/kunskapsbank/recept/entrecote-med-haricot-verts-och-bearnaisesas" },
      { expectedRecipe: "Bananmuffin", currentLink: "/kunskapsbank/recept/bananmuffins-med-mandel-och-kanel" },
      { expectedRecipe: "Blåbärssmoothie", currentLink: "/kunskapsbank/recept/gron-smoothie" },
      { expectedRecipe: "Valnötslax med fetaostcreme", currentLink: "/kunskapsbank/recept/stekta-applen-med-vit-chokladkram" },
      { expectedRecipe: "Blåbärssmoothie", currentLink: "/kunskapsbank/recept/smoothie-blabarssmoothie" },
      { expectedRecipe: "Yoghurt med mango och apelsin", currentLink: "/kunskapsbank/recept/yoghurt-bovetegranola-frukt" },
      { expectedRecipe: "Stekt ägg med parmaskinka", currentLink: "/kunskapsbank/recept/gronkalspaj-med-champinjoner" },
      { expectedRecipe: "Kyckling med stekt blomkålsris och dillyoghurt", currentLink: "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango" },
      { expectedRecipe: "Kyckling med stekt blomkålsris och dillyoghurt", currentLink: "/kunskapsbank/recept/kyckling-med-blomkalsris-och-dillyoghurt" },
      { expectedRecipe: "Äggröra med champinjoner", currentLink: "/kunskapsbank/recept/aggrora-lax-2" },
      { expectedRecipe: "Quinoasallad med scampi och mango", currentLink: "/kunskapsbank/recept/kycklingfylld-aubergine" },
      { expectedRecipe: "Grönkålspaj med champinjoner", currentLink: "/kunskapsbank/recept/stekt-agg-champinjoner" },
      { expectedRecipe: "Bananpannkaka", currentLink: "/kunskapsbank/recept/bananpannkaka-med-keso-blabar-och-mango" },
      { expectedRecipe: "Hamburgare med grekisk sallad", currentLink: "/kunskapsbank/recept/grekisk-sallad" },
      
      // Energy course fixes
      { expectedRecipe: "Yoghurt med bär och bovetegranola", currentLink: "/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt" },
      { expectedRecipe: "Rökt lax med ägghack", currentLink: "/kunskapsbank/recept/aggrora-lax-2" },
      { expectedRecipe: "Smoothiebowl med spirulina och havre", currentLink: "/kunskapsbank/recept/barsmoothiebowl" },
      { expectedRecipe: "Kesofralla med färskost och gurka", currentLink: "/kunskapsbank/recept/kesofralla-med-ost-och-paprika" },
      { expectedRecipe: "Äggröra med kalkon och granatäpple", currentLink: "/kunskapsbank/recept/aggrora-med-lax" },
      { expectedRecipe: "Bananpannkaka med keso, blåbär och mango", currentLink: "/kunskapsbank/recept/stekt-agg-champinjoner-2" },
      { expectedRecipe: "Yoghurt med bovetegranola och aprikos", currentLink: "/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt" },
      { expectedRecipe: "Stekt ägg med kalkon och senapsmajonnäs", currentLink: "/kunskapsbank/recept/stekt-agg-lax" },
      { expectedRecipe: "Yoghurt med bovetegranola och sylt", currentLink: "/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt" },
      { expectedRecipe: "Kycklingfärstimbaler med färskost och sweet chili", currentLink: "/kunskapsbank/recept/kycklingfarswok" },
      { expectedRecipe: "Äggröra med sockerärtor", currentLink: "/kunskapsbank/recept/aggrora-med-lax" },
      { expectedRecipe: "Morotskaka med havregryn och chiafrön", currentLink: "/kunskapsbank/recept/entrecote-med-sparris-och-artpesto" },
      { expectedRecipe: "Chiapudding med jordgubbssylt och pistagenötter", currentLink: "/kunskapsbank/recept/tropisk-chiapudding" },
      { expectedRecipe: "Ugnsomelett med keso och bär", currentLink: "/kunskapsbank/recept/omelett-keso-bar" },
      { expectedRecipe: "Chiapudding med med apelsin och mynta", currentLink: "/kunskapsbank/recept/tropisk-chiapudding" },
    ];
    
    // Process each incorrect mapping
    for (const mapping of incorrectMappings) {
      const match = findBestMatch(mapping.expectedRecipe, dbRecipes);
      
      if (match) {
        const correctLink = `/kunskapsbank/recept/${match.recipe.slug}`;
        
        // Replace the incorrect link with the correct one
        const regex = new RegExp(
          `"recipeLink":\\s*"${mapping.currentLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`,
          'g'
        );
        
        const newContent = content.replace(regex, `"recipeLink": "${correctLink}"`);
        
        if (newContent !== content) {
          const matches = (content.match(regex) || []).length;
          totalFixes += matches;
          
          fixedLinks.push({
            expectedRecipe: mapping.expectedRecipe,
            oldLink: mapping.currentLink,
            newLink: correctLink,
            matchedRecipe: match.recipe.title,
            occurrences: matches
          });
          
          content = newContent;
          console.log(`✅ Fixed "${mapping.expectedRecipe}"`);
          console.log(`   ${mapping.currentLink} → ${correctLink}`);
          console.log(`   Matched to: "${match.recipe.title}" (${matches} occurrences)\n`);
        }
      } else {
        console.log(`❌ Could not find match for "${mapping.expectedRecipe}"`);
      }
    }
    
    // Write the updated content back to the file
    if (totalFixes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 SUMMARY OF ADDITIONAL FIXES');
      console.log('='.repeat(60));
      console.log(`Total additional links fixed: ${totalFixes}`);
      console.log(`Unique meal types fixed: ${fixedLinks.length}`);
      
      console.log('\n📄 All additional fixes applied to mealPlans.ts');
      console.log('🎉 All remaining incorrect recipe links should now be fixed!');
      
    } else {
      console.log('\n✅ No additional fixes needed. All links appear to be correct now.');
    }
    
  } catch (error) {
    console.error('Error fixing remaining links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllRemainingLinks(); 