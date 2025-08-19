const { PrismaClient } = require('@prisma/client');

function simplifySlug(title) {
  // Extract core dish words, remove fluff
  const words = title
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['med', 'och', 'fran', 'till', 'recept', 'portion', 'portioner', 'bitar', 'skivor', 'stycken'].includes(w));

  // Take first 3 meaningful words
  const core = words.slice(0, 3);
  
  // Handle special cases for clarity
  if (title.includes('smoothie')) core[0] = 'smoothie';
  if (title.includes('omelett')) core[0] = 'omelett';
  if (title.includes('yoghurt')) core[0] = 'yoghurt';
  if (title.includes('granola')) core.push('granola');
  if (title.includes('sallad')) core.push('sallad');
  if (title.includes('gryta')) core.push('gryta');
  if (title.includes('soppa')) core.push('soppa');
  if (title.includes('juice')) core.push('juice');
  
  return core.slice(0, 3).join('-');
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const recipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true }
    });

    console.log(`🔧 Simplifying ${recipes.length} recipe slugs...`);
    
    const updates = [];
    const conflicts = new Set();
    
    // First pass: generate new slugs and check for conflicts
    for (const recipe of recipes) {
      const newSlug = simplifySlug(recipe.title);
      updates.push({ id: recipe.id, title: recipe.title, oldSlug: recipe.slug, newSlug });
    }
    
    // Handle conflicts by adding numbers
    const slugCounts = new Map();
    for (const update of updates) {
      const count = slugCounts.get(update.newSlug) || 0;
      slugCounts.set(update.newSlug, count + 1);
      
      if (count > 0) {
        update.finalSlug = `${update.newSlug}-${count + 1}`;
      } else {
        update.finalSlug = update.newSlug;
      }
    }

    // Apply updates
    let updated = 0;
    for (const update of updates) {
      if (update.oldSlug === update.finalSlug) continue;
      
      try {
        await prisma.recipe.update({
          where: { id: update.id },
          data: { slug: update.finalSlug }
        });
        console.log(`✅ ${update.title}: ${update.oldSlug} → ${update.finalSlug}`);
        updated++;
      } catch (e) {
        console.log(`⚠️ Failed to update ${update.title}: ${e.message}`);
      }
    }

    console.log(`\n🎉 Simplified ${updated} recipe slugs`);
    
  } catch (e) {
    console.error('❌ Slug simplification failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 