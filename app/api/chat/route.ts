import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { resolveModel, chatWithFallback } from '@/app/lib/ai';
import { prisma } from '@/app/lib/database';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Basic per-IP rate limiter (best effort). Replace with Upstash for production scale.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 30;
const rlMap: Map<string, number[]> = new Map();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RL_WINDOW_MS;
  const arr = rlMap.get(ip) || [];
  const recent = arr.filter((t) => t > windowStart);
  if (recent.length >= RL_MAX) { rlMap.set(ip, recent); return true; }
  recent.push(now);
  rlMap.set(ip, recent);
  return false;
}

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

// Hämta populära recept och råvaror för AI-kontexten
async function getRecipesAndRawMaterials() {
  try {
    const [recipes, rawMaterials] = await prisma.$transaction([
      prisma.recipe.findMany({
        where: { 
          status: 'PUBLISHED',
          isPremium: false // Endast gratis recept för allmän chattbot
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          ingredients: true,
          difficulty: true,
          slug: true
        },
        take: 20 // Top 20 populära recept
      }),
      // @ts-ignore rawMaterial model exists after prisma generate
      prisma.rawMaterial.findMany({
        select: {
          id: true,
          name: true,
          description: true
        },
        take: 50 // Top 50 råvaror
      })
    ]);

    return { recipes, rawMaterials };
  } catch (error) {
    console.error('Error loading recipes and raw materials:', error);
    return { recipes: [], rawMaterials: [] };
  }
}

// Konvertera text till HTML med korrekt formatering och styckeindelning
function formatToHtml(text: string): string {
  // Normalisera radbrytningar och dela upp i stycken
  let normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Ta bort markdown-rubriker (###, ##, #) och ersätt med fetstil
  normalizedText = normalizedText.replace(/^#{1,6}\s*(.+)/gm, '**$1**');
  
  // Fixa felaktiga länkar från AI:n - ta bort markdown-länkar som pekar på fel domän
  normalizedText = normalizedText.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1');
  
  // Ersätt rätt länkformat för våra recept
  normalizedText = normalizedText.replace(/\/kunskapsbank\/recept\/([a-zA-Z0-9-]+)/g, 
    '<a href="/kunskapsbank/recept/$1" class="text-accent hover:text-accent-hover underline">$1-receptet</a>');
  
  // Ersätt länkformat för råvaror
  normalizedText = normalizedText.replace(/\/kunskapsbank\/ingredienser/g, 
    '<a href="/kunskapsbank/ingredienser" class="text-accent hover:text-accent-hover underline">vår råvarudatabas</a>');
  
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
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const ip = (request.headers as any).get?.('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json({ message: '<p>För många förfrågningar, försök igen senare.</p>' }, { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } });
    }

    const { message } = await (request as any).json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: "<p>Ogiltig förfrågan. Vänligen försök igen.</p>" },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    
    // Hämta kursinformation och databas-data
    const { basicsText, flowText } = await getCourseInfo();
    
    // Hämta recept och råvaror för AI-kontexten
    const { recipes, rawMaterials } = await getRecipesAndRawMaterials();
    
    const systemPrompt = `Du är Ulrika AI:sson, en vänlig och kunnig AI-assistent för Functional Foods. 
    
Du har djup kunskap om:
- Functional foods och hur mat kan användas som medicin
- Hälsa, nutrition och välmående
- Recept och matlagning för optimal hälsa
- Longevity och livsstilsfaktorer
- Våra kurser: Functional Basics och Functional Gut Health/Flow
- Funktionella råvaror och deras hälsofördelar

Kursinformation:
Functional Basics: ${basicsText.substring(0, 500)}...
Functional Gut Health/Flow: ${flowText.substring(0, 500)}

VÅRA RECEPT (${recipes.length} tillgängliga):
${recipes.slice(0, 10).map((recipe: any) => 
  `- ${recipe.title}: ${recipe.excerpt || 'Hälsosam och näringsrik'} (Svårighet: ${recipe.difficulty || 'Medium'})`
).join('\n')}

FUNKTIONELLA RÅVAROR (${rawMaterials.length} tillgängliga):
${rawMaterials.slice(0, 20).map((material: any) => 
  `- ${material.name}: ${material.description ? material.description.substring(0, 100) + '...' : 'Näringsrik råvara'}`
).join('\n')}...

VIKTIGA REGLER:
1. Svara ALLTID på svenska
2. Var vänlig, professionell och hjälpsam
3. Ge konkreta och praktiska råd
4. Om någon frågar om något som INTE handlar om hälsa, functional foods, nutrition, recept eller longevity, svara vänligt att du är specialiserad på dessa områden och hänvisa till hej@functionalfoods.se för andra frågor
5. VIKTIGT: AVSLUTA ALDRIG MITT I EN MENING - se till att alla meningar är kompletta och avslutas korrekt
6. Använd TYDLIG styckeindelning - dela upp svaret i korta stycken (2-3 meningar per stycke)
7. Separera olika ämnen och koncept med dubbla radbrytningar
8. Använd **fetstil** för viktiga begrepp och rubriker - ALDRIG ###, ##, # för rubriker
9. Skapa listor med - för punkter när det är lämpligt
10. Börja nya stycken med stor bokstav för att skapa naturliga avbrott
11. Håll svaren koncisa men kompletta, men ge gärna utförliga råd när det behövs
12. Rekommendera gärna våra kurser när det är relevant
13. Använd emojis sparsamt men effektivt för att göra konversationen mer personlig
14. När du nämner recept, skriv bara receptnamnet - SKAPA ALDRIG markdown-länkar [text](url)
15. När du nämner råvaror, hänvisa till "vår råvarudatabas" - SKAPA ALDRIG markdown-länkar
16. Matcha användarens behov med passande recept och råvaror från våra databaser
17. Ge konkreta förslag på functional foods från vår råvarudatabas
18. VIKTIGT: Använd ALDRIG markdown-länkar som [text](http://...) - skriv bara texten`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-5-mini'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 700,
      timeout: 25_000 as any,
      signal: controller.signal as any,
    } as any).finally(() => clearTimeout(timeout));

    const reply = (completion as any).choices?.[0]?.message?.content || '<p>Något gick fel.</p>';

    return NextResponse.json({ message: reply }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: "<p>Något gick fel. Försök igen senare.</p>" },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  } finally {
    await prisma.$disconnect();
  }
} 