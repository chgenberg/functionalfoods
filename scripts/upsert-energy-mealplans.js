const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

function extractEnergyMealPlansFromTS(tsContent) {
  const anchor = 'export const energyMealPlans';
  const startIdx = tsContent.indexOf(anchor);
  if (startIdx === -1) return null;
  // Find '=' after anchor
  const eqIdx = tsContent.indexOf('=', startIdx);
  if (eqIdx === -1) return null;
  // Find first '{' after '='
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
      if (ch === strChar && prev !== '\\') {
        inStr = false;
        strChar = '';
      }
    } else {
      if (ch === '"' || ch === '\'') {
        inStr = true;
        strChar = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1; // include closing brace
          break;
        }
      }
    }
    prev = ch;
  }

  if (endIdx === -1) return null;
  const objectLiteral = tsContent.slice(tsContent.indexOf('{', eqIdx), endIdx);
  // eslint-disable-next-line no-eval
  return eval('(' + objectLiteral + ')');
}

function parseWeeksFromArgv(argv) {
  const args = argv.slice(2);
  if (!args.length) return [1, 2, 3];
  const weeks = new Set();
  for (const a of args) {
    if (/^\d+$/.test(a)) {
      weeks.add(Number(a));
    } else if (/^(\d+)-(\d+)$/.test(a)) {
      const [, s, e] = a.match(/(\d+)-(\d+)/);
      const start = Number(s);
      const end = Number(e);
      for (let w = start; w <= end; w++) weeks.add(w);
    }
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

async function run() {
  const prisma = new PrismaClient();
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');
    const energyMealPlans = extractEnergyMealPlansFromTS(content);
    if (!energyMealPlans) throw new Error('Could not extract energyMealPlans from mealPlans.ts');

    const weeks = parseWeeksFromArgv(process.argv);
    for (const week of weeks) {
      const key = `week${week}`;
      const wp = energyMealPlans[key];
      if (!wp || !wp.days) {
        console.log(`⚠️  Skipping week ${week} (not found in energyMealPlans)`);
        continue;
      }

      const days = wp.days;

      await prisma.mealPlanWeek.upsert({
        where: { course_weekNumber: { course: 'energy', weekNumber: week } },
        update: { title: wp.title || null, days },
        create: { course: 'energy', weekNumber: week, title: wp.title || null, days }
      });
      console.log(`✅ Upserted Energy week ${week}`);
    }

    console.log('✅ Done updating Energy weeks 1–3 in DB.');
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
