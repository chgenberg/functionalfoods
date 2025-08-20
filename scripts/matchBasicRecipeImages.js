#!/usr/bin/env node

/**
 * Script: matchBasicRecipeImages.js
 * Purpose: Match images ONLY to Basic course recipes
 */

require('dotenv').config();
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

// Hardcoded API key for this run
const apiKey = 'REMOVED_FOR_SECURITY';
const openai = new OpenAI({ apiKey });

const IMAGES_DIR = path.resolve('public', 'Bilder_basic');

// Known Basic recipe patterns
const BASIC_RECIPE_PATTERNS = [
  'yoghurt', 'ketomüsli', 'bovetegranola', 'granola',
  'äggröra', 'omelett', 'stekt ägg', 'ägghack', 'kokt ägg',
  'smoothie', 'juice', 'bärmoothiebowl', 'smoothiebowl',
  'lax', 'torsk', 'tonfisk',
  'sallad', 'grekisk', 'waldorf',
  'köttfärs', 'köttbullar', 'hamburgare', 'biff',
  'kyckling', 'kycklinggryta', 'kycklingpizza',
  'soppa', 'nudelsoppa', 'morotssoppa',
  'wok', 'grönsaker',
  'keso', 'fetaost', 'halloumi',
  'mango', 'bär', 'frukt', 'hallon', 'blåbär',
  'chiafrögröt', 'chiapudding', 'havregrynsgröt',
  'macka', 'frallor'
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPortrait(width, height) { return height >= width; }

async function getImageSize(filePath) {
  try {
    const sharp = require('sharp');
    const meta = await sharp(filePath).metadata();
    return { width: meta.width || 0, height: meta.height || 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}

async function describeImage(filePath) {
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
            text: `Identifiera maträtten i bilden. Här är exempel på rätter från Basic-kursen:
- Yoghurt med ketomüsli eller bovetegranola
- Äggröra (med lax, paprika, fetaost)
- Omelett (med hallon, champinjoner, ost)
- Smoothie (grön, blåbär, hallon, mango, frukt)
- Lax (med waldorfsallad, fetaost, quinoa)
- Torsk (med olika tillbehör)
- Grekisk sallad
- Köttfärssås, köttfärsbiffar, hamburgare
- Kyckling (gryta, pizza, burgare, fylld aubergine)
- Bärmoothiebowl, smoothiebowl
- Mangoglass
- Juice (grön, rödbets, morot)
- Nudelsoppa med grönsaker
- Keso med hallon/granola/frukt
- Macka med ost
- Chiafrögröt

Svara med flera möjliga namn separerade med |` 
          },
          { type: 'input_image', image_url: `data:${mime};base64,${b64}` }
        ]
      }
    ],
  });
  
  return (resp.output_text || '').trim();
}

function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isLikelyBasicRecipe(title) {
  const titleLower = title.toLowerCase();
  return BASIC_RECIPE_PATTERNS.some(pattern => titleLower.includes(pattern));
}

async function main() {
  // 1) Get all recipes and filter for likely Basic recipes
  const allRecipes = await prisma.recipe.findMany({ 
    select: { id: true, title: true, slug: true } 
  });
  
  // Filter to only Basic-like recipes
  const basicRecipes = allRecipes.filter(r => isLikelyBasicRecipe(r.title));
  
  console.log(`Found ${basicRecipes.length} likely Basic recipes (out of ${allRecipes.length} total)`);

  // 2) Read images in folder
  const files = await fsp.readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  
  // Only process unmatched files
  const unprocessedFiles = imageFiles.filter(f => f.includes('IMG_'));
  
  console.log(`Processing ${unprocessedFiles.length} unmatched IMG files against Basic recipes`);

  for (const file of unprocessedFiles) {
    const fullPath = path.join(IMAGES_DIR, file);
    const { width, height } = await getImageSize(fullPath);

    // 4) Ask Vision for dish name
    let predictions = '';
    try {
      predictions = await describeImage(fullPath);
      console.log(`\nFile: ${file}`);
      console.log(`AI predictions: ${predictions}`);
    } catch (e) {
      console.warn('Vision failed for', file, e.message);
      continue;
    }

    const searchTerms = predictions.split('|').map(s => s.trim()).filter(s => s);
    
    // 5) Match ONLY against Basic recipes
    let bestMatch = null;
    let bestScore = Infinity;
    
    for (const recipe of basicRecipes) {
      for (const term of searchTerms) {
        const distance = levenshtein(term.toLowerCase(), recipe.title.toLowerCase());
        if (distance < bestScore) {
          bestMatch = recipe;
          bestScore = distance;
        }
      }
      
      // Also check partial matches
      const recipeLower = recipe.title.toLowerCase();
      for (const term of searchTerms) {
        const termLower = term.toLowerCase();
        if (recipeLower.includes(termLower) || termLower.includes(recipeLower)) {
          if (bestScore > 5) {
            bestMatch = recipe;
            bestScore = 5;
          }
        }
      }
    }

    // Accept matches up to 15 character differences for Basic
    if (!bestMatch || bestScore > 15) {
      console.log(`No Basic recipe match found for ${file} (best score: ${bestScore})`);
      continue;
    }

    console.log(`Matched to Basic recipe: ${bestMatch.title} (score: ${bestScore})`);

    // 6) Rename file to slug-based name
    const ext = path.extname(file).toLowerCase();
    const base = slugify(bestMatch.title);
    const newName = isPortrait(width, height) ? `${base}-mobile${ext}` : `${base}${ext}`;
    const newPath = path.join(IMAGES_DIR, newName);

    if (newPath !== fullPath && !fs.existsSync(newPath)) {
      await fsp.rename(fullPath, newPath).catch(() => {});
      console.log(`Renamed to: ${newName}`);
    }

    // 7) Update DB
    const imageUrl = `/Bilder_basic/${base}${ext}`;
    const imageMobileUrl = `/Bilder_basic/${base}-mobile${ext}`;

    const exists = async p => !!(await fsp.stat(path.join('public', p)).catch(() => null));

    const data = { imageAlt: bestMatch.title };
    if (await exists(imageUrl)) data.imageUrl = imageUrl;
    if (await exists(imageMobileUrl)) data.imageMobileUrl = imageMobileUrl;

    await prisma.recipe.update({ where: { id: bestMatch.id }, data });
    console.log('Updated Basic recipe:', bestMatch.title, data);
  }

  // Final report
  const remainingIMG = (await fsp.readdir(IMAGES_DIR)).filter(f => f.includes('IMG_')).length;
  console.log(`\n✅ Done! ${remainingIMG} IMG files could not be matched to Basic recipes.`);

  await prisma.$disconnect();
}

main().catch(async e => { 
  console.error(e); 
  await prisma.$disconnect(); 
  process.exit(1); 
}); 