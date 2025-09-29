const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function okImg(r){ return !!r.imageUrl && typeof r.imageUrl === 'string' && r.imageUrl.length > 3; }
function okNut(r){ return !!(r.nutrition && r.nutrition.perServing && typeof r.nutrition.perServing.energy === 'number'); }
function sample(arr, n=10){ return arr.sort(()=>0.5-Math.random()).slice(0, n); }

async function run(){
  try {
    const basics = await prisma.recipe.findMany({ where:{ categories:{ hasSome: ['Basic','Basics','Functional Basics']}}, take: 50, select:{id:true,slug:true,title:true,imageUrl:true,nutrition:true}});
    const flow = await prisma.recipe.findMany({ where:{ categories:{ hasSome: ['Flow','Functional Flow']}}, take: 50, select:{id:true,slug:true,title:true,imageUrl:true,nutrition:true}});
    const energy = await prisma.recipe.findMany({ where:{ categories:{ hasSome: ['Energy','Functional Energy']}}, take: 50, select:{id:true,slug:true,title:true,imageUrl:true,nutrition:true}});

    const report = {};
    for (const [name, arr] of [['Basics', basics], ['Flow', flow], ['Energy', energy]]){
      const s = sample(arr, 10);
      report[name] = s.map(r=>({ title: r.title, slug: r.slug, imageOk: okImg(r), nutritionOk: okNut(r) }));
    }

    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    console.error('Spotcheck failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
