const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// TEMPORARY API KEY - REMOVED FOR SECURITY
const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY_HERE'
});

const scrapedContentDir = path.join(process.cwd(), 'public', 'scraped_content_basic');

const systemPrompt = `Du är en expert på att formatera text för webben. Din uppgift är att ta rå text från artiklar och förbättra formateringen genom att:

1. Lägga till fetstil på viktiga rubriker och underrubriker
2. Förbättra styckesindelning för bättre läsbarhet
3. Markera viktiga punkter och tips
4. Behålla allt innehåll men göra det mer läsbart

Använd följande formatering:
- **Fetstil** för rubriker och viktiga termer
- Separera stycken med tomma rader
- Behåll frågor som de är
- Lägg till **TIPS!** i fetstil för tips-sektioner
- Förbättra strukturen men ändra inte innehållet

Returnera ENDAST den formaterade texten utan extra kommentarer.`;

async function improveArticleFormatting(content) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error improving formatting:', error);
    return content; // Return original if API fails
  }
}

async function processAllArticles() {
  try {
    const files = await fs.promises.readdir(scrapedContentDir);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    console.log(`📝 Improving formatting for ${txtFiles.length} articles...`);
    
    for (const file of txtFiles) {
      const filePath = path.join(scrapedContentDir, file);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      // Split at the separator line
      const parts = content.split('--------------------------------------------------------------------------------');
      if (parts.length > 1) {
        const header = parts[0] + '--------------------------------------------------------------------------------\n';
        const bodyContent = parts[1].trim();
        
        console.log(`🔄 Processing: ${file}`);
        
        // Improve formatting with GPT
        const improvedContent = await improveArticleFormatting(bodyContent);
        
        const finalContent = header + improvedContent;
        await fs.promises.writeFile(filePath, finalContent, 'utf-8');
        
        console.log(`✅ Improved: ${file}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`⚠️  No separator found in: ${file}`);
      }
    }
    
    console.log('🎉 All articles improved successfully!');
    
  } catch (error) {
    console.error('❌ Error processing articles:', error);
  }
}

// Run the improvement
processAllArticles(); 