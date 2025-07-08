import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Läs in kursinformation
async function getCourseInfo() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const [basicsResponse, flowResponse] = await Promise.all([
      fetch(`${baseUrl}/functionalbasics.txt`, { cache: 'no-store' }),
      fetch(`${baseUrl}/functionalflow.txt`, { cache: 'no-store' })
    ]);
    
    if (!basicsResponse.ok || !flowResponse.ok) {
      console.error('Failed to load course info:', {
        basics: basicsResponse.status,
        flow: flowResponse.status
      });
      return { basicsText: '', flowText: '' };
    }
    
    const basicsText = await basicsResponse.text();
    const flowText = await flowResponse.text();
    
    return { basicsText, flowText };
  } catch (error) {
    console.error('Error loading course info:', error);
    return { basicsText: '', flowText: '' };
  }
}

// Konvertera text till HTML med korrekt formatering och styckeindelning
function formatToHtml(text: string): string {
  // Normalisera radbrytningar och dela upp i stycken
  let normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Dela upp i stycken baserat på dubbla radbrytningar ELLER enkla radbrytningar följt av stor bokstav
  const paragraphs = normalizedText.split(/\n\s*\n|\n(?=[A-ZÅÄÖ])/);
  
  const htmlParagraphs = paragraphs.map(paragraph => {
    if (!paragraph.trim()) return '';
    
    let formattedParagraph = paragraph.trim();
    
    // Konvertera **text** till <strong>text</strong>
    formattedParagraph = formattedParagraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Konvertera *text* till <em>text</em>
    formattedParagraph = formattedParagraph.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Hantera listor som börjar med - eller •
    if (formattedParagraph.includes('\n-') || formattedParagraph.includes('\n•')) {
      const lines = formattedParagraph.split('\n');
      let listItems = [];
      let regularText = [];
      
      for (const line of lines) {
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          listItems.push(`<li>${line.trim().substring(1).trim()}</li>`);
        } else if (listItems.length > 0) {
          // Avsluta listan och börja ny text
          regularText.push(`<ul class="list-disc ml-4 mb-2">${listItems.join('')}</ul>`);
          listItems = [];
          if (line.trim()) regularText.push(`<p class="mb-3">${line.trim()}</p>`);
        } else {
          if (line.trim()) regularText.push(line.trim());
        }
      }
      
      // Lägg till eventuell kvarvarande lista
      if (listItems.length > 0) {
        regularText.push(`<ul class="list-disc ml-4 mb-2">${listItems.join('')}</ul>`);
      }
      
      return regularText.join('');
    }
    
    // Lägg till CSS-klasser för bättre spacing
    return `<p class="mb-3">${formattedParagraph}</p>`;
  }).filter(p => p);
  
  return htmlParagraphs.join('');
}

export async function POST(request: Request) {
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return NextResponse.json(
      { message: "<p>Konfigurationsfel. Vänligen kontakta support.</p>" },
      { status: 500 }
    );
  }

  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: "<p>Ogiltig förfrågan. Vänligen försök igen.</p>" },
        { status: 400 }
      );
    }
    
    // Hämta kursinformation
    const { basicsText, flowText } = await getCourseInfo();
    
    const systemPrompt = `Du är Ulrika AI:sson, en vänlig och kunnig AI-assistent för Functional Foods. 
    
Du har djup kunskap om:
- Functional foods och hur mat kan användas som medicin
- Hälsa, nutrition och välmående
- Recept och matlagning för optimal hälsa
- Longevity och livsstilsfaktorer
- Våra kurser: Functional Basics och Functional Flow

Kursinformation:
Functional Basics: ${basicsText.substring(0, 500)}...
Functional Flow: ${flowText.substring(0, 500)}...

VIKTIGA REGLER:
1. Svara ALLTID på svenska
2. Var vänlig, professionell och hjälpsam
3. Ge konkreta och praktiska råd
4. Om någon frågar om något som INTE handlar om hälsa, functional foods, nutrition, recept eller longevity, svara vänligt att du är specialiserad på dessa områden och hänvisa till hej@functionalfoods.se för andra frågor
5. VIKTIGT: AVSLUTA ALDRIG MITT I EN MENING - se till att alla meningar är kompletta och avslutas korrekt
6. Använd TYDLIG styckeindelning - dela upp svaret i korta stycken (2-3 meningar per stycke)
7. Separera olika ämnen och koncept med dubbla radbrytningar
8. Använd fetstil för viktiga begrepp och rubriker genom att skriva **text** (detta konverteras automatiskt)
9. Skapa listor med - för punkter när det är lämpligt
10. Börja nya stycken med stor bokstav för att skapa naturliga avbrott
11. Håll svaren koncisa men kompletta (max 250 ord)
12. Rekommendera gärna våra kurser när det är relevant
13. Använd emojis sparsamt men effektivt för att göra konversationen mer personlig`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 350, // Lite extra tokens för att säkerställa kompletta meningar
      temperature: 0.7,
      stop: null, // Ta bort stop sequences för att undvika avbrott
    });

    let response = completion.choices[0].message.content || "Ursäkta, jag kunde inte generera ett svar just nu.";
    
    // Säkerställ att svaret slutar med en komplett mening
    const lastChar = response.trim().slice(-1);
    if (!['.', '!', '?', ':', '😊', '🌱', '💚'].includes(lastChar)) {
      // Om svaret inte slutar med punktuation, lägg till punkt
      response = response.trim() + '.';
    }
    
    // Konvertera text till HTML
    const htmlResponse = formatToHtml(response);

    return NextResponse.json({ message: htmlResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: "<p>Ursäkta, något gick fel. Försök igen senare eller kontakta oss på hej@functionalfoods.se</p>" },
      { status: 500 }
    );
  }
} 