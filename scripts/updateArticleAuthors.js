const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateArticleAuthors() {
  try {
    console.log('🔄 Finding Ulrika Davidsson user and updating article authors...');
    
    // First, find or create Ulrika Davidsson user
    let ulrikaUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: 'Ulrika Davidsson' },
          { email: { contains: 'ulrika' } }
        ]
      }
    });
    
    if (!ulrikaUser) {
      // Create Ulrika user if doesn't exist
      ulrikaUser = await prisma.user.create({
        data: {
          email: 'ulrika@functionalfoods.se',
          name: 'Ulrika Davidsson',
          role: 'admin',
          password: 'placeholder' // This should be updated with proper password
        }
      });
      console.log('✅ Created Ulrika Davidsson user');
    } else {
      console.log('✅ Found Ulrika Davidsson user:', ulrikaUser.name, ulrikaUser.email);
    }
    
    // Update all blog posts to have Ulrika as author
    const result = await prisma.blogPost.updateMany({
      data: {
        authorId: ulrikaUser.id
      }
    });
    
    console.log(`✅ Updated ${result.count} articles to have Ulrika Davidsson as author`);
    
    // Check current authors
    const articlesWithAuthors = await prisma.blogPost.findMany({
      include: {
        author: {
          select: { name: true, email: true }
        }
      },
      take: 5
    });
    
    console.log('📋 Sample articles with authors:');
    articlesWithAuthors.forEach(article => {
      console.log(`  - "${article.title}" by ${article.author.name}`);
    });
    
    console.log('🎉 All articles now have Ulrika Davidsson as author!');
    
  } catch (error) {
    console.error('❌ Error updating authors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateArticleAuthors(); 