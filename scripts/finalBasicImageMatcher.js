#!/usr/bin/env node

/**
 * Final Basic Image Matcher
 * Purpose: Match remaining images to Basic recipes using free-form Vision description + fuzzy matching
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

function levenshtein(a, b) {
  const an = a ? a.length : 0; const bn = b ? b.length : 0;
  if (an === 0) return bn; if (bn === 0) return an;
  const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[an][bn];
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

async function describeImageFreeform(filePath) {
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
            text: 'Beskriv maträtten i bilden på svenska. Ge flera alternativa namn separerade med | (pipe). Exempel: "Lax med grönsaker|Stekt lax|Laxfilé med tillbehör". Var generös med variationer.' 
          },
          { type: 'input_image', image_url: `data:${mime};base64,${b64}` }
        ]
      }
    ]
  });
  
  return (resp.output_text || '').trim();
}

function findBestMatch(descriptions, recipes) {
  const terms = descriptions.split('|').map(s => s.trim()).filter(s => s);
  let bestRecipe = null; let bestScore = Infinity;
  
  for (const recipe of recipes) {
    for (const term of terms) {
      // Try exact Levenshtein
      const score = levenshtein(term.toLowerCase(), recipe.title.toLowerCase());
      if (score < bestScore) { bestRecipe = recipe; bestScore = score; }
      
      // Try partial matches (bonus)
      const termLower = term.toLowerCase(); const titleLower = recipe.title.toLowerCase();
      if (titleLower.includes(termLower) || termLower.includes(titleLower)) {
        if (bestScore > 3) { bestRecipe = recipe; bestScore = 3; }
      }
      
      // Try word-by-word matches
      const termWords = termLower.split(/\s+/); const titleWords = titleLower.split(/\s+/);
      for (const tw of termWords) {
        for (const rw of titleWords) {
          if (tw.length > 3 && rw.length > 3 && (tw.includes(rw) || rw.includes(tw))) {
            if (bestScore > 5) { bestRecipe = recipe; bestScore = 5; }
          }
        }
      }
    }
  }
  
  return bestScore <= 15 ? bestRecipe : null; // Accept up to 15 char difference
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
  const missingRecipes = await prisma.recipe.findMany({
    where: {
      slug: { in: [...basicSlugs] },
      AND: [{ imageUrl: null }, { imageMobileUrl: null }]
    },
    select: { id: true, title: true, slug: true }
  });

  console.log(`Processing ${missingRecipes.length} Basic recipes without images`);
  if (missingRecipes.length === 0) {
    console.log('All Basic recipes have images!');
    await prisma.$disconnect();
    return;
  }

  // 3) Process ALL image files
  const files = await fsp.readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Checking ${imageFiles.length} image files`);

  let matched = 0;
  for (const file of imageFiles) {
    if (missingRecipes.length === 0) break;
    
    try {
      const fullPath = path.join(IMAGES_DIR, file);
      
      // Get Vision description
      const descriptions = await describeImageFreeform(fullPath);
      console.log(`\n${file}: ${descriptions}`);
      
      // Find best match among missing recipes
      const recipe = findBestMatch(descriptions, missingRecipes);
      if (!recipe) {
        console.log(`No match found`);
        continue;
      }
      
      console.log(`Matched to: ${recipe.title}`);
      
      // Rename and update DB
      const { width, height } = await getImageSize(fullPath);
      const ext = path.extname(file).toLowerCase();
      const base = slugify(recipe.title);
      const newName = (height >= width) ? `${base}-mobile${ext}` : `${base}${ext}`;
      const newPath = path.join(IMAGES_DIR, newName);

      if (newPath !== fullPath && !fs.existsSync(newPath)) {
        await fsp.rename(fullPath, newPath).catch(() => {});
        console.log(`Renamed to: ${newName}`);
      }

      const imageUrl = `/Bilder_basic/${base}${ext}`;
      const imageMobileUrl = `/Bilder_basic/${base}-mobile${ext}`;
      const exists = async p => !!(await fsp.stat(path.join('public', p)).catch(() => null));

      const data = { imageAlt: recipe.title };
      if (await exists(imageUrl)) data.imageUrl = imageUrl;
      if (await exists(imageMobileUrl)) data.imageMobileUrl = imageMobileUrl;

      if (data.imageUrl || data.imageMobileUrl) {
        await prisma.recipe.update({ where: { id: recipe.id }, data });
        console.log('✅ Updated:', recipe.title);
        matched++;
        // Remove from missing list
        const idx = missingRecipes.findIndex(r => r.id === recipe.id);
        if (idx >= 0) missingRecipes.splice(idx, 1);
      }
      
    } catch (e) {
      console.log(`Error with ${file}:`, e.message);
    }
  }

  console.log(`\n🎉 Matched ${matched} more Basic recipes with images!`);
  console.log(`📝 ${missingRecipes.length} Basic recipes still without images`);
  
  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 