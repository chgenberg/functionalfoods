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

async function testSingleBlogImprovement() {
  console.log('🧪 Testar förbättring av ett enda blogginlägg...\n');

  try {
    // Test med BCAA/EAA/kollagen-inlägget
    const pdfFile = 'Skillnader mellan BCAA, EAA och kollagen – en djupdykning i proteintillskotten.pdf';
    const slug = 'skillnader-mellan-bcaa-eaa-och-kollagen-en-djupdykning-i-proteintillskotten';

    console.log(`📖 Bearbetar: ${pdfFile}`);

    // Hitta befintligt blogginlägg
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, title: true, excerpt: true }
    });

    if (!existingPost) {
      console.log('❌ Ingen befintlig post hittad');
      return;
    }

    console.log(`✅ Hittade post: ${existingPost.title}`);

    // Läs och extrahera text från PDF
    const pdfPath = path.join(process.cwd(), 'public', 'Blogginlagg', pdfFile);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const rawContent = pdfData.text;
    
    console.log(`📄 Extraherat ${rawContent.length} tecken text från PDF`);
    console.log(`🔍 Första 200 tecken: ${rawContent.substring(0, 200)}`);

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
- Skapa INTE nytt innehåll, formatera bara det befintliga innehållet bättre

Outputen ska vara välformaterad markdown som är lätt att läsa.`
        },
        {
          role: 'user',
          content: `Här är råinnehållet från en PDF (titel: "${existingPost.title}"). Formatera det till välstrukturerad markdown och behåll det ursprungliga ämnet och innehållet:

${rawContent.substring(0, 15000)}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.2
    });

    const improvedContent = response.choices[0].message.content;
    console.log(`✅ Fick ${improvedContent.length} tecken förbättrat innehåll`);
    console.log(`🔍 Första 500 tecken:`);
    console.log(improvedContent.substring(0, 500));

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

    console.log(`📝 Nytt excerpt: ${improvedExcerpt}`);

    // Uppdatera blogginlägget
    await prisma.blogPost.update({
      where: { slug },
      data: {
        content: improvedContent,
        excerpt: improvedExcerpt,
        updatedAt: new Date()
      }
    });

    console.log(`💾 Uppdaterat blogginlägg: ${existingPost.title}`);

  } catch (error) {
    console.error('❌ Fel:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSingleBlogImprovement(); 