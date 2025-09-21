const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkKnowledgeDocuments() {
  try {
    console.log('🔍 Checking knowledge documents in database...');
    
    const total = await prisma.knowledgeDocument.count();
    console.log(`📊 Total documents: ${total}`);
    
    if (total === 0) {
      console.log('❌ No knowledge documents found in database!');
      console.log('💡 Try running: node scripts/seed-knowledge-documents.js');
      return;
    }
    
    const byCourse = await prisma.knowledgeDocument.groupBy({
      by: ['course'],
      _count: { id: true }
    });
    
    console.log('\n📋 Documents by course:');
    byCourse.forEach(group => {
      console.log(`  ${group.course}: ${group._count.id} documents`);
    });
    
    console.log('\n📝 Sample documents:');
    const samples = await prisma.knowledgeDocument.findMany({
      take: 5,
      select: { title: true, course: true, slug: true }
    });
    
    samples.forEach(doc => {
      console.log(`  • ${doc.title} (${doc.course}) - ${doc.slug}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKnowledgeDocuments();
