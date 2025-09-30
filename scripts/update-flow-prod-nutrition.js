// Update Flow recipe nutrition in PRODUCTION DB via API
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const PROD_BASE = 'https://ulrika-functional-foods-production.up.railway.app';

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

const SECTION_HEADERS = ['Ingredienser','Gör så här','Utvalda råvaror','Näringsvärden'];
const MEAL_TYPES = ['Frukost','Lunch','Middag','Mellanmål','Efterrätt','Egenbakat'];

function isHeader(line){
  const l = normalize(line);
  if (!l) return true;
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
    while (i < lines.length && isHeader(lines[i])) i++;
    if (i >= lines.length) break;
    const title = lines[i++];
    let time = '', mealType = '', servings = 0;
    while (i < lines.length && !/^Ingredienser$/i.test(lines[i]) && !(!isHeader(lines[i]) && !/minut|tim|portion/i.test(lines[i]))){
      const l = lines[i];
      if (/minut|tim/i.test(l)) time = l; else
      if (MEAL_TYPES.some(t => new RegExp(`^${t}$`,'i').test(l))) mealType = l; else
      if (/portion/i.test(l)) servings = parseNumber(l) || servings;
      i++;
    }
    if (i >= lines.length || !/^Ingredienser$/i.test(lines[i])) continue;
    i++;
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
    recipes.push({ title, servings: servings || 1, ingredients, steps, nutrition });
  }
  return recipes;
}

async function loadFlowManualInputs(){
  const dir = path.join(process.cwd(), 'public','Shopping-lists');
  const files = (await fs.readdir(dir)).filter(f=>/flow_week.*manual_input\.txt$/i.test(f));
  const all = [];
  for (const f of files){
    const txt = await fs.readFile(path.join(dir, f), 'utf8');
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
  const records = await loadFlowManualInputs();
  console.log(`Found ${records.length} Flow recipes from manual_input files`);
  
  let updated = 0, missing = 0, errors = 0;

  for (const rec of records){
    const recipe = await findRecipeByTitle(rec.title);
    if (!recipe){ 
      missing++; 
      continue; 
    }

    try {
      // Fetch current recipe from production
      const getRes = await fetch(`${PROD_BASE}/api/recipes/${recipe.slug}`);
      if (!getRes.ok) {
        console.log(`❌ GET failed for ${recipe.slug}`);
        errors++;
        continue;
      }
      const current = await getRes.json();

      // Build update body
      const body = {
        title: current.title,
        excerpt: current.excerpt,
        description: current.content,
        image: current.imageUrl,
        imageAlt: current.imageAlt,
        category: current.categories && current.categories[0],
        categories: current.categories,
        ingredients: rec.ingredients && rec.ingredients.length > 0 ? rec.ingredients : current.ingredients,
        instructions: rec.steps && rec.steps.length > 0 ? rec.steps : (Array.isArray(current.instructions) ? current.instructions : current.instructions?.split('\n') || []),
        difficulty: current.difficulty,
        prepTime: current.prepTime,
        cookTime: current.cookTime,
        totalTime: current.totalTime,
        servings: rec.servings || current.servings || 1,
        nutritionInfo: {
          perServing: {
            energy: rec.nutrition.energy || null,
            protein: rec.nutrition.protein || null,
            carbohydrates: rec.nutrition.carbohydrates || null,
            fat: rec.nutrition.fat || null,
            fiber: rec.nutrition.fiber || null
          }
        },
        tips: current.tips,
        tags: current.tags,
        published: current.status !== 'DRAFT'
      };

      const putRes = await fetch(`${PROD_BASE}/api/recipes/${recipe.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (putRes.ok) {
        updated++;
        if (updated % 10 === 0) console.log(`Progress: ${updated}/${records.length}`);
      } else {
        console.log(`❌ PUT failed for ${recipe.slug}: ${putRes.status}`);
        errors++;
      }
    } catch (e) {
      console.log(`❌ Error updating ${recipe.slug}:`, e.message);
      errors++;
    }
  }

  console.log(`✅ Updated: ${updated}, Missing: ${missing}, Errors: ${errors}`);
}

run()
  .catch(e=>{ console.error(e); process.exit(1); })
  .finally(async ()=>{ await prisma.$disconnect(); });
