const fs = require('fs').promises;
const path = require('path');

async function run() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'knowledge-documents-basic.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

    console.log(`\n📚 ALLA 20 KUNSKAPSDOKUMENT FÖR FUNCTIONAL BASICS:\n`);
    console.log('='.repeat(80) + '\n');

    data.forEach((doc, i) => {
      console.log(`${(i + 1).toString().padStart(2, '0')}. ${doc.title}`);
      console.log(`    URL: https://ulrika-functional-foods-production.up.railway.app/dashboard/courses/functional-basics/knowledge/${doc.slug}`);
      console.log(`    Slug: ${doc.slug}`);
      console.log(`    Bild: ${doc.headerImage || 'INGEN BILD'}`);
      console.log(`    Läsningstid: ${doc.readTime} min`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\nTOTALT: ${data.length} dokument\n`);

  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}
run();
