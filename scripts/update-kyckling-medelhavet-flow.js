const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const r = await prisma.recipe.findFirst({
      where: {
        OR: [
          { slug: 'kycklinggryta-fran-medelhavet' },
          { title: { contains: 'Kycklinggryta från medelhavet', mode: 'insensitive' } }
        ]
      }
    });
    if (!r) { console.log('❌ Receptet hittades inte'); return; }
    await prisma.recipe.update({
      where: { id: r.id },
      data: { imageUrl: '/Ersattning-bilder/Kycklinggryta-medelhavet.jpg' }
    });
    console.log('✅ Satt bild till Kycklinggryta-medelhavet.jpg för:', r.title);
  } catch (e) {
    console.error('❌ Fel:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
