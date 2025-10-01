const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeTitle(s){
  return (s||'')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[åä]/g,'a')
    .replace(/[ö]/g,'o')
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function collectCourseSlugs(){
  const files = [
    path.join(process.cwd(), 'app/data/mealPlans.ts'),
    path.join(process.cwd(), 'scripts/updated_mealPlans.ts')
  ];
  const slugs = new Set();
  const slugRe = /recipeLink\s*:\s*["'`](.*?)["'`]/g;
  for (const f of files){
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = slugRe.exec(txt))){
      const link = m[1];
      const x = link.replace(/^https?:\/\/[^/]+/, '');
      const m2 = x.match(/\/kunskapsbank\/recept\/([^"'`\s?]+)/);
      if (m2 && m2[1]) slugs.add(decodeURIComponent(m2[1]));
    }
  }
  return slugs;
}

async function run(){
  try {
    const keepSlugs = collectCourseSlugs();
    console.log(`📚 Course slugs collected: ${keepSlugs.size}`);

    const recipes = await prisma.recipe.findMany({ select: { id:true, title:true, slug:true, isFree:true, isPremium:true, tags:true } });
    const groups = new Map();
    for (const r of recipes){
      const key = normalizeTitle(r.title);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }

    let deleteIds = [];
    let protectedCount = 0;
    let dupGroups = 0;

    for (const [key, arr] of groups.entries()){
      if (arr.length <= 1) continue;
      dupGroups++;
      // Determine which items to keep
      const keep = [];
      const candidates = [];
      for (const r of arr){
        const taggedCourse = Array.isArray(r.tags) && r.tags.some(t => ['Basic','Flow','Energy'].includes(t));
        const inCourse = keepSlugs.has(r.slug) || taggedCourse || r.isFree === false;
        if (inCourse) keep.push(r);
        else candidates.push(r);
      }
      if (keep.length === 0){
        // Safety: don't delete if we can't identify a course version
        protectedCount++;
        continue;
      }
      // Prefer to delete only free candidates
      for (const r of candidates){
        if (r.isFree === true){
          deleteIds.push(r.id);
        }
      }
    }

    console.log(`🔎 Duplicate groups: ${dupGroups}`);
    console.log(`🛡️ Groups skipped (no course version detected): ${protectedCount}`);
    console.log(`🗑️ Recipes to delete (free duplicates): ${deleteIds.length}`);

    // Print a sample of planned deletions
    if (deleteIds.length > 0){
      const sample = await prisma.recipe.findMany({ where: { id: { in: deleteIds.slice(0, 20) } }, select: { id:true, title:true, slug:true } });
      console.log('\nExamples to delete:');
      for (const r of sample){
        console.log(` - ${r.title} (${r.slug}) [${r.id}]`);
      }
    }

    // Execute deletions
    if (deleteIds.length > 0){
      const res = await prisma.recipe.deleteMany({ where: { id: { in: deleteIds } } });
      console.log(`\n✅ Deleted ${res.count} free duplicate recipes. Courses untouched.`);
    } else {
      console.log('\nNothing to delete.');
    }
  } catch (e){
    console.error('❌ Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
