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
      model: "gpt-4o-mini",
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