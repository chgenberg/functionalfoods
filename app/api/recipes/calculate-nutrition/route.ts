import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export async function POST(req: NextRequest) {
  try {
    const { ingredients, servings = 4 } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredienslista krävs' },
        { status: 400 }
      );
    }

    // Skapa en prompt för OpenAI
    const prompt = `Du är en expert på näringslära. Beräkna näringsvärdena för detta recept med ${servings} portioner.

Ingredienser:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Beräkna och returnera ENDAST ett JSON-objekt med följande struktur (inga andra texter):

{
  "perServing": {
    "calories": [antal kalorier per portion],
    "protein": [gram protein per portion],
    "carbs": [gram kolhydrater per portion],
    "fat": [gram fett per portion]
  },
  "total": {
    "calories": [totalt antal kalorier],
    "protein": [totalt gram protein],
    "carbs": [totalt gram kolhydrater],
    "fat": [totalt gram fett]
  }
}

Använd rimliga uppskattningar baserat på standardnäringsvärden för ingredienserna. Svara ENDAST med JSON-objektet.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är en expert på näringslära. Svara ENDAST med giltigt JSON utan extra text eller förklaringar."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Ingen respons från OpenAI');
    }

    // Försök att parsa JSON-responsen
    let nutritionData;
    try {
      // Ta bort eventuella markdown-markeringar eller extra text
      const cleanedResponse = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      nutritionData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', response);
      throw new Error('Kunde inte tolka näringsdata från AI');
    }

    // Validera att vi har rätt struktur
    if (!nutritionData.perServing || !nutritionData.total) {
      throw new Error('Ogiltig näringsdata-struktur');
    }

    return NextResponse.json({
      success: true,
      nutrition: nutritionData,
      servings: servings
    });

  } catch (error) {
    console.error('Error calculating nutrition:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte beräkna näringsvärden',
        details: error instanceof Error ? error.message : 'Okänt fel'
      },
      { status: 500 }
    );
  }
} 