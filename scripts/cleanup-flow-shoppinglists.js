const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const flow = await prisma.courseProduct.findFirst({
      where: { name: { contains: 'Flow', mode: 'insensitive' } },
      select: { id: true, name: true }
    });

    if (!flow) {
      console.log('No Flow course found');
      return;
    }

    const lists = await prisma.weeklyShoppingList.findMany({ where: { courseId: flow.id } });
    const toDelete = lists.filter(l => l.week < 1 || l.week > 6).map(l => l.id);

    if (toDelete.length > 0) {
      await prisma.shoppingListItem.deleteMany({ where: { listId: { in: toDelete } } });
      await prisma.weeklyShoppingList.deleteMany({ where: { id: { in: toDelete } } });
    }

    console.log(
      JSON.stringify(
        { flowCourseId: flow.id, total: lists.length, deleted: toDelete.length, kept: lists.length - toDelete.length },
        null,
        2
      )
    );
  } catch (e) {
    console.error('Cleanup error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}


