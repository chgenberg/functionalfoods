import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all course products
    const courseProducts = await prisma.courseProduct.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      }
    });

    // Calculate what Stripe would receive
    const stripeAmounts = courseProducts.map(product => ({
      name: product.name,
      priceInSEK: product.price,
      priceInOre: Math.round(product.price * 100),
      stripeUnitAmount: Math.round(product.price * 100),
      expectedChargeForOneItem: `${product.price} SEK`,
      stripeWillCharge: `${Math.round(product.price * 100)} öre = ${product.price} SEK`,
    }));

    // Test scenarios
    const testScenarios = [
      {
        scenario: "1x Functional Basics",
        items: [{ name: "Functional Basics", price: 1495, quantity: 1 }],
        expectedTotal: "1495 SEK",
        stripeAmount: Math.round(1495 * 100),
        stripeAmountInSEK: Math.round(1495 * 100) / 100,
      },
      {
        scenario: "1x Functional Flow",
        items: [{ name: "Functional Flow", price: 2995, quantity: 1 }],
        expectedTotal: "2995 SEK",
        stripeAmount: Math.round(2995 * 100),
        stripeAmountInSEK: Math.round(2995 * 100) / 100,
      },
      {
        scenario: "1x Functional Basics + 1x Functional Flow",
        items: [
          { name: "Functional Basics", price: 1495, quantity: 1 },
          { name: "Functional Flow", price: 2995, quantity: 1 }
        ],
        expectedTotal: "4490 SEK",
        stripeAmount: Math.round(1495 * 100) + Math.round(2995 * 100),
        stripeAmountInSEK: (Math.round(1495 * 100) + Math.round(2995 * 100)) / 100,
      }
    ];

    return NextResponse.json({
      message: "Stripe amount verification",
      courseProducts: stripeAmounts,
      testScenarios,
      conversionFormula: "SEK * 100 = öre (Stripe unit_amount)",
      note: "Stripe charges in smallest currency unit (öre for SEK)",
      verification: {
        correct: "1495 SEK → 149500 öre",
        incorrect: "1495 SEK → 1495 öre (would charge 14.95 SEK!)"
      }
    });
  } catch (error) {
    console.error('Debug stripe amounts error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch course products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
