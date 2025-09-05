const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function rollbackUdImport() {
  try {
    console.log('🚨 Rolling back UD import...');

    // 1) Identify UD recipes by tag
    const udByTag = await prisma.recipe.findMany({
      where: { tags: { has: 'UD' } },
      select: { id: true, slug: true, title: true, imageUrl: true, tags: true }
    });

    // 2) Identify recipes with imageUrl pointing to UD folder (covers converted ones)
    const udByImage = await prisma.recipe.findMany({
      where: {
        imageUrl: { contains: '/UD_recept_complete/' }
      },
      select: { id: true, slug: true, title: true, imageUrl: true, tags: true }
    });

    // Merge IDs
    const toDeleteMap = new Map();
    udByTag.forEach(r => toDeleteMap.set(r.id, r));
    udByImage.forEach(r => toDeleteMap.set(r.id, r));
    const toDelete = Array.from(toDeleteMap.values());

    console.log(`\n🧹 Will delete ${toDelete.length} UD-imported recipes`);
    if (toDelete.length > 0) {
      // 3) Delete
      const result = await prisma.recipe.deleteMany({
        where: { id: { in: toDelete.map(r => r.id) } }
      });
      console.log(`✅ Deleted ${result.count} recipes`);

      // Print a few examples
      console.log('\n🗒️ Examples of deleted:');
      toDelete.slice(0, 10).forEach(r => console.log(` - ${r.title} (${r.slug})`));
      if (toDelete.length > 10) console.log(`   ...and ${toDelete.length - 10} more`);
    }

    // 4) Reset access flags: free by default
    console.log('\n🔄 Reset recipe access flags (free by default)...');
    const reset = await prisma.recipe.updateMany({ data: { isPremium: false, isFree: true } });
    console.log(`✅ Reset ${reset.count} recipes`);

    // 5) Re-apply premium to course-linked recipes using mealPlans.ts
    console.log('\n🔒 Setting course-linked recipes back to premium...');
    const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    const extractSlugs = (section) => {
      const matches = section.match(/"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g) || [];
      return matches.map(m => (m.match(/"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/) || [])[1])
        .filter(Boolean);
    };

    const basics = (content.match(/export const mealPlans[^=]*=\s*{([\s\S]*?)};/) || [])[1] || '';
    const flow = (content.match(/export const flowMealPlans[^=]*=\s*{([\s\S]*?)};/) || [])[1] || '';
    const energy = (content.match(/export const energyMealPlans[^=]*=\s*{([\s\S]*?)};/) || [])[1] || '';

    const premiumSlugs = Array.from(new Set([...extractSlugs(basics), ...extractSlugs(flow), ...extractSlugs(energy)]));

    const setPremium = await prisma.recipe.updateMany({
      where: { slug: { in: premiumSlugs } },
      data: { isPremium: true, isFree: false }
    });
    console.log(`✅ Set ${setPremium.count} course-linked recipes to premium`);

    // 6) Recount stats
    const [total, udRemaining, adminOnlyRemaining, premium, free] = await Promise.all([
      prisma.recipe.count(),
      prisma.recipe.count({ where: { tags: { has: 'UD' } } }),
      prisma.recipe.count({ where: { tags: { has: 'ADMIN_ONLY' } } }),
      prisma.recipe.count({ where: { isPremium: true, isFree: false } }),
      prisma.recipe.count({ where: { isPremium: false, isFree: true } }),
    ]);

    console.log('\n📊 Final DB state:');
    console.log(`Total recipes: ${total}`);
    console.log(`UD-tagged remaining: ${udRemaining}`);
    console.log(`ADMIN_ONLY remaining (non-UD): ${adminOnlyRemaining}`);
    console.log(`Premium: ${premium}`);
    console.log(`Free: ${free}`);

    return { deleted: toDelete.length, total, premium, free };
  } catch (err) {
    console.error('❌ Rollback error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  rollbackUdImport();
}

module.exports = { rollbackUdImport }; 