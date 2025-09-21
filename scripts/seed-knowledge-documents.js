const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedKnowledgeDocuments() {
  try {
    console.log('🌱 Seeding knowledge documents...');

    // Read all knowledge document files
    const files = [
      { file: 'data/knowledge-documents-basic.json', course: 'basic' },
      { file: 'data/knowledge-documents-flow.json', course: 'flow' },
      { file: 'data/knowledge-documents-energy.json', course: 'energy' }
    ];

    let totalImported = 0;

    for (const { file, course } of files) {
      const filePath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${file}`);
        continue;
      }

      console.log(`📖 Processing ${course} documents...`);
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const documents = Array.isArray(data) ? data : (data.documents || []);

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        
        try {
          // Check if document already exists
          const existing = await prisma.knowledgeDocument.findUnique({
            where: { slug: doc.slug }
          });

          if (existing) {
            console.log(`⏭️ Skipping existing: ${doc.title}`);
            continue;
          }

          // Create new document
          await prisma.knowledgeDocument.create({
            data: {
              title: doc.title,
              slug: doc.slug,
              content: doc.content || '',
              headerImage: doc.headerImage || null,
              relatedImages: doc.relatedImages || null,
              keyTakeaways: doc.keyTakeaways || null,
              readTime: doc.readTime || 5,
              course: course,
              order: doc.order || i,
              weekNumber: doc.weekNumber || null
            }
          });

          console.log(`✅ Imported: ${doc.title}`);
          totalImported++;
        } catch (error) {
          console.error(`❌ Error importing ${doc.title}:`, error.message);
        }
      }
    }

    console.log(`🎉 Successfully imported ${totalImported} knowledge documents!`);
    
    // Show summary
    const counts = await prisma.knowledgeDocument.groupBy({
      by: ['course'],
      _count: { id: true }
    });

    console.log('\n📊 Summary by course:');
    counts.forEach(count => {
      console.log(`  ${count.course}: ${count._count.id} documents`);
    });

  } catch (error) {
    console.error('❌ Error seeding knowledge documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedKnowledgeDocuments();
}

module.exports = { seedKnowledgeDocuments };
