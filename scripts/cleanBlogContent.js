require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();

// Funktion för att rensa och formatera innehåll
function cleanAndFormatContent(rawText, title) {
  console.log('🧹 Rensar innehållet...');
  
  // 1. Ta bort överflödiga mellanslag och tomma rader
  let content = rawText
    .replace(/\r\n/g, '\n')  // Standardisera radbrytningar
    .replace(/\n{3,}/g, '\n\n')  // Max 2 tomma rader
    .trim();

  // 2. Ta bort slumpmässiga ensamma siffror på egna rader
  content = content.replace(/^\d+\s*$/gm, '');

  // 3. Identifiera och formatera rubriker
  const lines = content.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      processedLines.push('');
      continue;
    }
    
    // Huvudrubrik (titel)
    if (line.toLowerCase().includes(title.toLowerCase().substring(0, 20))) {
      processedLines.push(`# ${line}`);
      continue;
    }
    
    // Identifiera rubriker baserat på position och innehåll
    if (isLikelyHeader(line, i, lines)) {
      if (isMainSection(line)) {
        processedLines.push(`## ${line}`);
      } else {
        processedLines.push(`### ${line}`);
      }
      continue;
    }
    
    // Vanlig text
    processedLines.push(line);
  }

  // 4. Rensa upp resultat
  content = processedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')  // Återigen, max 2 tomma rader
    .replace(/^[\s\n]+/, '')     // Ta bort whitespace i början
    .replace(/[\s\n]+$/, '');    // Ta bort whitespace i slutet

  return content;
}

// Hjälpfunktion för att identifiera rubriker
function isLikelyHeader(line, index, allLines) {
  // Kort rad (möjlig rubrik)
  if (line.length < 80 && line.length > 3) {
    // Börjar med stor bokstav
    if (/^[A-ZÅÄÖ]/.test(line)) {
      // Innehåller inte punkt i slutet (inte mening)
      if (!line.endsWith('.') && !line.endsWith(',')) {
        // Nästa rad är tom eller är början på stycke
        const nextLine = allLines[index + 1];
        if (!nextLine || nextLine.trim() === '' || /^[A-ZÅÄÖ]/.test(nextLine.trim())) {
          return true;
        }
      }
    }
  }
  return false;
}

// Hjälpfunktion för att identifiera huvudsektioner
function isMainSection(line) {
  const mainSectionKeywords = [
    'inledning', 'introduktion', 'bakgrund', 'sammanfattning', 'slutsats',
    'vad är', 'skillnader', 'fördelar', 'nackdelar', 'användning',
    'rekommendationer', 'dosering', 'biverkningar', 'forskning'
  ];
  
  return mainSectionKeywords.some(keyword => 
    line.toLowerCase().includes(keyword)
  );
}

async function cleanBlogContent() {
  console.log('🚀 Rensar blogginläggsinnehåll...\n');

  try {
    // Hämta alla blogginlägg
    const posts = await prisma.blogPost.findMany({
      select: { id: true, title: true, excerpt: true, slug: true, content: true }
    });

    console.log(`Hittade ${posts.length} blogginlägg att rensa:\n`);

    for (const post of posts) {
      console.log(`📖 Bearbetar: ${post.title}`);
      
      // Räkna problem i nuvarande innehåll
      const currentContent = post.content || '';
      const currentLines = currentContent.split('\n');
      const emptyLines = currentLines.filter(line => line.trim() === '').length;
      const randomNumbers = currentContent.match(/^\d+\s*$/gm) || [];
      
      console.log(`📊 Nuvarande problem: ${emptyLines} tomma rader, ${randomNumbers.length} slumpsiffror`);

      // Rensa innehållet
      const cleanedContent = cleanAndFormatContent(currentContent, post.title);
      
      // Skapa nytt excerpt från rensat innehåll
      const contentLines = cleanedContent.split('\n').filter(line => line.trim());
      const firstParagraph = contentLines.find(line => 
        !line.startsWith('#') && 
        line.trim().length > 50 && 
        !line.startsWith('![')
      );
      
      const improvedExcerpt = firstParagraph 
        ? firstParagraph.substring(0, 200).trim() + '...'
        : post.excerpt;

      // Uppdatera blogginlägget
      await prisma.blogPost.update({
        where: { slug: post.slug },
        data: {
          content: cleanedContent,
          excerpt: improvedExcerpt,
          updatedAt: new Date()
        }
      });

      // Räkna förbättringar
      const newLines = cleanedContent.split('\n');
      const newEmptyLines = newLines.filter(line => line.trim() === '').length;
      const newRandomNumbers = cleanedContent.match(/^\d+\s*$/gm) || [];
      
      console.log(`✅ Rensat: ${newEmptyLines} tomma rader (-${emptyLines - newEmptyLines}), ${newRandomNumbers.length} slumpsiffror (-${randomNumbers.length - newRandomNumbers.length})`);
      console.log(`📝 Nytt excerpt: ${improvedExcerpt.substring(0, 100)}...`);
      console.log('');
    }

    console.log('🎉 Klar med att rensa blogginläggsinnehåll!');
    
  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kör om argumentet --run skickas med
if (process.argv.includes('--run')) {
  cleanBlogContent();
} else {
  console.log('💡 För att köra scriptet, använd: node scripts/cleanBlogContent.js --run');
  console.log('⚠️  Detta kommer att rensa alla blogginlägg utan att använda OpenAI');
} 