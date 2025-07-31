require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();

// Funktion för att konvertera PDF-filnamn till slug (samma som tidigare)
function createSlugFromPdfName(pdfFileName) {
  const nameWithoutExt = pdfFileName.replace('.pdf', '');
  return nameWithoutExt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[–—]/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Funktion för att beräkna likhet (samma som tidigare)
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
}

// Funktion för att formatera PDF-text till markdown
function formatPdfToMarkdown(rawText, title) {
  console.log('🔧 Formaterar PDF-text till markdown...');
  
  // 1. Rensa och standardisera text
  let content = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. Dela upp i rader
  const lines = content.split('\n');
  const processedLines = [];
  
  // 3. Lägg till huvudrubrik
  processedLines.push(`# ${title}`);
  processedLines.push('');

  // 4. Bearbeta varje rad
  let currentParagraph = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Hoppa över tomma rader och titeln (om den dyker upp igen)
    if (line === '' || line.toLowerCase().includes(title.toLowerCase().substring(0, 20))) {
      // Avsluta nuvarande stycke om det finns
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        processedLines.push(cleanAndFormatText(paragraphText));
        processedLines.push('');
        currentParagraph = [];
      }
      continue;
    }
    
    // Ta bort ensamma siffror
    if (/^\d+$/.test(line)) {
      continue;
    }
    
    // Identifiera rubriker
    if (isHeader(line, i, lines)) {
      // Avsluta nuvarande stycke först
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        processedLines.push(cleanAndFormatText(paragraphText));
        processedLines.push('');
        currentParagraph = [];
      }
      
      // Se till att det finns en tom rad före rubriken
      if (processedLines[processedLines.length - 1] !== '') {
        processedLines.push('');
      }
      
      if (isMainSection(line)) {
        processedLines.push(`## ${line}`);
      } else {
        processedLines.push(`### ${line}`);
      }
      processedLines.push('');
      continue;
    }
    
    // Kontrollera om det ska vara en lista
    if (isListItem(line)) {
      // Avsluta nuvarande stycke först
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        processedLines.push(cleanAndFormatText(paragraphText));
        processedLines.push('');
        currentParagraph = [];
      }
      
      const cleanListItem = line.replace(/^[•\-\*]\s*/, '');
      processedLines.push(`- ${cleanAndFormatText(cleanListItem)}`);
      continue;
    }
    
    // Kontrollera om raden avslutar ett stycke (slutar med punkt, utropstecken eller frågetecken)
    if (line.match(/[.!?]$/) && line.length > 50) {
      currentParagraph.push(line);
      const paragraphText = currentParagraph.join(' ');
      processedLines.push(cleanAndFormatText(paragraphText));
      processedLines.push('');
      currentParagraph = [];
    } else {
      // Lägg till i nuvarande stycke
      currentParagraph.push(line);
    }
  }
  
  // Hantera eventuellt kvarvarande stycke
  if (currentParagraph.length > 0) {
    const paragraphText = currentParagraph.join(' ');
    processedLines.push(cleanAndFormatText(paragraphText));
  }

  // 5. Slutlig rensning
  const result = processedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[\s\n]+/, '')
    .replace(/[\s\n]+$/, '');

  return result;
}

// Funktion för att rensa och formatera text (hantera fetstil etc.)
function cleanAndFormatText(text) {
  return text
    // Rensa bort extra mellanslag
    .replace(/\s+/g, ' ')
    .trim()
    // Fixa fetstil - ta bort onödiga * mellan ord
    .replace(/\*([^*]+)\*/g, '**$1**')  // Konvertera enkla * till dubbla **
    .replace(/\*\*\s+/g, '**')  // Ta bort mellanslag efter öppnande **
    .replace(/\s+\*\*/g, '**')  // Ta bort mellanslag före stängande **
    // Fixa kursiv stil
    .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '*$1*')
    // Ta bort ensamma asterisker
    .replace(/(?<!\*)\*(?!\*)\s+/g, ' ')
    .replace(/\s+\*(?!\*)/g, ' ')
    // Fixa interpunktion
    .replace(/\s+([,.!?;:])/g, '$1')  // Ta bort mellanslag före interpunktion
    .replace(/([.!?])\s*([A-ZÅÄÖ])/g, '$1 $2')  // Se till att det finns mellanslag efter meningsslut
    // Rensa bort dubbelencode tecken om de finns
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

// Hjälpfunktion för att identifiera rubriker
function isHeader(line, index, allLines) {
  // Kort rad som kan vara rubrik
  if (line.length < 120 && line.length > 5) {
    // Börjar med stor bokstav eller siffra
    if (/^[A-ZÅÄÖ0-9]/.test(line)) {
      // Innehåller inte punkt i slutet (troligen inte en mening), men kan ha kolon
      if (!line.endsWith('.') && !line.endsWith(',') && !line.endsWith(';')) {
        // Kolla nästa rad - ska vara tom eller början på nytt stycke
        const nextLine = allLines[index + 1];
        if (!nextLine || nextLine.trim() === '' || /^[A-ZÅÄÖ]/.test(nextLine.trim())) {
          // Extra kontroll - undvik att klassificera korta meningar som rubriker
          if (line.includes('?') || line.includes('!') || line.split(' ').length < 8) {
            return true;
          }
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
    'rekommendationer', 'dosering', 'biverkningar', 'forskning',
    'bcaa', 'eaa', 'kollagen', 'protein', 'blue zones', 'probiotika',
    'polyfenoler', 'funktionella livsmedel', '3d-printad'
  ];
  
  return mainSectionKeywords.some(keyword => 
    line.toLowerCase().includes(keyword)
  );
}

// Hjälpfunktion för att identifiera listobjekt
function isListItem(line) {
  return /^[•\-\*]\s/.test(line) || 
         /^\d+\.\s/.test(line) ||
         /^[•·]\s/.test(line) ||
         (line.length < 100 && line.startsWith('- ')) ||
         (line.length < 100 && /^\w+\s*[-–]\s/.test(line) && !line.endsWith('.'));
}

async function restoreFromPDF() {
  console.log('🔄 Återställer blogginlägg från PDF-filer...\n');

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
      // Hitta motsvarande post
      const expectedSlug = createSlugFromPdfName(pdfFile);
      console.log(`🎯 Förväntat slug: ${expectedSlug}`);

      const existingPost = allPosts.find(post => {
        if (post.slug === expectedSlug) return true;
        
        const similarity = calculateSimilarity(post.slug, expectedSlug);
        if (similarity > 0.8) {
          console.log(`🔗 Matchat "${post.slug}" med "${expectedSlug}" (${Math.round(similarity * 100)}% likhet)`);
          return true;
        }
        
        return false;
      });

      if (!existingPost) {
        console.log(`❌ Ingen motsvarande post hittad för: ${pdfFile}`);
        continue;
      }

      console.log(`✅ Hittade post: ${existingPost.title}`);

      // Läs och extrahera text från PDF
      const pdfPath = path.join(pdfDir, pdfFile);
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      const rawContent = pdfData.text;
      
      console.log(`📄 Extraherat ${rawContent.length} tecken text från PDF`);

      // Formatera innehållet
      const formattedContent = formatPdfToMarkdown(rawContent, existingPost.title);
      
      console.log(`✅ Formaterat innehåll: ${formattedContent.length} tecken`);

      // Skapa excerpt från formaterat innehåll
      const contentLines = formattedContent.split('\n').filter(line => line.trim());
      const firstParagraph = contentLines.find(line => 
        !line.startsWith('#') && 
        line.trim().length > 50 && 
        !line.startsWith('![') &&
        !line.startsWith('-')
      );
      
      const improvedExcerpt = firstParagraph 
        ? firstParagraph.substring(0, 200).trim() + '...'
        : existingPost.excerpt;

      // Uppdatera blogginlägget
      await prisma.blogPost.update({
        where: { slug: existingPost.slug },
        data: {
          content: formattedContent,
          excerpt: improvedExcerpt,
          updatedAt: new Date()
        }
      });

      console.log(`💾 Uppdaterat blogginlägg: ${existingPost.title}`);
      console.log(`📝 Nytt excerpt: ${improvedExcerpt.substring(0, 100)}...`);

      // Vänta lite mellan uppdateringar
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Fel vid bearbetning av ${pdfFile}:`, error.message);
    }
  }

  console.log('\n🎉 Klar med att återställa blogginläggsinnehåll från PDF-filer!');
}

async function main() {
  try {
    await restoreFromPDF();
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
  console.log('💡 För att köra scriptet, använd: node scripts/restoreFromPDF.js --run');
  console.log('⚠️  Detta kommer att återställa alla blogginlägg från deras ursprungliga PDF-filer');
  console.log('📋 Scriptet kommer att:');
  console.log('   1. Läsa text från PDF-filerna');
  console.log('   2. Formatera innehållet till markdown');
  console.log('   3. Skapa korrekta rubriker och stycken');
  console.log('   4. Uppdatera blogginläggen i databasen');
} 