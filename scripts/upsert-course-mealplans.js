const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

function parseWeeksFromArgv(argv) {
  const args = argv.slice(2);
  const weeks = new Set();
  for (const a of args) {
    if (a === '--course') { // skip next token
      continue;
    }
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--course') { i++; continue; }
    if (/^\d+$/.test(a)) weeks.add(Number(a));
    else if (/^(\d+)-(\d+)$/.test(a)) {
      const [, s, e] = a.match(/(\d+)-(\d+)/);
      for (let w = Number(s); w <= Number(e); w++) weeks.add(w);
    }
  }
  if (weeks.size === 0) return [1,2,3,4,5,6];
  return Array.from(weeks).sort((a,b)=>a-b);
}

function extractObjectFromTS(tsContent, exportConstName) {
  const anchor = `export const ${exportConstName}`;
  const startIdx = tsContent.indexOf(anchor);
  if (startIdx === -1) return null;
  const eqIdx = tsContent.indexOf('=', startIdx);
  if (eqIdx === -1) return null;
  let i = tsContent.indexOf('{', eqIdx);
  if (i === -1) return null;

  let depth = 0;
  let inStr = false;
  let strChar = '';
  let prev = '';
  let endIdx = -1;

  for (; i < tsContent.length; i++) {
    const ch = tsContent[i];
    if (inStr) {
      if (ch === strChar && prev !== '\\') { inStr = false; strChar = ''; }
    } else {
      if (ch === '"' || ch === '\'') { inStr = true; strChar = ch; }
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
    prev = ch;
  }
  if (endIdx === -1) return null;
  const objectLiteral = tsContent.slice(tsContent.indexOf('{', eqIdx), endIdx);
  // eslint-disable-next-line no-eval
  return eval('(' + objectLiteral + ')');
}

async function run() {
  const prisma = new PrismaClient();
  try {
    const argv = process.argv.slice(2);
    let courseArg = 'basic';
    for (let i = 0; i < argv.length; i++) {
      if (argv[i] === '--course') { courseArg = (argv[i+1] || '').toLowerCase(); i++; }
    }
    if (!['basic','flow','energy'].includes(courseArg)) {
      throw new Error('Ange --course basic|flow|energy');
    }
    const weeks = parseWeeksFromArgv(process.argv);

    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    const exportName = courseArg === 'basic' ? 'mealPlans' : (courseArg === 'flow' ? 'flowMealPlans' : 'energyMealPlans');
    const plans = extractObjectFromTS(content, exportName);
    if (!plans) throw new Error(`Kunde inte extrahera ${exportName} från mealPlans.ts`);

    for (const week of weeks) {
      const key = `week${week}`;
      const wp = plans[key];
      if (!wp || !wp.days) {
        console.log(`⚠️  Hoppar över vecka ${week} (${exportName} saknar data)`);
        continue;
      }

      const days = wp.days;
      await prisma.mealPlanWeek.upsert({
        where: { course_weekNumber: { course: courseArg, weekNumber: week } },
        update: { title: wp.title || null, days },
        create: { course: courseArg, weekNumber: week, title: wp.title || null, days }
      });
      console.log(`✅ Upsert ${courseArg} vecka ${week}`);
    }

    console.log(`✅ Klart: ${courseArg} veckor ${weeks.join(', ')}`);
  } catch (e) {
    console.error('❌ Misslyckades:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();


