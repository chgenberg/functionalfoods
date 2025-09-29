// Normalize recipe.nutrition so UI always reads perServing values
// - If top-level nutrition fields (calories/protein/carbohydrates/fat/fiber) exist, move them under nutrition.perServing
// - Remove the top-level fields to avoid UI preferring stale values

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function toNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

async function run() {
  const recipes = await prisma.recipe.findMany({ select: { id: true, slug: true, nutrition: true, tags: true } });
  let updated = 0;
  for (const r of recipes) {
    const n = typeof r.nutrition === 'string' ? (() => { try { return JSON.parse(r.nutrition); } catch { return null; } })() : r.nutrition;
    if (!n) continue;
    const hasTop = ('calories' in n) || ('protein' in n) || ('carbohydrates' in n) || ('fat' in n) || ('fiber' in n);
    if (!hasTop) continue;
    const per = (n.perServing && typeof n.perServing === 'object') ? { ...n.perServing } : {};
    const next = {
      perServing: {
        energy: toNumber(per.energy ?? n.calories),
        protein: toNumber(per.protein ?? n.protein),
        carbohydrates: toNumber(per.carbohydrates ?? n.carbohydrates),
        fat: toNumber(per.fat ?? n.fat),
        fiber: toNumber(per.fiber ?? n.fiber)
      }
    };
    await prisma.recipe.update({ where: { id: r.id }, data: { nutrition: next } });
    updated++;
  }
  console.log(`Normalized nutrition for ${updated} recipes.`);
}

run().finally(async () => { await prisma.$disconnect(); });


