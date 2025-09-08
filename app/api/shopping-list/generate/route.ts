import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans, flowMealPlans, energyMealPlans } from '../../../data/mealPlans';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ShoppingListRequest {
  recipes: {
    slug: string;
    servings: number;
    courseType?: 'basics' | 'flow' | 'energy';
    weekNumber?: number;
  }[];
}

interface ParsedIngredient {
  amount: number | null;
  unit: string | null;
  name: string;
  original: string;
}

// Parse ingredient string to extract amount and unit
function parseIngredient(ingredient: string): ParsedIngredient {
  const patterns = [
    /^(\d+(?:[.,]\d+)?)\s*(st|stycken|styck|g|kg|ml|dl|l|msk|tsk|krm|burk|burkar|påse|påsar|förpackning|förpackningar)\s+(.+)$/i,
    /^([½¼¾⅓⅔]|\d+(?:[.,]\d+)?)\s*(dl|ml|l|msk|tsk|krm|g|kg)\s+(.+)$/i,
    /^(\d+(?:[.,]\d+)?)\s+(.+)$/,
    /^(.+?)\s*\((\d+(?:[.,]\d+)?)\s*(st|stycken|styck|g|kg|ml|dl|l|msk|tsk|krm|burk|burkar|påse|påsar)?\)$/i
  ];
  
  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      let amount: number | null = null;
      let unit: string | null = null;
      let name: string = '';
      
      if (pattern === patterns[3]) {
        name = match[1].trim();
        const amountStr = match[2].replace(',', '.');
        amount = parseFloat(amountStr);
        unit = match[3] || 'st';
      } else if (pattern === patterns[2]) {
        const amountStr = match[1].replace(',', '.');
        amount = parseFloat(amountStr);
        name = match[2].trim();
      } else {
        const amountStr = match[1];
        if (amountStr === '½') amount = 0.5;
        else if (amountStr === '¼') amount = 0.25;
        else if (amountStr === '¾') amount = 0.75;
        else if (amountStr === '⅓') amount = 0.33;
        else if (amountStr === '⅔') amount = 0.67;
        else amount = parseFloat(amountStr.replace(',', '.'));
        
        unit = match[2];
        name = match[3].trim();
      }
      
      return { amount, unit, name, original: ingredient };
    }
  }
  
  return { amount: null, unit: null, name: ingredient.trim(), original: ingredient };
}

// Normalize ingredient name for grouping
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\såäöÅÄÖ]/g, '')
    .trim();
}

// Check if units are compatible for addition
function unitsCompatible(unit1: string | null, unit2: string | null): boolean {
  if (!unit1 || !unit2) return unit1 === unit2;
  
  const weightUnits = ['g', 'kg'];
  const volumeUnits = ['ml', 'dl', 'l'];
  const countUnits = ['st', 'stycken', 'styck'];
  
  const isWeight1 = weightUnits.includes(unit1.toLowerCase());
  const isWeight2 = weightUnits.includes(unit2.toLowerCase());
  const isVolume1 = volumeUnits.includes(unit1.toLowerCase());
  const isVolume2 = volumeUnits.includes(unit2.toLowerCase());
  const isCount1 = countUnits.includes(unit1.toLowerCase());
  const isCount2 = countUnits.includes(unit2.toLowerCase());
  
  return (isWeight1 && isWeight2) || (isVolume1 && isVolume2) || (isCount1 && isCount2);
}

// Convert units to base unit for addition
function convertToBaseUnit(amount: number, unit: string | null): { amount: number; unit: string } {
  if (!unit) return { amount, unit: 'st' };
  
  const u = unit.toLowerCase();
  
  // Weight conversion to grams
  if (u === 'kg') return { amount: amount * 1000, unit: 'g' };
  if (u === 'g') return { amount, unit: 'g' };
  
  // Volume conversion to ml
  if (u === 'l') return { amount: amount * 1000, unit: 'ml' };
  if (u === 'dl') return { amount: amount * 100, unit: 'ml' };
  if (u === 'ml') return { amount, unit: 'ml' };
  
  // Count units
  if (['st', 'stycken', 'styck'].includes(u)) return { amount, unit: 'st' };
  
  // Default - keep as is
  return { amount, unit };
}

// Format amount back to readable format
function formatAmount(amount: number, unit: string): string {
  if (unit === 'g' && amount >= 1000) {
    const kg = amount / 1000;
    return kg % 1 === 0 ? `${kg} kg` : `${kg.toFixed(1).replace('.', ',')} kg`;
  }
  
  if (unit === 'ml' && amount >= 1000) {
    const l = amount / 1000;
    return l % 1 === 0 ? `${l} l` : `${l.toFixed(1).replace('.', ',')} l`;
  }
  
  if (unit === 'ml' && amount >= 100 && amount % 100 === 0) {
    return `${amount / 100} dl`;
  }
  
  if (amount % 1 === 0) {
    return `${amount} ${unit}`;
  } else if (Math.abs(amount - 0.5) < 0.01) {
    return `½ ${unit}`;
  } else if (Math.abs(amount - 0.25) < 0.01) {
    return `¼ ${unit}`;
  } else if (Math.abs(amount - 0.75) < 0.01) {
    return `¾ ${unit}`;
  } else {
    return `${amount.toFixed(1).replace('.', ',')} ${unit}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipes }: ShoppingListRequest = await request.json();
    
    if (!Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json({ error: 'Recipes array is required' }, { status: 400 });
    }
    
    console.log(`🛒 Generating shopping list for ${recipes.length} recipes`);
    
    // Collect all ingredients from all recipes
    const allIngredients: ParsedIngredient[] = [];
    
    for (const recipeRequest of recipes) {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recipes/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeRequest)
      });
      
      if (response.ok) {
        const data = await response.json();
        const ingredients = data.ingredients || [];
        
        for (const ing of ingredients) {
          const parsed = parseIngredient(ing);
          allIngredients.push(parsed);
        }
        
        console.log(`✅ Added ${ingredients.length} ingredients from ${data.recipe?.title}`);
      }
    }
    
    console.log(`📝 Total ingredients collected: ${allIngredients.length}`);
    
    // Group and aggregate ingredients
    const grouped: Record<string, { 
      name: string; 
      totalAmount: number; 
      unit: string; 
      items: string[];
      canAggregate: boolean;
    }> = {};
    
    for (const ingredient of allIngredients) {
      const normalizedName = normalizeIngredientName(ingredient.name);
      
      if (!grouped[normalizedName]) {
        grouped[normalizedName] = {
          name: ingredient.name,
          totalAmount: 0,
          unit: ingredient.unit || 'st',
          items: [],
          canAggregate: ingredient.amount !== null
        };
      }
      
      const group = grouped[normalizedName];
      
      // Check if we can aggregate this ingredient
      if (ingredient.amount !== null && group.canAggregate && unitsCompatible(ingredient.unit, group.unit)) {
        const converted = convertToBaseUnit(ingredient.amount, ingredient.unit);
        const groupConverted = convertToBaseUnit(group.totalAmount, group.unit);
        
        if (converted.unit === groupConverted.unit) {
          group.totalAmount = groupConverted.amount + converted.amount;
          group.unit = converted.unit;
          group.items.push(ingredient.original);
        } else {
          // Can't aggregate, add as separate item
          group.items.push(ingredient.original);
          group.canAggregate = false;
        }
      } else {
        // Can't aggregate, add as separate item
        group.items.push(ingredient.original);
        group.canAggregate = false;
      }
    }
    
    // Format final shopping list
    const shoppingList = Object.values(grouped).map(group => {
      if (group.canAggregate && group.totalAmount > 0) {
        return {
          item: `${formatAmount(group.totalAmount, group.unit)} ${group.name}`,
          aggregated: true,
          count: group.items.length,
          sources: group.items
        };
      } else {
        // Return first item as representative
        return {
          item: group.items[0],
          aggregated: false,
          count: group.items.length,
          sources: group.items
        };
      }
    });
    
    console.log(`🛍️ Final shopping list: ${shoppingList.length} unique items`);
    
    return NextResponse.json({
      shoppingList: shoppingList.sort((a, b) => a.item.localeCompare(b.item)),
      summary: {
        totalRecipes: recipes.length,
        totalIngredients: allIngredients.length,
        uniqueItems: shoppingList.length,
        aggregatedItems: shoppingList.filter(item => item.aggregated).length
      }
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
    
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json({ error: 'Failed to generate shopping list' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 