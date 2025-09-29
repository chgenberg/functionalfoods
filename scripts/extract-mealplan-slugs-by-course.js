const fs = require('fs');
const path = require('path');

function run(){
  const file = path.join(process.cwd(), 'app','data','mealPlans.ts');
  const src = fs.readFileSync(file,'utf8');
  const lines = src.split(/\r?\n/);
  let section = 'unknown';
  const map = { basics: new Set(), flow: new Set(), energy: new Set() };
  for (const line of lines){
    if (line.includes('export const mealPlans')) section = 'basics';
    if (line.includes('export const flowMealPlans')) section = 'flow';
    if (line.includes('export const energyMealPlans')) section = 'energy';
    const m = line.match(/"recipeLink"\s*:\s*"(\/kunskapsbank\/recept\/[^"?]+)"/);
    if (m){
      const slug = m[1].split('/').pop();
      if (section in map) map[section].add(slug);
    }
  }
  function pick(set){
    const arr = Array.from(set);
    for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    return arr.slice(0,10);
  }
  const report = {
    basics: pick(map.basics).map(s=>({ slug:s, url:`/kunskapsbank/recept/${s}` })),
    flow: pick(map.flow).map(s=>({ slug:s, url:`/kunskapsbank/recept/${s}` })),
    energy: pick(map.energy).map(s=>({ slug:s, url:`/kunskapsbank/recept/${s}` }))
  };
  console.log(JSON.stringify(report,null,2));
}

run();
