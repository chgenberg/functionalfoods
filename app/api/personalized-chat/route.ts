import { NextRequest, NextResponse } from 'next/server';
import { resolveModel, chatWithFallback } from '@/app/lib/ai';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

function getUserIdFromToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded.userId as string;
    }
    return null;
  } catch (error) {
    return null;
  }
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

export async function POST(request: NextRequest) {
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    return NextResponse.json(
      { message: "<p>Konfigurationsfel. Vänligen kontakta support.</p>" },
      { status: 500 }
    );
  }

  try {
    const { message, locale } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: "<p>Ogiltig förfrågan. Vänligen försök igen.</p>" },
        { status: 400 }
      );
    }

    // Hämta användare från token
    const authorization = request.headers.get('authorization');
    let userId = null;
    let user: any = null;
    let userContext = '';

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      userId = getUserIdFromToken(token);
      
      if (userId) {
        try {
          // Hämta användarens fullständiga profil
          user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              quizResults: {
                orderBy: { createdAt: 'desc' } as any,
                take: 1 // Senaste quiz-resultatet
              },
              healthProfile: true,
              symptomAnalyses: {
                orderBy: { createdAt: 'desc' } as any,
                take: 3 // Senaste 3 symptomanalyserna
              },
              chatMessages: {
                orderBy: { createdAt: 'desc' } as any,
                take: 5 // Senaste 5 chat-meddelandena för kontext
              },
              courses: true
            }
          });

          if (user) {
            // Bygg personlig kontext
            userContext = `
PERSONLIG PROFIL FÖR ${user.name || user.email}:

GRUNDINFO:
- Namn: ${user.name || 'Ej angivet'}
- E-post: ${user.email}
- Registrerad: ${user.createdAt.toLocaleDateString('sv-SE')}

`;

            // Lägg till quiz-resultat
            if (user.quizResults.length > 0) {
              const latestQuiz = user.quizResults[0];
              userContext += `SENASTE HÄLSOQUIZ (${latestQuiz.createdAt.toLocaleDateString('sv-SE')}):
- Total hälsopoäng: ${latestQuiz.healthScore}/100
- Energi: ${latestQuiz.energyScore}/10
- Sömn: ${latestQuiz.sleepScore}/10  
- Stress: ${latestQuiz.stressScore}/10
- Kost: ${latestQuiz.dietScore}/10
- Motion: ${latestQuiz.exerciseScore}/10

QUIZ-RESULTAT SAMMANFATTNING:
${typeof latestQuiz.results === 'object' && latestQuiz.results ? 
  `Profil: ${(latestQuiz.results as any).profile || 'Ej tillgänglig'}` : 'Ej tillgänglig'}

`;
            }

            // Lägg till hälsoprofil
            if (user.healthProfile) {
              const profile = user.healthProfile;
              userContext += `HÄLSOPROFIL:
- Ålder: ${profile.age || 'Ej angiven'}
- Kön: ${profile.gender || 'Ej angivet'}
- Aktivitetsnivå: ${profile.activityLevel || 'Ej angiven'}
- Kostbegränsningar: ${profile.dietaryRestrictions || 'Inga'}
- Hälsomål: ${profile.healthGoals ? JSON.stringify(profile.healthGoals) : 'Ej angivna'}
- Nuvarande symptom: ${profile.currentSymptoms ? JSON.stringify(profile.currentSymptoms) : 'Inga'}
- Mediciner: ${profile.medications ? JSON.stringify(profile.medications) : 'Inga'}
- Kosttillskott: ${profile.supplements ? JSON.stringify(profile.supplements) : 'Inga'}
- Allergier: ${profile.allergies ? JSON.stringify(profile.allergies) : 'Inga'}

`;
            }

            // Lägg till symptomanalyser
            if (user.symptomAnalyses.length > 0) {
              userContext += `TIDIGARE SYMPTOMANALYSER:
${user.symptomAnalyses.map((analysis: any, index: number) => 
  `${index + 1}. ${analysis.bodyPart} (${analysis.createdAt.toLocaleDateString('sv-SE')}): ${analysis.description}`
).join('\n')}

`;
            }

            // Lägg till kurser
            if (user.courses.length > 0) {
              userContext += `KURSER:
${user.courses.map((course: any) => 
  `- ${course.title} (Progress: ${course.progress}%)`
).join('\n')}

`;
            }

            // Lägg till tidigare chat-kontext
            if (user.chatMessages.length > 0) {
              userContext += `TIDIGARE CHAT-KONVERSATIONER:
${user.chatMessages.map((chat: any) => 
  `Fråga: ${chat.message}\nSvar: ${chat.response.substring(0, 200)}...`
).join('\n\n')}

`;
            }
          }
        } catch (dbError) {
          console.error('Failed to fetch user data:', dbError);
        }
      }
    }
    
    // Hämta kursinformation och databas-data
    const { basicsText, flowText } = await getCourseInfo();
    const { recipes, rawMaterials } = await getRecipesAndRawMaterials();
    
    const targetLang = locale === 'en' ? 'engelska' : locale === 'es' ? 'spanska' : locale === 'de' ? 'tyska' : locale === 'fr' ? 'franska' : 'svenska';
    const systemPrompt = `Du är Ulrika AI:sson, en vänlig och kunnig AI-assistent för Functional Foods.${userContext ? ` Du chattar nu med en registrerad användare.` : ' Du chattar med en gäst.'}

${userContext || ''}

Du har djup kunskap om:
- Functional foods och hur mat kan användas som medicin
- Hälsa, nutrition och välmående
- Recept och matlagning för optimal hälsa
- Longevity och livsstilsfaktorer
- Våra kurser: Functional Basics och Functional Flow
- Funktionella råvaror och deras hälsofördelar

Kursinformation:
Functional Basics: ${basicsText.substring(0, 500)}...
Functional Flow: ${flowText.substring(0, 500)}...

VÅRA RECEPT (${recipes.length} tillgängliga):
${recipes.slice(0, 10).map((recipe: any) => 
  `- ${recipe.title}: ${recipe.excerpt || 'Hälsosam och näringsrik'} (Svårighet: ${recipe.difficulty || 'Medium'})`
).join('\n')}

FUNKTIONELLA RÅVAROR (${rawMaterials.length} tillgängliga):
${rawMaterials.slice(0, 20).map((material: any) => 
  `- ${material.name}: ${material.description ? material.description.substring(0, 100) + '...' : 'Näringsrik råvara'}`
).join('\n')}

VIKTIGA REGLER:
1. Svara ALLTID på ${targetLang}
2. Var vänlig, professionell och hjälpsam
3. ${userContext ? 'Använd användarens personliga information för att ge skräddarsydda råd' : 'Ge allmänna råd eftersom användaren inte är inloggad'}
4. ${userContext ? 'Referera till användarens quiz-resultat, hälsoprofil och tidigare analyser när det är relevant' : ''}
5. Om någon frågar om något som INTE handlar om hälsa, functional foods, nutrition, recept eller longevity, svara vänligt att du är specialiserad på dessa områden
6. VIKTIGT: AVSLUTA ALDRIG MITT I EN MENING - se till att alla meningar är kompletta och avslutas korrekt
7. Använd TYDLIG styckeindelning - dela upp svaret i korta stycken (2-3 meningar per stycke)
8. Separera olika ämnen och koncept med dubbla radbrytningar
9. Använd **fetstil** för viktiga begrepp och rubriker - ALDRIG ###, ##, # för rubriker
10. Skapa listor med - för punkter när det är lämpligt
11. Börja nya stycken med stor bokstav för att skapa naturliga avbrott
12. Håll svaren koncisa men kompletta (max 300 ord)
13. Rekommendera gärna våra kurser när det är relevant
14. Använd emojis sparsamt men effektivt
15. När du nämner recept, skriv bara receptnamnet - SKAPA ALDRIG markdown-länkar [text](url)
16. När du nämner råvaror, hänvisa till "vår råvarudatabas" - SKAPA ALDRIG markdown-länkar
17. Matcha användarens behov med passande recept och råvaror från våra databaser
18. Ge konkreta förslag på functional foods från vår råvarudatabas
19. VIKTIGT: Använd ALDRIG markdown-länkar som [text](http://...) - skriv bara texten
${userContext ? '19. Kom ihåg att du känner till användarens hälsostatus och kan ge personliga råd baserat på det' : ''}`;

    const completion = await chatWithFallback(openai, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 400,
      temperature: 0.7,
      stop: null,
    });

    let response = completion.choices[0].message.content || "Ursäkta, jag kunde inte generera ett svar just nu.";
    
    // Säkerställ att svaret slutar med en komplett mening
    const lastChar = response.trim().slice(-1);
    if (!['.', '!', '?', ':', '😊', '🌱', '💚'].includes(lastChar)) {
      response = response.trim() + '.';
    }
    
    // Konvertera text till HTML
    const htmlResponse = formatToHtml(response);

    // Spara chat-meddelandet i databasen om användaren är inloggad
    if (userId && user) {
      try {
        await prisma.chatMessage.create({
          data: { userId, message, response: htmlResponse }
        });
      } catch (dbError) {
        console.error('Failed to save chat message:', dbError);
      }
    }

    return NextResponse.json({ message: htmlResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { message: "<p>Ursäkta, något gick fel. Försök igen senare eller kontakta oss på hej@functionalfoods.se</p>" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 