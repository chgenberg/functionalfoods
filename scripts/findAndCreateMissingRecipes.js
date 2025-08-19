const { PrismaClient } = require('@prisma/client');

const missing = [
  'kottfarsbiffar-med-stekt-blomkal',
  'kycklinggryta-med-bakad-spetskal', 
  'ugnsbakad-tomat-med-kottfars'
];

function normalize(s) {
  return (s || '').toLowerCase().replace(/[åäà]/g, 'a').replace(/[öø]/g, 'o').replace(/[ü]/g, 'u').replace(/[éè]/g, 'e').replace(/[^a-z0-9]/g, '').trim();
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const allRecipes = await prisma.recipe.findMany({ select: { title: true, slug: true, ingredients: true, instructions: true, servings: true } });
    const normalized = allRecipes.map(r => ({ ...r, norm: normalize(r.title) }));

    for (const targetSlug of missing) {
      const targetNorm = normalize(targetSlug.replace(/-/g, ' '));
      let bestMatch = null;
      let bestDist = 5;

      for (const r of normalized) {
        const dist = levenshtein(targetNorm, r.norm);
        if (dist < bestDist) {
          bestDist = dist;
          bestMatch = r;
        }
      }

      if (bestMatch) {
        try {
          await prisma.recipe.create({
            data: {
              title: bestMatch.title,
              slug: targetSlug,
              ingredients: bestMatch.ingredients,
              instructions: bestMatch.instructions,
              servings: bestMatch.servings,
              status: 'PUBLISHED',
              isPremium: false,
              isFree: true
            }
          });
          console.log(`✅ Created alias: ${targetSlug} → ${bestMatch.slug} (${bestMatch.title})`);
        } catch (e) {
          console.log(`⚠️ Alias exists: ${targetSlug}`);
        }
      } else {
        console.log(`❌ No match found for: ${targetSlug}`);
      }
    }

    console.log('\n🎉 All aliases created!');
  } catch (e) {
    console.error('❌ Process failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 