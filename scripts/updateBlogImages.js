const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping av blogginlägg till bilder baserat på filnamn
const blogImageMapping = {
  '10-proteinrika-ra-varor-i-mataffa-ren-som-du-kanske-har-missat': '/blogginlagg/bilder/blogg1.png',
  '3d-printad-mat-med-anpassad-aminosyraprofil-framtidens-kost-och-ha-lsa': '/blogginlagg/bilder/blogg2.png',
  'blue-zones-funktionella-livsmedel-och-vanor-fo-r-ett-la-ngt-och-friskt-liv': '/blogginlagg/bilder/blogg3.png',
  'polyfenoler-och-protein-sa-kan-smarta-matkombinationer-fo-rba-ttra-din-ha-lsa': '/blogginlagg/bilder/blogg4.png',
  'probiotika-pa-verkan-pa-tarmfloran-immunfo-rsvaret-och-la-ngsiktig-ha-lsa': '/blogginlagg/bilder/blogg5.png',
  'skillnader-mellan-bcaa-eaa-och-kollagen-en-djupdykning-i-proteintillskotten': '/blogginlagg/bilder/blogg6.png',
  'vad-a-r-funktionella-livsmedel-en-djupdykning-fo-r-konsumenter': '/blogginlagg/bilder/blogg7.png'
};

async function updateBlogImages() {
  try {
    console.log('Starting to update blog post images...\n');
    
    // Hämta alla blogginlägg
    const allPosts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${allPosts.length} blog posts to update\n`);

    for (const post of allPosts) {
      const imagePath = blogImageMapping[post.slug];
      
      if (imagePath) {
        console.log(`Updating post: "${post.title}"`);
        console.log(`  Slug: ${post.slug}`);
        console.log(`  Old image: ${post.coverImage || 'None'}`);
        console.log(`  New image: ${imagePath}`);
        
        await prisma.blogPost.update({
          where: { id: post.id },
          data: {
            coverImage: imagePath
          }
        });
        
        console.log(`  ✅ Updated successfully\n`);
      } else {
        console.log(`⚠️  No image mapping found for slug: ${post.slug}\n`);
      }
    }

    console.log('✅ All blog post images updated successfully!');
    
    // Visa resultatet
    const updatedPosts = await prisma.blogPost.findMany({
      select: {
        title: true,
        slug: true,
        coverImage: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('\n📸 Final image assignments:');
    updatedPosts.forEach(post => {
      console.log(`- ${post.title}`);
      console.log(`  Image: ${post.coverImage}`);
      console.log();
    });

  } catch (error) {
    console.error('Error updating blog images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör uppdateringen
updateBlogImages(); 