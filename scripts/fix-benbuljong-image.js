const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const slugOrTitle = 'grundrecept-benbuljong';
    let recipe = await prisma.recipe.findFirst({ where: { OR: [{ slug: slugOrTitle }, { title: 'Grundrecept benbuljong' }] } });
    if (!recipe) {
      console.log('❌ Hittade inte receptet Grundrecept benbuljong');
      return;
    }

    const webp = '/Recept_complete/images/_optimized/Grundrecept benbuljong.webp';
    const jpg = '/Recept_complete/images/Grundrecept benbuljong.jpg';

    const webpFs = path.join(process.cwd(), 'public', webp.replace(/^\//, ''));
    const jpgFs = path.join(process.cwd(), 'public', jpg.replace(/^\//, ''));

    let imageUrl = null;
    if (fs.existsSync(webpFs)) imageUrl = webp;
    else if (fs.existsSync(jpgFs)) imageUrl = jpg;

    if (!imageUrl) {
      console.log('⚠️ Ingen bild hittades på disk för benbuljong');
      return;
    }

    await prisma.recipe.update({ where: { id: recipe.id }, data: { imageUrl } });
    console.log(`✅ Uppdaterade benbuljong-bild: ${imageUrl}`);
  } catch (e) {
    console.error('Fel:', e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 