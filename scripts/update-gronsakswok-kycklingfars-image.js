const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const r = await prisma.recipe.findFirst({
      where: { OR: [ { slug: 'gronsakswok-med-kycklingfars' }, { title: { contains: 'Grönsakswok med kycklingfärs', mode: 'insensitive' } } ] }
    });
    if (!r) { console.log('❌ Receptet hittades inte'); return; }
    await prisma.recipe.update({ where: { id: r.id }, data: { imageUrl: '/Ersattning-bilder/gronsakswok-kycklingfars.jpg' } });
    console.log('✅ Bild satt till gronsakswok-kycklingfars.jpg för:', r.title);
  } catch (e) {
    console.error('❌ Fel:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
