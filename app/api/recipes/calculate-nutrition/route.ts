import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { servings = 4 } = await req.json();

    // Return static, predictable nutrition data
    const nutritionData = {
      perServing: {
        calories: 450,
        protein: 30,
        carbs: 15,
        fat: 30
      },
      total: {
        calories: 450 * servings,
        protein: 30 * servings,
        carbs: 15 * servings,
        fat: 30 * servings
      }
    };

    return NextResponse.json({
      success: true,
      nutrition: nutritionData,
      servings: servings
    });

  } catch (error) {
    console.error('Error in static nutrition endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte hämta näringsvärden',
        details: error instanceof Error ? error.message : 'Okänt fel'
      },
      { status: 500 }
    );
  }
} 