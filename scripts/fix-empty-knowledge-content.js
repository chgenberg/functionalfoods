const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmptyKnowledgeContent() {
  try {
    console.log('🔍 Checking for knowledge documents with empty content in database...');
    
    // Find all knowledge documents (we'll filter empty content client-side)
    const allDocs = await prisma.knowledgeDocument.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        course: true,
        content: true
      }
    });

    // Filter client-side for empty content
    const emptyDocs = allDocs.filter(doc => !doc.content || doc.content.trim() === '');

    console.log(`\n📋 Found ${emptyDocs.length} documents with empty content:`);
    emptyDocs.forEach(doc => {
      console.log(`  - ${doc.slug} (${doc.title})`);
      console.log(`    Course: ${doc.course}`);
      console.log(`    Content: ${doc.content === null ? 'NULL' : doc.content === '' ? 'EMPTY STRING' : `LENGTH ${doc.content.length}`}`);
    });

    if (emptyDocs.length === 0) {
      console.log('\n✅ No documents with empty content found. All good!');
      return;
    }

    console.log(`\n🗑️  Deleting ${emptyDocs.length} documents with empty content from DB...`);
    console.log('   (JSON files will still serve full content via fallback)');
    
    const idsToDelete = emptyDocs.map(doc => doc.id);
    const deleteResult = await prisma.knowledgeDocument.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });

    console.log(`\n✅ Deleted ${deleteResult.count} documents with empty content`);
    console.log('   These documents will now be served from JSON files with full content.');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixEmptyKnowledgeContent();

