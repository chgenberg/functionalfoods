const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function improveBlogFormatting() {
  console.log('🎨 Förbättrar blogginläggsformatering...\n');

  try {
    // Hämta alla blogginlägg
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true
      }
    });

    console.log(`📋 Hittade ${posts.length} publicerade blogginlägg att förbättra\n`);

    for (const post of posts) {
      console.log(`📝 Bearbetar: ${post.title}`);
      
      const improvedContent = improveTextFormatting(post.content);
      
      // Uppdatera endast om innehållet faktiskt förbättrats
      if (improvedContent !== post.content) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { content: improvedContent }
        });
        console.log(`✅ Uppdaterat blogginlägg: ${post.title}`);
      } else {
        console.log(`ℹ️  Inget behov av förbättring: ${post.title}`);
      }
    }

    console.log('\n🎉 Klar med att förbättra blogginläggsformatering!');

  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function improveTextFormatting(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let improved = content
    // Grundläggande rensning
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/gm, '')
    .trim()

    // Fixa brutna ord över rader
    .replace(/([a-zåäöé])\s*\n\s*([a-zåäöé])/g, '$1 $2')
    
    // Normalisera mellanslag
    .replace(/\s{2,}/g, ' ')
    
    // Fixa meningsbrytningar
    .replace(/([.!?])\s*\n\s*([A-ZÅÄÖ])/g, '$1\n\n$2')
    
    // Bryt efter kolon när följt av meningar
    .replace(/:\s*([A-ZÅÄÖ][^.!?]*[.!?])/g, ':\n\n$1')
    
    // Bryt före kategorietiketter
    .replace(/([a-zåäöé])\s*([A-ZÅÄÖ][a-zåäöé]*:)/g, '$1\n\n$2')
    
    // Förbättra punkt-spacing
    .replace(/([a-zåäöé])\s*\.\s*([A-ZÅÄÖ])/g, '$1. $2')
    
    // Hantera parenteser bättre
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    
    // Fixa komma-spacing
    .replace(/\s*,\s*/g, ', ')
    
    // Hantera bindestreck och tankstreck
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s*–\s*/g, ' – ')
    
    // Förbättra listformatering
    .replace(/^\s*([•·])\s*/gm, '- ')
    
    // Ta bort onödiga mellanslag före skiljetecken
    .replace(/\s+([.!?,:;])/g, '$1')
    
    // Lägg till mellanslag efter skiljetecken om det saknas
    .replace(/([.!?,:;])([A-ZÅÄÖ])/g, '$1 $2')

    // Specifika förbättringar för svenska text
    .replace(/\s*(t\.ex\.)\s*/g, ' $1 ')
    .replace(/\s*(m\.fl\.)\s*/g, ' $1 ')
    .replace(/\s*(osv\.)\s*/g, ' $1 ')
    .replace(/\s*(etc\.)\s*/g, ' $1 ')

    // Förbättra citathantering
    .replace(/\s*"\s*/g, ' "')
    .replace(/\s*"\s*/g, '" ')

    // Rensa upp slutligt
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');

  // Förbättra styckeindelning baserat på innehåll
  improved = improveParargraphStructure(improved);

  return improved;
}

function improveParargraphStructure(text) {
  const lines = text.split('\n');
  const improvedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
    
    // Lägg till aktuell rad
    improvedLines.push(currentLine);
    
    // Bestäm om vi behöver en ny styckebrytning
    if (currentLine && nextLine) {
      const needsBreak = shouldBreakParagraph(currentLine, nextLine);
      
      if (needsBreak && !lines[i + 1]?.startsWith('\n')) {
        improvedLines.push(''); // Lägg till tom rad för styckebrytning
      }
    }
  }
  
  return improvedLines.join('\n')
    .replace(/\n{3,}/g, '\n\n') // Begränsa till max 2 radbrytningar
    .trim();
}

function shouldBreakParagraph(currentLine, nextLine) {
  // Bryt före nya kategorier eller ämnen
  const categoryStarters = [
    /^[A-ZÅÄÖ][a-zåäöé]+:/,     // "Flavonoider:", "Studier:", etc.
    /^Det finns/,                // Nya förklaringar
    /^Till exempel/,
    /^Dessa/,
    /^Studier/,
    /^Forskning/,
    /^I tillägg/,
    /^Däremot/,
    /^Samtidigt/,
    /^Därför/,
    /^Slutligen/,
    /^Sammanfattningsvis/,
    /^Andra viktiga/,
    /^Viktiga källor/
  ];

  // Bryt efter meningar som avslutar ett ämne
  const topicEnders = [
    /som antioxidanter\.$/,
    /hälsoeffekter\.$/,
    /för kroppen\.$/,
    /enligt forskning\.$/,
    /m\.fl\.$/
  ];

  return categoryStarters.some(pattern => pattern.test(nextLine)) ||
         topicEnders.some(pattern => pattern.test(currentLine));
}

// Kör scriptet om det anropas direkt
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--run')) {
    improveBlogFormatting();
  } else {
    console.log('📖 Script för att förbättra blogginläggsformatering');
    console.log('🚀 Kör med: node scripts/improveBlogFormatting.js --run');
  }
}

module.exports = { improveBlogFormatting, improveTextFormatting }; 