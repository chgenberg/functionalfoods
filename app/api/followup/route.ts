import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Question, UserResponse, APIResponse } from '@/app/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
  try {
    const { bodyPart, description, previousAnswers = [] } = await req.json() as UserResponse;

    const prompt = `
You are a medical expert chatbot. 
Based on the user's description and selected body part, generate a list of 10–15 follow-up questions that will help you assess the user's health status across the following domains: 
- Nutrient Deficiency
- Inflammation
- Metabolic Health
- Hormonal Imbalance
- Gut Health
- Allergy/Sensitivity

Make sure the questions are relevant to the user's problem and cover as many domains as possible. 
Return the questions as a JSON array of objects, each with "question" (string) and "type" ("choice" or "text"), and if "choice", include an "options" array.

Example:
[
  { "question": "How often do you eat fruits and vegetables?", "type": "choice", "options": ["Every meal", "Once a day", "Few times a week", "Rarely/Never"] },
  { "question": "Have you experienced unexplained fatigue recently?", "type": "choice", "options": ["Yes", "No"] },
  { "question": "Please describe any digestive symptoms you have experienced.", "type": "text" }
]

Return ONLY valid JSON, nothing else.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || "";
    console.log("GPT followup content:", content);

    // Extrahera JSON-array ur svaret
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ 
        questions: [], 
        error: "No JSON array found in GPT response",
        raw: content 
      });
    }

    let questions: Question[];
    try {
      questions = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return NextResponse.json({ 
        questions: [], 
        error: "Invalid JSON from GPT",
        raw: jsonMatch[0]
      });
    }

    return NextResponse.json({ 
      questions,
      metadata: {
        hasNutrientQuestions: false,
        symptomCount: previousAnswers.filter(a => a.type === 'symptom').length
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      questions: [],
      error: "Something went wrong" 
    });
  }
}