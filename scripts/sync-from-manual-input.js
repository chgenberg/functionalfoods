const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

function normalize(s){
  return (s || '').replace(/\u00A0/g,' ').replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
}

function stripDiacritics(s){
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseNumber(line){
  if (!line) return null;
  const m = String(line).match(/([\d,.]+)/);
  if (!m) return null;
  return parseFloat(m[1].replace(',', '.'));
}

const DAY_NAMES = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
const SECTION_HEADERS = ['Ingredienser','Gör så här','Utvalda råvaror','Näringsvärden'];
const MEAL_TYPES = ['Frukost','Lunch','Middag','Mellanmål','Efterrätt'];

function isHeader(line){
  const l = normalize(line);
  if (!l) return true;
  if (DAY_NAMES.includes(l)) return true;
  if (/^Kostschema vecka/i.test(l)) return true;
  if (SECTION_HEADERS.some(h => new RegExp(`^${h}$`,'i').test(l))) return true;
  if (/minut|tim/i.test(l)) return true;
  if (/portion/i.test(l)) return true;
  if (MEAL_TYPES.some(t => new RegExp(`^${t}$`,'i').test(l))) return true;
  if (/^Energi:|^Fett:|^Protein:|^Kolhydrater:|^Fiber:/i.test(l)) return true;
  if (l.startsWith('*')) return true;
  return false;
}

function scanRecipes(text){
  const lines = text.split(/\r?\n/).map(normalize).filter(Boolean);
  const recipes = [];
  let i = 0;
  while (i < lines.length){
    // Find a plausible title: a non-header standalone line
    while (i < lines.length && isHeader(lines[i])) i++;
    if (i >= lines.length) break;
    const title = lines[i++];
    // Collect meta in any order until we hit 'Ingredienser' or next title
    let time = '', mealType = '', servings = 0;
    while (i < lines.length && !/^Ingredienser$/i.test(lines[i]) && !(!isHeader(lines[i]) && !/minut|tim|portion/i.test(lines[i]))){
      const l = lines[i];
      if (/minut|tim/i.test(l)) time = l; else
      if (MEAL_TYPES.some(t => new RegExp(`^${t}$`,'i').test(l))) mealType = l; else
      if (/portion/i.test(l)) servings = parseNumber(l) || servings;
      i++;
    }
    if (i >= lines.length || !/^Ingredienser$/i.test(lines[i])){
      // Not a valid block; skip this title
      continue;
    }
    i++; // after Ingredienser
    const ingredients = [];
    while (i < lines.length && !/^Gör så här$/i.test(lines[i])){
      const l = lines[i];
      if (l.startsWith('*')) ingredients.push(l.replace(/^\*\s*/, ''));
      i++;
    }
    const steps = [];
    if (i < lines.length && /^Gör så här$/i.test(lines[i])){
      i++;
      while (i < lines.length && !/^Utvalda råvaror$/i.test(lines[i]) && !/^Näringsvärden$/i.test(lines[i]) && isHeader(lines[i])){
        const l = lines[i];
        if (l.startsWith('*')) steps.push(l.replace(/^\*\s*/, ''));
        i++;
      }
    }
    // Skip optional utvalda råvaror
    if (i < lines.length && /^Utvalda råvaror$/i.test(lines[i])){
      i++;
      while (i < lines.length && !/^Näringsvärden$/i.test(lines[i])) i++;
    }
    const nutrition = { energy:null, protein:null, carbohydrates:null, fat:null, fiber:null };
    if (i < lines.length && /^Näringsvärden$/i.test(lines[i])){
      i++;
      while (i < lines.length && isHeader(lines[i])){
        const l = lines[i];
        if (/Energi/i.test(l)) nutrition.energy = parseNumber(l);
        else if (/Kolhydrater/i.test(l)) nutrition.carbohydrates = parseNumber(l);
        else if (/Fett/i.test(l)) nutrition.fat = parseNumber(l);
        else if (/Protein/i.test(l)) nutrition.protein = parseNumber(l);
        else if (/Fiber/i.test(l)) nutrition.fiber = parseNumber(l);
        i++;
      }
    }
    recipes.push({ title, time, mealType, servings: servings || 1, ingredients, steps, nutrition });
  }
  return recipes;
}

async function loadAllManualInputs(){
  const dir = path.join(process.cwd(), 'public','Shopping-lists');
  const files = (await fsp.readdir(dir)).filter(f=>/manual_input\.txt$/i.test(f));
  const all = [];
  for (const f of files){
    const txt = await fsp.readFile(path.join(dir, f), 'utf8');
    const recs = scanRecipes(txt);
    for (const r of recs){ all.push({ file:f, ...r }); }
  }
  return all;
}

async function findRecipeByTitle(title){
  const t = normalize(title);
  let r = await prisma.recipe.findFirst({ where:{ title: t } });
  if (r) return r;
  const all = await prisma.recipe.findMany({ select:{ id:true, title:true, slug:true }});
  const norm = stripDiacritics(t.toLowerCase());
  r = all.find(x => stripDiacritics(x.title.toLowerCase()) === norm);
  return r || null;
}

async function run(){
  const apply = process.argv.includes('--apply');
  const records = await loadAllManualInputs();
  const report = { total: records.length, updated: 0, missing: [], changed: [] };

  for (const rec of records){
    const recipe = await findRecipeByTitle(rec.title);
    if (!recipe){ report.missing.push({ title: rec.title, file: rec.file }); continue; }

    const perServing = {
      energy: rec.nutrition.energy || null,
      protein: rec.nutrition.protein || null,
      carbohydrates: rec.nutrition.carbohydrates || null,
      fat: rec.nutrition.fat || null,
      fiber: rec.nutrition.fiber || null
    };

    const newData = {
      servings: rec.servings || recipe.servings || 1,
      ingredients: rec.ingredients && rec.ingredients.length > 0 ? rec.ingredients : recipe.ingredients,
      instructions: rec.steps && rec.steps.length > 0 ? rec.steps.join('\n') : recipe.instructions,
      nutrition: { perServing }
    };

    report.changed.push({ title: recipe.title, slug: recipe.slug, from:{ servings: recipe.servings }, to:{ servings: newData.servings } });

    if (apply){
      await prisma.recipe.update({ where:{ id: recipe.id }, data: newData });
      report.updated++;
    }
  }

  console.log(JSON.stringify(report, null, 2));
}

run().catch(async e=>{ console.error(e); await prisma.$disconnect(); process.exit(1); }).finally(async ()=>{ await prisma.$disconnect(); });
