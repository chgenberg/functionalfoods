const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: {
        OR: [
          { slug: 'ajvarspett-med-grekisk-sallad-och-tzatziki' },
          { title: { contains: 'ajvarspett', mode: 'insensitive' } }
        ]
      }
    });
    if (!recipe) { console.log('❌ Receptet hittades inte'); return; }
    await prisma.recipe.update({ where: { id: recipe.id }, data: { imageUrl: '/Ersattning-bilder/grillspett-grekisk.jpg' } });
    console.log('✅ Satt bild till grillspett-grekisk.jpg för:', recipe.title);
  } catch (e) {
    console.error('❌ Fel:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
