import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
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

    // Hämta användare från token
    const authorization = request.headers.get('authorization');
    let userId = null;
    let user = null;
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
                orderBy: { createdAt: 'desc' },
                take: 1 // Senaste quiz-resultatet
              },
              healthProfile: true,
              symptomAnalyses: {
                orderBy: { createdAt: 'desc' },
                take: 3 // Senaste 3 symptomanalyserna
              },
              chatMessages: {
                orderBy: { createdAt: 'desc' },
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
${user.symptomAnalyses.map((analysis, index) => 
  `${index + 1}. ${analysis.bodyPart} (${analysis.createdAt.toLocaleDateString('sv-SE')}): ${analysis.description}`
).join('\n')}

`;
            }

            // Lägg till kurser
            if (user.courses.length > 0) {
              userContext += `KURSER:
${user.courses.map(course => 
  `- ${course.title} (Progress: ${course.progress}%)`
).join('\n')}

`;
            }

            // Lägg till tidigare chat-kontext
            if (user.chatMessages.length > 0) {
              userContext += `TIDIGARE CHAT-KONVERSATIONER:
${user.chatMessages.map(chat => 
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
    
    // Hämta kursinformation
    const { basicsText, flowText } = await getCourseInfo();
    
    const systemPrompt = `Du är Ulrika AI:sson, en vänlig och kunnig AI-assistent för Functional Foods.${userContext ? ` Du chattar nu med en registrerad användare.` : ' Du chattar med en gäst.'}

${userContext || ''}

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
3. ${userContext ? 'Använd användarens personliga information för att ge skräddarsydda råd' : 'Ge allmänna råd eftersom användaren inte är inloggad'}
4. ${userContext ? 'Referera till användarens quiz-resultat, hälsoprofil och tidigare analyser när det är relevant' : ''}
5. Om någon frågar om något som INTE handlar om hälsa, functional foods, nutrition, recept eller longevity, svara vänligt att du är specialiserad på dessa områden
6. AVSLUTA ALDRIG MITT I EN MENING - se till att alla meningar är kompletta
7. Använd styckeindelning för bättre läsbarhet
8. Håll svaren koncisa men kompletta (max 300 ord)
9. Rekommendera gärna våra kurser när det är relevant
10. Använd emojis sparsamt men effektivt
${userContext ? '11. Kom ihåg att du känner till användarens hälsostatus och kan ge personliga råd baserat på det' : ''}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
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
    
    // Konvertera markdown till HTML
    const htmlResponse = markdownToHtml(response);

    // Spara chat-meddelandet i databasen om användaren är inloggad
    if (userId && user) {
      try {
        await prisma.chatMessage.create({
          data: {
            userId,
            message,
            response: htmlResponse,
            context: userContext ? {
              hasQuizResults: user.quizResults.length > 0,
              hasHealthProfile: !!user.healthProfile,
              symptomAnalysesCount: user.symptomAnalyses.length,
              coursesCount: user.courses.length
            } : null
          }
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