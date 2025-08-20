#!/usr/bin/env node

/**
 * Script: matchRecipeImagesWithVision.js
 * Purpose: Auto-match images in public/Bilder_basic to recipes using GPT Vision,
 *          rename files to recipe slugs, and update Prisma Recipe.imageUrl and imageMobileUrl.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  // Lightweight size check using sharp if available, otherwise fallback to suffix heuristics
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
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Identify the Swedish recipe dish name in this image. Respond with only the dish name, no extra text.' },
          { type: 'image_url', image_url: `data:image/jpeg;base64,${b64}` }
        ]
      }
    ],
    temperature: 0.2,
  });
  return res.choices[0].message.content.trim();
}

function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn; if (bn === 0) return an;
  const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing');
    process.exit(1);
  }

  // 1) Read all recipes
  const recipes = await prisma.recipe.findMany({ select: { id: true, title: true, slug: true } });

  // 2) Read images in folder
  const files = await fsp.readdir(IMAGES_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

  for (const file of imageFiles) {
    const fullPath = path.join(IMAGES_DIR, file);
    const { width, height } = await getImageSize(fullPath);

    // 3) Ask Vision to suggest dish name
    let predicted = '';
    try {
      predicted = await describeImage(fullPath);
    } catch (e) {
      console.warn('Vision failed for', file, e.message);
      continue;
    }

    // 4) Fuzzy match to recipe title
    let best = null;
    let bestScore = Infinity;
    for (const r of recipes) {
      const d = levenshtein(predicted.toLowerCase(), r.title.toLowerCase());
      if (d < bestScore) { best = r; bestScore = d; }
    }

    if (!best || bestScore > 10) { // threshold safeguard
      console.warn('No close match for', file, 'predicted:', predicted);
      continue;
    }

    // 5) Rename file to slug-based name and decide mobile/desktop
    const ext = path.extname(file).toLowerCase();
    const base = slugify(best.title);
    const newName = isPortrait(width, height) ? `${base}-mobile${ext}` : `${base}${ext}`;
    const newPath = path.join(IMAGES_DIR, newName);

    if (newPath !== fullPath) {
      await fsp.rename(fullPath, newPath).catch(() => {});
    }

    // 6) Update DB fields
    const imageUrl = `/Bilder_basic/${base}${ext}`;
    const imageMobileUrl = `/Bilder_basic/${base}-mobile${ext}`;

    // Only set fields that correspond to existing files
    const exists = async p => !!(await fsp.stat(path.join('public', p)).catch(() => null));

    const data = { imageAlt: best.title };
    if (await exists(imageUrl)) data.imageUrl = imageUrl;
    if (await exists(imageMobileUrl)) data.imageMobileUrl = imageMobileUrl;

    await prisma.recipe.update({ where: { id: best.id }, data });
    console.log('Updated', best.title, data);
  }

  await prisma.$disconnect();
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); }); 