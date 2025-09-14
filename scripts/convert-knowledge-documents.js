const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');

// Mappning av dokument till bilder baserat på filnamn
const imageMapping = {
  'flow': {
    'sammanfattning och källor': ['sammanfattning-och-källor.jpg'],
    'livsstilsfaktorer': ['livsstilsfaktorer-1.jpg', 'livsstilsfaktorer-2.jpg', 'livsstilsfaktorer-3.jpg'],
    'fermenterade livsmedel, probiotika och prebiotika': ['fermenterade-livsmedel-probiotika-och-prebiotika-1.jpg', 'fermenterade-livsmedel-probiotika-och-prebiotika-2.jpg'],
    'tillskott som kan stödja mag- och tarmhälsa': ['tillskott-som-kan-stödja-mag-och-tarmhälsa-1.jpg', 'tillskott-som-kan-stödja-mag-och-tarmhälsa-2.jpg', 'tillskott-som-kan-stödja-mag-och-tarmhälsa-3.jpg'],
    'kosten – en guide till en bättre mage och tarm': ['Kosten-en-guide-till-en-bättre-mage-och-tarm-1.jpg', 'Kosten-en-guide-till-en-bättre-mage-och-tarm-2.jpg', 'Kosten-en-guide-till-en-bättre-mage-och-tarm-3.jpg'],
    'vanliga mag- och tarmproblem': ['vanliga-mag-ocj-tarmproblem-1.jpg', 'vanliga-mag-och-tarmproblem-2.jpg', 'vanliga-mag-och-tarmproblem-3.jpg', 'vanliga-mag-och-tarmproblem-4.jpg'],
    'min resa till en lugnare mage': ['min-resa-till-en-lugnare-mage.jpg'],
    'att välja rätt kolhydrater': ['att-välja-rätt-kolhydrater-1.jpg', 'att-välja-rätt-kolhydrater-2.png'],
    'drycker': ['drycker.jpg'],
    'superpulver': ['superpulver-1.jpg', 'superpulver-2.jpg'],
    'vad är functional foods': ['Vad-är-functional-foods.jpg'],
    'ersättningsguide för kolhydrater': ['Ät-mer-functional-foods-på-ett-enkelt-sätt.jpg'],
    'att äta ute med functional foods': ['Att-äta-ute-med-functional-foods-1.jpg', 'Att-äta-ute-med-functional-foods-2.jpg', 'Att-äta-ute-med-functional-foods-3.jpg'],
    'att välja rätt proteiner': ['Att-välja-rätt-proteiner-1.jpg', 'Att-välja-rätt-proteiner-2.jpg'],
    'benbuljong': ['Benbuljong.jpg'],
    'topplista med functional foods': ['topplista-med-functional-foods.jpg'],
    'dags att komma igång': ['dags-att-komma-igång.jpg'],
    'frågor och svar': []
  },
  'basic': {
    'periodisk fasta': ['periodisk-fasta-1.jpg', 'periodisk-fasta-2.jpg'],
    'att välja rätt kolhydrater': ['att-välja-rätt-kolhydrater-1.jpg', 'att-välja-rätt-kolhydrater-2.png'],
    'drycker': ['drycker.jpg'],
    'superpulver': ['superpulver-1.jpg', 'superpulver-2.jpg'],
    'functional foods som livsstil': ['functional-foods-som-livsstil.jpg'],
    'ät mer functional foods på ett enkelt sätt': ['Ät-mer-functional-foods-på-ett-enkelt-sätt.jpg'],
    'motivation och reflektion': ['motivation-och-reflektion.jpg'],
    'functional foods - 3 steg till ett friskare liv': ['functional-foods-3-steg-till-ett-friskare-liv-1.jpg', 'functional-foods-3-steg-till-ett-friskare-liv-2.jpg'],
    'vad är functional foods': ['Vad-är-functional-foods.jpg'],
    'ersättningsguide för kolhydrater': ['Ät-mer-functional-foods-på-ett-enkelt-sätt.jpg'],
    'att äta ute med functional foods': ['Att-äta-ute-med-functional-foods-1.jpg', 'Att-äta-ute-med-functional-foods-2.jpg', 'Att-äta-ute-med-functional-foods-3.jpg'],
    'att välja rätt proteiner': ['Att-välja-rätt-proteiner-1.jpg', 'Att-välja-rätt-proteiner-2.jpg'],
    'benbuljong': ['Benbuljong.jpg'],
    'topplista med functional foods': ['topplista-med-functional-foods.jpg'],
    'dags att komma igång': ['dags-att-komma-igång.jpg'],
    'måldokument - styrelsemöte 1': ['måldokument-styrelsemöte-1.jpg'],
    'fördelarna-med-functional-foods': ['Vad-är-functional-foods.jpg'],
    'frågor och svar': [],
    'reflektion - vecka 3': ['motivation-och-reflektion.jpg'],
    'måldokument - styrelsemöte 2': ['måldokument-styrelsemöte-1.jpg']
  }
};

// Ordning för dokument
const documentOrder = {
  'flow': [
    'vad är functional foods',
    'dags att komma igång',
    'min resa till en lugnare mage',
    'vanliga mag- och tarmproblem',
    'kosten – en guide till en bättre mage och tarm',
    'fermenterade livsmedel, probiotika och prebiotika',
    'tillskott som kan stödja mag- och tarmhälsa',
    'livsstilsfaktorer',
    'att välja rätt kolhydrater',
    'att välja rätt proteiner',
    'drycker',
    'superpulver',
    'benbuljong',
    'ersättningsguide för kolhydrater',
    'att äta ute med functional foods',
    'topplista med functional foods',
    'frågor och svar',
    'sammanfattning och källor'
  ],
  'basic': [
    'vad är functional foods',
    'dags att komma igång',
    'functional foods - 3 steg till ett friskare liv',
    'fördelarna-med-functional-foods',
    'att välja rätt kolhydrater',
    'att välja rätt proteiner',
    'drycker',
    'superpulver',
    'benbuljong',
    'periodisk fasta',
    'ersättningsguide för kolhydrater',
    'ät mer functional foods på ett enkelt sätt',
    'att äta ute med functional foods',
    'topplista med functional foods',
    'functional foods som livsstil',
    'motivation och reflektion',
    'frågor och svar'
  ]
};

async function convertDocxToHtml(filePath) {
  try {
    const result = await mammoth.convertToHtml({
      path: filePath,
      options: {
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh",
          "p[style-name='Heading 3'] => h4:fresh",
          "p => p:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em"
        ]
      }
    });
    
    // Rensa upp HTML och formatera för bättre läsbarhet
    let html = result.value;
    
    // Förbättra HTML-strukturen
    html = html.replace(/<p>\s*<\/p>/g, ''); // Ta bort tomma paragrafer
    html = html.replace(/<p>([•·])\s*/g, '<li>'); // Konvertera punktlistor
    html = html.replace(/<\/li><\/p>/g, '</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
      return `<ul class="list-disc list-inside space-y-2 my-4">${match}</ul>`;
    });
    
    // Lägg till styling för paragrafer
    html = html.replace(/<p>/g, '<p class="mb-4 leading-relaxed">');
    html = html.replace(/<h2>/g, '<h2 class="text-2xl font-semibold text-[#014421] mt-8 mb-4">');
    html = html.replace(/<h3>/g, '<h3 class="text-xl font-medium text-[#014421] mt-6 mb-3">');
    html = html.replace(/<h4>/g, '<h4 class="text-lg font-medium text-[#014421] mt-4 mb-2">');
    
    return html;
  } catch (error) {
    console.error('Error converting docx:', error);
    return null;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getHeaderImage(title, course, images) {
  const normalizedTitle = title.toLowerCase();
  const availableImages = imageMapping[course][normalizedTitle] || [];
  
  if (availableImages.length > 0) {
    // Använd första bilden som header
    return `/Kunskapsdokument/Functional ${course === 'basic' ? 'Basics' : 'Flow'}/Bilder/${availableImages[0]}`;
  }
  
  // Fallback bild
  return course === 'basic' 
    ? '/kurser/functional-basics-hero.jpg'
    : '/kurser/functional-flow-hero.jpg';
}

function getRelatedImages(title, course) {
  const normalizedTitle = title.toLowerCase();
  const availableImages = imageMapping[course][normalizedTitle] || [];
  
  // Returnera alla bilder utom den första (som används som header)
  if (availableImages.length > 1) {
    return availableImages.slice(1).map(img => 
      `/Kunskapsdokument/Functional ${course === 'basic' ? 'Basics' : 'Flow'}/Bilder/${img}`
    );
  }
  
  return [];
}

function extractKeyTakeaways(html) {
  // Extrahera huvudpunkter från innehållet
  const takeaways = [];
  
  // Leta efter listor eller viktiga punkter
  const listMatches = html.match(/<li>(.*?)<\/li>/g);
  if (listMatches && listMatches.length > 0) {
    // Ta de första 3-5 punkterna
    takeaways.push(...listMatches.slice(0, 5).map(item => 
      item.replace(/<\/?li>/g, '').trim()
    ));
  }
  
  return takeaways;
}

function estimateReadTime(html) {
  // Räkna ord och estimera lästid (200 ord per minut)
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

async function generateKnowledgeDocument(docPath, title, course, index, total) {
  console.log(`📄 Konverterar: ${title}`);
  
  const html = await convertDocxToHtml(docPath);
  if (!html) {
    console.error(`❌ Kunde inte konvertera ${title}`);
    return null;
  }
  
  const slug = slugify(title);
  const headerImage = getHeaderImage(title, course);
  const relatedImages = getRelatedImages(title, course);
  const keyTakeaways = extractKeyTakeaways(html);
  const readTime = estimateReadTime(html);
  
  // Bestäm nästa och föregående dokument
  const docs = documentOrder[course];
  const currentIndex = docs.findIndex(d => d.toLowerCase() === title.toLowerCase());
  
  const prevDoc = currentIndex > 0 ? {
    title: docs[currentIndex - 1],
    slug: slugify(docs[currentIndex - 1])
  } : null;
  
  const nextDoc = currentIndex < docs.length - 1 ? {
    title: docs[currentIndex + 1],
    slug: slugify(docs[currentIndex + 1])
  } : null;
  
  return {
    title,
    slug,
    content: html,
    headerImage,
    relatedImages,
    keyTakeaways,
    readTime,
    course,
    order: currentIndex,
    previousDocument: prevDoc,
    nextDocument: nextDoc
  };
}

async function processDocuments() {
  const baseDir = path.join(process.cwd(), 'public', 'Kunskapsdokument');
  
  for (const course of ['flow', 'basic']) {
    console.log(`\n🎓 Bearbetar ${course === 'basic' ? 'Functional Basics' : 'Functional Flow'}...`);
    
    const courseDir = path.join(baseDir, course === 'basic' ? 'Functional Basics' : 'Functional Flow');
    const files = await fs.readdir(courseDir);
    const docxFiles = files.filter(f => f.endsWith('.docx') && !f.startsWith('~$'));
    
    const documents = [];
    
    for (let i = 0; i < docxFiles.length; i++) {
      const file = docxFiles[i];
      const title = file.replace('.docx', '').toLowerCase();
      const docPath = path.join(courseDir, file);
      
      const doc = await generateKnowledgeDocument(
        docPath, 
        title, 
        course, 
        i, 
        docxFiles.length
      );
      
      if (doc) {
        documents.push(doc);
      }
    }
    
    // Sortera dokument enligt ordningen
    documents.sort((a, b) => a.order - b.order);
    
    // Spara dokumentdata
    const outputPath = path.join(
      process.cwd(), 
      'data', 
      `knowledge-documents-${course}.json`
    );
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(documents, null, 2));
    
    console.log(`✅ Sparade ${documents.length} dokument för ${course}`);
  }
  
  console.log('\n🎉 Konvertering klar!');
}

// Kör konverteringen
processDocuments().catch(console.error); 