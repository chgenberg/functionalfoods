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
  
  // Determine which areas need most attention
  const weakAreas = [];
  if (scores.energyScore <= 5) weakAreas.push('energy');
  if (scores.sleepScore <= 5) weakAreas.push('sleep');
  if (scores.stressScore <= 5) weakAreas.push('stress');
  if (scores.dietScore <= 5) weakAreas.push('diet');
  if (scores.exerciseScore <= 5) weakAreas.push('exercise');
  
  return {
    success: true,
    results: {
      profile: lang === 'en' ? 
        'Based on your responses, we see opportunities to optimize your health through targeted functional foods. Your health profile shows both strengths to build upon and areas where strategic nutritional support can make a significant difference.' :
        'Baserat på dina svar ser vi möjligheter att optimera din hälsa genom riktade functional foods. Din hälsoprofil visar både styrkor att bygga vidare på och områden där strategiskt näringsstöd kan göra stor skillnad.',
      recommendations: [
        {
          title: lang === 'en' ? 'Omega-3 Rich Foods' : 'Omega-3 rika livsmedel',
          description: lang === 'en' ? 
            'Essential fatty acids that support brain health, reduce inflammation, and improve cardiovascular function. Studies show omega-3s can enhance mood, cognitive performance, and recovery from exercise.' :
            'Essentiella fettsyror som stödjer hjärnhälsa, minskar inflammation och förbättrar kardiovaskulär funktion. Studier visar att omega-3 kan förbättra humör, kognitiv prestanda och återhämtning från träning.',
          howToUse: lang === 'en' ?
            'Include fatty fish like salmon or mackerel 2-3 times per week. Alternatively, take 1000-2000mg high-quality fish oil daily with meals. For vegetarians, use algae-based omega-3 supplements.' :
            'Inkludera fet fisk som lax eller makrill 2-3 gånger per vecka. Alternativt, ta 1000-2000mg högkvalitativ fiskolja dagligen med måltider. För vegetarianer, använd algbaserade omega-3-tillskott.'
        },
        {
          title: lang === 'en' ? 'Adaptogenic Herbs' : 'Adaptogena örter',
          description: lang === 'en' ?
            'Natural compounds that help your body adapt to stress and maintain balance. Ashwagandha, rhodiola, and reishi mushroom can improve stress resilience and energy levels.' :
            'Naturliga föreningar som hjälper din kropp att anpassa sig till stress och bibehålla balans. Ashwagandha, rhodiola och reishi-svamp kan förbättra stressmotståndskraft och energinivåer.',
          howToUse: lang === 'en' ?
            'Take 300-600mg ashwagandha in the morning or 200-400mg rhodiola before noon. For evening relaxation, try reishi mushroom tea or 500mg extract before bed.' :
            'Ta 300-600mg ashwagandha på morgonen eller 200-400mg rhodiola före lunch. För kvällsavslappning, prova reishi-svampte eller 500mg extrakt före sänggåendet.'
        },
        {
          title: lang === 'en' ? 'Fermented Foods' : 'Fermenterade livsmedel',
          description: lang === 'en' ?
            'Probiotic-rich foods that support gut health, immune function, and mental well-being through the gut-brain axis. A healthy microbiome is essential for optimal nutrient absorption.' :
            'Probiotikarika livsmedel som stödjer tarmhälsa, immunfunktion och mentalt välbefinnande genom tarm-hjärna-axeln. En hälsosam mikrobiom är avgörande för optimal näringsupptag.',
          howToUse: lang === 'en' ?
            'Include 1-2 servings daily: kefir, sauerkraut, kimchi, or kombucha. Start with small amounts and gradually increase. Best consumed with meals for optimal probiotic survival.' :
            'Inkludera 1-2 portioner dagligen: kefir, surkål, kimchi eller kombucha. Börja med små mängder och öka gradvis. Bäst konsumerat med måltider för optimal probiotisk överlevnad.'
        }
      ],
      priorityAreas: [
        {
          area: lang === 'en' ? 'Energy & Vitality' : 'Energi & Vitalitet',
          description: lang === 'en' ? 
            'Your energy levels could benefit from targeted nutritional support to maintain consistent energy throughout the day.' :
            'Dina energinivåer kan dra nytta av riktad näringsstöd för att bibehålla jämn energi genom hela dagen.',
          suggestions: [
            lang === 'en' ? 'B-vitamin complex in the morning' : 'B-vitaminkomplex på morgonen',
            lang === 'en' ? 'Adaptogens like ashwagandha' : 'Adaptogener som ashwagandha',
            lang === 'en' ? 'Iron-rich foods with vitamin C' : 'Järnrika livsmedel med C-vitamin',
            lang === 'en' ? 'Magnesium for cellular energy' : 'Magnesium för cellulär energi'
          ]
        },
        {
          area: lang === 'en' ? 'Stress Management' : 'Stresshantering',
          description: lang === 'en' ?
            'Supporting your body\'s stress response system can improve both mental clarity and physical resilience.' :
            'Att stödja kroppens stressresponssystem kan förbättra både mental klarhet och fysisk motståndskraft.',
          suggestions: [
            lang === 'en' ? 'L-theanine with morning coffee' : 'L-theanin med morgonkaffet',
            lang === 'en' ? 'Magnesium glycinate evening' : 'Magnesiumglycinat på kvällen',
            lang === 'en' ? 'Rhodiola for acute stress' : 'Rhodiola för akut stress',
            lang === 'en' ? 'Holy basil tea daily' : 'Holy basil-te dagligen'
          ]
        },
        {
          area: lang === 'en' ? 'Digestive Health' : 'Matsmältningshälsa',
          description: lang === 'en' ?
            'A healthy gut is the foundation for nutrient absorption and overall well-being.' :
            'En hälsosam tarm är grunden för näringsupptag och allmänt välbefinnande.',
          suggestions: [
            lang === 'en' ? 'Prebiotic fiber foods' : 'Prebiotiska fiberrika livsmedel',
            lang === 'en' ? 'Digestive enzymes with meals' : 'Matsmältningsenzymer med måltider',
            lang === 'en' ? 'Ginger tea after eating' : 'Ingefärste efter mat',
            lang === 'en' ? 'Avoid eating late' : 'Undvik att äta sent'
          ]
        }
      ],
      functionalFoods: [
        {
          name: lang === 'en' ? 'Turmeric' : 'Gurkmeja',
          benefits: [
            lang === 'en' ? 'Anti-inflammatory' : 'Antiinflammatorisk',
            lang === 'en' ? 'Antioxidant' : 'Antioxidant',
            lang === 'en' ? 'Brain protection' : 'Hjärnskydd'
          ],
          timing: lang === 'en' ? 'With fatty meals' : 'Med fettrika måltider',
          dosage: lang === 'en' ? '500-1000mg curcumin daily' : '500-1000mg kurkumin dagligen'
        },
        {
          name: lang === 'en' ? 'Green Tea' : 'Grönt te',
          benefits: [
            lang === 'en' ? 'Metabolism boost' : 'Metabolismboost',
            lang === 'en' ? 'Mental clarity' : 'Mental klarhet',
            lang === 'en' ? 'Antioxidants' : 'Antioxidanter'
          ],
          timing: lang === 'en' ? 'Morning and afternoon' : 'Morgon och eftermiddag',
          dosage: lang === 'en' ? '2-3 cups daily' : '2-3 koppar dagligen'
        },
        {
          name: lang === 'en' ? 'Magnesium' : 'Magnesium',
          benefits: [
            lang === 'en' ? 'Muscle relaxation' : 'Muskelavslappning',
            lang === 'en' ? 'Better sleep' : 'Bättre sömn',
            lang === 'en' ? 'Stress reduction' : 'Stressreducering'
          ],
          timing: lang === 'en' ? 'Evening, 1h before bed' : 'Kväll, 1h före sänggående',
          dosage: lang === 'en' ? '200-400mg magnesium glycinate' : '200-400mg magnesiumglycinat'
        },
        {
          name: lang === 'en' ? 'Collagen' : 'Kollagen',
          benefits: [
            lang === 'en' ? 'Joint health' : 'Ledhälsa',
            lang === 'en' ? 'Skin elasticity' : 'Hudelasticitet',
            lang === 'en' ? 'Gut healing' : 'Tarmläkning'
          ],
          timing: lang === 'en' ? 'Morning on empty stomach' : 'Morgon på tom mage',
          dosage: lang === 'en' ? '10-20g collagen peptides' : '10-20g kollagenpeptider'
        }
      ],
      warnings: [
        lang === 'en' ? 'Always consult healthcare provider before starting new supplements, especially if taking medications' : 'Konsultera alltid vårdgivare innan du börjar med nya tillskott, särskilt om du tar mediciner',
        lang === 'en' ? 'Start with lower doses and gradually increase to assess tolerance' : 'Börja med lägre doser och öka gradvis för att bedöma tolerans',
        lang === 'en' ? 'Stop use if you experience any adverse reactions' : 'Sluta använda om du upplever några biverkningar'
      ],
      lifestyleAdvice: [
        lang === 'en' ? 'Prioritize 7-9 hours of quality sleep each night' : 'Prioritera 7-9 timmar kvalitetssömn varje natt',
        lang === 'en' ? 'Stay hydrated with 8-10 glasses of water daily' : 'Håll dig hydrerad med 8-10 glas vatten dagligen',
        lang === 'en' ? 'Include 30 minutes of movement in your daily routine' : 'Inkludera 30 minuter rörelse i din dagliga rutin',
        lang === 'en' ? 'Practice stress-reduction techniques like deep breathing' : 'Öva stressreducerande tekniker som djupandning',
        lang === 'en' ? 'Eat a rainbow of colorful fruits and vegetables' : 'Ät en regnbåge av färgglada frukter och grönsaker',
        lang === 'en' ? 'Limit processed foods and added sugars' : 'Begränsa processad mat och tillsatt socker'
      ],
      nextSteps: [
        lang === 'en' ? 'Week 1-2: Start with one new functional food and track how you feel' : 'Vecka 1-2: Börja med en ny functional food och spåra hur du mår',
        lang === 'en' ? 'Week 3-4: Add a second functional food and establish morning routine' : 'Vecka 3-4: Lägg till en andra functional food och etablera morgonrutin',
        lang === 'en' ? 'Month 2: Focus on sleep optimization and stress management' : 'Månad 2: Fokusera på sömnoptimering och stresshantering',
        lang === 'en' ? 'Month 3: Fine-tune doses and timing based on your results' : 'Månad 3: Finjustera doser och timing baserat på dina resultat',
        lang === 'en' ? 'Ongoing: Regular health check-ins and seasonal adjustments' : 'Löpande: Regelbundna hälsokontroller och säsongsjusteringar'
      ],
      longTermVision: lang === 'en' ?
        'Achieve optimal health through personalized nutrition and lifestyle strategies that support your unique needs.' :
        'Uppnå optimal hälsa genom personlig nutrition och livsstilsstrategier som stödjer dina unika behov.',
      supplements: [],
      nutrition: [],
      exercise: [],
      stressManagement: [],
      sleepOptimization: [],
      successMetrics: [
        lang === 'en' ? 'Track energy levels daily on a 1-10 scale' : 'Spåra energinivåer dagligen på en 1-10 skala',
        lang === 'en' ? 'Monitor sleep quality and time to fall asleep' : 'Övervaka sömnkvalitet och tid till insomnande',
        lang === 'en' ? 'Note changes in mood and mental clarity' : 'Notera förändringar i humör och mental klarhet',
        lang === 'en' ? 'Weekly check-in on digestive health' : 'Veckovis kontroll av matsmältningshälsa',
        lang === 'en' ? 'Monthly progress photos and measurements' : 'Månatliga framstegsfoton och mätningar'
      ],
      courseRecommendation: weakAreas.length >= 3 ?
        (lang === 'en' ? 
          'Based on your results, we recommend starting with Functional Basics. This comprehensive course will give you a strong foundation in functional nutrition, helping you address multiple health areas systematically. You\'ll learn the science behind functional foods and how to implement them effectively in your daily life.' :
          'Baserat på dina resultat rekommenderar vi att börja med Functional Basics. Denna omfattande kurs ger dig en stark grund i funktionell nutrition och hjälper dig att ta itu med flera hälsoområden systematiskt. Du kommer att lära dig vetenskapen bakom functional foods och hur du implementerar dem effektivt i ditt dagliga liv.') :
        (lang === 'en' ? 
          'We recommend Functional Flow to help you build sustainable health routines. This course focuses on creating personalized systems that fit seamlessly into your lifestyle, ensuring long-term success with functional foods and healthy habits.' :
          'Vi rekommenderar Functional Flow för att hjälpa dig bygga hållbara hälsorutiner. Denna kurs fokuserar på att skapa personliga system som passar sömlöst in i din livsstil och säkerställer långsiktig framgång med functional foods och hälsosamma vanor.'),
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
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('OpenAI not configured, using fallback');
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

2. **FUNCTIONAL FOOD REKOMMENDATIONER** (3-5 stycken): Varje rekommendation ska inkludera:
   - Varför det passar just denna person baserat på deras svar
   - Specifika bioaktiva föreningar och näringsämnen
   - Exakta doseringar och timing
   - Förväntat resultat och tidsram

3. **PRIORITERADE OMRÅDEN** (3-4 stycken): För varje område inkludera:
   - Området (t.ex. "Energi & Vitalitet", "Sömnkvalitet", "Stresshantering")
   - Beskrivning av varför detta är prioriterat
   - 3-4 konkreta förslag

4. **FUNCTIONAL FOODS** (4-6 stycken): För varje functional food inkludera:
   - Namn på functional food
   - 2-3 huvudsakliga fördelar
   - När på dagen den ska tas
   - Exakt dosering

5. **LIVSSTILSRÅD** (6-8 stycken): Konkreta råd för dagliga rutiner

6. **NÄSTA STEG** (5-6 stycken): Steg-för-steg handlingsplan

7. **VARNINGAR** (2-3 stycken): Viktiga säkerhetsaspekter

8. **KURSREKOMMENDATION**: Baserat på quiz-svaren, rekommendera antingen Functional Basics eller Functional Flow med motivering.

VIKTIGT: Använd INTE markdown-formatering som ### eller **. Returnera ren text.

Returera ditt svar som en JSON med följande struktur:
{
  "profile": "Detaljerad hälsoprofil",
  "recommendations": [
    {
      "title": "Namn på functional food",
      "description": "Detaljerad beskrivning",
      "howToUse": "Konkret användning"
    }
  ],
  "priorityAreas": [
    {
      "area": "Område",
      "description": "Förklaring",
      "suggestions": ["Förslag 1", "Förslag 2", "Förslag 3"]
    }
  ],
  "functionalFoods": [
    {
      "name": "Functional food namn",
      "benefits": ["Fördel 1", "Fördel 2"],
      "timing": "När på dagen",
      "dosage": "Hur mycket"
    }
  ],
  "warnings": ["Varning 1", "Varning 2"],
  "lifestyleAdvice": ["Råd 1", "Råd 2"],
  "nextSteps": ["Steg 1", "Steg 2"],
  "longTermVision": "Vision för långsiktig hälsa",
  "supplements": ["Tillskott 1", "Tillskott 2"],
  "nutrition": ["Näringsråd 1", "Näringsråd 2"],
  "exercise": ["Träningsråd 1", "Träningsråd 2"],
  "stressManagement": ["Stresshantering 1", "Stresshantering 2"],
  "sleepOptimization": ["Sömnråd 1", "Sömnråd 2"],
  "successMetrics": ["Mätmetod 1", "Mätmetod 2"],
  "courseRecommendation": "Rekommendationstext"
}`;

    try {
      const completion = await chatWithFallback(openai, {
        messages: [
          { role: "system", content: `Du är Ulrika Davidsson, en expert på functional foods och hälsa. Du ger personaliserade råd baserat på quiz-svar. Svara på språket: ${lang}. Använd INTE markdown-formatering.` },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
        // Remove any markdown code blocks
        cleanResult = cleanResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        // Find JSON object
        const firstBrace = cleanResult.indexOf('{');
        const lastBrace = cleanResult.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanResult = cleanResult.substring(firstBrace, lastBrace + 1);
        }
        
        parsedResult = JSON.parse(cleanResult);
        
        // Validate required fields
        if (!parsedResult.profile || !parsedResult.recommendations) {
          throw new Error('Invalid structure');
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError);
        console.error('Raw response:', result);
        // Use fallback if parsing fails
        return NextResponse.json(buildLocalFallback(answers, lang));
      }

      // Beräkna hälsopoäng
      const scores = calculateHealthScores(answers);

      // Ensure all required fields exist with defaults
      parsedResult = {
        profile: parsedResult.profile || '',
        recommendations: parsedResult.recommendations || [],
        priorityAreas: parsedResult.priorityAreas || [],
        functionalFoods: parsedResult.functionalFoods || [],
        warnings: parsedResult.warnings || [],
        lifestyleAdvice: parsedResult.lifestyleAdvice || [],
        nextSteps: parsedResult.nextSteps || [],
        longTermVision: parsedResult.longTermVision || '',
        supplements: parsedResult.supplements || [],
        nutrition: parsedResult.nutrition || [],
        exercise: parsedResult.exercise || [],
        stressManagement: parsedResult.stressManagement || [],
        sleepOptimization: parsedResult.sleepOptimization || [],
        successMetrics: parsedResult.successMetrics || [],
        courseRecommendation: parsedResult.courseRecommendation || ''
      };

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

    } catch (openAiError) {
      console.error('OpenAI API error:', openAiError);
      // Return fallback data on any OpenAI error
      return NextResponse.json(buildLocalFallback(answers, lang));
    }

  } catch (error) {
    console.error('Quiz analysis error:', error);
    // Try to return a meaningful fallback response
    try {
      const { answers } = await request.json().catch(() => ({ answers: {} }));
      const lang = getLang(request);
      return NextResponse.json(buildLocalFallback(answers || {}, lang));
    } catch {
      return NextResponse.json(
        { error: 'Failed to analyze quiz results' },
        { status: 500 }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
} 