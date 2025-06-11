import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';
import { AnalysisResult } from '@/app/types';

// Använd miljövariabeln för API-nyckeln
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { bodyPart, description, answers } = await req.json();

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

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to analyze responses' },
      { status: 500 }
    );
  }
}