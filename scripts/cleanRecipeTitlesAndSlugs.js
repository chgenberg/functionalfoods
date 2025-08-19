const { PrismaClient } = require('@prisma/client');

function cleanTitle(title) {
  if (!title) return '';
  let cleaned = title
    .replace(/^namn på rätt:\s*/i, '') // remove marker
    .replace(/\s*–\s*\d+\s*portion(er)?\b.*$/i, '') // remove portion info and everything after
    .replace(/\s*-\s*\d+\s*portion(er)?\b.*$/i, '') // also handle regular dash
    .replace(/\s*\d+\s*dl\s+.*$/i, '') // remove ingredient lines that leaked
    .replace(/\s*namn på rätt:.*$/i, '') // remove any trailing marker text
    .trim();
  
  // Handle specific cases
  if (cleaned.includes('Havrefrallor med morötter och aprikoser')) {
    cleaned = 'Havrefrallor med morötter och aprikoser + valfritt pålägg';
  }
  if (cleaned.includes('Yoghurt med ketomüsli')) {
    cleaned = 'Yoghurt med ketomüsli';
  }
  if (cleaned.includes('Squashspagetti med köttfärssås')) {
    cleaned = 'Squashspagetti med köttfärssås';
  }
  if (cleaned.includes('Laxburgare med krämig grönsaksröra')) {
    cleaned = 'Laxburgare med krämig grönsaksröra';
  }
  
  return cleaned;
}

function createSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const recipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true }
    });

    console.log(`🧹 Cleaning ${recipes.length} recipe titles and slugs...`);
    
    let updated = 0;
    for (const recipe of recipes) {
      const cleanedTitle = cleanTitle(recipe.title);
      const newSlug = createSlug(cleanedTitle);
      
      if (cleanedTitle !== recipe.title || newSlug !== recipe.slug) {
        try {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              title: cleanedTitle,
              slug: newSlug
            }
          });
          console.log(`✅ ${recipe.title} → ${cleanedTitle} (${newSlug})`);
          updated++;
        } catch (e) {
          console.log(`⚠️  Slug conflict for ${cleanedTitle}: ${e.message}`);
        }
      }
    }

    console.log(`\n✨ Updated ${updated} recipes with clean titles and slugs`);
  } catch (e) {
    console.error('❌ Cleanup failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 