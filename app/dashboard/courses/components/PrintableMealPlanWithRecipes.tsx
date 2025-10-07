'use client';
import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { motion } from 'framer-motion';

interface Meal {
  name: string;
  recipeLink?: string;
}

interface DayMeals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snack?: Meal;
  dessert?: Meal;
}

interface PrintableMealPlanProps {
  mealPlan: Record<string, DayMeals>;
  weekNumber: number;
  courseName: string;
  courseType: 'basics' | 'flow' | 'energy';
}

interface RecipeDetails {
  title: string;
  slug: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
  servings?: number;
  nutritionPerServing?: {
    kcal?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

export default function PrintableMealPlanWithRecipes({ mealPlan, weekNumber, courseName, courseType }: PrintableMealPlanProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatMealName = (name: string) => {
    if (!name) return '';
    return name.replace(/^\d+\.\s*/, '').trim();
  };

  const translateMealType = (mealType: string) => {
    const translations: Record<string, string> = {
      breakfast: 'Frukost',
      lunch: 'Lunch',
      dinner: 'Middag',
      snack: 'Mellanmål',
      dessert: 'Efterrätt'
    };
    return translations[mealType] || mealType;
  };

  const getMealIcon = (mealType: string) => {
    const icons: Record<string, string> = {
      breakfast: '☕',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🥪',
      dessert: '🍰'
    };
    return icons[mealType] || '🍴';
  };

  // Extract recipe slugs from meal plan
  const extractRecipeSlugs = () => {
    const slugs: string[] = [];
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (meal?.recipeLink) {
          // Extract slug from recipeLink (e.g., /kunskapsbank/recept/slug-name -> slug-name)
          const match = meal.recipeLink.match(/\/kunskapsbank\/recept\/([^?]+)/);
          if (match && match[1]) {
            slugs.push(match[1]);
          }
        }
      });
    });
    return [...new Set(slugs)]; // Remove duplicates
  };

  // Fetch recipe details
  const fetchRecipeDetails = async (slugs: string[]): Promise<RecipeDetails[]> => {
    if (slugs.length === 0) return [];
    
    try {
      const response = await fetch('/api/recipes/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slugs })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.map((recipe: any) => ({
          title: recipe.title,
          slug: recipe.slug,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          cookingTime: recipe.cookingTime,
          servings: recipe.servings || 4,
          nutritionPerServing: recipe.nutritionPerServing
        }));
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
    
    return [];
  };

  // Fetch shopping list
  const fetchShoppingList = async (): Promise<string[]> => {
    try {
      // Map course type to the correct shopping list file name format
      const courseNameMap: Record<string, string> = {
        'basics': 'basic',
        'flow': 'flow', 
        'energy': 'energy'
      };
      const courseName = courseNameMap[courseType] || courseType;
      
      // Try to fetch the shopping list file
      const response = await fetch(`/Shopping-lists/${courseName}_week${weekNumber}_shopping_list.txt`);
      if (response.ok) {
        const text = await response.text();
        // Parse the shopping list - skip header lines and empty lines
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('INKÖPSLISTA') && !line.startsWith('Vecka'));
        return lines;
      }
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
    }
    return [];
  };

  const handlePrint = async () => {
    setIsLoading(true);
    
    try {
      // Fetch all recipe details
      const slugs = extractRecipeSlugs();
      const recipes = await fetchRecipeDetails(slugs);
      const shoppingList = await fetchShoppingList();

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setIsLoading(false);
        return;
      }

      // Create a map for quick recipe lookup
      const recipeMap = new Map(recipes.map(r => [r.slug, r]));

      const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseName} - Vecka ${weekNumber} - Måltidsplan med recept</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      padding: 20px;
    }
    
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      @page {
        size: A4;
        margin: 15mm;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
      
      .recipe-card {
        page-break-inside: avoid;
      }
      
      /* Try to fit 2 recipes per page */
      .recipe-card:nth-child(odd) {
        page-break-after: avoid;
      }
      
      .recipe-card:nth-child(even) {
        page-break-after: auto;
      }
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #014421;
    }
    
    .logo-text {
      font-size: 32px;
      font-weight: 700;
      color: #014421;
      letter-spacing: -0.5px;
    }
    
    .course-title {
      font-size: 28px;
      font-weight: 700;
      color: #014421;
      margin-bottom: 8px;
    }
    
    .week-title {
      font-size: 20px;
      color: #666;
      font-weight: 500;
    }
    
    /* Meal Plan Overview */
    .meal-plan-overview {
      margin-bottom: 40px;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
    }
    
    .overview-title {
      font-size: 20px;
      font-weight: 600;
      color: #014421;
      margin-bottom: 16px;
    }
    
    .day-overview {
      margin-bottom: 16px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
    }
    
    .day-name {
      font-weight: 600;
      color: #014421;
      margin-bottom: 8px;
    }
    
    .meal-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
      font-size: 14px;
    }
    
    .meal-item-overview {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .meal-type {
      font-weight: 600;
      color: #93C560;
      min-width: 80px;
    }
    
    /* Recipe Cards */
    .recipes-section {
      margin-top: 40px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #014421;
      margin-bottom: 24px;
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .recipe-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .recipe-header {
      border-bottom: 2px solid #93C560;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    
    .recipe-title {
      font-size: 20px;
      font-weight: 600;
      color: #014421;
      margin-bottom: 8px;
    }
    
    .recipe-meta {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #666;
    }
    
    .recipe-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }
    
    .ingredients-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
    }
    
    .section-subtitle {
      font-size: 16px;
      font-weight: 600;
      color: #014421;
      margin-bottom: 12px;
    }
    
    .ingredients-list {
      list-style: none;
      font-size: 14px;
    }
    
    .ingredients-list li {
      padding: 4px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .ingredients-list li:last-child {
      border-bottom: none;
    }
    
    .instructions-section {
      font-size: 14px;
    }
    
    .instructions-list {
      counter-reset: step;
      list-style: none;
    }
    
    .instructions-list li {
      counter-increment: step;
      margin-bottom: 12px;
      padding-left: 32px;
      position: relative;
    }
    
    .instructions-list li:before {
      content: counter(step);
      position: absolute;
      left: 0;
      top: 0;
      background: #93C560;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
    }
    
    .nutrition-info {
      margin-top: 16px;
      padding: 12px;
      background: #f0fdf4;
      border-radius: 8px;
      font-size: 13px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .nutrition-item {
      display: flex;
      gap: 4px;
    }
    
    .nutrition-label {
      font-weight: 600;
      color: #014421;
    }
    
    /* Shopping List */
    .shopping-list-section {
      margin-top: 40px;
      page-break-before: always;
    }
    
    .shopping-list {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
    }
    
    .shopping-items {
      columns: 2;
      column-gap: 24px;
      list-style: none;
      font-size: 14px;
    }
    
    .shopping-items li {
      margin-bottom: 8px;
      padding-left: 24px;
      position: relative;
      break-inside: avoid;
    }
    
    .shopping-items li:before {
      content: "☐";
      position: absolute;
      left: 0;
      color: #93C560;
      font-size: 18px;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-text">Functional Foods</div>
      <h1 class="course-title">${courseName}</h1>
      <h2 class="week-title">Vecka ${weekNumber} - Komplett måltidsplan</h2>
    </div>
    
    <!-- Meal Plan Overview -->
    <div class="meal-plan-overview no-break">
      <h3 class="overview-title">Veckans översikt</h3>
      ${Object.entries(mealPlan).map(([day, meals]) => `
        <div class="day-overview">
          <div class="day-name">${day}</div>
          <div class="meal-list">
            ${Object.entries(meals).filter(([_, meal]) => meal && meal.name).map(([mealType, meal]) => `
              <div class="meal-item-overview">
                <span class="meal-type">${translateMealType(mealType)}:</span>
                <span>${formatMealName(meal.name)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- Recipes Section -->
    <div class="recipes-section">
      <h2 class="section-title page-break">Recept för veckan</h2>
      ${recipes.map((recipe, index) => `
        <div class="recipe-card ${index % 2 === 0 ? '' : 'page-break'}">
          <div class="recipe-header">
            <h3 class="recipe-title">${recipe.title}</h3>
            <div class="recipe-meta">
              ${recipe.cookingTime ? `<span>⏱️ ${recipe.cookingTime}</span>` : ''}
              <span>👥 ${recipe.servings || 4} portioner</span>
            </div>
          </div>
          
          <div class="recipe-content">
            <div class="ingredients-section">
              <h4 class="section-subtitle">Ingredienser</h4>
              <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
              </ul>
            </div>
            
            <div class="instructions-section">
              <h4 class="section-subtitle">Gör så här</h4>
              <ol class="instructions-list">
                ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
              </ol>
              
              ${recipe.nutritionPerServing ? `
                <div class="nutrition-info">
                  <div class="nutrition-item">
                    <span class="nutrition-label">Energi:</span>
                    <span>${recipe.nutritionPerServing.kcal || 0} kcal</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">Protein:</span>
                    <span>${recipe.nutritionPerServing.protein || 0}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">Kolhydrater:</span>
                    <span>${recipe.nutritionPerServing.carbs || 0}g</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="nutrition-label">Fett:</span>
                    <span>${recipe.nutritionPerServing.fat || 0}g</span>
                  </div>
                  ${recipe.nutritionPerServing.fiber ? `
                    <div class="nutrition-item">
                      <span class="nutrition-label">Fiber:</span>
                      <span>${recipe.nutritionPerServing.fiber}g</span>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- Shopping List -->
    ${shoppingList.length > 0 ? `
      <div class="shopping-list-section">
        <h2 class="section-title">Inköpslista för vecka ${weekNumber}</h2>
        <div class="shopping-list">
          <ul class="shopping-items">
            ${shoppingList.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    ` : ''}
    
    <!-- Footer -->
    <div class="footer">
      <p>© ${new Date().getFullYear()} Functional Foods - Detta dokument är personligt och får inte delas utan tillstånd</p>
    </div>
  </div>
</body>
</html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 500);
      };
    } catch (error) {
      console.error('Error preparing print:', error);
      alert('Det uppstod ett fel vid förberedelse av utskriften. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePrint}
      disabled={isLoading}
      className="flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-xl hover:bg-[#116530] transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Printer className="w-5 h-5" />
      <span>{isLoading ? 'Förbereder...' : 'Skriv ut måltidsplan'}</span>
    </motion.button>
  );
}
