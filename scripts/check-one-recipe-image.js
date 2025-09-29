const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

function slugToOptimized(slug){
  const base = path.join(process.cwd(), 'public');
  const paths = [
    `recept_images_vision_optimized/${slug}-detail.webp`,
    `recept_images_vision_optimized/${slug}-card.webp`,
    `recept_images_optimized/${slug}-detail-large.webp`,
    `recept_images_optimized/${slug}-card-large.webp`,
    `recept_images_2025/${slug}.jpg`
  ];
  const found = paths.filter(p=>fs.existsSync(path.join(base,p)));
  return found;
}

(async()=>{
  const slug = process.argv[2];
  if (!slug){ console.error('Usage: node scripts/check-one-recipe-image.js <slug>'); process.exit(1); }
  try{
    const r = await prisma.recipe.findUnique({ where:{ slug }, select:{ slug:true, title:true, imageUrl:true } });
    console.log(JSON.stringify({ db:r, optimized: slugToOptimized(slug) }, null, 2));
  }catch(e){ console.error(e); }
  finally{ await prisma.$disconnect(); }
})();
