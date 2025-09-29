const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function candidatePathsForSlug(slug) {
  return [
    `/recept_images_vision_optimized/${slug}-card.webp`,
    `/recept_images_vision_optimized/${slug}-detail.webp`,
    `/recept_images_vision_optimized/${slug}-thumb.webp`,
    `/recept_images_optimized/${slug}-card-large.webp`,
    `/recept_images_optimized/${slug}-card-medium.webp`,
    `/recept_images_optimized/${slug}-detail-large.webp`,
    `/recept_images_optimized/${slug}-detail-medium.webp`,
    `/recept_images_optimized/${slug}-large.webp`,
    `/recept_images_optimized/${slug}-medium.webp`,
    `/recept_images_optimized/${slug}-small.webp`,
  ];
}

function fileExistsPublic(rel) {
  const abs = path.join(process.cwd(), 'public', rel.replace(/^\//, ''));
  return fs.existsSync(abs);
}

function normalizeSwedish(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function listAvailableBaseNames() {
  const roots = [
    path.join(process.cwd(), 'public', 'recept_images_vision_optimized'),
    path.join(process.cwd(), 'public', 'recept_images_optimized'),
    path.join(process.cwd(), 'public', 'recept_images_2025'),
  ];
  const names = new Set();
  for (const dir of roots) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^(.*?)(?:-(?:card|detail|thumb).+)?\.(?:webp|jpg|jpeg|png)$/i) || f.match(/^(.*)\.(?:webp|jpg|jpeg|png)$/i);
      if (m) {
        names.add(m[1].toLowerCase());
      }
    }
  }
  return Array.from(names);
}

function fuzzyFindByTitle(title, baseNames) {
  const n = normalizeSwedish(title).replace(/\s+/g, '-');
  // exact slugified match
  if (baseNames.includes(n)) return n;
  // contains
  for (const b of baseNames) if (b.includes(n)) return b;
  // word-based
  const words = n.split('-').filter(w => w.length > 3);
  if (words.length) {
    for (const b of baseNames) {
      const matched = words.filter(w => b.includes(w));
      if (matched.length >= Math.max(2, Math.ceil(words.length * 0.75))) return b;
    }
  }
  return null;
}

function bestImageForSlugOrTitle(slug, title, baseNames) {
  // Try slug candidates first
  for (const rel of candidatePathsForSlug(slug)) {
    if (fileExistsPublic(rel)) return rel;
  }
  // Fuzzy by title -> base name, then prefer vision/optimized
  const b = fuzzyFindByTitle(title, baseNames);
  if (b) {
    const tries = [
      `/recept_images_vision_optimized/${b}-card.webp`,
      `/recept_images_optimized/${b}-card-large.webp`,
      `/recept_images_optimized/${b}-card-medium.webp`,
      `/recept_images_2025/${b}.jpg`,
      `/recept_images_2025/${b}.jpeg`,
      `/recept_images_2025/${b}.png`,
    ];
    for (const rel of tries) if (fileExistsPublic(rel)) return rel;
  }
  return null;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const baseNames = listAvailableBaseNames();
    const recipes = await prisma.recipe.findMany({ select: { id: true, slug: true, title: true } });
    let updated = 0, missing = 0;
    for (const r of recipes) {
      const img = bestImageForSlugOrTitle(r.slug, r.title, baseNames);
      if (!img) { missing++; continue; }
      const res = await prisma.recipe.updateMany({ where: { id: r.id }, data: { imageUrl: img } });
      if (res.count > 0) updated += res.count;
    }
    console.log(`Updated images: ${updated}, Missing images: ${missing}`);
  } catch (e) {
    console.error('Failed setting images for all recipes:', e);
    process.exitCode = 1;
  }
}

main();


