import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Lazily create OpenAI client only when an API key exists
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  return new OpenAI({ apiKey });
}

interface HealthTestData {
  answers: Record<number, string | string[]>;
  contextData?: {
    weather?: any;
    air?: any;
    pollen?: any;
    places?: any[];
    enhanced?: {
      location?: any;
      timezone?: any;
      circadian?: any[];
      safety?: any;
      research?: any[];
    };
  };
  functionalFoods?: any[];
  userProfile?: {
    firstName: string;
    email: string;
  };
}

function analyzeQuizAnswers(answers: Record<number, string | string[]>) {
  const analysis = {
    energyLevel: 'medium',
    sleepQuality: 'good', 
    stressLevel: 'medium',
    activityLevel: 'moderate',
    dietQuality: 'good',
    healthGoals: [] as string[],
    deficiencies: [] as string[],
    medications: [] as string[],
    riskFactors: [] as string[],
    strengths: [] as string[]
  };

  // Energy (question 0)
  if (answers[0] === 'high_energy') {
    analysis.energyLevel = 'high';
    analysis.strengths.push('Hög energinivå');
  } else if (answers[0] === 'low_energy') {
    analysis.energyLevel = 'low';
    analysis.riskFactors.push('Låg energi');
  }

  // Sleep (question 1)
  if (answers[1] === 'excellent_sleep') {
    analysis.sleepQuality = 'excellent';
    analysis.strengths.push('Utmärkt sömnkvalitet');
  } else if (answers[1] === 'poor_sleep') {
    analysis.sleepQuality = 'poor';
    analysis.riskFactors.push('Dålig sömnkvalitet');
  }

  // Stress (question 2)
  if (answers[2] === 'low_stress') {
    analysis.stressLevel = 'low';
    analysis.strengths.push('Låga stressnivåer');
  } else if (answers[2] === 'chronic_stress') {
    analysis.stressLevel = 'high';
    analysis.riskFactors.push('Kronisk stress');
  }

  // Activity (question 3)
  if (answers[3] === 'very_active') {
    analysis.activityLevel = 'high';
    analysis.strengths.push('Mycket aktiv livsstil');
  } else if (answers[3] === 'sedentary') {
    analysis.activityLevel = 'low';
    analysis.riskFactors.push('Stillasittande livsstil');
  }

  // Diet (question 4)
  if (answers[4] === 'excellent_diet') {
    analysis.dietQuality = 'excellent';
    analysis.strengths.push('Utmärkt kosthållning');
  } else if (answers[4] === 'poor_diet') {
    analysis.dietQuality = 'poor';
    analysis.riskFactors.push('Dåliga kostvanor');
  }

  // Health goals (question 9)
  if (Array.isArray(answers[9])) {
    analysis.healthGoals = answers[9] as string[];
  }

  // Deficiencies (question 10) 
  if (Array.isArray(answers[10])) {
    analysis.deficiencies = (answers[10] as string[]).filter(d => d !== 'none');
  }

  // Medications (question 11)
  if (Array.isArray(answers[11])) {
    analysis.medications = (answers[11] as string[]).filter(m => m !== 'none');
  }

  return analysis;
}

function generateContextInsights(contextData: any) {
  const insights: string[] = [];
  
  if (contextData?.weather?.current) {
    const temp = contextData.weather.current.temperature_2m;
    const uv = contextData.weather.current.uv_index;
    const rain = contextData.weather.current.precipitation;
    
    if (rain > 2) {
      insights.push('Regnigt väder idag - perfekt för inomhusträning och reflektion');
    } else if (uv > 7) {
      insights.push('Högt UV-index - träna i skuggan eller tidigt på morgonen');
    } else if (temp > 15 && rain < 0.5) {
      insights.push('Perfekt väder för utomhusaktiviteter och D-vitaminproduktion');
    }
  }

  if (contextData?.air?.hourly) {
    const latest = Object.keys(contextData.air.hourly.time || {}).length - 1;
    const pm25 = contextData.air.hourly.pm2_5?.[latest] || 0;
    
    if (pm25 > 50) {
      insights.push('Dålig luftkvalitet - undvik intensiv träning utomhus');
    } else if (pm25 < 15) {
      insights.push('Utmärkt luftkvalitet - perfekt för cardioträning utomhus');
    }
  }

  if (contextData?.places?.length > 0) {
    const nearbyGyms = contextData.places.filter((p: any) => p.type.includes('fitness') || p.type.includes('gym')).length;
    const nearbyParks = contextData.places.filter((p: any) => p.type === 'park').length;
    
    if (nearbyParks > 3) {
      insights.push(`${nearbyParks} parker nära dig - utmärkt för naturträning och stress-minskning`);
    }
    if (nearbyGyms > 0) {
      insights.push(`${nearbyGyms} gym i närheten - bra backup för dåligt väder`);
    }
  }

  if (contextData?.enhanced?.timezone?.circadianPhase) {
    const phase = contextData.enhanced.timezone.circadianPhase;
    if (phase === 'morning') {
      insights.push('Morgonfas - optimal tid för D-vitamin och energigivande kosttillskott');
    } else if (phase === 'evening') {
      insights.push('Kvällsfas - perfekt för magnesium och avslappnande adaptogener');
    }
  }

  return insights;
}

export async function POST(req: Request) {
  try {
    const data: HealthTestData = await req.json();
    
    if (!data.answers || Object.keys(data.answers).length === 0) {
      return NextResponse.json({ error: 'Quiz answers required' }, { status: 400 });
    }

    const analysis = analyzeQuizAnswers(data.answers);
    const contextInsights = generateContextInsights(data.contextData);
    
    // Create comprehensive prompt for AI moderator
    const prompt = `Du är en expert inom functional foods och personaliserad hälsa. Analysera följande data och skapa en sammanhängande, personlig hälsorapport.

ANVÄNDARENS HÄLSOPROFIL:
- Energinivå: ${analysis.energyLevel}
- Sömnkvalitet: ${analysis.sleepQuality}  
- Stressnivå: ${analysis.stressLevel}
- Aktivitetsnivå: ${analysis.activityLevel}
- Kostkvalitet: ${analysis.dietQuality}
- Hälsomål: ${analysis.healthGoals.join(', ')}
- Kända brister: ${analysis.deficiencies.join(', ')}
- Mediciner: ${analysis.medications.join(', ')}
- Styrkor: ${analysis.strengths.join(', ')}
- Riskfaktorer: ${analysis.riskFactors.join(', ')}

MILJÖKONTEXT:
${contextInsights.join('\n')}

SÄKERHETSVARNINGAR:
${data.contextData?.enhanced?.safety?.warnings?.map((w: any) => `- ${w.warning} (${w.medication})`).join('\n') || 'Inga kända interaktioner'}

FORSKNINGSSTÖD:
${data.contextData?.enhanced?.research?.map((r: any) => `- ${r.title} (${r.pubdate})`).join('\n') || 'Allmän forskningsgrund'}

REKOMMENDERADE PRODUKTER:
${data.functionalFoods?.slice(0, 5).map((p: any) => `- ${p.name} (${p.healthBenefits.join(', ')})`).join('\n') || 'Inga specifika produkter'}

INSTRUKTIONER:
1. Skapa en sammanhängande, personlig rapport som känns skriven av en expert
2. Integrera ALL information naturligt - väder, mediciner, forskning, produkter
3. Ge konkreta, actionable råd baserat på HELA bilden
4. Inkludera timing (cirkadian), säkerhet och miljöfaktorer
5. Rekommendera Functional Flow-kursen naturligt i slutet
6. Skriv på svenska, använd "du"-form, var uppmuntrande men ärlig
7. Struktur: Sammanfattning → Prioriterade åtgärder → Functional foods → Livsstil → Nästa steg

Maxlängd: 1500 ord. Fokus på kvalitet över kvantitet.`;

    // Try to generate AI report if API key is configured
    let aiReport = '';
    const openai = getOpenAIClient();
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Du är en expert inom functional foods, personaliserad nutrition och hälsooptimering. Du skapar personliga, evidensbaserade hälsorapporter som integrerar all tillgänglig data på ett sammanhängande sätt."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });
        aiReport = completion.choices[0]?.message?.content || '';
      } catch (e) {
        // Gracefully degrade if OpenAI fails
        aiReport = '';
      }
    }

    // Generate structured recommendations
    const structuredRecommendations = {
      profile: aiReport || 'AI‑sammanfattning är tillfälligt inaktiverad. Här är dina rekommendationer baserade på dina svar och kontext.',
      priorityActions: [
        ...(analysis.riskFactors.includes('Dålig sömnkvalitet') ? ['Prioritera sömnhygien och magnesium'] : []),
        ...(analysis.riskFactors.includes('Kronisk stress') ? ['Implementera adaptogener och stresshantering'] : []),
        ...(analysis.deficiencies.includes('vitamin_d') ? ['Börja med D3-tillskott (2000-4000 IE)'] : []),
        ...(analysis.deficiencies.includes('omega_3') ? ['Lägg till omega-3 (EPA/DHA 1-2g dagligen)'] : []),
        ...(contextInsights.length > 0 ? [contextInsights[0]] : [])
      ].slice(0, 5),
      
      functionalFoodRecommendations: data.functionalFoods?.slice(0, 8) || [],
      
      lifestyleRecommendations: [
        ...(analysis.activityLevel === 'low' ? ['Öka daglig rörelse till minst 30 min'] : []),
        ...(analysis.stressLevel === 'high' ? ['Implementera daglig meditation eller andningsteknik'] : []),
        ...(analysis.sleepQuality === 'poor' ? ['Skapa en konsekvent sömnrutin'] : []),
        ...(contextInsights.filter(i => i.includes('träning')).slice(0, 2))
      ],
      
      safetyWarnings: data.contextData?.enhanced?.safety?.warnings || [],
      
      researchEvidence: data.contextData?.enhanced?.research || [],
      
      nextSteps: [
        'Implementera en förändring i taget',
        'Håll en hälsodagbok i 2 veckor', 
        'Boka läkarkonsultation om du tar mediciner',
        'Överväg vår Functional Flow-kurs för djupare kunskap',
        'Följ upp resultaten efter 4-6 veckor'
      ],

      courseRecommendation: {
        title: 'Functional Flow - Din nästa nivå',
        description: 'Baserat på din profil skulle du ha stor nytta av vår Functional Flow-kurs som går djupare in på personaliserad nutrition och advanced functional foods.',
        benefits: [
          'Avancerade functional foods för dina specifika mål',
          'Personaliserad måltidsplanering',
          'Biomarkörer och testning',
          'Community med likasinnade'
        ],
        price: 'Specialpris för hälsotestdeltagare'
      }
    };

    return NextResponse.json({
      success: true,
      report: structuredRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: {
          quizAnswers: Object.keys(data.answers).length,
          contextSources: 4, // Fixed number since we know the sources
          functionalFoods: data.functionalFoods?.length || 0,
          safetyWarnings: data.contextData?.enhanced?.safety?.warnings?.length || 0,
          researchStudies: data.contextData?.enhanced?.research?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('AI Moderator error:', error);
    return NextResponse.json(
      { error: 'Failed to generate health report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 