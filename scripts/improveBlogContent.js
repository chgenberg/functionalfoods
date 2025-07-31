require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Funktion för att konvertera PDF-filnamn till slug
function createSlugFromPdfName(pdfFileName) {
  // Ta bort .pdf-ändelsen
  const nameWithoutExt = pdfFileName.replace('.pdf', '');
  
  // Konvertera till slug-format
  return nameWithoutExt
    .toLowerCase()
    .normalize('NFD') // Normalisera Unicode
    .replace(/[\u0300-\u036f]/g, '') // Ta bort diakritiska tecken
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[–—]/g, '-') // Ersätt em-dash och en-dash
    .replace(/[^\w\s-]/g, '') // Ta bort specialtecken
    .replace(/\s+/g, '-') // Ersätt mellanslag med bindestreck
    .replace(/-+/g, '-') // Ersätt flera bindestreck med ett
    .replace(/^-|-$/g, ''); // Ta bort bindestreck i början/slutet
}

// Funktion för att beräkna Levenshtein-likhet mellan två strängar
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Skapa en matris för att lagra avstånden
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  // Initialisera första raden och kolumnen
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fyll matrisen
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // borttagning
        matrix[i][j - 1] + 1,      // tillägg
        matrix[i - 1][j - 1] + cost // ersättning
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
}

async function improveBlogContent() {
  console.log('🚀 Förbättrar blogginläggsinnehåll med OpenAI GPT...\n');

  const pdfDir = path.join(process.cwd(), 'public', 'Blogginlagg');
  const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));

  console.log(`Hittade ${pdfFiles.length} PDF-filer att bearbeta:\n`);
  pdfFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  // Hämta alla befintliga posts först
  const allPosts = await prisma.blogPost.findMany({
    select: { id: true, title: true, excerpt: true, slug: true }
  });

  for (const pdfFile of pdfFiles) {
    console.log(`\n📖 Bearbetar: ${pdfFile}`);
    
    try {
      // Skapa en förväntad slug från PDF-namnet
      const expectedSlug = createSlugFromPdfName(pdfFile);
      console.log(`🎯 Förväntat slug: ${expectedSlug}`);

      // Hitta motsvarande post genom att matcha slug
      const existingPost = allPosts.find(post => {
        // Exakt match
        if (post.slug === expectedSlug) return true;
        
        // Fuzzy match - kontrollera om slugs är liknande
        const similarity = calculateSimilarity(post.slug, expectedSlug);
        if (similarity > 0.8) {
          console.log(`🔗 Matchat "${post.slug}" med "${expectedSlug}" (${Math.round(similarity * 100)}% likhet)`);
          return true;
        }
        
        return false;
      });

      if (!existingPost) {
        console.log(`❌ Ingen motsvarande post hittad för: ${pdfFile}`);
        console.log(`🔍 Tillgängliga slugs:`);
        allPosts.forEach(post => console.log(`   - ${post.slug}`));
        continue;
      }

      console.log(`✅ Hittade post: ${existingPost.title}`);

      // Läs och extrahera text från PDF
      const pdfPath = path.join(pdfDir, pdfFile);
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      const rawContent = pdfData.text;
      
      console.log(`📄 Extraherat ${rawContent.length} tecken text från PDF`);

      // Använd OpenAI för att förbättra innehållet
      console.log('🤖 Skickar till OpenAI för bearbetning...');
      
              const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Du är en expert på att formatera och förbättra svenskt hälso-innehåll från PDF-filer. 

Din uppgift är att:
1. Rensa bort alla slumpmässiga siffror och fel formatering från PDF-konvertering
2. Skapa välformulerade rubriker med ## och ###
3. Organisera innehållet i logiska stycken med bra mellanrum
4. Behålla alla viktiga fakta och källor
5. Säkerställa att texten flyter naturligt på svenska
6. Inkludera relevanta underrubriker för struktur
7. Ta bort all onödig whitespace och tomma rader

KRITISKT VIKTIGT: 
- Behåll det URSPRUNGLIGA ämnet och innehållet från PDF:en
- Ändra INTE ämnet till något generiskt om "funktionella livsmedel"
- Om PDF:en handlar om protein/BCAA/EAA/kollagen - behåll det ämnet
- Om PDF:en handlar om Blue Zones - behåll det ämnet
- Skapa INTE nytt innehåll, formatera bara det befintliga innehållet bättre

Outputen ska vara välformaterad markdown som är lätt att läsa.`
            },
            {
              role: 'user',
              content: `Här är råinnehållet från en PDF (titel: "${existingPost.title}"). Formatera det till välstrukturerad markdown och behåll det ursprungliga ämnet och innehållet:

${rawContent.substring(0, 12000)}`
            }
          ],
          max_tokens: 4000,
          temperature: 0.2
        });

      const improvedContent = response.choices[0].message.content;
      console.log(`✅ Fick ${improvedContent.length} tecken förbättrat innehåll`);

      // Skapa eller uppdatera excerpt från det förbättrade innehållet
      const contentLines = improvedContent.split('\n').filter(line => line.trim());
      const firstParagraph = contentLines.find(line => 
        !line.startsWith('#') && 
        line.trim().length > 50 && 
        !line.startsWith('![')
      );
      
      const improvedExcerpt = firstParagraph 
        ? firstParagraph.substring(0, 200).trim() + '...'
        : existingPost.excerpt;

      // Uppdatera blogginlägget
      await prisma.blogPost.update({
        where: { slug: existingPost.slug },
        data: {
          content: improvedContent,
          excerpt: improvedExcerpt,
          updatedAt: new Date()
        }
      });

      console.log(`💾 Uppdaterat blogginlägg: ${existingPost.title}`);
      console.log(`📝 Nytt excerpt: ${improvedExcerpt.substring(0, 100)}...`);

      // Vänta lite mellan anrop för att inte överbelasta API:et
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Fel vid bearbetning av ${pdfFile}:`, error.message);
    }
  }

  console.log('\n🎉 Klar med att förbättra blogginläggsinnehåll!');
}

async function main() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY saknas i .env.local');
      process.exit(1);
    }

    await improveBlogContent();
  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör om argumentet --run skickas med
if (process.argv.includes('--run')) {
  main();
} else {
  console.log('💡 För att köra scriptet, använd: node scripts/improveBlogContent.js --run');
  console.log('⚠️  Se till att du har OPENAI_API_KEY i .env.local först');
} 