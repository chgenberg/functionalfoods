const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function loadMealPlans() {
  const file = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
  const src = fs.readFileSync(file, 'utf8');
  const js = src
    .replace(/export interface[\s\S]*?\}\n/g, '')
    .replace(/export function[\s\S]*?\}\n/g, '')
    .replace(/export const flowMealPlans:[\s\S]*/g, '')
    .replace(/export const energyMealPlans:[\s\S]*/g, '')
    .replace(/export const mealPlans:[\s\S]*?=\s*/, 'module.exports = ');
  const tmp = path.join(process.cwd(), 'public', '__basicMealPlans_img_tmp.js');
  fs.writeFileSync(tmp, js, 'utf8');
  const mealPlans = require(tmp).mealPlans || require(tmp);
  fs.unlinkSync(tmp);
  return mealPlans;
}

function candidatePathsForSlug(slug) {
  return [
    `/recept_images_vision_optimized/${slug}-card.webp`,
    `/recept_images_vision_optimized/${slug}-detail.webp`,
    `/recept_images_vision_optimized/${slug}-thumb.webp`,
    `/recept_images_optimized/${slug}-card-large.webp`,
    `/recept_images_optimized/${slug}-detail-large.webp`,
    `/recept_images_optimized/${slug}-large.webp`,
    `/recept_images_optimized/${slug}-card-medium.webp`,
    `/recept_images_optimized/${slug}-medium.webp`,
    `/recept_images_optimized/${slug}-small.webp`
  ];
}

function fileExistsPublic(rel) {
  const abs = path.join(process.cwd(), 'public', rel.replace(/^\//, ''));
  return fs.existsSync(abs);
}

function bestImageForSlug(slug) {
  const candidates = candidatePathsForSlug(slug);
  for (const rel of candidates) {
    if (fileExistsPublic(rel)) return rel;
  }
  return null;
}

function slugFromLink(link) {
  if (!link) return null;
  try {
    const u = new URL(link, 'https://example.com');
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const plans = loadMealPlans();
    const slugs = new Set();
    for (let w = 1; w <= 6; w++) {
      const week = plans[`week${w}`];
      if (!week || !week.days) continue;
      const days = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
      for (const d of days) {
        const day = week.days[d] || week.days[`day${days.indexOf(d)+1}`];
        if (!day) continue;
        [day.breakfast, day.lunch, day.dinner, day.snack, day.dessert]
          .filter(Boolean)
          .forEach(m => {
            const s = slugFromLink(m.recipeLink);
            if (s) slugs.add(s);
          });
      }
    }

    let updated = 0, missingFile = 0, missingRecipe = 0;
    for (const slug of slugs) {
      const img = bestImageForSlug(slug);
      if (!img) { missingFile++; continue; }
      const res = await prisma.recipe.updateMany({ where: { slug }, data: { imageUrl: img } });
      if (res.count > 0) updated += res.count;
    }
    console.log(`Images set: ${updated}, missing files: ${missingFile}, missing recipes updated via updateMany are ignored by count`);
  } catch (e) {
    console.error('Failed to set Basic images:', e);
    process.exitCode = 1;
  }
}

main();


