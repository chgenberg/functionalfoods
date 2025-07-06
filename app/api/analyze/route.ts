import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';
import { AnalysisResult } from '@/app/types';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Använd miljövariabeln för API-nyckeln
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

export async function POST(req: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { bodyPart, description, answers } = await req.json();

    // Hämta användare från token (om inloggad)
    const authorization = req.headers.get('authorization');
    let userId = null;
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7);
      userId = getUserIdFromToken(token);
    }

    // Skapa en prompt för OpenAI baserad på svaren
    const prompt = `Baserat på följande information, skapa en detaljerad hälsorapport:

Kroppsdel: ${bodyPart}
Beskrivning av besvär: ${description}
Svar på frågor:
${answers.map((answer: string, index: number) => `Fråga ${index + 1}: ${answer}`).join('\n')}

Skapa en analys med följande strukturerade svar:

1. SAMMANFATTNING: En kort sammanfattning av personens hälsotillstånd och huvudproblem.

2. REKOMMENDATIONER: En lista med konkreta rekommendationer för att förbättra hälsan.

3. FUNKTIONELLA LIVSMEDEL: En lista med specifika funktionella livsmedel som kan hjälpa till.

4. LIVSSTILSFÖRÄNDRINGAR: En lista med livsstilsförändringar som kan förbättra hälsan.

Formatera svaret som ett JSON-objekt med följande struktur:
{
  "summary": "sammanfattningstext",
  "recommendations": ["rekommendation1", "rekommendation2", ...],
  "functionalFoods": ["livsmedel1", "livsmedel2", ...],
  "lifestyleChanges": ["förändring1", "förändring2", ...]
}

Svara ENDAST med JSON-objektet, utan någon ytterligare text.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    });

    const analysisResult: AnalysisResult = JSON.parse(completion.choices[0].message.content || '{}');

    // Spara symptomanalys i databasen om användaren är inloggad
    if (userId) {
      try {
        await prisma.symptomAnalysis.create({
          data: {
            userId,
            bodyPart,
            description,
            analysis: analysisResult
          }
        });
      } catch (dbError) {
        console.error('Failed to save symptom analysis to database:', dbError);
        // Fortsätt ändå, returnera resultatet även om DB-sparningen misslyckades
      }
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to analyze responses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}