import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { AnalysisResult } from '@/app/types';

// Använd miljövariabeln för API-nyckeln
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { bodyPart, description, answers, numQuestions } = await req.json();

    // Here you would typically integrate with an AI service or use a rule-based system
    // to analyze the responses and generate recommendations
    const result: AnalysisResult = {
      summary: `Baserat på dina svar och beskrivning av ${description} i ${bodyPart}-området, har vi identifierat följande:`,
      recommendations: [
        "Konsultera en läkare för en fullständig bedömning",
        "Överväg att föra en symtomdagbok",
        "Implementera stresshanteringstekniker"
      ],
      functionalFoods: [
        "Omega-3 rika livsmedel",
        "Anti-inflammatoriska kryddor",
        "Probiotika"
      ],
      lifestyleChanges: [
        "Regelbunden motion",
        "Tillräcklig sömn",
        "Balanserad kost"
      ]
    };

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error analyzing responses:', error);
    return NextResponse.json(
      { error: 'Failed to analyze responses' },
      { status: 500 }
    );
  }
}