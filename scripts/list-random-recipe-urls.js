const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function pick(arr, n=10){
  const a = [...arr];
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

async function run(){
  try{
    const basics = await prisma.recipe.findMany({ where:{ categories:{ hasSome: ['Basic','Basics','Functional Basics']}}, select:{title:true,slug:true,imageUrl:true}});
    const flow = await prisma.recipe.findMany({ where:{ categories:{ hasSome: ['Flow','Functional Flow']}}, select:{title:true,slug:true,imageUrl:true}});
    const energy = await prisma.recipe.findMany({ where:{ categories:{ hasSome: ['Energy','Functional Energy']}}, select:{title:true,slug:true,imageUrl:true}});

    const mk = (r)=>({ title: r.title, url: `/kunskapsbank/recept/${r.slug}`, image: r.imageUrl || '' });

    const report = {
      basics: pick(basics, 10).map(mk),
      flow: pick(flow, 10).map(mk),
      energy: pick(energy, 10).map(mk)
    };

    console.log(JSON.stringify(report, null, 2));
  }catch(e){
    console.error('list failed:', e);
  }finally{ await prisma.$disconnect(); }
}

run();
