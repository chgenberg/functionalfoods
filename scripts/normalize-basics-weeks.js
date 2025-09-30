/*
 Normalize Functional Basics week plans (weeks 1-6):
  - Ensure each day has breakfast, lunch, dinner keys
  - Move any 'extra' into 'lunch' if lunch is missing
  - Keep 'snack' and 'dessert' if present
*/
const { PrismaClient } = require('@prisma/client');

async function normalizeDays(days) {
  const dayNames = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
  const out = { ...days };
  for (const name of dayNames) {
    const d = out[name] || out[`day${dayNames.indexOf(name)+1}`];
    if (!d) continue;

    // Clone to avoid mutating original references
    const nd = { ...d };

    // If lunch missing but extra present, move extra to lunch
    if (!nd.lunch && nd.extra) {
      nd.lunch = nd.extra;
      delete nd.extra;
    }

    // If still no lunch but breakfast and dinner exist, leave as is (UI shows what exists)

    // Ensure structure only includes known keys
    const cleaned = {
      breakfast: nd.breakfast || null,
      lunch: nd.lunch || null,
      dinner: nd.dinner || null,
    };
    if (nd.snack) cleaned.snack = nd.snack;
    if (nd.dessert) cleaned.dessert = nd.dessert;

    // Only write back if something changed
    out[name] = cleaned;
  }
  return out;
}

async function run() {
  const prisma = new PrismaClient();
  try {
    let updated = 0;
    for (let week = 1; week <= 6; week++) {
      const row = await prisma.mealPlanWeek.findUnique({
        where: { course_weekNumber: { course: 'basic', weekNumber: week } }
      });
      if (!row) continue;
      const orig = row.days || {};
      const norm = await normalizeDays(orig);
      const changed = JSON.stringify(orig) !== JSON.stringify(norm);
      if (changed) {
        await prisma.mealPlanWeek.update({
          where: { course_weekNumber: { course: 'basic', weekNumber: week } },
          data: { days: norm }
        });
        updated++;
      }
    }
    console.log(`✅ Normalized basics weeks 1-6. Updated: ${updated}`);
  } catch (e) {
    console.error('❌ Normalize failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();


