// reconcile-basic-nutrition.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function normalizeTitle(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function loadMealPlans() {
  const file = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
  const src = fs.readFileSync(file, 'utf8');
  const jsonLike = src
    .replace(/export interface[\s\S]*?\}/g, '')
    .replace(/export const mealPlans:[\s\S]*?=\s*/, 'module.exports = ')
    .replace(/export const flowMealPlans:[\s\S]*/g, '');
  const tmp = path.join(process.cwd(), 'public', '__mealPlans_tmp.js');
  fs.writeFileSync(tmp, jsonLike, 'utf8');
  const mealPlans = require(tmp).mealPlans || require(tmp);
  fs.unlinkSync(tmp);
  return mealPlans;
}

function loadManualWeek(week) {
  const file = path.join(process.cwd(), 'public', 'Shopping-lists', `basic_week${week}_manual_parsed.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const mealPlans = loadMealPlans();
    const slugToNutrition = {};

    for (let w = 1; w <= 6; w++) {
      const week = mealPlans[`week${w}`];
      if (!week || !week.days) continue;
      const manual = loadManualWeek(w);
      const idx = manual.map(m => ({ key: normalizeTitle(m.title), m }));

      const days = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
      for (const d of days) {
        const day = week.days[d] || week.days[`day${days.indexOf(d)+1}`];
        if (!day) continue;
        const meals = [day.breakfast, day.lunch, day.dinner, day.snack, day.dessert].filter(Boolean);
        for (const meal of meals) {
          const slug = slugFromLink(meal.recipeLink);
          if (!slug) continue;
          const key = normalizeTitle(meal.name.replace(/\s*\(rester\).*/i, ''));
          let match = idx.find(x => x.key === key)?.m;
          if (!match) continue;
          const n = match.nutrition || {};
          slugToNutrition[slug] = {
            perServing: {
              energy: Number(n.calories || n.energy || 0),
              protein: Number(n.protein || 0),
              carbohydrates: Number(n.carbohydrates || 0),
              fat: Number(n.fat || 0),
              fiber: Number(n.fiber || 0)
            }
          };
        }
      }
    }

    let updated = 0, missing = 0;
    for (const [slug, nutrition] of Object.entries(slugToNutrition)) {
      const recipe = await prisma.recipe.findUnique({ where: { slug } });
      if (!recipe) { missing++; continue; }
      await prisma.recipe.update({ where: { slug }, data: { nutrition } });
      updated++;
    }

    console.log(`Updated: ${updated}, Missing recipes: ${missing}`);
  } catch (e) {
    console.error('Reconcile failed:', e);
    process.exitCode = 1;
  }
}

main();
