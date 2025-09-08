import { NextRequest, NextResponse } from "next/server";
import { resolveModel } from '@/app/lib/ai';
import { OpenAI } from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API-nyckel är inte konfigurerad" },
        { status: 500 }
      );
    }

    const { answers, blockScores, totalScore } = await req.json();

    const answersList: string = Array.isArray(answers)
      ? (answers as any[])
          .map((a: any) => `Block: ${a.block}\nQ: ${a.question}\nA: ${a.answer}\nPoints: ${a.points}`)
          .join("\n\n")
      : "";

    const prompt = `
    You are a world-leading expert in nutritional risk assessment.
    Analyze the following 30-question micronutrient screening, based on validated tools (HHAS, NutriCheQ, etc).
    Each answer is scored 0–3 (or 0/1 for yes/no).
    The blocks are: Diet (40%), Symptoms (30%), Lifestyle/Medical (20%), Supplements/Demographics (10%).

    Here are the block scores (raw sum, not weighted): ${JSON.stringify(blockScores, null, 2)}
    Total risk index (weighted): ${totalScore}

    Here are all answers (with points):
    ${answersList}

    Additionally, create a matrix (heatmap) where each row is a nutrient (e.g., Vitamin D, Iron, B12, Omega-3, etc.) and each column is one of: "Diet", "Symptoms", "Lifestyle", "Blood test". 
    For each cell, assign a risk score (0–3) and a color code ("green", "yellow", "red") based on the user's answers and risk profile. 
    Return this as a JSON object with the structure:
    {
      "nutrientMatrix": {
        "Vitamin D": { "Diet": {score: 2, color: "yellow"}, "Symptoms": {...}, ... },
        "Iron": { ... },
        ...
      }
    }

    Provide concise reasoning for the top 3 nutrients with the highest risk.
    `;

    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-5-mini'),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content || "";
    console.log("GPT response:", content);

    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON found in GPT response:", content);
      return NextResponse.json({ 
        error: "No JSON found in GPT response", 
        raw: content 
      }, { status: 500 });
    }
    const jsonString = content.slice(firstBrace, lastBrace + 1);

    let resultObj;
    try {
      resultObj = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", jsonString);
      return NextResponse.json({ 
        error: "Failed to parse JSON", 
        raw: jsonString 
      }, { status: 500 });
    }

    // Validera att resultObj har rätt struktur
    if (!resultObj.analysis || !Array.isArray(resultObj.recommendedTests) || 
        !Array.isArray(resultObj.references)) {
      throw new Error("Invalid response structure");
    }

    return NextResponse.json({ result: resultObj });
  } catch (e) {
    console.error("Error in micronutrient analysis:", e);
    return NextResponse.json({ 
      error: "Error processing analysis", 
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}