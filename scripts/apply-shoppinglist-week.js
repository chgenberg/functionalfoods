const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function run() {
  const prisma = new PrismaClient();
  try {
    const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'app', 'data', 'shoppingLists', 'curated-basics-week2.json');
    const weekArg = process.argv[3] || '2';
    const week = parseInt(weekArg, 10);
    if (!week || Number.isNaN(week)) throw new Error('Ogiltig vecka. Ange en siffra, t.ex. 2');

    console.log(`🛒 Byter inköpslista för Basic vecka ${week}…`);
    const curated = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    const course = await prisma.courseProduct.findFirst({ where: { name: { contains: 'Basic', mode: 'insensitive' } }, select: { id: true, name: true } });
    if (!course) throw new Error('Hittar inte CourseProduct för Basic');

    let list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: course.id, week } });
    if (!list) list = await prisma.weeklyShoppingList.create({ data: { courseId: course.id, week } });

    const before = await prisma.shoppingListItem.count({ where: { listId: list.id } });
    await prisma.shoppingListItem.deleteMany({ where: { listId: list.id } });

    const items = (curated.items || []).map(i => ({ ingredient: `${i.amount ?? ''} ${i.unit ?? ''} ${i.name}`.trim(), listId: list.id }));
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
      await prisma.shoppingListItem.createMany({ data: items.slice(i, i + chunkSize) });
    }
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
