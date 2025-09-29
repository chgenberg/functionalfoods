const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
  const js = src
    .replace(/export interface[\s\S]*?\}\n/g, '')
    .replace(/export function[\s\S]*?\}\n/g, '')
    .replace(/export const flowMealPlans:[\s\S]*/g, '')
    .replace(/export const energyMealPlans:[\s\S]*/g, '')
    .replace(/export const mealPlans:[\s\S]*?=\s*/, 'module.exports = ');
  const tmp = path.join(process.cwd(), 'public', '__basicMealPlans_tmp.js');
  fs.writeFileSync(tmp, js, 'utf8');
  const mealPlans = require(tmp).mealPlans || require(tmp);
  fs.unlinkSync(tmp);
  return mealPlans;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const plans = loadMealPlans();
    const counts = new Map();

    for (let w = 1; w <= 6; w++) {
      const week = plans[`week${w}`];
      if (!week || !week.days) continue;
      const days = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
      for (const d of days) {
        const day = week.days[d] || week.days[`day${days.indexOf(d)+1}`];
        if (!day) continue;
        const meals = [day.breakfast, day.lunch, day.dinner, day.snack, day.dessert].filter(Boolean);
        for (const meal of meals) {
          const slug = slugFromLink(meal.recipeLink);
          if (!slug) continue;
          counts.set(slug, (counts.get(slug) || 0) + 1);
        }
      }
    }

    let updated = 0;
    for (const [slug, count] of counts.entries()) {
      const servings = count > 1 ? count : 1;
      const res = await prisma.recipe.updateMany({ where: { slug }, data: { servings } });
      if (res.count > 0) updated += res.count;
    }

    console.log(`Updated servings for ${updated} recipe records based on Basic meal plan usage counts.`);
  } catch (e) {
    console.error('Failed to set servings from Basics meal plans:', e);
    process.exitCode = 1;
  }
}

main();


