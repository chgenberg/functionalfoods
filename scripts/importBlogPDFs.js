const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const prisma = new PrismaClient();

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
}

function formatContent(text) {
  // Clean up the text
  let cleanedText = text
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single
    .trim();

  // Try to identify and format sections
  const lines = cleanedText.split('\n');
  const formattedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.length === 0) {
      formattedLines.push('');
      continue;
    }
    
    // Check if this looks like a heading (short line followed by content)
    if (line.length < 80 && i < lines.length - 1 && lines[i + 1].trim().length > 80) {
      formattedLines.push(`## ${line}`);
    } 
    // Check for numbered items
    else if (/^\d+\./.test(line)) {
      formattedLines.push(line);
    }
    // Check for bullet points
    else if (/^[•–-]/.test(line)) {
      formattedLines.push(line);
    }
    // Regular paragraph
    else {
      formattedLines.push(line);
    }
  }
  
  return formattedLines.join('\n\n');
}

function createExcerpt(content) {
  // Get first meaningful paragraph
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
  if (paragraphs.length > 0) {
    return paragraphs[0].substring(0, 200) + '...';
  }
  return content.substring(0, 200) + '...';
}

async function importBlogPosts() {
  try {
    const blogDir = path.join(__dirname, '..', 'public', 'blogginlagg');
    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.pdf'));
    
    console.log(`Found ${files.length} PDF files to import`);
    
    // Get admin user for author
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }
    
    console.log(`Using admin user: ${adminUser.email}`);
    
    for (const file of files) {
      console.log(`\nProcessing: ${file}`);
      
      const pdfPath = path.join(blogDir, file);
      const dataBuffer = fs.readFileSync(pdfPath);
      
      try {
        const pdfData = await pdf(dataBuffer);
        
        // Extract title from filename
        const title = file
          .replace('.pdf', '')
          .replace(/_/g, ' ')
          .replace(/–/g, '-');
        
        const slug = createSlug(title);
        const content = formatContent(pdfData.text);
        const excerpt = createExcerpt(content);
        
        // Check if blog post already exists
        const existingPost = await prisma.blogPost.findUnique({
          where: { slug }
        });
        
        if (existingPost) {
          console.log(`Blog post already exists: ${title}`);
          console.log(`Updating existing post...`);
          
          await prisma.blogPost.update({
            where: { slug },
            data: {
              title,
              content,
              excerpt,
              searchText: `${title} ${excerpt}`.toLowerCase(),
              published: true,
              publishedAt: new Date()
            }
          });
          
          console.log(`✅ Updated: ${title}`);
        } else {
          // Create new blog post
          const blogPost = await prisma.blogPost.create({
            data: {
              title,
              slug,
              content,
              excerpt,
              authorId: adminUser.id,
              published: true,
              publishedAt: new Date(),
              searchText: `${title} ${excerpt}`.toLowerCase(),
              coverImage: '/images/blog-placeholder.jpg' // You can update this if you have specific images
            }
          });
          
          console.log(`✅ Created: ${title}`);
          console.log(`   Slug: ${slug}`);
          console.log(`   Excerpt: ${excerpt.substring(0, 100)}...`);
        }
        
      } catch (pdfError) {
        console.error(`Error processing PDF ${file}:`, pdfError.message);
      }
    }
    
    console.log('\n✅ Import completed!');
    
    // List all blog posts
    const allPosts = await prisma.blogPost.findMany({
      select: {
        title: true,
        slug: true,
        published: true,
        publishedAt: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
    
    console.log(`\nTotal blog posts in database: ${allPosts.length}`);
    allPosts.forEach(post => {
      console.log(`- ${post.title} (${post.published ? 'Published' : 'Draft'})`);
    });
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importBlogPosts(); 