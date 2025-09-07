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

// Main validation function
async function validateAndFixRecipeImages() {
  try {
    console.log('🖼️ RECIPE IMAGE VALIDATION AND FIX');
    console.log('====================================\n');

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

      // Check if image exists and is valid
      const hasImage = recipe.imageUrl && 
                      !recipe.imageUrl.includes('placeholder') &&
                      recipe.imageUrl !== '/images/placeholder.jpg';

      if (!hasImage) {
        issues.push({
          type: 'missing',
          recipe: recipe.title,
          slug: recipe.slug,
          current: recipe.imageUrl || 'none'
        });

        // Try to find matching image
        const match = await findBestImageMatch(recipe);
        
        if (match && match.score > 50) {
          if (FIX_MODE) {
            await prisma.recipe.update({
              where: { id: recipe.id },
              data: { imageUrl: match.path }
            });
            
            fixes.push({
              recipe: recipe.title,
              slug: recipe.slug,
              newImage: match.path,
              reason: match.reason,
              score: match.score
            });
          }
        } else {
          noImageFound.push({
            recipe: recipe.title,
            slug: recipe.slug,
            tags: recipe.tags || []
          });
        }
        
        continue;
      }

      // Check if file actually exists
      const imagePath = path.join(process.cwd(), 'public', recipe.imageUrl);
      if (!fs.existsSync(imagePath)) {
        issues.push({
          type: 'broken',
          recipe: recipe.title,
          slug: recipe.slug,
          current: recipe.imageUrl
        });

        // Try to find replacement
        const match = await findBestImageMatch(recipe);
        
        if (match) {
          if (FIX_MODE) {
            await prisma.recipe.update({
              where: { id: recipe.id },
              data: { imageUrl: match.path }
            });
            
            fixes.push({
              recipe: recipe.title,
              slug: recipe.slug,
              oldImage: recipe.imageUrl,
              newImage: match.path,
              reason: match.reason,
              score: match.score
            });
          }
        } else {
          noImageFound.push({
            recipe: recipe.title,
            slug: recipe.slug,
            tags: recipe.tags || []
          });
        }
      }
    }

    // Generate report
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`\n✅ Recipes checked: ${recipes.length}`);
    console.log(`🚨 Issues found: ${issues.length}`);
    console.log(`✨ Fixes applied: ${fixes.length}`);
    console.log(`❌ No suitable image found: ${noImageFound.length}`);

    if (issues.length > 0) {
      console.log('\n🚨 ISSUES:');
      const missingImages = issues.filter(i => i.type === 'missing');
      const brokenImages = issues.filter(i => i.type === 'broken');
      
      if (missingImages.length > 0) {
        console.log(`\n  Missing images: ${missingImages.length}`);
        missingImages.slice(0, 5).forEach(issue => {
          console.log(`    - ${issue.recipe} (${issue.slug})`);
        });
        if (missingImages.length > 5) {
          console.log(`    ... and ${missingImages.length - 5} more`);
        }
      }

      if (brokenImages.length > 0) {
        console.log(`\n  Broken image links: ${brokenImages.length}`);
        brokenImages.slice(0, 5).forEach(issue => {
          console.log(`    - ${issue.recipe}: ${issue.current}`);
        });
        if (brokenImages.length > 5) {
          console.log(`    ... and ${brokenImages.length - 5} more`);
        }
      }
    }

    if (fixes.length > 0) {
      console.log('\n✨ FIXES APPLIED:');
      fixes.slice(0, 10).forEach(fix => {
        console.log(`  ✅ ${fix.recipe}`);
        console.log(`     New image: ${fix.newImage}`);
        console.log(`     Reason: ${fix.reason} (score: ${Math.round(fix.score)})`);
      });
      if (fixes.length > 10) {
        console.log(`  ... and ${fixes.length - 10} more fixes`);
      }
    }

    if (noImageFound.length > 0) {
      console.log('\n❌ NO SUITABLE IMAGE FOUND:');
      
      // Group by course
      const byCourse = {
        Basic: noImageFound.filter(r => r.tags.includes('Basic')),
        Flow: noImageFound.filter(r => r.tags.includes('Flow')),
        Energy: noImageFound.filter(r => r.tags.includes('Energy')),
        Free: noImageFound.filter(r => !r.tags.some(t => ['Basic', 'Flow', 'Energy'].includes(t)))
      };

      Object.entries(byCourse).forEach(([course, recipes]) => {
        if (recipes.length > 0) {
          console.log(`\n  ${course}: ${recipes.length} recipes`);
          recipes.slice(0, 3).forEach(r => {
            console.log(`    - ${r.recipe} (${r.slug})`);
          });
          if (recipes.length > 3) {
            console.log(`    ... and ${recipes.length - 3} more`);
          }
        }
      });
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRecipes: recipes.length,
        issuesFound: issues.length,
        fixesApplied: fixes.length,
        noImageFound: noImageFound.length
      },
      issues,
      fixes,
      noImageFound
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'recipe-image-validation-report.json'),
      JSON.stringify(report, null, 2)
    );

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