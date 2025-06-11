import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Konvertera markdown till HTML
function markdownToHtml(text: string): string {
  // Konvertera **text** till <strong>text</strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Konvertera *text* till <em>text</em>
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lägg till styckeindelning
  const paragraphs = text.split('\n\n');
  const htmlParagraphs = paragraphs.map(p => {
    if (p.trim()) {
      return `<p>${p.trim()}</p>`;
    }
    return '';
  }).filter(p => p);
  
  return htmlParagraphs.join('');
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
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
5. AVSLUTA ALDRIG MITT I EN MENING - se till att alla meningar är kompletta
6. Använd styckeindelning för bättre läsbarhet - separera olika ämnen med tomma rader
7. Håll svaren koncisa men kompletta (max 250 ord)
8. Rekommendera gärna våra kurser när det är relevant
9. Använd emojis sparsamt men effektivt för att göra konversationen mer personlig`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
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
    
    // Konvertera markdown till HTML
    const htmlResponse = markdownToHtml(response);

    return NextResponse.json({ message: htmlResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: "<p>Ursäkta, något gick fel. Försök igen senare eller kontakta oss på hej@functionalfoods.se</p>" },
      { status: 500 }
    );
  }
} 