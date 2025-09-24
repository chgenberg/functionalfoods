const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function run() {
  const prisma = new PrismaClient();
  try {
    const argv = process.argv.slice(2);
    // Support: node apply-shoppinglist-week.js [inputPath] [week]
    // or: node apply-shoppinglist-week.js --course flow --week 1 [inputPath]
    let courseArg = 'basic';
    let weekArg;
    let inputPath;

    for (let i = 0; i < argv.length; i++) {
      const a = argv[i];
      if (a === '--course') {
        courseArg = (argv[i + 1] || '').toLowerCase();
        i++;
      } else if (a === '--week') {
        weekArg = argv[i + 1];
        i++;
      } else if (!a.startsWith('--') && !inputPath) {
        inputPath = a;
      } else if (!a.startsWith('--') && !weekArg) {
        weekArg = a;
      }
    }

    inputPath = inputPath ? path.resolve(inputPath) : path.join(process.cwd(), 'app', 'data', 'shoppingLists', 'curated-basics-week2.json');
    const week = parseInt(weekArg || '2', 10);
    if (!week || Number.isNaN(week)) throw new Error('Ogiltig vecka. Ange en siffra, t.ex. 2');

    const curated = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    // Map course arg to CourseProduct name filter
    let courseNameFilter = 'Basic';
    if (courseArg.includes('flow')) courseNameFilter = 'Flow';
    if (courseArg.includes('energy') || courseArg.includes('insulin')) courseNameFilter = 'Energy';
    console.log(`🛒 Byter inköpslista för ${courseNameFilter} vecka ${week}…`);

    const course = await prisma.courseProduct.findFirst({ where: { name: { contains: courseNameFilter, mode: 'insensitive' } }, select: { id: true, name: true } });
    if (!course) throw new Error(`Hittar inte CourseProduct för ${courseNameFilter}`);

    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: course.id, week } });
    if (!list) list = await prisma.weeklyShoppingList.create({ data: { courseId: course.id, week } });

    const before = await prisma.shoppingListItem.count({ where: { listId: list.id } });
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    const items = (curated.items || []).map(i => ({ ingredient: `${i.amount ?? ''} ${i.unit ?? ''} ${i.name}`.trim(), listId: list.id }));
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
      await prisma.shoppingListItem.createMany({ data: items.slice(i, i + chunkSize) });
    }

    // Touch timestamp to reflect update
    await prisma.weeklyShoppingList.update({ where: { id: list.id }, data: { updatedAt: new Date() } });

    const after = await prisma.shoppingListItem.count({ where: { listId: list.id } });
    console.log(`✅ Inköpslista uppdaterad. Före: ${before} rader, Efter: ${after} rader.`);
  } catch (e) {
    console.error('❌ Misslyckades:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
