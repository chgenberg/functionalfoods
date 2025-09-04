const { PrismaClient } = require('@prisma/client');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Unsplash-bilder som matchar artiklarnas teman
const articleImages = {
  'gröna bladgrönsaker': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2000',
  'rotfrukter': 'https://images.unsplash.com/photo-1635774855536-9728f2610245?q=80&w=2000',
  'kålväxter': 'https://images.unsplash.com/photo-1510627083412-2968b3c19279?q=80&w=2000',
  'frukt': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2000',
  'magbesvär': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2000',
  'fermenterade': 'https://images.unsplash.com/photo-1571042804886-dd28b9e7bfb9?q=80&w=2000',
  'stress': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000',
  'tugga': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000',
  'jordgubbar': 'https://images.unsplash.com/photo-1589734823667-da8f847bb4ed?q=80&w=2000',
  'functional foods': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2000',
  'yoghurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2000'
};

// Kategorier baserat på artikelns innehåll
const getCategories = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('grönsaker') || titleLower.includes('bladgrönsaker')) {
    return ['Grönsaker', 'Näringslära'];
  }
  if (titleLower.includes('rotfrukter')) {
    return ['Grönsaker', 'Näringslära'];
  }
  if (titleLower.includes('kålväxter')) {
    return ['Grönsaker', 'Näringslära'];
  }
  if (titleLower.includes('frukt') || titleLower.includes('bär') || titleLower.includes('jordgubbar')) {
    return ['Frukt & Bär', 'Näringslära'];
  }
  if (titleLower.includes('mag') || titleLower.includes('tarm')) {
    return ['Maghälsa', 'Hälsa'];
  }
  if (titleLower.includes('fermenterad')) {
    return ['Fermentering', 'Maghälsa'];
  }
  if (titleLower.includes('stress') || titleLower.includes('psykisk')) {
    return ['Mental hälsa', 'Hälsa'];
  }
  if (titleLower.includes('tugga')) {
    return ['Matvanor', 'Hälsa'];
  }
  if (titleLower.includes('functional foods')) {
    return ['Functional Foods', 'Näringslära'];
  }
  if (titleLower.includes('yoghurt')) {
    return ['Mejeriprodukter', 'Probiotika'];
  }
  return ['Hälsa', 'Näringslära'];
};

// Hitta matchande bild
const getImageUrl = (title) => {
  const titleLower = title.toLowerCase();
  for (const [key, url] of Object.entries(articleImages)) {
    if (titleLower.includes(key)) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2000'; // Default functional foods bild
};

// Konvertera titel till slug
const toSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Extrahera första stycket som excerpt
const extractExcerpt = (html, maxLength = 160) => {
  const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const firstParagraph = textOnly.split('.')[0] + '.';
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  return textOnly.substring(0, maxLength).trim() + '...';
};

// Förbättra HTML-strukturen
const enhanceHtml = (html, title) => {
  // Lägg till en stilig introduktion om det inte finns någon
  if (!html.includes('<h')) {
    html = `<h1 class="text-3xl font-bold mb-6 text-[#014421]">${title}</h1>\n${html}`;
  }
  
  // Förbättra paragraf-styling
  html = html.replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-700">');
  
  // Förbättra listor
  html = html.replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">');
  html = html.replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">');
  html = html.replace(/<li>/g, '<li class="text-gray-700">');
  
  // Förbättra rubriker
  html = html.replace(/<h2>/g, '<h2 class="text-2xl font-semibold mt-6 mb-4 text-[#014421]">');
  html = html.replace(/<h3>/g, '<h3 class="text-xl font-semibold mt-4 mb-3 text-[#014421]">');
  
  // Lägg till en call-to-action i slutet
  html += `
    <div class="mt-8 p-6 bg-[#F7F1E8] rounded-lg">
      <h3 class="text-lg font-semibold mb-2 text-[#014421]">Vill du lära dig mer?</h3>
      <p class="text-gray-700 mb-4">
        Utforska våra kurser för att fördjupa din kunskap om functional foods och hälsosam matlagning.
      </p>
      <a href="/utbildning" class="inline-block bg-[#014421] text-white px-6 py-2 rounded-full hover:bg-[#116530] transition-colors">
        Se våra kurser
      </a>
    </div>
  `;
  
  return html;
};

async function importArticles() {
  try {
    console.log('📚 Importerar artiklar från artiklar_2025...\n');
    
    // Hämta författaren först
    const author = await prisma.user.findUnique({
      where: { email: 'ulrika@functionalfoods.se' }
    });
    
    if (!author) {
      console.error('❌ Kunde inte hitta författaren Ulrika. Kör create-ulrika-author.js först!');
      return;
    }
    
    const articlesDir = path.join(process.cwd(), 'public', 'artiklar_2025');
    const files = await fs.readdir(articlesDir);
    const docxFiles = files.filter(f => f.endsWith('.docx') && !f.startsWith('.'));
    
    console.log(`Hittade ${docxFiles.length} artiklar att importera\n`);
    
    let imported = 0;
    let updated = 0;
    let errors = 0;
    
    for (const file of docxFiles) {
      try {
        console.log(`📄 Bearbetar: ${file}`);
        
        const filePath = path.join(articlesDir, file);
        const buffer = await fs.readFile(filePath);
        
        // Konvertera DOCX till HTML
        const result = await mammoth.convertToHtml({ buffer });
        let html = result.value;
        
        // Extrahera titel från filnamn
        const title = file.replace('.docx', '').trim();
        const slug = toSlug(title);
        
        // Förbättra HTML
        html = enhanceHtml(html, title);
        
        // Skapa artikel-data
        const articleData = {
          title,
          slug,
          content: html,
          excerpt: extractExcerpt(html),
          coverImage: getImageUrl(title),
          authorId: author.id,
          published: true,
          publishedAt: new Date(),
          searchText: [title, extractExcerpt(html, 500), getCategories(title).join(' ')].join(' ').slice(0, 10000)
        };
        
        // Kolla om artikeln redan finns
        const existing = await prisma.blogPost.findUnique({
          where: { slug }
        });
        
        if (existing) {
          // Uppdatera befintlig artikel
          await prisma.blogPost.update({
            where: { slug },
            data: articleData
          });
          console.log(`✅ Uppdaterade: ${title}`);
          updated++;
        } else {
          // Skapa ny artikel
          await prisma.blogPost.create({
            data: articleData
          });
          console.log(`✅ Importerade: ${title}`);
          imported++;
        }
        
      } catch (error) {
        console.error(`❌ Fel vid import av ${file}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Importresultat:');
    console.log(`✅ Nya artiklar: ${imported}`);
    console.log(`🔄 Uppdaterade: ${updated}`);
    console.log(`❌ Fel: ${errors}`);
    
    // Visa totalt antal artiklar
    const totalArticles = await prisma.blogPost.count();
    console.log(`\n📚 Totalt antal artiklar i databasen: ${totalArticles}`);
    
  } catch (error) {
    console.error('🚨 Fel vid artikelimport:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  importArticles();
}

module.exports = { importArticles }; 