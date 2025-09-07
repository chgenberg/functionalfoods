const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Set to true to apply fixes, false to just report issues
const FIX_MODE = true;

// Image directories to search in priority order
const IMAGE_DIRS = [
  'public/Bilder_basic/_optimized',
  'public/Bilder_flow/_optimized',
  'public/Recept_complete2.0/images',
  'public/Recept_complete/images',
  'public/images/recipes',
  'public/images'
];

// Common words to ignore in matching
const IGNORE_WORDS = ['med', 'och', 'från', 'för', 'på', 'i', 'av', 'till', 'rester'];

// Helper to normalize text for matching
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !IGNORE_WORDS.includes(word))
    .join(' ');
}

// Helper to find best matching image
async function findBestImageMatch(recipe) {
  const recipeName = normalizeText(recipe.title);
  const recipeSlug = recipe.slug;
  
  let bestMatch = null;
  let bestScore = 0;
  let bestReason = '';

  for (const dir of IMAGE_DIRS) {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) {
      continue;
    }

    const files = fs.readdirSync(dirPath);
    const imageFiles = files.filter(f => 
      /\.(webp|jpg|jpeg|png)$/i.test(f) && 
      !f.includes('placeholder')
    );

    for (const file of imageFiles) {
      const fileName = normalizeText(path.basename(file, path.extname(file)));
      
      // Check exact slug match
      if (fileName === recipeSlug) {
        return {
          path: `/${path.join(dir.replace('public/', ''), file)}`,
          score: 100,
          reason: 'Exact slug match'
        };
      }

      // Check if slug is in filename
      if (fileName.includes(recipeSlug) || recipeSlug.includes(fileName)) {
        const score = 90;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = `/${path.join(dir.replace('public/', ''), file)}`;
          bestReason = 'Slug partial match';
        }
      }

      // Calculate similarity score
      const similarity = stringSimilarity.compareTwoStrings(recipeName, fileName);
      const score = similarity * 80;

      if (score > bestScore && score > 40) {
        bestScore = score;
        bestMatch = `/${path.join(dir.replace('public/', ''), file)}`;
        bestReason = `Name similarity: ${Math.round(score)}%`;
      }

      // Check individual word matches
      const recipeWords = recipeName.split(' ');
      const fileWords = fileName.split(' ');
      const matchingWords = recipeWords.filter(word => 
        fileWords.some(fw => fw === word || fw.includes(word) || word.includes(fw))
      );
      
      if (matchingWords.length >= 2) {
        const wordScore = (matchingWords.length / recipeWords.length) * 70;
        if (wordScore > bestScore) {
          bestScore = wordScore;
          bestMatch = `/${path.join(dir.replace('public/', ''), file)}`;
          bestReason = `Word matches: ${matchingWords.join(', ')}`;
        }
      }
    }
  }

  if (bestMatch) {
    return {
      path: bestMatch,
      score: bestScore,
      reason: bestReason
    };
  }

  return null;
}

const CSV_RECIPES_PATH = 'public/Recept_complete/recipes.csv';

function tryReadCsvRecipes() {
  try {
    const abs = path.join(process.cwd(), CSV_RECIPES_PATH);
    if (!fs.existsSync(abs)) return [];
    const raw = fs.readFileSync(abs, 'utf8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0].split(/\t/);
    const titleIdx = header.findIndex(h => /title/i.test(h));
    const imgPathIdx = header.findIndex(h => /(featured_image_path|image_path)/i.test(h));
    if (titleIdx === -1 || imgPathIdx === -1) return [];
    const entries = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/\t/);
      const title = (cols[titleIdx] || '').trim();
      const imgPath = (cols[imgPathIdx] || '').trim();
      if (!title) continue;
      // Normalize to local public path if possible
      const fileName = path.basename(imgPath);
      const localCandidate = path.join('public', 'Recept_complete', 'images', fileName);
      const exists = fs.existsSync(path.join(process.cwd(), localCandidate));
      entries.push({
        title,
        normTitle: normalizeText(title),
        fileName,
        localPath: exists ? `/${path.join('Recept_complete', 'images', fileName)}` : null
      });
    }
    return entries;
  } catch (err) {
    console.warn('CSV read failed:', err.message);
    return [];
  }
}

function scoreTitleAgainstPath(recipeTitle, imagePath) {
  const name = normalizeText(path.basename(imagePath || '', path.extname(imagePath || '')));
  const r = normalizeText(recipeTitle);
  if (!name || !r) return 0;
  return stringSimilarity.compareTwoStrings(r, name);
}

async function findAuthoritativeCsvMatch(recipe, csvEntries) {
  if (!csvEntries || csvEntries.length === 0) return null;
  const target = normalizeText(recipe.title);
  let best = null;
  let bestScore = 0;
  for (const e of csvEntries) {
    const s = stringSimilarity.compareTwoStrings(target, e.normTitle);
    if (s > bestScore) {
      bestScore = s;
      best = e;
    }
  }
  if (best && best.localPath && bestScore >= 0.45) {
    return { path: best.localPath, score: bestScore * 100, reason: `CSV title match ${Math.round(bestScore*100)}%` };
  }
  return null;
}

// Main validation function
async function validateAndFixRecipeImages() {
  try {
    console.log('🖼️ RECIPE IMAGE VALIDATION AND FIX');
    console.log('====================================\n');

    const csvEntries = tryReadCsvRecipes();
    console.log(`📄 CSV mapping entries: ${csvEntries.length}`);

    // Get all recipes
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        tags: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    console.log(`📚 Total recipes to check: ${recipes.length}\n`);

    const issues = [];
    const fixes = [];
    const noImageFound = [];
    let checkedCount = 0;

    for (const recipe of recipes) {
      checkedCount++;
      
      if (checkedCount % 50 === 0) {
        console.log(`  Progress: ${checkedCount}/${recipes.length} recipes checked...`);
      }

      const currentUrl = recipe.imageUrl || '';
      const currentExists = currentUrl && fs.existsSync(path.join(process.cwd(), 'public', currentUrl));
      const currentScore = scoreTitleAgainstPath(recipe.title, currentUrl) * 100;

      // First, try authoritative CSV mapping
      let bestCandidate = await findAuthoritativeCsvMatch(recipe, csvEntries);

      // If none from CSV, try fuzzy on directories
      if (!bestCandidate) {
        bestCandidate = await findBestImageMatch(recipe);
      }

      // Determine if missing or mismatched
      const missingOrBroken = !currentUrl || !currentExists;
      const severelyMismatched = !missingOrBroken && bestCandidate && (bestCandidate.score - currentScore >= 20 || currentScore < 35);

      if (missingOrBroken || severelyMismatched) {
        issues.push({
          type: missingOrBroken ? 'missing_or_broken' : 'mismatch',
          recipe: recipe.title,
          slug: recipe.slug,
          current: currentUrl,
          currentScore: Math.round(currentScore),
          best: bestCandidate ? bestCandidate.path : null,
          bestScore: bestCandidate ? Math.round(bestCandidate.score) : 0,
          reason: bestCandidate ? bestCandidate.reason : 'no candidate'
        });

        if (bestCandidate && FIX_MODE) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { imageUrl: bestCandidate.path }
          });
          fixes.push({
            recipe: recipe.title,
            slug: recipe.slug,
            oldImage: currentUrl,
            newImage: bestCandidate.path,
            currentScore: Math.round(currentScore),
            bestScore: Math.round(bestCandidate.score),
            reason: bestCandidate.reason
          });
        } else if (!bestCandidate) {
          noImageFound.push({ recipe: recipe.title, slug: recipe.slug, tags: recipe.tags || [] });
        }

        continue;
      }

      // If current seems fine, skip
    }

    // Generate report
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`\n✅ Recipes checked: ${recipes.length}`);
    console.log(`🚨 Issues found: ${issues.length}`);
    console.log(`✨ Fixes applied: ${fixes.length}`);
    console.log(`❌ No suitable image found: ${noImageFound.length}`);

    // Persist report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRecipes: recipes.length,
        issuesFound: issues.length,
        fixesApplied: fixes.length,
        noImageFound: noImageFound.length
      },
      fixes,
      issues,
      noImageFound
    };
    fs.writeFileSync(path.join(process.cwd(), 'recipe-image-validation-report.json'), JSON.stringify(report, null, 2));

    console.log('\n📄 Detailed report saved to: recipe-image-validation-report.json');
    console.log('\n✨ Image validation complete!');

  } catch (error) {
    console.error('❌ Error during validation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run validation
if (require.main === module) {
  validateAndFixRecipeImages();
}

module.exports = { validateAndFixRecipeImages }; 