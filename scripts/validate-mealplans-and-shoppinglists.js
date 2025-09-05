const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function extractAllLinks(source) {
  const entries = [];
  const pairRegex = /"name"\s*:\s*"([^"]+)"[\s\S]*?"recipeLink"\s*:\s*"(\/kunskapsbank\/recept\/[^"\s]+)"/g;
  let m;
  while ((m = pairRegex.exec(source)) !== null) {
    const name = m[1];
    const link = m[2];
    const sm = link.match(/\/kunskapsbank\/recept\/([^\"\s]+)/);
    const slug = sm ? sm[1] : '';
    entries.push({ name, link, slug });
  }
  return entries;
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const source = fs.readFileSync(mealPlansPath, 'utf8');

    const entries = extractAllLinks(source);
    const publicRoot = path.join(process.cwd(), 'public');

    let ok = 0;
    const missingRecipe = [];
    const missingImage = [];
    const missingIngredients = [];
    const badAmounts = [];

    for (const e of entries) {
      const recipe = await prisma.recipe.findUnique({ where: { slug: e.slug } });
      if (!recipe) { missingRecipe.push(e); continue; }

      // image check
      let hasImage = false;
      if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
        const abs = path.join(publicRoot, recipe.imageUrl.replace(/^\//, ''));
        hasImage = fs.existsSync(abs);
      }
      if (!hasImage) missingImage.push({ slug: e.slug, imageUrl: recipe.imageUrl || null, name: e.name });

      const hasStruct = Array.isArray(recipe.ingredientsStructured) && recipe.ingredientsStructured.length > 0;
      const hasLabels = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
      if (!hasStruct && !hasLabels) missingIngredients.push({ slug: e.slug, name: e.name });

      if (hasStruct) {
        for (const ing of recipe.ingredientsStructured) {
          if (ing && ing.finalAmount != null && Number.isNaN(Number(ing.finalAmount))) {
            badAmounts.push({ slug: e.slug, ingredient: ing.label, amount: ing.finalAmount });
          }
        }
      }

      if (hasImage) ok++;
    }

    console.log('VALIDATION SUMMARY');
    console.log(JSON.stringify({
      totalMeals: entries.length,
      ok,
      missingRecipe: missingRecipe.length,
      missingImage: missingImage.length,
      missingIngredients: missingIngredients.length,
      badAmounts: badAmounts.length
    }, null, 2));

    if (missingRecipe.length || missingImage.length || missingIngredients.length || badAmounts.length) {
      console.log('\nExamples:');
      missingRecipe.slice(0, 5).forEach(x => console.log(`MISSING_RECIPE: ${x.name} -> ${x.slug}`));
      missingImage.slice(0, 5).forEach(x => console.log(`MISSING_IMAGE: ${x.slug} (${x.name}) url=${x.imageUrl}`));
      missingIngredients.slice(0, 5).forEach(x => console.log(`MISSING_ING: ${x.slug} (${x.name})`));
      badAmounts.slice(0, 5).forEach(x => console.log(`BAD_AMOUNT: ${x.slug} ${x.ingredient} = ${x.amount}`));
    }
  } catch (err) {
    console.error('❌ Validation error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 