const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

function slugToOptimized(slug, size='medium', usage='card'){
  const vision = path.join(process.cwd(), 'public','recept_images_vision_optimized', `${slug}-${usage}.webp`);
  if (fs.existsSync(vision)) return `/api/images/recept_images_vision_optimized/${slug}-${usage}.webp`;
  const format = usage==='detail' ? `detail-${size}` : usage==='thumb' ? `thumb-${size}` : `card-${size}`;
  const optimized = path.join(process.cwd(), 'public','recept_images_optimized', `${slug}-${format}.webp`);
  if (fs.existsSync(optimized)) return `/api/images/recept_images_optimized/${slug}-${format}.webp`;
  return null;
}

async function extractMealPlanSlugs(){
  const file = path.join(process.cwd(), 'app','data','mealPlans.ts');
  const src = await fsp.readFile(file,'utf8');
  const rx = /"recipeLink"\s*:\s*"(\/kunskapsbank\/recept\/[^"?]+)"/g;
  const slugs = new Set();
  let m;
  while((m=rx.exec(src))){
    const link = m[1];
    const s = link.split('/').pop();
    if (s) slugs.add(s);
  }
  return Array.from(slugs);
}

async function run(){
  try{
    const slugs = await extractMealPlanSlugs();
    const recipes = await prisma.recipe.findMany({ where:{ slug: { in: slugs } }, select:{ slug:true, title:true, imageUrl:true }});
    const bySlug = new Map(recipes.map(r=>[r.slug, r]));

    let ok=0, warn=0, missing=0; const samples=[];
    for(const s of slugs){
      const r = bySlug.get(s);
      if (!r){ missing++; samples.push({ slug:s, issue:'missing in DB' }); continue; }
      const dbUrl = r.imageUrl ? (r.imageUrl.startsWith('/')? r.imageUrl : `/${r.imageUrl}`) : null;
      const optimized = slugToOptimized(s);
      if (dbUrl || optimized){ ok++; } else { warn++; samples.push({ slug:s, title:r.title, issue:'no optimized file and no DB image' }); }
    }

    console.log(JSON.stringify({ summary:{ total: slugs.length, ok, warn, missing }, examples: samples.slice(0,15) }, null, 2));
  }catch(e){
    console.error('verify failed:', e);
  }finally{ await prisma.$disconnect(); }
}

run();
