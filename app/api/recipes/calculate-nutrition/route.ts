import { NextRequest, NextResponse } from 'next/server';

// Näringsdata per 100g för vanliga ingredienser
const NUTRITION_DATA: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  // Kött & Fisk
  'kyckling': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'kycklingfilé': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'kycklingbröst': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'lax': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'torsk': { calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  'nötkött': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'fläskkött': { calories: 242, protein: 27, carbs: 0, fat: 14 },
  'köttfärs': { calories: 250, protein: 20, carbs: 0, fat: 20 },
  'lammkött': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'kalkon': { calories: 135, protein: 30, carbs: 0, fat: 1 },
  'tonfisk': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  
  // Mejeri
  'mjölk': { calories: 42, protein: 3.4, carbs: 5, fat: 1.5 },
  'yoghurt': { calories: 61, protein: 10, carbs: 4, fat: 0.4 },
  'keso': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  'ost': { calories: 113, protein: 25, carbs: 4, fat: 0.3 },
  'fetaost': { calories: 264, protein: 14, carbs: 4, fat: 21 },
  'mozzarella': { calories: 280, protein: 28, carbs: 2.2, fat: 17 },
  'parmesan': { calories: 431, protein: 38, carbs: 4, fat: 29 },
  'smör': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'grädde': { calories: 345, protein: 2.1, carbs: 2.8, fat: 37 },
  
  // Ägg
  'ägg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  
  // Grönsaker
  'tomat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'gurka': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  'paprika': { calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  'lök': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  'vitlök': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  'morötter': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'spenat': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'sallad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  'avokado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
  'blomkål': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  'aubergine': { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  'champinjoner': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  'sötpotatis': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'potatis': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  
  // Frukt & Bär
  'äpple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'banan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'jordgubbar': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  'blåbär': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  'hallon': { calories: 52, protein: 1.2, carbs: 12, fat: 0.7 },
  'apelsin': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  'ananas': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  'kiwi': { calories: 61, protein: 1.1, carbs: 15, fat: 0.5 },
  'citron': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3 },
  'lime': { calories: 30, protein: 0.7, carbs: 11, fat: 0.2 },
  'granatäpple': { calories: 83, protein: 1.7, carbs: 19, fat: 1.2 },
  
  // Nötter & Frön
  'mandel': { calories: 579, protein: 21, carbs: 22, fat: 50 },
  'valnötter': { calories: 654, protein: 15, carbs: 14, fat: 65 },
  'cashewnötter': { calories: 553, protein: 18, carbs: 30, fat: 44 },
  'pistaschnötter': { calories: 560, protein: 20, carbs: 28, fat: 45 },
  'hasselnötter': { calories: 628, protein: 15, carbs: 17, fat: 61 },
  'pumpakärnor': { calories: 559, protein: 30, carbs: 11, fat: 49 },
  'solrosfrön': { calories: 584, protein: 21, carbs: 20, fat: 51 },
  'chiafrön': { calories: 486, protein: 17, carbs: 42, fat: 31 },
  'linfrön': { calories: 534, protein: 18, carbs: 29, fat: 42 },
  'sesamfrön': { calories: 573, protein: 18, carbs: 23, fat: 50 },
  
  // Spannmål & Baljväxter
  'havregryn': { calories: 389, protein: 17, carbs: 66, fat: 7 },
  'quinoa': { calories: 368, protein: 14, carbs: 64, fat: 6 },
  'ris': { calories: 365, protein: 7, carbs: 78, fat: 3 },
  'pasta': { calories: 371, protein: 13, carbs: 74, fat: 1.5 },
  'bröd': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'linser': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'kikärtor': { calories: 164, protein: 8, carbs: 27, fat: 2.6 },
  'svarta bönor': { calories: 132, protein: 9, carbs: 24, fat: 0.5 },
  'röda bönor': { calories: 127, protein: 9, carbs: 23, fat: 0.5 },
  
  // Oljor & Fetter
  'olivolja': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'kokosolja': { calories: 862, protein: 0, carbs: 0, fat: 100 },
  'rapsolja': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'majonnäs': { calories: 680, protein: 1.5, carbs: 0.6, fat: 75 },
  
  // Örter & Kryddor (mindre mängder)
  'basilika': { calories: 22, protein: 3.2, carbs: 2.6, fat: 0.6 },
  'persilja': { calories: 36, protein: 3, carbs: 6, fat: 0.8 },
  'dill': { calories: 43, protein: 3.5, carbs: 7, fat: 1.1 },
  'oregano': { calories: 265, protein: 9, carbs: 69, fat: 4.3 },
  'timjan': { calories: 276, protein: 9.1, carbs: 64, fat: 7.4 },
  'rosmarin': { calories: 131, protein: 3.3, carbs: 20, fat: 5.9 },
};

// Funktion för att extrahera mängd och ingrediens från text
function parseIngredient(ingredientText: string): { amount: number; ingredient: string } {
  // Regex för att matcha mängd + enhet + ingrediens
  const patterns = [
    /(\d+(?:[,\.]\d+)?)\s*(?:kg|kilogram)\s+(.+)/i,     // kg
    /(\d+(?:[,\.]\d+)?)\s*(?:g|gram)\s+(.+)/i,          // gram
    /(\d+(?:[,\.]\d+)?)\s*(?:st|styck|stycken)\s+(.+)/i, // styck
    /(\d+(?:[,\.]\d+)?)\s*(?:dl|deciliter)\s+(.+)/i,    // deciliter
    /(\d+(?:[,\.]\d+)?)\s*(?:cl|centiliter)\s+(.+)/i,   // centiliter
    /(\d+(?:[,\.]\d+)?)\s*(?:ml|milliliter)\s+(.+)/i,   // milliliter
    /(\d+(?:[,\.]\d+)?)\s*(?:l|liter)\s+(.+)/i,         // liter
    /(\d+(?:[,\.]\d+)?)\s*(?:msk|matsked|matskedar)\s+(.+)/i, // matsked
    /(\d+(?:[,\.]\d+)?)\s*(?:tsk|tesked|teskedar)\s+(.+)/i,   // tesked
    /(\d+(?:[,\.]\d+)?)\s*(?:krm|kryddmått)\s+(.+)/i,   // kryddmått
  ];

  for (const pattern of patterns) {
    const match = ingredientText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      const ingredient = match[2].trim().toLowerCase();
      return { amount, ingredient };
    }
  }

  // Om inget mönster matchar, anta 100g av ingrediensen
  return { amount: 100, ingredient: ingredientText.toLowerCase().trim() };
}

// Funktion för att konvertera olika enheter till gram
function convertToGrams(amount: number, unit: string, ingredient: string): number {
  unit = unit.toLowerCase();
  
  switch (unit) {
    case 'kg':
    case 'kilogram':
      return amount * 1000;
    case 'g':
    case 'gram':
      return amount;
    case 'dl':
    case 'deciliter':
      // Approximation: 1 dl ≈ 100g för de flesta ingredienser
      return amount * 100;
    case 'cl':
    case 'centiliter':
      return amount * 10;
    case 'ml':
    case 'milliliter':
      return amount;
    case 'l':
    case 'liter':
      return amount * 1000;
    case 'msk':
    case 'matsked':
    case 'matskedar':
      return amount * 15; // 1 msk ≈ 15ml
    case 'tsk':
    case 'tesked':
    case 'teskedar':
      return amount * 5; // 1 tsk ≈ 5ml
    case 'krm':
    case 'kryddmått':
      return amount * 1; // 1 krm ≈ 1ml
    case 'st':
    case 'styck':
    case 'stycken':
      // Approximationer för vanliga ingredienser
      if (ingredient.includes('ägg')) return amount * 60;
      if (ingredient.includes('tomat')) return amount * 150;
      if (ingredient.includes('lök')) return amount * 150;
      if (ingredient.includes('paprika')) return amount * 120;
      if (ingredient.includes('avokado')) return amount * 200;
      if (ingredient.includes('äpple')) return amount * 180;
      if (ingredient.includes('banan')) return amount * 120;
      return amount * 100; // Default
    default:
      return amount;
  }
}

// Funktion för att hitta närmaste matchning i näringsdata
function findNutritionMatch(ingredient: string): { calories: number; protein: number; carbs: number; fat: number } | null {
  ingredient = ingredient.toLowerCase();
  
  // Exakt matchning först
  if (NUTRITION_DATA[ingredient]) {
    return NUTRITION_DATA[ingredient];
  }
  
  // Partiell matchning
  for (const [key, value] of Object.entries(NUTRITION_DATA)) {
    if (ingredient.includes(key) || key.includes(ingredient)) {
      return value;
    }
  }
  
  // Defaultvärden om ingen matchning hittas
  return { calories: 50, protein: 2, carbs: 8, fat: 1 };
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients, servings = 4 } = await req.json();

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Ingredienser saknas eller är i fel format' },
        { status: 400 }
      );
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Beräkna näringsvärden för varje ingrediens
    for (const ingredientText of ingredients) {
      if (typeof ingredientText !== 'string') continue;
      
      const { amount, ingredient } = parseIngredient(ingredientText);
      const nutritionData = findNutritionMatch(ingredient);
      
      if (nutritionData) {
        // Konvertera till gram och beräkna näringsvärden per 100g
        const grams = convertToGrams(amount, '', ingredient);
        const factor = grams / 100;
        
        totalCalories += nutritionData.calories * factor;
        totalProtein += nutritionData.protein * factor;
        totalCarbs += nutritionData.carbs * factor;
        totalFat += nutritionData.fat * factor;
      }
    }

    // Avrunda till hela tal
    const totalNutrition = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat)
    };

    const perServingNutrition = {
      calories: Math.round(totalCalories / servings),
      protein: Math.round(totalProtein / servings),
      carbs: Math.round(totalCarbs / servings),
      fat: Math.round(totalFat / servings)
    };

    return NextResponse.json({
      success: true,
      nutrition: {
        total: totalNutrition,
        perServing: perServingNutrition
      },
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