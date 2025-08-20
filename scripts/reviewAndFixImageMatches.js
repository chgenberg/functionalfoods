const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// Analyze image and get description
async function getImageDescription(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Beskriv denna maträtt mycket detaljerat på svenska. Nämn alla synliga ingredienser, tillagningsmetod, färger, och presentation. Var så specifik som möjligt."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`❌ Vision error:`, error.message);
    return null;
  }
}

// Review match quality using GPT-4o-mini
async function reviewMatch(recipeTitle, imageDescription, allRecipeNames) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Du är en expert på att bedöma om receptnamn matchar bildbeskrivningar. Du får:
1. Ett receptnamn
2. En detaljerad beskrivning av vad som syns på bilden  
3. En lista med alla tillgängliga recept

Din uppgift:
- Bedöm om receptnamnet passar bildbeskrivningen (GOOD_MATCH/BAD_MATCH)
- Om BAD_MATCH, föreslå det bästa alternativet från listan
- Var mycket noggrann med ingredienser - kyckling vs vegetarisk, ägg vs kött, etc.`
        },
        {
          role: "user",
          content: `Receptnamn: "${recipeTitle}"
Bildbeskrivning: "${imageDescription}"

Tillgängliga recept:
${allRecipeNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Bedöm matchningen och svara i format:
KVALITET: [GOOD_MATCH eller BAD_MATCH]
FÖRSLAG: [receptnamn från listan eller "NONE"]
ANLEDNING: [kort förklaring]`
        }
      ],
      max_tokens: 150,
      temperature: 0.1
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`❌ Review error:`, error.message);
    return null;
  }
}

async function reviewAndFixImageMatches() {
  console.log('🔍 Reviewing existing image matches for quality...\n');
  
  // Get all recipes with images
  const recipesWithImages = await prisma.recipe.findMany({
    where: { 
      imageUrl: { not: null },
      tags: { hasSome: ['Basic', 'Flow'] }
    },
    select: { id: true, title: true, imageUrl: true, tags: true },
    orderBy: { title: 'asc' }
  });
  
  console.log(`📝 Found ${recipesWithImages.length} recipes with images to review\n`);
  
  // Get all recipe names for suggestions
  const allRecipes = await prisma.recipe.findMany({
    where: { tags: { hasSome: ['Basic', 'Flow'] } },
    select: { id: true, title: true, tags: true }
  });
  
  const allRecipeNames = allRecipes.map(r => r.title);
  
  let reviewedCount = 0;
  let badMatches = 0;
  let fixedMatches = 0;
  
  for (const recipe of recipesWithImages) {
    const courseType = recipe.tags.includes('Basic') ? 'Basic' : 'Flow';
    const imagePath = path.join(process.cwd(), 'public', recipe.imageUrl);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`❌ Image not found: ${recipe.imageUrl}`);
      continue;
    }
    
    console.log(`🔍 Reviewing: ${recipe.title} (${courseType})`);
    console.log(`   Image: ${path.basename(recipe.imageUrl)}`);
    
    // Get fresh image description
    const imageDescription = await getImageDescription(imagePath);
    if (!imageDescription) {
      console.log(`   ❌ Could not analyze image`);
      continue;
    }
    
    console.log(`   📝 Vision: "${imageDescription.substring(0, 80)}..."`);
    
    // Review the match
    const review = await reviewMatch(recipe.title, imageDescription, allRecipeNames);
    if (!review) {
      console.log(`   ❌ Could not review match`);
      continue;
    }
    
    console.log(`   🎯 Review: ${review}`);
    
    // Parse review result
    const qualityMatch = review.match(/KVALITET:\s*(GOOD_MATCH|BAD_MATCH)/);
    const suggestionMatch = review.match(/FÖRSLAG:\s*(.+)/);
    
    if (qualityMatch && qualityMatch[1] === 'BAD_MATCH') {
      badMatches++;
      console.log(`   ❌ BAD MATCH detected!`);
      
      if (suggestionMatch) {
        const suggestion = suggestionMatch[1].trim();
        if (suggestion !== 'NONE' && suggestion !== recipe.title) {
          // Find the suggested recipe
          const suggestedRecipe = allRecipes.find(r => r.title === suggestion);
          if (suggestedRecipe && !suggestedRecipe.imageUrl) {
            // Move the image to the suggested recipe
            await prisma.recipe.update({
              where: { id: recipe.id },
              data: { imageUrl: null, imageMobileUrl: null }
            });
            
            await prisma.recipe.update({
              where: { id: suggestedRecipe.id },
              data: { 
                imageUrl: recipe.imageUrl,
                imageMobileUrl: recipe.imageMobileUrl || recipe.imageUrl
              }
            });
            
            console.log(`   ✅ FIXED: Moved image to "${suggestion}"`);
            fixedMatches++;
          } else {
            console.log(`   ⚠️  Cannot fix: "${suggestion}" already has image or not found`);
          }
        }
      }
    } else if (qualityMatch && qualityMatch[1] === 'GOOD_MATCH') {
      console.log(`   ✅ Good match confirmed`);
    }
    
    reviewedCount++;
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Limit to avoid excessive API usage
    if (reviewedCount >= 20) {
      console.log('⏸️  Pausing after 20 reviews to avoid excessive API usage');
      break;
    }
  }
  
  // Final summary
  const finalBasicWithImages = await prisma.recipe.count({
    where: { 
      tags: { has: 'Basic' },
      imageUrl: { not: null }
    }
  });
  
  const finalFlowWithImages = await prisma.recipe.count({
    where: { 
      tags: { has: 'Flow' },
      imageUrl: { not: null }
    }
  });
  
  const totalBasic = await prisma.recipe.count({ where: { tags: { has: 'Basic' } } });
  const totalFlow = await prisma.recipe.count({ where: { tags: { has: 'Flow' } } });
  
  console.log(`🎉 Review complete!`);
  console.log(`📊 Reviewed: ${reviewedCount} matches`);
  console.log(`❌ Bad matches found: ${badMatches}`);
  console.log(`✅ Matches fixed: ${fixedMatches}`);
  console.log(`📈 Final Basic: ${finalBasicWithImages}/${totalBasic} recipes (${Math.round(finalBasicWithImages/totalBasic*100)}%)`);
  console.log(`📈 Final Flow: ${finalFlowWithImages}/${totalFlow} recipes (${Math.round(finalFlowWithImages/totalFlow*100)}%)`);
}

reviewAndFixImageMatches()
  .then(() => {
    console.log('✅ Image match review completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 