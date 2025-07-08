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

function calculateHealthScores(answers: Record<number, string>) {
  const scores = {
    energyScore: 5,
    sleepScore: 5,
    stressScore: 5,
    dietScore: 5,
    exerciseScore: 5
  };

  // Map quiz answers to scores
  if (answers[0] === 'high_energy') scores.energyScore = 8;
  else if (answers[0] === 'low_energy') scores.energyScore = 3;
  else if (answers[0] === 'afternoon_dip') scores.energyScore = 5;

  if (answers[1] === 'excellent_sleep') scores.sleepScore = 9;
  else if (answers[1] === 'poor_sleep') scores.sleepScore = 3;
  else if (answers[1] === 'good_sleep') scores.sleepScore = 7;

  if (answers[2] === 'low_stress') scores.stressScore = 8;
  else if (answers[2] === 'chronic_stress') scores.stressScore = 3;
  else if (answers[2] === 'moderate_stress') scores.stressScore = 5;

  if (answers[3] === 'very_active') scores.exerciseScore = 8;
  else if (answers[3] === 'sedentary') scores.exerciseScore = 3;
  else if (answers[3] === 'active') scores.exerciseScore = 6;

  if (answers[4] === 'excellent_diet') scores.dietScore = 8;
  else if (answers[4] === 'poor_diet') scores.dietScore = 3;
  else if (answers[4] === 'good_diet') scores.dietScore = 6;

  const healthScore = Math.round(((scores.energyScore + scores.sleepScore + scores.stressScore + scores.dietScore + scores.exerciseScore) / 50) * 100);

  return { ...scores, healthScore };
}

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { answers } = await request.json();
    
    // Hämta användare från token (om inloggad)
    const authorization = request.headers.get('authorization');
    let userId = null;
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      userId = getUserIdFromToken(token);
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    // Convert answers to readable format for analysis
    const answerSummary = Object.entries(answers).map(([questionIndex, answer]) => {
      const questionNum = parseInt(questionIndex) + 1;
      return `Fråga ${questionNum}: ${answer}`;
    }).join('\n');

    const prompt = `
Du är Ulrika Davidsson, en expert på functional foods och hälsa. Analysera följande quiz-svar och ge mycket omfattande, personaliserade rekommendationer.

Quiz-svar:
${answerSummary}

Baserat på svaren, ge:
1. En detaljerad sammanfattning av personens hälsoprofil (3-4 meningar)
2. 6-8 specifika functional food rekommendationer med djupgående förklaringar
3. 8-10 konkreta livsstilsråd som kompletterar functional foods (inkludera sömn, motion, stress, kost, mindfulness, hydrering, social hälsa, miljöfaktorer)
4. 7-9 detaljerade nästa steg för att förbättra hälsan

Svara på svenska och håll en varm, uppmuntrande ton som Ulrika Davidsson.
Använd HTML-formatering: <strong> för viktiga begrepp, <br> för radbrytningar, <p> för stycken.
Var mycket konkret och specifik i dina råd - inkludera doseringar, timing, kombinationer och praktiska tips.

För varje functional food rekommendation, inkludera:
- Varför det passar just denna person
- Specifika näringsämnen och fördelar
- Exakt hur och när det ska konsumeras
- Potentiella kombinationer med andra functional foods
- Vad personen kan förvänta sig för resultat

För livsstilsråd, inkludera:
- Konkreta handlingsplaner
- Tidsramar och mål
- Praktiska tips för implementering
- Koppling till functional foods

Formatera svaret som JSON med följande struktur:
{
  "profile": "Detaljerad sammanfattning av hälsoprofil med HTML-formatering",
  "recommendations": [
    {
      "title": "Functional food titel",
      "description": "Djupgående beskrivning med näringsämnen, fördelar och varför det passar denna person",
      "howToUse": "Detaljerade instruktioner för konsumtion, timing, dosering och kombinationer"
    }
  ],
  "lifestyleAdvice": [
    "Omfattande livsstilsråd med konkreta handlingsplaner",
    "Detaljerat råd med tidsramar och mål",
    "Specifikt råd med praktiska implementeringstips",
    "Råd med koppling till functional foods",
    "Miljöfaktorer och social hälsa råd",
    "Stresshantering med konkreta tekniker",
    "Sömnoptimering med specifika rutiner",
    "Motionsplan anpassad för personen"
  ],
  "nextSteps": [
    "Vecka 1: Detaljerat första steg med specifika mål",
    "Vecka 2-3: Andra steget med progression och mätbara resultat",
    "Månad 2: Tredje steget med utökade rutiner",
    "Månad 3: Fjärde steget med fördjupning",
    "Långsiktigt: Femte steget med hållbara vanor",
    "Uppföljning: Sjätte steget med utvärdering",
    "Optimering: Sjunde steget med finjustering"
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson, en expert på functional foods och hälsa. Du ger personaliserade råd baserat på quiz-svar. Använd HTML-formatering: <strong> för fetstil, <br> för radbrytningar, <p> för stycken."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const result = completion.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let parsedResult;
    try {
      // Clean the result string first
      let cleanResult = result.trim();
      
      // Remove any markdown code blocks
      cleanResult = cleanResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON content between first { and last }
      const firstBrace = cleanResult.indexOf('{');
      const lastBrace = cleanResult.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanResult = cleanResult.substring(firstBrace, lastBrace + 1);
      }
      
      parsedResult = JSON.parse(cleanResult);
      
      // Validate the structure
      if (!parsedResult.profile || !parsedResult.recommendations) {
        throw new Error('Invalid structure');
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', result);
      // Create a better fallback using the raw result
             const cleanText = result.replace(/```json|```/g, '').replace(/^\s*\{.*?\}\s*/, '').trim();
      
      parsedResult = {
        profile: "<p>Baserat på dina quiz-svar visar din hälsoprofil både styrkor och områden med potential för förbättring. Din energinivå och allmänna välbefinnande kan optimeras genom riktade functional foods och livsstilsförändringar. Vi ser möjligheter att stärka din kropp inifrån och skapa hållbara vanor som stödjer din långsiktiga hälsa.</p>",
        recommendations: [
          {
            title: "Omega-3 från alger",
            description: "<strong>Varför det passar dig:</strong> Stödjer hjärnfunktion och minskar inflammation<br><strong>Näringsämnen:</strong> EPA och DHA från hållbara algkällor<br><strong>Fördelar:</strong> Förbättrad koncentration, bättre humör och starkare immunförsvar",
            howToUse: "<strong>Dosering:</strong> 1-2 kapslar dagligen med mat<br><strong>Timing:</strong> Bäst tillsammans med frukost eller lunch<br><strong>Kombinera med:</strong> Vitamin D för optimal absorption<br><strong>Förväntat resultat:</strong> Märkbar förbättring inom 2-4 veckor"
          },
          {
            title: "Adaptogena svampar (Reishi & Cordyceps)",
            description: "<strong>Varför det passar dig:</strong> Balanserar stress och ökar energi naturligt<br><strong>Näringsämnen:</strong> Beta-glukaner, triterpener och polysackarider<br><strong>Fördelar:</strong> Stressresiliens, bättre sömn och förbättrad uthållighet",
            howToUse: "<strong>Dosering:</strong> 1 tsk pulver eller 2 kapslar dagligen<br><strong>Timing:</strong> Reishi på kvällen, Cordyceps på morgonen<br><strong>Kombinera med:</strong> Varmt te eller smoothie<br><strong>Förväntat resultat:</strong> Gradvis förbättring över 3-6 veckor"
          },
          {
            title: "Fermenterade livsmedel (Kimchi & Kefir)",
            description: "<strong>Varför det passar dig:</strong> Stärker tarmhälsan och immunförsvaret<br><strong>Näringsämnen:</strong> Probiotika, enzymer och B-vitaminer<br><strong>Fördelar:</strong> Bättre matsmältning, starkare immunförsvar och förbättrat humör",
            howToUse: "<strong>Dosering:</strong> 2-3 msk kimchi eller 1 dl kefir dagligen<br><strong>Timing:</strong> Till måltider för optimal effekt<br><strong>Kombinera med:</strong> Prebiotika från grönsaker<br><strong>Förväntat resultat:</strong> Märkbar förbättring inom 1-2 veckor"
          }
        ],
        lifestyleAdvice: [
          "<strong>Optimera din sömnhygien:</strong> Skapa en konsekvent sovrutin med 7-9 timmar sömn<br><strong>Handlingsplan:</strong> Samma sovtid varje dag, mörk och sval sovmiljö, ingen skärmtid 1 timme före sängdags<br><strong>Mål:</strong> Förbättrad sömnkvalitet inom 2 veckor",
          "<strong>Implementera mindful eating:</strong> Ät medvetet och utan distraktion<br><strong>Handlingsplan:</strong> Sätt undan telefonen under måltider, tugga långsamt, lyssna på kroppens mättnadssignaler<br><strong>Mål:</strong> Bättre matsmältning och näringsupptag",
          "<strong>Daglig rörelse som glädje:</strong> Hitta aktiviteter du verkligen tycker om<br><strong>Handlingsplan:</strong> 30 minuter daglig aktivitet, blanda styrka och kondition, prova nya aktiviteter<br><strong>Mål:</strong> Konsekvent motion som känns naturlig",
          "<strong>Stresshantering med andningsteknik:</strong> Lär dig 4-7-8 andningen för akut stress<br><strong>Handlingsplan:</strong> Andas in 4 sek, håll 7 sek, andas ut 8 sek, upprepa 4 gånger<br><strong>Mål:</strong> Verktyg för omedelbar stresslindring",
          "<strong>Hydrering med elektrolyter:</strong> Optimera din vätskebalans<br><strong>Handlingsplan:</strong> 2-3 liter vatten dagligen, lägg till naturligt salt och citron<br><strong>Mål:</strong> Stabil energi och bättre koncentration",
          "<strong>Social hälsa och gemenskap:</strong> Prioritera meningsfulla relationer<br><strong>Handlingsplan:</strong> Schemalägg regelbunden tid med vänner och familj<br><strong>Mål:</strong> Starkare socialt stöd och förbättrat välbefinnande",
          "<strong>Miljöoptimering hemma:</strong> Skapa en hälsosam hemmiljö<br><strong>Handlingsplan:</strong> Luftrening med växter, minska kemikalier, optimera belysning<br><strong>Mål:</strong> Renare luft och bättre inomhusklimat",
          "<strong>Digital detox rutiner:</strong> Balansera skärmtid för bättre mental hälsa<br><strong>Handlingsplan:</strong> Skärmfria zoner, regelbundna pauser, mindful teknik-användning<br><strong>Mål:</strong> Minskad digital stress och bättre fokus"
        ],
        nextSteps: [
          "<strong>Vecka 1:</strong> Starta med en functional food och en livsstilsförändring<br><strong>Specifikt mål:</strong> Lägg till probiotika och förbättra sömnrutinen<br><strong>Mätbart resultat:</strong> Daglig konsumtion och konsekvent sovtid",
          "<strong>Vecka 2-3:</strong> Utöka med omega-3 och stresshantering<br><strong>Specifikt mål:</strong> Daglig omega-3 och andningsteknik<br><strong>Mätbart resultat:</strong> Förbättrad koncentration och lugn",
          "<strong>Månad 2:</strong> Integrera adaptogena svampar och motionsrutin<br><strong>Specifikt mål:</strong> Daglig svampkonsumtion och 30 min aktivitet<br><strong>Mätbart resultat:</strong> Högre energinivåer och bättre stresshantering",
          "<strong>Månad 3:</strong> Fördjupa med avancerade functional foods<br><strong>Specifikt mål:</strong> Utforska nya functional foods baserat på resultat<br><strong>Mätbart resultat:</strong> Optimerad hälsoprofil och välbefinnande",
          "<strong>Långsiktigt (3-6 månader):</strong> Etablera hållbara vanor<br><strong>Specifikt mål:</strong> Alla rekommendationer som naturliga rutiner<br><strong>Mätbart resultat:</strong> Stabil energi, bättre hälsa och livskvalitet",
          "<strong>Uppföljning (6 månader):</strong> Utvärdera framsteg och justera<br><strong>Specifikt mål:</strong> Bedöm vilka strategier som fungerar bäst<br><strong>Mätbart resultat:</strong> Personlig hälsoplan som passar din livsstil",
          "<strong>Optimering (löpande):</strong> Finjustera baserat på säsong och livssituation<br><strong>Specifikt mål:</strong> Anpassa rekommendationer efter behov<br><strong>Mätbart resultat:</strong> Flexibel och hållbar hälsostrategi"
        ]
      };
    }

    // Beräkna hälsopoäng
    const scores = calculateHealthScores(answers);

    // Spara quiz-resultat i databasen om användaren är inloggad
    if (userId) {
      try {
        await prisma.quizResult.create({
          data: {
            userId,
            answers,
            results: parsedResult,
            healthScore: scores.healthScore,
            energyScore: scores.energyScore,
            sleepScore: scores.sleepScore,
            stressScore: scores.stressScore,
            dietScore: scores.dietScore,
            exerciseScore: scores.exerciseScore,
          }
        });
      } catch (dbError) {
        console.error('Failed to save quiz result to database:', dbError);
        // Fortsätt ändå, returnera resultatet även om DB-sparningen misslyckades
      }
    }

    return NextResponse.json({
      success: true,
      results: { ...parsedResult, scores }
    });

  } catch (error) {
    console.error('Quiz analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze quiz results' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 