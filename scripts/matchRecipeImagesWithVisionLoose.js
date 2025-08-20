#!/usr/bin/env node

/**
 * Script: matchRecipeImagesWithVisionLoose.js
 * Purpose: More flexible matching of images to recipes using GPT Vision
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

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPortrait(width, height) { return height >= width; }
function isLandscape(width, height) { return width > height; }

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
            text: `Identifiera maträtten i bilden. Svara med FLERA möjliga namn på svenska, separerade med | (pipe).
Exempel: "Lax med grönsaker|Stekt lax|Laxfilé med tillbehör"
Om det är en smoothie eller juice, beskriv färgen.
Om det är en sallad, nämn huvudingredienserna.
Var generös med alternativa namn.` 
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

// Helper function to find partial matches
function findPartialMatch(searchTerms, recipeTitle) {
  const recipeLower = recipeTitle.toLowerCase();
  
  // Check if any search term is contained in recipe title
  for (const term of searchTerms) {
    const termLower = term.toLowerCase().trim();
    if (termLower && (
      recipeLower.includes(termLower) || 
      termLower.includes(recipeLower) ||
      // Check individual words
      termLower.split(' ').some(word => word.length > 3 && recipeLower.includes(word)) ||
      recipeLower.split(' ').some(word => word.length > 3 && termLower.includes(word))
    )) {
      return true;
    }
  }
  return false;
}

async function main() {
  // 1) Read all recipes
  const recipes = await prisma.recipe.findMany({ 
    select: { id: true, title: true, slug: true } 
  });
  
  console.log(`Found ${recipes.length} recipes in database`);

  // 2) Read images in folder
  const files = await fsp.readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  
  console.log(`Found ${imageFiles.length} image files to process`);
  
  // Only process unmatched IMG files and files with full names
  const unprocessedFiles = imageFiles.filter(f => 
    f.includes('IMG_') || 
    f.includes('Ägghack') || 
    f.includes('Quinoasallad') ||
    f.includes('Lax med fetaost') ||
    f.includes('Mangoglass') ||
    f.includes('Het kycklinggryta')
  );
  
  console.log(`Processing ${unprocessedFiles.length} unmatched files`);

  for (const file of unprocessedFiles) {
    const fullPath = path.join(IMAGES_DIR, file);
    const { width, height } = await getImageSize(fullPath);

    // 3) Ask Vision for multiple possible dish names
    let predictions = '';
    try {
      predictions = await describeImage(fullPath);
      console.log(`\nFile: ${file}`);
      console.log(`AI predictions: ${predictions}`);
    } catch (e) {
      console.warn('Vision failed for', file, e.message);
      continue;
    }

    // Split predictions by pipe
    const searchTerms = predictions.split('|').map(s => s.trim()).filter(s => s);
    
    // 4) Try to match with multiple strategies
    let bestMatch = null;
    let bestScore = Infinity;
    
    for (const recipe of recipes) {
      // Strategy 1: Exact Levenshtein matching (more lenient threshold)
      for (const term of searchTerms) {
        const distance = levenshtein(term.toLowerCase(), recipe.title.toLowerCase());
        if (distance < bestScore) {
          bestMatch = recipe;
          bestScore = distance;
        }
      }
      
      // Strategy 2: Partial word matching
      if (findPartialMatch(searchTerms, recipe.title)) {
        // Give bonus to partial matches
        const avgDistance = searchTerms.reduce((sum, term) => 
          sum + levenshtein(term.toLowerCase(), recipe.title.toLowerCase()), 0
        ) / searchTerms.length;
        
        if (avgDistance - 5 < bestScore) { // Bonus of 5 for partial matches
          bestMatch = recipe;
          bestScore = avgDistance - 5;
        }
      }
    }

    // More lenient threshold - accept matches up to 20 character differences
    if (!bestMatch || bestScore > 20) {
      console.log(`No match found for ${file} (best score: ${bestScore})`);
      continue;
    }

    console.log(`Matched to: ${bestMatch.title} (score: ${bestScore})`);

    // 5) Rename file to slug-based name
    const ext = path.extname(file).toLowerCase();
    const base = slugify(bestMatch.title);
    const newName = isPortrait(width, height) ? `${base}-mobile${ext}` : `${base}${ext}`;
    const newPath = path.join(IMAGES_DIR, newName);

    if (newPath !== fullPath && !fs.existsSync(newPath)) {
      await fsp.rename(fullPath, newPath).catch(() => {});
      console.log(`Renamed to: ${newName}`);
    }

    // 6) Update DB fields
    const imageUrl = `/Bilder_basic/${base}${ext}`;
    const imageMobileUrl = `/Bilder_basic/${base}-mobile${ext}`;

    // Only set fields that correspond to existing files
    const exists = async p => !!(await fsp.stat(path.join('public', p)).catch(() => null));

    const data = { imageAlt: bestMatch.title };
    if (await exists(imageUrl)) data.imageUrl = imageUrl;
    if (await exists(imageMobileUrl)) data.imageMobileUrl = imageMobileUrl;

    await prisma.recipe.update({ where: { id: bestMatch.id }, data });
    console.log('Updated recipe:', bestMatch.title, data);
  }

  await prisma.$disconnect();
  console.log('\nDone!');
}

main().catch(async e => { 
  console.error(e); 
  await prisma.$disconnect(); 
  process.exit(1); 
}); 