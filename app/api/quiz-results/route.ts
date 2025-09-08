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

function getLang(req: NextRequest): 'sv'|'en'|'es'|'de'|'fr' {
  try {
    const cookie = req.cookies.get('lang')?.value;
    if (cookie === 'en' || cookie === 'es' || cookie === 'de' || cookie === 'fr') return cookie;
  } catch {}
  return 'sv';
}

function buildLocalFallback(answers: Record<number, string>, lang: string) {
  const scores = calculateHealthScores(answers);
  const t = (sv: string, en?: string) => lang === 'en' && en ? en : sv;
  return {
    success: true,
    results: {
      profile: t(
        '<p>Baserat på dina quiz-svar visar din hälsoprofil både styrkor och områden med potential för förbättring. Vi kan optimera energi, sömn och stress med riktade functional foods och rutiner.</p>',
        '<p>Based on your answers, your profile shows strengths and opportunities. We can optimize energy, sleep and stress with targeted functional foods and routines.</p>'
      ),
      recommendations: [
        { title: t('Magnesium för återhämtning', 'Magnesium for recovery'), description: '<p>Stödjer sömn och muskler. Kombinera med kvällsrutin.</p>', howToUse: '<p>200–400 mg magnesiumcitrat 1 h före sänggående.</p>' },
        { title: t('Omega‑3 för hjärna och hjärta', 'Omega‑3 for brain & heart'), description: '<p>Minskar inflammation och stödjer kognition.</p>', howToUse: '<p>1 000 mg EPA/DHA dagligen eller fet fisk 2–3 ggr/vecka.</p>' },
        { title: t('Probiotika för tarmhälsa', 'Probiotics for gut'), description: '<p>Stödjer mikrobiom och immunförsvar.</p>', howToUse: '<p>Minst 10 miljarder CFU dagligen i 4–6 veckor.</p>' }
      ],
      lifestyleAdvice: [
        t('30 min daglig rörelse', '30 min daily movement'),
        t('7–9 h sömn med regelbunden läggtid', '7–9h sleep with consistent schedule'),
        t('2–3 L vatten/dag', '2–3 L water/day')
      ],
      nextSteps: [t('Vecka 1: Lägg till magnesium och kvällsrutin', 'Week 1: Add magnesium and evening routine')],
      scientificReferences: ['Omega‑3 benefits', 'Magnesium and sleep'],
      warningSignals: [t('Avsluta vid biverkningar och kontakta vård', 'Stop if adverse effects and consult care')],
      successMetrics: [t('Energiskala 1–10 dagligen', 'Daily energy scale 1–10')],
      courseRecommendation: scores.energyScore + scores.sleepScore < 14
        ? t('Vi rekommenderar Functional Basics som grund.', 'We recommend Functional Basics as your foundation.')
        : t('Vi rekommenderar Functional Flow för rutiner.', 'We recommend Functional Flow to build routines.'),
      scores
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json();
    const lang = getLang(request);

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid quiz answers provided' },
        { status: 400 }
      );
    }

    // If OpenAI is not configured, return a robust local fallback instead of 500
    if (!openai) {
      const fallback = buildLocalFallback(answers, lang);
      return NextResponse.json(fallback);
    }

    // Hämta användare från token (om inloggad)
    const authorization = request.headers.get('authorization');
    let userId = null;
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      userId = getUserIdFromToken(token);
    }

    // Convert answers to readable format for analysis
    const answerSummary = Object.entries(answers).map(([questionIndex, answer]) => {
      const questionNum = parseInt(questionIndex) + 1;
      return `Fråga ${questionNum}: ${answer}`;
    }).join('\n');

    const prompt = `
Du är Ulrika Davidsson, en expert på functional foods och hälsa med över 15 års erfarenhet. Du har hjälpt tusentals personer att förbättra sin hälsa genom personaliserade functional food-strategier.

Analysera följande quiz-svar och skapa en OMFATTANDE, PERSONALISERAD hälsoanalys:

Quiz-svar:
${answerSummary}

Skapa en djupgående analys som inkluderar:

1. **HÄLSOPROFIL** (4-5 meningar): Detaljerad bedömning av personens nuvarande hälsostatus, identifierade styrkor och utmaningar, samt potentiella underliggande faktorer som påverkar deras välbefinnande.

2. **FUNCTIONAL FOOD REKOMMENDATIONER** (8-10 stycken): Varje rekommendation ska vara 200-300 ord och inkludera:
   - Varför det passar just denna person baserat på deras svar
   - Specifika bioaktiva föreningar och näringsämnen
   - Vetenskapligt stöd och studier
   - Exakta doseringar och timing
   - Synergier med andra functional foods
   - Förväntat resultat och tidsram
   - Potentiella biverkningar eller försiktighetsåtgärder

3. **LIVSSTILSSTRATEGIER** (12-15 stycken): Omfattande råd inom:
   - Sömnoptimering med specifika rutiner
   - Stresshantering med konkreta tekniker
   - Motionsprotokoll anpassat för personen
   - Mindfulness och mental hälsa
   - Hydrering och elektrolytbalans
   - Intermittent fasting eller måltidstiming
   - Social hälsa och relationer
   - Miljöfaktorer och toxinreducering
   - Hormonal balans
   - Inflammationsreducering
   - Antioxidantstrategier
   - Tarmhälsa och mikrobiom

4. **PERSONLIG HANDLINGSPLAN** (10-12 stycken): Detaljerad steg-för-steg guide med:
   - Vecka 1-2: Grundläggande förändringar
   - Vecka 3-4: Utbyggnad av rutiner
   - Månad 2: Fördjupning och optimering
   - Månad 3: Avancerade strategier
   - Månad 4-6: Stabilisering och finjustering
   - Långsiktig underhåll och utveckling
   - Uppföljning och utvärdering
   - Anpassning efter säsong och livssituation

5. **VETENSKAPLIGA REFERENSER** (5-8 stycken): Kort sammanfattning av relevanta studier som stödjer rekommendationerna.

6. **VARNINGSSIGNALER** (4-5 stycken): Vad personen ska vara uppmärksam på och när de ska söka professionell hjälp.

7. **FRAMGÅNGSMÄTNING** (6-8 stycken): Konkreta sätt att mäta framsteg och justera strategin.

8. **KURSREKOMMENDATION**: Baserat på quiz-svaren, rekommendera antingen Functional Basics (om flera grunddomäner är svaga) eller Functional Flow (om grunderna finns men rutin/optimering behövs). Motivera med specifika problem som framkommit i svaren och hur kursen löser dessa.

Använd HTML-formatering: <strong> för viktiga begrepp, <br> för radbrytningar, <p> för stycken, <em> för betoning.
Håll en varm, professionell och uppmuntrande ton som Ulrika Davidsson.
Var extremt specifik och konkret - inkludera exakta mängder, tider, märken när relevant.

Formatera svaret som JSON med följande struktur:
{
  "profile": "Omfattande hälsoprofil med HTML-formatering",
  "recommendations": [
    {
      "title": "Functional food titel",
      "description": "Djupgående beskrivning (200-300 ord) med näringsämnen, vetenskapligt stöd, varför det passar denna person",
      "howToUse": "Extremt detaljerade instruktioner för konsumtion, timing, dosering, kombinationer, försiktighetsåtgärder"
    }
  ],
  "lifestyleAdvice": [
    "Omfattande livsstilsråd med vetenskapligt stöd och konkreta handlingsplaner",
    "Detaljerat råd med tidsramar, mål och mätbara resultat"
  ],
  "nextSteps": [
    "Vecka 1: Extremt detaljerat första steg med dagliga rutiner och specifika mål"
  ],
  "scientificReferences": ["Kort forskningstext"],
  "warningSignals": ["Varningstext"],
  "successMetrics": ["Mätmetod"],
  "courseRecommendation": "Rekommendationstext"
}`;

    const completion = await chatWithFallback(openai, {
      messages: [
        { role: "system", content: `Du är Ulrika Davidsson, en expert på functional foods och hälsa. Du ger personaliserade råd baserat på quiz-svar. Svara på språket: ${lang}. Använd HTML-formatering: <strong> för fetstil, <br> för radbrytningar, <p> för stycken.` },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    } as any);

    const result = (completion as any).choices?.[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let parsedResult;
    try {
      // Clean the result string first
      let cleanResult = result.trim();
      cleanResult = cleanResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const firstBrace = cleanResult.indexOf('{');
      const lastBrace = cleanResult.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanResult = cleanResult.substring(firstBrace, lastBrace + 1);
      }
      parsedResult = JSON.parse(cleanResult);
      if (!parsedResult.profile || !parsedResult.recommendations) {
        throw new Error('Invalid structure');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', result);
      parsedResult = buildLocalFallback(answers, lang).results;
    }

    // Beräkna hälsopoäng
    const scores = calculateHealthScores(answers);

    // Enkel fallback-kursrekommendation om fältet saknas
    if (!parsedResult.courseRecommendation) {
      const weakDomains = [scores.energyScore, scores.sleepScore, scores.stressScore, scores.dietScore, scores.exerciseScore].filter(s => s <= 5).length;
      parsedResult.courseRecommendation = weakDomains >= 3
        ? (lang==='en' ? 'We recommend Functional Basics as your foundation.' : 'Vi rekommenderar Functional Basics som grund.')
        : (lang==='en' ? 'We recommend Functional Flow to build strong routines.' : 'Vi rekommenderar Functional Flow för att bygga starka rutiner.');
    }

    // Spara quiz-resultat i databasen om användaren är inloggad
    if (userId) {
      try {
        await prisma.quizResult.create({
          data: ({
            userId,
            answers,
            results: parsedResult,
            healthScore: scores.healthScore,
            energyScore: scores.energyScore,
            sleepScore: scores.sleepScore,
            stressScore: scores.stressScore,
            dietScore: scores.dietScore,
            exerciseScore: scores.exerciseScore,
          } as any)
        });
      } catch (dbError) {
        console.error('Failed to save quiz result to database:', dbError);
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