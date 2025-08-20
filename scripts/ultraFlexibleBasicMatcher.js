#!/usr/bin/env node

/**
 * Ultra Flexible Basic Image Matcher
 * Purpose: Final attempt to match the last 16 Basic recipes without images
 * Strategy: Very loose matching, multiple Vision attempts, filename analysis
 */

require('dotenv').config();
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const apiKey = 'REMOVED_FOR_SECURITY';
const openai = new OpenAI({ apiKey });

const IMAGES_DIR = path.resolve('public', 'Bilder_basic');

function slugify(title) {
  return title.toLowerCase().replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function getImageSize(filePath) {
  try {
    const sharp = require('sharp');
    const meta = await sharp(filePath).metadata();
    return { width: meta.width || 0, height: meta.height || 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}

async function describeImageUltraDetailed(filePath) {
  const b64 = await fsp.readFile(filePath, { encoding: 'base64' });
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  
  const resp = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'user',
        content: [
          { 
            type: 'input_text', 
            text: `Analysera bilden noggrant och beskriv maträtten på svenska. Ge MÅNGA alternativa namn och variationer, separerade med | (pipe).

Inkludera:
- Huvudingredienser (kött, fisk, ägg, grönsaker)
- Tillagningsmetod (stekt, kokt, grillad, ugns-)
- Typ av rätt (sallad, soppa, gryta, smoothie, juice)
- Tillbehör och såser
- Olika sätt att säga samma sak

Exempel: "Lax med grönsaker|Stekt lax|Laxfilé med tillbehör|Fisk med sallad|Grillad fisk|Lax och grönsaker|Fiskrätt med grönsaker"

Var MYCKET generös med variationer!` 
          },
          { type: 'input_image', image_url: `data:${mime};base64,${b64}` }
        ]
      }
    ]
  });
  
  return (resp.output_text || '').trim();
}

function ultraFlexibleMatch(descriptions, recipes) {
  const terms = descriptions.split('|').map(s => s.trim()).filter(s => s);
  const matches = [];
  
  for (const recipe of recipes) {
    const titleLower = recipe.title.toLowerCase();
    const titleWords = titleLower.split(/\s+/);
    
    for (const term of terms) {
      const termLower = term.toLowerCase();
      const termWords = termLower.split(/\s+/);
      
      let score = 0;
      
      // 1. Exact substring match (high score)
      if (titleLower.includes(termLower) || termLower.includes(titleLower)) {
        score += 50;
      }
      
      // 2. Word overlap scoring
      for (const tw of termWords) {
        for (const rw of titleWords) {
          if (tw.length > 2 && rw.length > 2) {
            if (tw === rw) score += 20; // exact word match
            else if (tw.includes(rw) || rw.includes(tw)) score += 10; // partial word match
          }
        }
      }
      
      // 3. Key ingredient matching
      const keyIngredients = ['lax', 'torsk', 'kyckling', 'ägg', 'keso', 'yoghurt', 'smoothie', 'juice', 'sallad', 'soppa', 'gryta'];
      for (const ingredient of keyIngredients) {
        if (titleLower.includes(ingredient) && termLower.includes(ingredient)) {
          score += 15;
        }
      }
      
      // 4. Cooking method matching
      const methods = ['stekt', 'kokt', 'grillad', 'ugns', 'rökt'];
      for (const method of methods) {
        if (titleLower.includes(method) && termLower.includes(method)) {
          score += 10;
        }
      }
      
      if (score > 0) {
        matches.push({ recipe, term, score });
      }
    }
  }
  
  // Sort by score descending and return best match
  matches.sort((a, b) => b.score - a.score);
  return matches.length > 0 && matches[0].score >= 15 ? matches[0].recipe : null;
}

function analyzeFilename(filename, recipes) {
  const base = path.basename(filename, path.extname(filename));
  const normalized = base.toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/img\s*\d+/g, '')
    .replace(/\d+/g, '')
    .trim();
  
  if (normalized.length < 3) return null;
  
  for (const recipe of recipes) {
    const titleLower = recipe.title.toLowerCase();
    if (titleLower.includes(normalized) || normalized.includes(titleLower)) {
      return recipe;
    }
    
    // Check individual words
    const words = normalized.split(/\s+/);
    const titleWords = titleLower.split(/\s+/);
    let matches = 0;
    
    for (const word of words) {
      if (word.length > 3) {
        for (const titleWord of titleWords) {
          if (titleWord.includes(word) || word.includes(titleWord)) {
            matches++;
          }
        }
      }
    }
    
    if (matches >= 2) return recipe;
  }
  
  return null;
}

async function main() {
  // 1) Get Basic slugs from mealPlans
  const mealPlansPath = path.resolve('app', 'data', 'mealPlans.ts');
  const text = await fsp.readFile(mealPlansPath, 'utf8');
  const start = text.indexOf('export const mealPlans');
  const end = text.indexOf('export const flowMealPlans');
  const basicBlock = start >= 0 && end > start ? text.slice(start, end) : text;
  const re = /\/kunskapsbank\/recept\/([a-z0-9\-]+)/g;
  let m; const basicSlugs = new Set();
  while ((m = re.exec(basicBlock))) basicSlugs.add(m[1]);

  // 2) Get Basic recipes without images
  let missingRecipes = await prisma.recipe.findMany({
    where: {
      slug: { in: [...basicSlugs] },
      AND: [{ imageUrl: null }, { imageMobileUrl: null }]
    },
    select: { id: true, title: true, slug: true }
  });

  console.log(`🎯 Ultra-flexible matching for ${missingRecipes.length} Basic recipes without images`);
  if (missingRecipes.length === 0) {
    console.log('🎉 All Basic recipes have images!');
    await prisma.$disconnect();
    return;
  }

  // List missing recipes
  console.log('\n📋 Missing recipes:');
  missingRecipes.forEach((r, i) => console.log(`${i + 1}. ${r.title}`));

  // 3) Process ALL image files with ultra-flexible matching
  const files = await fsp.readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`\n🔍 Checking ${imageFiles.length} image files with ultra-flexible matching`);

  let matched = 0;
  for (const file of imageFiles) {
    if (missingRecipes.length === 0) break;
    
    try {
      const fullPath = path.join(IMAGES_DIR, file);
      console.log(`\n📸 Processing: ${file}`);
      
      let recipe = null;
      
      // Strategy 1: Filename analysis first (fast)
      recipe = analyzeFilename(file, missingRecipes);
      if (recipe) {
        console.log(`📁 Filename match: ${recipe.title}`);
      } else {
        // Strategy 2: Vision analysis (slower but thorough)
        const descriptions = await describeImageUltraDetailed(fullPath);
        console.log(`👁️  Vision: ${descriptions.substring(0, 100)}...`);
        
        recipe = ultraFlexibleMatch(descriptions, missingRecipes);
        if (recipe) {
          console.log(`🎯 Vision match: ${recipe.title}`);
        }
      }
      
      if (!recipe) {
        console.log(`❌ No match found`);
        continue;
      }
      
      // Update DB
      const { width, height } = await getImageSize(fullPath);
      const ext = path.extname(file).toLowerCase();
      const base = slugify(recipe.title);
      const newName = (height >= width) ? `${base}-mobile${ext}` : `${base}${ext}`;
      const newPath = path.join(IMAGES_DIR, newName);

      if (newPath !== fullPath && !fs.existsSync(newPath)) {
        await fsp.rename(fullPath, newPath).catch(() => {});
        console.log(`📝 Renamed to: ${newName}`);
      }

      const imageUrl = `/Bilder_basic/${base}${ext}`;
      const imageMobileUrl = `/Bilder_basic/${base}-mobile${ext}`;
      const exists = async p => !!(await fsp.stat(path.join('public', p)).catch(() => null));

      const data = { imageAlt: recipe.title };
      if (await exists(imageUrl)) data.imageUrl = imageUrl;
      if (await exists(imageMobileUrl)) data.imageMobileUrl = imageMobileUrl;

      if (data.imageUrl || data.imageMobileUrl) {
        await prisma.recipe.update({ where: { id: recipe.id }, data });
        console.log(`✅ Updated: ${recipe.title}`);
        matched++;
        // Remove from missing list
        missingRecipes = missingRecipes.filter(r => r.id !== recipe.id);
      }
      
    } catch (e) {
      console.log(`💥 Error with ${file}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Ultra-flexible matching complete!`);
  console.log(`✅ Matched ${matched} more Basic recipes`);
  console.log(`📝 ${missingRecipes.length} Basic recipes still without images`);
  
  if (missingRecipes.length > 0) {
    console.log('\n🔍 Remaining recipes without images:');
    missingRecipes.forEach((r, i) => console.log(`${i + 1}. ${r.title} (${r.slug})`));
  }
  
  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 