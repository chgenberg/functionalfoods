import { PrismaClient } from '@prisma/client';

// Quick Levenshtein implementation
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Kott/g, 'Kött')
    .replace(/Sas/g, 'sås')
    .replace(/O/g, 'ö');
}

const prisma = new PrismaClient();

(async () => {
  const missing = [
    'morotsjuice',
    'kyckling-i-curry-med-kokosmjolk',
    'paronmusli-med-mandlar',
    'kott-i-mustig-tomatsas',
    'linssoppa-med-curry-och-spiskummin',
    'notgryta-med-sotpotatis',
    'glasnudelsallad-med-gronsaker',
    'halloumiburgare-med-rodbetor',
    'wokad-lovbiff-med-nudlar',
    'rotfruktssoppa',
    'kottfarssas-med-konjaksnudlar',
    'asiatisk-tonfisksallad',
    'squashspagetti-med-gronsakssos',
    'grillade-kottspett-med-grekisk-sallad',
  ];

  const allRecipes = await prisma.recipe.findMany({ select: { id: true, slug: true, title: true } });

  for (const targetSlug of missing) {
    let bestMatch: typeof allRecipes[0] | null = null;
    let bestDistance = Infinity;

    for (const recipe of allRecipes) {
      const dist = levenshtein(targetSlug, recipe.slug);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = recipe;
      }
    }

    if (bestMatch && bestDistance <= 5) {
      console.log(`Updating ${bestMatch.slug} -> ${targetSlug} (distance ${bestDistance})`);
      await prisma.recipe.update({
        where: { id: bestMatch.id },
        data: {
          slug: targetSlug,
          title: slugToTitle(targetSlug),
        },
      });
    } else {
      console.log(`No close match found for ${targetSlug} (closest distance ${bestDistance}).`);
    }
  }

  await prisma.$disconnect();
})(); 