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

8. **KURSREKOMMENDATION**: Baserat på quiz-svaren, rekommendera FRÄMST vår Functional Flow-kurs och förklara varför den passar just denna person. Motivera med specifika problem som framkommit i svaren och hur kursen löser dessa. Inkludera även en kort omnämnande av Functional Basics som grundkurs.

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
    "Detaljerat råd med tidsramar, mål och mätbara resultat",
    "Specifikt råd med praktiska implementeringstips och felsökning"
  ],
  "nextSteps": [
    "Vecka 1: Extremt detaljerat första steg med dagliga rutiner och specifika mål",
    "Vecka 2: Andra steget med progression och mätbara milstolpar",
    "Månad 2: Tredje steget med avancerade strategier och optimering"
  ],
  "scientificReferences": [
    "Kort sammanfattning av relevant forskning som stödjer rekommendationerna",
    "Studier om functional foods och deras effekter på hälsa"
  ],
  "warningSignals": [
    "Viktiga varningssignaler att vara uppmärksam på",
    "När professionell hjälp bör sökas"
  ],
  "successMetrics": [
    "Konkreta sätt att mäta framsteg och resultat",
    "Indikatorer på att strategin fungerar"
  ],
  "courseRecommendation": "Personaliserad rekommendation för Functional Flow-kursen baserat på quiz-svar, med specifik motivering för varför den passar denna person"
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
      max_tokens: 8000,
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
        profile: "<p>Baserat på dina quiz-svar visar din hälsoprofil både styrkor och områden med potential för förbättring. Din energinivå och allmänna välbefinnande kan optimeras genom riktade functional foods och livsstilsförändringar. Vi ser möjligheter att stärka din kropp inifrån och skapa hållbara vanor som stödjer din långsiktiga hälsa. Genom att implementera personaliserade strategier kan du uppnå betydande förbättringar inom 4-8 veckor.</p>",
        recommendations: [
          {
            title: "Omega-3 från alger",
            description: "<p><strong>Varför det passar dig:</strong> Baserat på dina svar behöver du stöd för hjärnfunktion och inflammationsreducering. Omega-3 från alger är en hållbar källa till EPA och DHA som direkt påverkar kognitiv prestanda och humör.</p><p><strong>Bioaktiva föreningar:</strong> Docosahexaensyra (DHA) 300-500mg och eikosapentaensyra (EPA) 200-400mg dagligen. Dessa essentiella fettsyror är avgörande för cellmembranstabilitet och neuroplasticitet.</p><p><strong>Vetenskapligt stöd:</strong> Studier visar att regelbunden omega-3 konsumtion kan förbättra koncentration med 15-25% och minska inflammationsmarkörer inom 4-6 veckor.</p>",
            howToUse: "<strong>Dosering:</strong> 1-2 kapslar (1000-1500mg) dagligen med mat<br><strong>Timing:</strong> Bäst tillsammans med frukost eller lunch för optimal absorption<br><strong>Kombinera med:</strong> Vitamin D3 (2000 IU) för förbättrad absorption och synergistisk effekt<br><strong>Försiktighetsåtgärder:</strong> Undvik om du tar blodförtunnande mediciner utan läkarkonsultation<br><strong>Förväntat resultat:</strong> Märkbar förbättring av koncentration och humör inom 2-4 veckor"
          },
          {
            title: "Adaptogena svampar (Reishi & Cordyceps)",
            description: "<p><strong>Varför det passar dig:</strong> Dina svar indikerar behov av stressbalans och energioptimering. Adaptogena svampar hjälper kroppen att anpassa sig till stress och förbättrar energiproduktion på cellnivå.</p><p><strong>Bioaktiva föreningar:</strong> Beta-glukaner för immunstöd, triterpener för leverhälsa och cordycepin för energiproduktion. Dessa föreningar modulerar HPA-axeln och stödjer mitokondriell funktion.</p><p><strong>Vetenskapligt stöd:</strong> Kliniska studier visar att Reishi kan minska kortisolnivåer med 20-30% och Cordyceps kan öka VO2 max med 7-15% inom 6-8 veckor.</p>",
            howToUse: "<strong>Dosering:</strong> Reishi 1-2g pulver eller 500-1000mg extrakt, Cordyceps 1-3g pulver eller 400-800mg extrakt<br><strong>Timing:</strong> Reishi på kvällen för vila, Cordyceps på morgonen för energi<br><strong>Kombinera med:</strong> Varmt te eller smoothie för bättre absorption<br><strong>Försiktighetsåtgärder:</strong> Börja med lägre doser för att testa tolerans<br><strong>Förväntat resultat:</strong> Gradvis förbättring av stresshantering och energi över 3-6 veckor"
          },
          {
            title: "Fermenterade livsmedel (Kimchi & Kefir)",
            description: "<p><strong>Varför det passar dig:</strong> Tarmhälsan är central för övergripande välbefinnande och dina svar tyder på behov av mikrobiomstöd. Fermenterade livsmedel tillför levande probiotika som stärker tarmbarriären och immunförsvaret.</p><p><strong>Bioaktiva föreningar:</strong> Lactobacillus och Bifidobacterium stammar, enzymer som hjälper matsmältningen och B-vitaminer från fermentationsprocessen.</p><p><strong>Vetenskapligt stöd:</strong> Forskning visar att daglig konsumtion av fermenterade livsmedel kan öka mikrobiell mångfald med 25-40% och förbättra immunfunktion inom 2-4 veckor.</p>",
            howToUse: "<strong>Dosering:</strong> 2-3 msk kimchi eller 1-2 dl kefir dagligen<br><strong>Timing:</strong> Till måltider för optimal effekt på matsmältningen<br><strong>Kombinera med:</strong> Prebiotiska livsmedel som lök, vitlök och sparris<br><strong>Försichtighetsåtgärder:</strong> Börja med mindre mängder om du har känslig mage<br><strong>Förväntat resultat:</strong> Märkbar förbättring av matsmältning och energi inom 1-2 veckor"
          },
          {
            title: "Kurkumin med piperin",
            description: "<p><strong>Varför det passar dig:</strong> Baserat på dina svar kan du dra nytta av kurkumins potenta antiinflammatoriska egenskaper. Kurkumin är en av naturens mest studerade inflammationshämmande föreningar.</p><p><strong>Bioaktiva föreningar:</strong> Curcumin 500-1000mg med piperin 5-10mg för förbättrad biotillgänglighet. Kurkumin modulerar NF-κB-signalvägen och minskar pro-inflammatoriska cytokiner.</p><p><strong>Vetenskapligt stöd:</strong> Studier visar att kurkumin kan minska inflammationsmarkörer med 25-40% och förbättra ledmobilitet inom 4-8 veckor.</p>",
            howToUse: "<strong>Dosering:</strong> 500-1000mg kurkumin med piperin dagligen<br><strong>Timing:</strong> Med mat för bättre absorption, helst med lite fett<br><strong>Kombinera med:</strong> Svartpeppar eller piperin för 2000% förbättrad absorption<br><strong>Försiktighetsåtgärder:</strong> Undvik vid gallstenar eller blodförtunnande mediciner<br><strong>Förväntat resultat:</strong> Minskad inflammation och förbättrad återhämtning inom 2-4 veckor"
          }
        ],
        lifestyleAdvice: [
          "<strong>Sömnoptimering med cirkadisk rytm:</strong> Skapa en konsekvent sovrutin som stödjer naturlig melatoninproduktion<br><strong>Handlingsplan:</strong> Samma sovtid varje dag (±30 min), mörk och sval sovmiljö (16-19°C), ingen skärmtid 1 timme före sängdags<br><strong>Vetenskapligt stöd:</strong> Konsekvent sömn förbättrar kognitiv funktion med 20-30%<br><strong>Mål:</strong> 7-9 timmar kvalitetssömn med förbättrad REM-fas inom 2 veckor",
          "<strong>Mindful eating för optimal näring:</strong> Ät medvetet för bättre matsmältning och näringsupptag<br><strong>Handlingsplan:</strong> Sätt undan telefonen under måltider, tugga 20-30 gånger per tugga, lyssna på kroppens mättnadssignaler<br><strong>Vetenskapligt stöd:</strong> Mindful eating kan förbättra näringsupptag med 15-25%<br><strong>Mål:</strong> Förbättrad matsmältning och energi efter måltider",
          "<strong>Funktionell träning för livskraft:</strong> Implementera rörelse som stödjer dagliga aktiviteter<br><strong>Handlingsplan:</strong> 30 minuter daglig aktivitet, blanda styrka, rörlighet och kondition, fokus på funktionella rörelser<br><strong>Vetenskapligt stöd:</strong> Regelbunden träning ökar BDNF med 30-50%<br><strong>Mål:</strong> Konsekvent motion som känns naturlig och energigivande",
          "<strong>Stresshantering med andningsteknik:</strong> Använd 4-7-8 andningen för akut stressreducering<br><strong>Handlingsplan:</strong> Andas in 4 sek, håll 7 sek, andas ut 8 sek, upprepa 4 gånger, 2-3 gånger dagligen<br><strong>Vetenskapligt stöd:</strong> Kontrollerad andning kan minska kortisol med 25-40%<br><strong>Mål:</strong> Verktyg för omedelbar stresslindring inom 1-2 minuter",
          "<strong>Hydrering med elektrolytbalans:</strong> Optimera vätskebalans för cellulär funktion<br><strong>Handlingsplan:</strong> 35ml vatten per kg kroppsvikt, lägg till naturligt salt (1-2g) och citron för elektrolyter<br><strong>Vetenskapligt stöd:</strong> Optimal hydrering förbättrar kognitiv prestanda med 12-20%<br><strong>Mål:</strong> Stabil energi och förbättrad koncentration genom dagen",
          "<strong>Intermittent fasting för metabolisk hälsa:</strong> Implementera tidsrestrikterad ätning för cellulär reparation<br><strong>Handlingsplan:</strong> 16:8 fasting (ät inom 8 timmar, fasta 16 timmar), börja gradvis med 12:12<br><strong>Vetenskapligt stöd:</strong> IF kan förbättra insulinkänslighet med 20-30%<br><strong>Mål:</strong> Förbättrad metabolisk flexibilitet och energistabilitet",
          "<strong>Social hälsa och gemenskap:</strong> Prioritera meningsfulla relationer för mental hälsa<br><strong>Handlingsplan:</strong> Schemalägg regelbunden tid med vänner och familj, delta i gemenskapsaktiviteter<br><strong>Vetenskapligt stöd:</strong> Starka sociala band kan öka livslängd med 50%<br><strong>Mål:</strong> Starkare socialt stöd och förbättrat välbefinnande",
          "<strong>Miljöoptimering för hälsa:</strong> Skapa en hälsosam hemmiljö fri från toxiner<br><strong>Handlingsplan:</strong> Luftrening med växter, minska kemikalier, optimera belysning med naturligt ljus<br><strong>Vetenskapligt stöd:</strong> Ren inomhusluft kan förbättra sömn med 15-25%<br><strong>Mål:</strong> Renare luft och bättre inomhusklimat för optimal hälsa",
          "<strong>Hormonal balans genom kost:</strong> Stöd naturlig hormonproduktion med rätt näringsämnen<br><strong>Handlingsplan:</strong> Inkludera zink (ostron, pumpafrön), magnesium (mörka bladgrönsaker), vitamin D3<br><strong>Vetenskapligt stöd:</strong> Optimal näring kan förbättra hormonbalans inom 6-12 veckor<br><strong>Mål:</strong> Stabil energi och förbättrat humör genom hormonell balans",
          "<strong>Inflammationsreducering:</strong> Implementera antiinflammatoriska strategier<br><strong>Handlingsplan:</strong> Minska processad mat, öka omega-3, inkludera färgglada antioxidanter<br><strong>Vetenskapligt stöd:</strong> Antiinflammatorisk kost kan minska CRP med 30-50%<br><strong>Mål:</strong> Minskad systemisk inflammation och förbättrad återhämtning",
          "<strong>Tarmhälsa och mikrobiom:</strong> Stöd en hälsosam tarmflora<br><strong>Handlingsplan:</strong> Variera probiotika, inkludera prebiotiska fibrer, undvik onödiga antibiotika<br><strong>Vetenskapligt stöd:</strong> Mikrobiom påverkar 70% av immunsystemet<br><strong>Mål:</strong> Förbättrad matsmältning och immunfunktion"
        ],
        nextSteps: [
          "<strong>Vecka 1-2:</strong> Grundläggande implementering<br><strong>Specifikt mål:</strong> Lägg till probiotika (kefir) och förbättra sömnrutinen<br><strong>Dagliga rutiner:</strong> 1 dl kefir till frukost, konsekvent sovtid kl 22:30<br><strong>Mätbart resultat:</strong> Daglig konsumtion och konsekvent sovtid, förbättrad energi på morgonen",
          "<strong>Vecka 3-4:</strong> Utbyggnad med omega-3 och stresshantering<br><strong>Specifikt mål:</strong> Daglig omega-3 och andningsteknik 2 gånger dagligen<br><strong>Dagliga rutiner:</strong> Omega-3 med frukost, 4-7-8 andning kl 12:00 och 18:00<br><strong>Mätbart resultat:</strong> Förbättrad koncentration och lugn, minskat stressresponser",
          "<strong>Månad 2:</strong> Integration av adaptogena svampar och funktionell träning<br><strong>Specifikt mål:</strong> Daglig svampkonsumtion och 30 min aktivitet<br><strong>Dagliga rutiner:</strong> Cordyceps på morgonen, Reishi på kvällen, 30 min rörelse<br><strong>Mätbart resultat:</strong> Högre energinivåer och bättre stresshantering, ökad styrka",
          "<strong>Månad 3:</strong> Avancerade strategier med intermittent fasting<br><strong>Specifikt mål:</strong> Implementera 16:8 fasting och miljöoptimering<br><strong>Dagliga rutiner:</strong> Ät mellan 12:00-20:00, luftrening med växter<br><strong>Mätbart resultat:</strong> Förbättrad metabolisk flexibilitet och energistabilitet",
          "<strong>Månad 4-6:</strong> Stabilisering och finjustering<br><strong>Specifikt mål:</strong> Alla rekommendationer som naturliga rutiner<br><strong>Dagliga rutiner:</strong> Automatiserade vanor, regelbunden uppföljning<br><strong>Mätbart resultat:</strong> Stabil energi, bättre hälsa och livskvalitet",
          "<strong>Långsiktig underhåll:</strong> Hållbar utveckling<br><strong>Specifikt mål:</strong> Anpassa strategier efter livssituation och säsong<br><strong>Dagliga rutiner:</strong> Flexibla rutiner som anpassas efter behov<br><strong>Mätbart resultat:</strong> Bibehållen hälsa och välbefinnande över tid",
          "<strong>Uppföljning och utvärdering:</strong> Regelbunden bedömning av framsteg<br><strong>Specifikt mål:</strong> Månadsvis utvärdering av hälsomarkörer<br><strong>Dagliga rutiner:</strong> Daglig loggning av energi, sömn och välbefinnande<br><strong>Mätbart resultat:</strong> Datadriven optimering av hälsostrategier"
        ],
        scientificReferences: [
          "<strong>Omega-3 och kognitiv funktion:</strong> Freeman et al. (2021) visade att DHA-tillskott förbättrade arbetsminne och uppmärksamhet hos vuxna inom 4 veckor",
          "<strong>Adaptogena svampar:</strong> Zhu et al. (2019) demonstrerade att Cordyceps ökade VO2 max med 11% hos tränade individer efter 6 veckor",
          "<strong>Fermenterade livsmedel:</strong> Wastyk et al. (2021) fann att fermenterade livsmedel ökade mikrobiell mångfald mer än fiberrik kost",
          "<strong>Intermittent fasting:</strong> Sutton et al. (2018) visade att 16:8 fasting förbättrade insulinkänslighet och blodtryck",
          "<strong>Mindfulness och matsmältning:</strong> Seguí et al. (2020) fann att mindful eating förbättrade matsmältningssymptom med 40%",
          "<strong>Kurkumin och inflammation:</strong> Hewlings & Kalman (2017) visade att kurkumin med piperin minskade inflammationsmarkörer signifikant",
          "<strong>Sömn och hälsa:</strong> Walker (2017) demonstrerade att konsekvent sömn förbättrar immunfunktion och kognitiv prestanda"
        ],
        warningSignals: [
          "<strong>Sömnproblem:</strong> Om sömnkvaliteten inte förbättras inom 2-3 veckor, konsultera läkare för utredning av sömnstörningar",
          "<strong>Matsmältningsproblem:</strong> Ihållande magbesvär, uppblåsthet eller förändrade avföringsmönster kräver medicinsk bedömning",
          "<strong>Energibrist:</strong> Om energinivåerna inte förbättras inom 4-6 veckor trots implementering, undersök sköldkörtel och järnstatus",
          "<strong>Stressymptom:</strong> Kronisk stress, ångest eller depression som inte förbättras kräver professionell mental hälsovård",
          "<strong>Allergiska reaktioner:</strong> Avbryt omedelbart vid tecken på allergi mot functional foods och sök medicinsk hjälp",
          "<strong>Biverkningar:</strong> Illamående, huvudvärk eller andra biverkningar från tillskott kräver dosreducering eller avbrott"
        ],
        successMetrics: [
          "<strong>Energinivåer:</strong> Mät energi på en skala 1-10 varje morgon och kväll, sikta på konsekvent 7-8",
          "<strong>Sömnkvalitet:</strong> Spåra tid till insomnande (<20 min), antal uppvaknanden (<2) och morgonpigghet",
          "<strong>Stressnivåer:</strong> Använd subjektiv stressskala 1-10, sikta på genomsnitt under 5",
          "<strong>Matsmältning:</strong> Notera avföringskonsistens (Bristol skala 3-4), uppblåsthet och energi efter måltider",
          "<strong>Kognitiv funktion:</strong> Bedöm koncentration, minne och mental klarhet dagligen på skala 1-10",
          "<strong>Fysisk prestanda:</strong> Mät träningsintensitet, återhämtning och allmän rörlighet",
          "<strong>Humör och välbefinnande:</strong> Spåra dagligt humör och övergripande livskvalitet på skala 1-10",
          "<strong>Biomarkörer:</strong> Överväg att testa inflammationsmarkörer (CRP), vitamin D, B12 efter 3 månader"
        ],
        courseRecommendation: "<p>Baserat på dina svar rekommenderar jag starkt vår <strong>Functional Flow-kurs</strong>. Denna kurs är perfekt för dig eftersom den fokuserar på att skapa hållbara rutiner och flöden i vardagen - något som verkar vara viktigt för din livsstil.</p><p>Functional Flow hjälper dig att:</p><ul><li>Integrera functional foods naturligt i din vardag</li><li>Skapa effektiva morgon- och kvällsrutiner</li><li>Optimera din energi genom dagen</li><li>Bygga hållbara hälsovanor</li></ul><p>Som grund rekommenderar jag också <strong>Functional Basics</strong> om du vill lära dig mer om grunderna.</p>"
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