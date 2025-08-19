const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');

const WEEKS = [
  'Recept-Final/Vecka-1-basic.docx',
  'Recept-Final/vecka-2-basic.docx', 
  'Recept-Final/vecka-3-basic.docx',
  'Recept-Final/vecka-4-basic.docx',
  'Recept-Final/vecka-5-basic.docx',
  'Recept-Final/vecka-6-basic.docx',
  'Recept-Final/vecka-1-flow.docx',
  'Recept-Final/vecka-2-flow.docx',
  'Recept-Final/vecka-3-flow.docx',
  'Recept-Final/vecka-4-flow.docx',
  'Recept-Final/vecka-5-flow.docx',
  'Recept-Final/vecka-6-flow.docx'
];

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve(); else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('🗑️ Clearing all recipes from production DB...');
    const result = await prisma.recipe.deleteMany({});
    console.log(`✅ Deleted ${result.count} recipes`);

    console.log('\n📥 Re-importing all weeks...');
    for (const weekPath of WEEKS) {
      console.log(`\n--- Importing ${weekPath} ---`);
      await runCommand('node', ['scripts/importDocxRecipes.js', weekPath]);
    }

    console.log('\n🛒 Generating shopping lists...');
    await runCommand('npx', ['ts-node', '--transpile-only', 'scripts/generateShoppingListsFromMealPlans.ts']);

    console.log('\n🎉 All done! All recipes re-imported with proper data.');
  } catch (e) {
    console.error('❌ Process failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 