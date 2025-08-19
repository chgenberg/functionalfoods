const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function improveRecipeWithAI(recipe) {
  const prompt = `Förbättra följande recept genom att:

1. Skapa en kort, SEO-vänlig slug med 2-4 nyckelord (använd bindestreck)
2. Dela upp instruktionerna i tydliga steg-för-steg (numrerade)
3. Beräkna ungefärliga näringsvärden per portion

Recept:
Titel: ${recipe.title}
Portioner: ${recipe.servings || 1}
Ingredienser: ${recipe.ingredients.join(', ')}
Instruktioner: ${recipe.instructions}

Svara ENDAST med JSON:
{
  "slug": "kort-seo-slug",
  "instructions": "1. Första steget.\n2. Andra steget.\n3. Tredje steget.",
  "nutrition": {
    "calories": antal_kalorier_per_portion,
    "protein": gram_protein_per_portion,
    "carbs": gram_kolhydrater_per_portion,
    "fat": gram_fett_per_portion
  }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from AI');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.slug || !parsed.instructions || !parsed.nutrition) {
      throw new Error('Invalid AI response structure');
    }

    return {
      slug: String(parsed.slug).trim(),
      instructions: String(parsed.instructions).trim(),
      nutrition: {
        calories: parseInt(parsed.nutrition.calories, 10) || 0,
        protein: parseFloat(parsed.nutrition.protein) || 0,
        carbs: parseFloat(parsed.nutrition.carbs) || 0,
        fat: parseFloat(parsed.nutrition.fat) || 0
      }
    };

  } catch (e) {
    console.error(`❌ AI improvement failed: ${e.message}`);
    return null;
  }
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const recipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true, ingredients: true, instructions: true, servings: true }
    });

    console.log(`🤖 Improving ${recipes.length} recipes with AI...`);
    
    let improved = 0;
    let skipped = 0;

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      console.log(`\n📝 Processing ${i + 1}/${recipes.length}: ${recipe.title}`);
      
      const improvements = await improveRecipeWithAI(recipe);
      if (!improvements) {
        skipped++;
        console.log('⚠️ Skipped due to AI failure');
        continue;
      }

      // Check if slug conflicts with existing
      let finalSlug = improvements.slug;
      const existing = await prisma.recipe.findUnique({ where: { slug: finalSlug } });
      if (existing && existing.id !== recipe.id) {
        finalSlug = `${improvements.slug}-${Math.random().toString(36).substr(2, 4)}`;
        console.log(`⚠️ Slug conflict, using: ${finalSlug}`);
      }

      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          slug: finalSlug,
          instructions: improvements.instructions,
          nutrition: improvements.nutrition
        }
      });

      improved++;
      console.log(`✅ Improved: ${recipe.title} → ${finalSlug}`);
      console.log(`   Nutrition: ${improvements.nutrition.calories} kcal, ${improvements.nutrition.protein}g protein, ${improvements.nutrition.carbs}g carbs, ${improvements.nutrition.fat}g fat`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Improvement complete:`);
    console.log(`✅ Improved: ${improved}`);
    console.log(`⚠️ Skipped: ${skipped}`);

  } catch (e) {
    console.error('❌ Improvement failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 