const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapping of blog titles to image files
const titleToImageMap = {
  '10-proteinrika-ra-varor-i-mataffa-ren-som-du-kanske-har-missat': 'blogg1.png',
  '3d-printad-mat-med-anpassad-aminosyraprofil-framtidens-kost-och-ha-lsa': 'blogg2.png',
  'blue-zones-funktionella-livsmedel-och-vanor-fo-r-ett-la-ngt-och-friskt-liv': 'blogg3.png',
  'polyfenoler-och-protein-sa-kan-smarta-matkombinationer-fo-rba-ttra-din-ha-lsa': 'blogg4.png',
  'probiotika-pa-verkan-pa-tarmfloran-immunfo-rsvaret-och-la-ngsiktig-ha-lsa': 'blogg5.png',
  'skillnader-mellan-bcaa-eaa-och-kollagen-en-djupdykning-i-proteintillskotten': 'blogg6.png',
  'vad-a-r-funktionella-livsmedel-en-djupdykning-fo-r-konsumenter': 'blogg7.png'
};

async function updateBlogImages() {
  console.log('🖼️  Updating blog post images...\n');

  try {
    // Get all blog posts
    const blogPosts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true
      }
    });

    console.log(`Found ${blogPosts.length} blog posts\n`);

    let updatedCount = 0;

    for (const post of blogPosts) {
      // Check if we have an image for this post
      const imageFile = titleToImageMap[post.slug];
      
      if (imageFile) {
        const imagePath = `/Blogginlagg/bilder/${imageFile}`;
        
        // Check if file exists
        const fullPath = path.join(__dirname, '..', 'public', 'Blogginlagg', 'bilder', imageFile);
        if (fs.existsSync(fullPath)) {
          // Update the blog post with the correct image
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { coverImage: imagePath }
          });

          console.log(`✅ Updated "${post.title}"`);
          console.log(`   Image: ${imagePath}\n`);
          updatedCount++;
        } else {
          console.log(`❌ Image not found: ${fullPath}`);
        }
      } else {
        console.log(`⚠️  No image mapping for: ${post.slug}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updatedCount} posts`);
    console.log(`⚠️  Skipped: ${blogPosts.length - updatedCount} posts`);

  } catch (error) {
    console.error('Error updating blog images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-detect post slugs and suggest image mappings
async function autoDetectImageMappings() {
  console.log('🔍 Auto-detecting blog post slugs...\n');

  try {
    const blogPosts = await prisma.blogPost.findMany({
      select: {
        slug: true,
        title: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('Current blog post slugs:');
    blogPosts.forEach((post, index) => {
      const suggestedImage = `blogg${index + 1}.png`;
      console.log(`${index + 1}. "${post.slug}": "${suggestedImage}"`);
    });

    console.log('\nCopy this mapping to update the titleToImageMap:');
    console.log('{');
    blogPosts.forEach((post, index) => {
      const suggestedImage = `blogg${index + 1}.png`;
      console.log(`  '${post.slug}': '${suggestedImage}',`);
    });
    console.log('}');

  } catch (error) {
    console.error('Error detecting mappings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--detect')) {
  autoDetectImageMappings();
} else {
  updateBlogImages();
} 