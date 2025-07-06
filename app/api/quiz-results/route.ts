import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Create OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { answers } = await request.json();

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
Du är Ulrika Davidsson, en expert på functional foods och hälsa. Analysera följande quiz-svar och ge personaliserade rekommendationer för functional foods.

Quiz-svar:
${answerSummary}

Baserat på svaren, ge:
1. En kort sammanfattning av personens hälsoprofil
2. 3-5 specifika functional food rekommendationer med förklaring
3. Livsstilsråd som kompletterar functional foods
4. Nästa steg för att förbättra hälsan

Svara på svenska och håll en varm, uppmuntrande ton som Ulrika Davidsson.
Formatera svaret som JSON med följande struktur:
{
  "profile": "Kort sammanfattning av hälsoprofil",
  "recommendations": [
    {
      "title": "Functional food titel",
      "description": "Beskrivning och fördelar",
      "howToUse": "Hur man använder det"
    }
  ],
  "lifestyleAdvice": [
    "Livsstilsråd 1",
    "Livsstilsråd 2"
  ],
  "nextSteps": [
    "Nästa steg 1",
    "Nästa steg 2"
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson, en expert på functional foods och hälsa. Du ger personaliserade råd baserat på quiz-svar."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', result);
      // Fallback to a structured response
      parsedResult = {
        profile: "Baserat på dina svar har vi analyserat din hälsoprofil.",
        recommendations: [
          {
            title: "Personaliserade rekommendationer",
            description: result,
            howToUse: "Följ råden som beskrivs ovan."
          }
        ],
        lifestyleAdvice: [
          "Fortsätt med hälsosamma vanor",
          "Konsultera en hälsoexpert för mer detaljerad vägledning"
        ],
        nextSteps: [
          "Implementera de rekommenderade förändringarna gradvis",
          "Följ upp din progress regelbundet"
        ]
      };
    }

    return NextResponse.json({
      success: true,
      results: parsedResult
    });

  } catch (error) {
    console.error('Quiz analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze quiz results' },
      { status: 500 }
    );
  }
} 