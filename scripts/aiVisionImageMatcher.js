const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// Step 1: Analyze image with Vision
async function analyzeImageWithVision(imagePath, imageUrl) {
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
              text: "Beskriv denna maträtt på svenska. Var mycket specifik om ingredienser, tillagningsmetod och presentation. Svara endast med en kort, tydlig beskrivning av rätten (max 2 meningar)."
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
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`❌ Vision error for ${imageUrl}:`, error.message);
    return null;
  }
}

// Step 2: Match description to recipe using GPT-4o-mini
async function matchDescriptionToRecipe(imageDescription, recipeNames, courseType) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Du är en expert på att matcha matbeskrivningar med receptnamn. Du får en beskrivning av en maträtt och en lista med ${courseType} receptnamn. Din uppgift är att hitta det BÄSTA receptet som matchar beskrivningen.

Regler:
- Svara endast med det exakta receptnamnet från listan
- Om ingen bra match finns, svara "NO_MATCH"  
- Var mycket noggrann med ingredienser och tillagningsmetod
- Föredra exakta matchningar framför liknande rätter`
        },
        {
          role: "user",
          content: `Bildbeskrivning: "${imageDescription}"

Tillgängliga ${courseType} recept:
${recipeNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Vilket recept matchar beskrivningen bäst?`
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    });

    const match = response.choices[0].message.content.trim();
    return match === "NO_MATCH" ? null : match;
  } catch (error) {
    console.error(`❌ Matching error:`, error.message);
    return null;
  }
}

async function aiVisionImageMatcher() {
  console.log('🤖 Starting AI Vision + GPT-4o-mini image matching...\n');
  
  // Get all recipes without images
  const basicRecipes = await prisma.recipe.findMany({
    where: { 
      tags: { has: 'Basic' },
      imageUrl: null
    },
    select: { id: true, title: true }
  });
  
  const flowRecipes = await prisma.recipe.findMany({
    where: { 
      tags: { has: 'Flow' },
      imageUrl: null
    },
    select: { id: true, title: true }
  });
  
  console.log(`📝 Found ${basicRecipes.length} Basic recipes and ${flowRecipes.length} Flow recipes without images`);
  
  // Get available images
  const basicImagesDir = path.join(process.cwd(), 'public/Bilder_basic');
  const flowImagesDir = path.join(process.cwd(), 'public/Bilder_flow');
  
  const basicImages = fs.existsSync(basicImagesDir) ? 
    fs.readdirSync(basicImagesDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i)) : [];
  const flowImages = fs.existsSync(flowImagesDir) ? 
    fs.readdirSync(flowImagesDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i)) : [];
  
  // Get already used images
  const usedImages = await prisma.recipe.findMany({
    where: { imageUrl: { not: null } },
    select: { imageUrl: true }
  });
  const usedImageNames = usedImages.map(r => path.basename(r.imageUrl));
  
  const availableBasicImages = basicImages.filter(img => !usedImageNames.includes(img));
  const availableFlowImages = flowImages.filter(img => !usedImageNames.includes(img));
  
  console.log(`📁 Available images: ${availableBasicImages.length} Basic, ${availableFlowImages.length} Flow\n`);
  
  let totalMatched = 0;
  
  // Process Flow images first (more images available)
  if (flowRecipes.length > 0 && availableFlowImages.length > 0) {
    console.log('🔄 Processing Flow images...\n');
    
    // Step 1: Analyze all Flow images with Vision
    const flowImageDescriptions = [];
    for (const imageFile of availableFlowImages.slice(0, Math.min(30, availableFlowImages.length))) {
      const imagePath = path.join(flowImagesDir, imageFile);
      console.log(`👁️  Analyzing: ${imageFile}`);
      
      const description = await analyzeImageWithVision(imagePath, imageFile);
      if (description) {
        flowImageDescriptions.push({ file: imageFile, description });
        console.log(`   📝 "${description}"`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 2: Match descriptions to recipes
    const flowRecipeNames = flowRecipes.map(r => r.title);
    
    for (const { file, description } of flowImageDescriptions) {
      console.log(`\n🎯 Matching: ${file}`);
      console.log(`   Description: "${description}"`);
      
      const matchedRecipe = await matchDescriptionToRecipe(description, flowRecipeNames, 'Flow');
      
      if (matchedRecipe) {
        const recipe = flowRecipes.find(r => r.title === matchedRecipe);
        if (recipe) {
          // Check for mobile version
          const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');
          const mobileImage = availableFlowImages.find(img => 
            img.startsWith(baseName + '-mobile.')
          );
          
          const desktopUrl = `/Bilder_flow/${file}`;
          const mobileUrl = mobileImage ? `/Bilder_flow/${mobileImage}` : desktopUrl;
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              imageUrl: desktopUrl,
              imageMobileUrl: mobileUrl
            }
          });
          
          console.log(`   ✅ MATCHED: "${matchedRecipe}"`);
          totalMatched++;
          
          // Remove from available lists
          const fileIndex = availableFlowImages.indexOf(file);
          if (fileIndex > -1) availableFlowImages.splice(fileIndex, 1);
          if (mobileImage) {
            const mobileIndex = availableFlowImages.indexOf(mobileImage);
            if (mobileIndex > -1) availableFlowImages.splice(mobileIndex, 1);
          }
        }
      } else {
        console.log(`   ❌ No match found`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Process Basic images
  if (basicRecipes.length > 0 && availableBasicImages.length > 0) {
    console.log('\n🔄 Processing Basic images...\n');
    
    // Step 1: Analyze Basic images
    const basicImageDescriptions = [];
    for (const imageFile of availableBasicImages.slice(0, Math.min(20, availableBasicImages.length))) {
      const imagePath = path.join(basicImagesDir, imageFile);
      console.log(`👁️  Analyzing: ${imageFile}`);
      
      const description = await analyzeImageWithVision(imagePath, imageFile);
      if (description) {
        basicImageDescriptions.push({ file: imageFile, description });
        console.log(`   📝 "${description}"`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 2: Match to Basic recipes
    const basicRecipeNames = basicRecipes.map(r => r.title);
    
    for (const { file, description } of basicImageDescriptions) {
      console.log(`\n🎯 Matching: ${file}`);
      console.log(`   Description: "${description}"`);
      
      const matchedRecipe = await matchDescriptionToRecipe(description, basicRecipeNames, 'Basic');
      
      if (matchedRecipe) {
        const recipe = basicRecipes.find(r => r.title === matchedRecipe);
        if (recipe) {
          const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');
          const mobileImage = availableBasicImages.find(img => 
            img.startsWith(baseName + '-mobile.')
          );
          
          const desktopUrl = `/Bilder_basic/${file}`;
          const mobileUrl = mobileImage ? `/Bilder_basic/${mobileImage}` : desktopUrl;
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              imageUrl: desktopUrl,
              imageMobileUrl: mobileUrl
            }
          });
          
          console.log(`   ✅ MATCHED: "${matchedRecipe}"`);
          totalMatched++;
        }
      } else {
        console.log(`   ❌ No match found`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
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
  
  console.log(`\n🎉 AI Vision matching complete!`);
  console.log(`📊 New matches: ${totalMatched}`);
  console.log(`📈 Basic: ${finalBasicWithImages}/${totalBasic} recipes (${Math.round(finalBasicWithImages/totalBasic*100)}%)`);
  console.log(`📈 Flow: ${finalFlowWithImages}/${totalFlow} recipes (${Math.round(finalFlowWithImages/totalFlow*100)}%)`);
}

aiVisionImageMatcher()
  .then(() => {
    console.log('✅ AI Vision image matching completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 