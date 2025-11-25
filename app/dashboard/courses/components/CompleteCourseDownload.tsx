'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { mealPlans, flowMealPlans, energyMealPlans, WeekMealPlan, DayMeals, MealItem } from '@/app/data/mealPlans';
import { Download, Book, Calendar, User, FileText, Package } from 'lucide-react';

interface CompleteCourseDownloadProps {
  courseType: 'basics' | 'flow' | 'energy' | 'hormone';
}

interface Recipe {
  title: string;
  slug: string;
  ingredients?: string[];
  instructions?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export default function CompleteCourseDownloadWithRecipes({ courseType }: CompleteCourseDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const courseName = courseType === 'basics' ? 'Functional Basics' : courseType === 'flow' ? 'Functional Gut Health/Flow' : courseType === 'hormone' ? 'Hormonell Balans' : 'Functional Insulin balance/Energy';
  // Note: hormone course uses database meal plans, not static data - this component may not work for hormone
  const courseData: Record<string, WeekMealPlan> = courseType === 'basics' ? mealPlans : courseType === 'flow' ? flowMealPlans : energyMealPlans;

  // Count total meals
  const totalMeals = Object.values(courseData).reduce((total, week) => {
    return total + Object.values(week.days).reduce((weekTotal, day) => {
      return weekTotal + Object.values(day as DayMeals).length;
    }, 0);
  }, 0);

  // Helper to slugify meal name
  const slugify = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Collect all unique meal names
  const getAllMealNames = (): string[] => {
    const mealNames = new Set<string>();
    Object.values(courseData).forEach(week => {
      Object.values(week.days).forEach(day => {
        Object.values(day as DayMeals).forEach(meal => {
          mealNames.add(meal.name);
        });
      });
    });
    return Array.from(mealNames);
  };

  // Fetch all recipes
  const fetchAllRecipes = async (): Promise<Record<string, Recipe>> => {
    const mealNames = getAllMealNames();
    const recipeMap: Record<string, Recipe> = {};

    console.log(`📚 Fetching ${mealNames.length} recipes for PDF generation...`);

    // Fetch recipes in parallel
    await Promise.all(
      mealNames.map(async (mealName) => {
        try {
          const slug = slugify(mealName);
          const response = await fetch(`/api/recipes/${slug}`);
          
          if (response.ok) {
            const data = await response.json();
            recipeMap[mealName] = {
              title: data.title || mealName,
              slug: data.slug || slug,
              ingredients: data.ingredients || [],
              instructions: data.instructions || [],
              nutrition: data.nutrition || {}
            };
            console.log(`✅ Fetched recipe: ${mealName}`);
          } else {
            console.warn(`⚠️ Recipe not found: ${mealName}`);
            recipeMap[mealName] = {
              title: mealName,
              slug,
              ingredients: [],
              instructions: []
            };
          }
        } catch (error) {
          console.error(`❌ Error fetching recipe ${mealName}:`, error);
          recipeMap[mealName] = {
            title: mealName,
            slug: slugify(mealName),
            ingredients: [],
            instructions: []
          };
        }
      })
    );

    console.log(`✅ Fetched ${Object.keys(recipeMap).length} recipes`);
    return recipeMap;
  };

  const generateCompletePDF = async () => {
    setIsGenerating(true);
    
    try {
      const today = new Date().toLocaleDateString('sv-SE');
      
      // Fetch all recipes first
      const recipes = await fetchAllRecipes();

      const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Komplett Kurspaket - ${courseName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        /* Cover Page */
        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #014421 0%, #116530 100%);
            color: white;
            page-break-after: always;
            position: relative;
            overflow: hidden;
        }
        
        .cover-page::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
            animation: backgroundMove 20s linear infinite;
        }
        
        @keyframes backgroundMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(60px, 60px); }
        }
        
        .cover-page h1 {
            font-family: 'Work Sans', sans-serif;
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-page .subtitle {
            font-size: 1.5rem;
            font-weight: 300;
            margin-bottom: 40px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .cover-stats {
            display: flex;
            gap: 40px;
            margin-top: 60px;
            position: relative;
            z-index: 1;
        }
        
        .cover-stat {
            text-align: center;
        }
        
        .cover-stat-number {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .cover-stat-label {
            font-size: 1rem;
            opacity: 0.8;
        }
        
        .cover-date {
            position: absolute;
            bottom: 40px;
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        /* Page Header */
        .page-header {
            background: linear-gradient(135deg, #014421 0%, #116530 100%);
            color: white;
            padding: 60px 40px;
            margin: -40px -20px 40px -20px;
            text-align: center;
        }
        
        .page-header h2 {
            font-family: 'Work Sans', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .page-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        /* Week Section */
        .week-section {
            margin-bottom: 80px;
            page-break-before: always;
        }
        
        .week-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-radius: 20px 20px 0 0;
            border-left: 5px solid #014421;
            margin-bottom: 0;
        }
        
        .week-number {
            font-family: 'Work Sans', sans-serif;
            font-size: 3rem;
            font-weight: 800;
            color: #014421;
            margin-bottom: 10px;
        }
        
        .week-title {
            font-size: 1.4rem;
            color: #495057;
            font-weight: 400;
        }
        
        /* Day Section */
        .day-section {
            background: white;
            padding: 30px;
            border-left: 5px solid #93C560;
            border-right: 1px solid #e9ecef;
            border-bottom: 1px solid #e9ecef;
            page-break-inside: avoid;
        }
        
        .day-section:last-child {
            border-radius: 0 0 20px 20px;
        }
        
        .day-name {
            font-family: 'Work Sans', sans-serif;
            font-weight: 700;
            font-size: 1.8rem;
            color: #014421;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .day-name::before {
            content: '';
            width: 12px;
            height: 12px;
            background: #014421;
            border-radius: 50%;
        }
        
        /* Recipe Card */
        .recipe-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid #e9ecef;
            page-break-inside: avoid;
        }
        
        .recipe-card:last-child {
            margin-bottom: 0;
        }
        
        .recipe-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #014421;
        }
        
        .meal-type-badge {
            background: #014421;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        
        .recipe-title {
            font-family: 'Work Sans', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
            color: #014421;
            margin-bottom: 8px;
        }
        
        .recipe-meta {
            display: flex;
            gap: 20px;
            font-size: 0.85rem;
            color: #6c757d;
            margin-top: 10px;
        }
        
        .recipe-meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Ingredients */
        .ingredients-section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-family: 'Work Sans', sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            color: #014421;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .section-title::before {
            content: '▸';
            color: #93C560;
            font-size: 1.2rem;
        }
        
        .ingredients-list {
            list-style: none;
            padding-left: 0;
        }
        
        .ingredient-item {
            padding: 8px 0 8px 25px;
            position: relative;
            font-size: 0.95rem;
            color: #2c3e50;
            line-height: 1.5;
        }
        
        .ingredient-item::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #93C560;
            font-weight: bold;
        }
        
        /* Instructions */
        .instructions-section {
            margin-top: 20px;
        }
        
        .instructions-list {
            list-style: none;
            counter-reset: instruction-counter;
            padding-left: 0;
        }
        
        .instruction-item {
            padding: 10px 0 10px 40px;
            position: relative;
            font-size: 0.95rem;
            color: #2c3e50;
            line-height: 1.6;
            counter-increment: instruction-counter;
        }
        
        .instruction-item::before {
            content: counter(instruction-counter);
            position: absolute;
            left: 0;
            top: 10px;
            background: #014421;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
        }
        
        /* Footer */
        .footer {
            margin-top: 100px;
            padding: 60px 40px;
            background: linear-gradient(135deg, #014421 0%, #116530 100%);
            color: white;
            text-align: center;
            margin-left: -20px;
            margin-right: -20px;
            margin-bottom: -40px;
            page-break-before: always;
        }
        
        .footer-logo {
            font-family: 'Work Sans', sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 20px;
        }
        
        .footer-tagline {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        
        .footer-info {
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        /* Print optimizations */
        @media print {
            body { 
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 100%;
                padding: 20px;
            }
            .cover-page {
                height: 100vh;
            }
            .week-section {
                page-break-before: always;
            }
            .recipe-card {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 20mm;
            size: A4;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <h1>${courseName}</h1>
        <div class="subtitle">Komplett receptsamling med alla recept</div>
        
        <div class="cover-stats">
            <div class="cover-stat">
                <div class="cover-stat-number">${Object.keys(courseData).length}</div>
                <div class="cover-stat-label">Veckor</div>
            </div>
            <div class="cover-stat">
                <div class="cover-stat-number">${totalMeals}</div>
                <div class="cover-stat-label">Måltider</div>
            </div>
            <div class="cover-stat">
                <div class="cover-stat-number">${Object.keys(recipes).length}</div>
                <div class="cover-stat-label">Recept</div>
            </div>
        </div>
        
        <div class="cover-date">Genererad ${today}</div>
    </div>
    
    <div class="container">
        <!-- Weekly Recipes -->
        ${Object.entries(courseData).map(([weekKey, week]) => {
          const weekNumber = weekKey.replace('week', '');
          return `
            <div class="week-section">
                <div class="week-header">
                    <div class="week-number">Vecka ${weekNumber}</div>
                    <div class="week-title">Alla recept för vecka ${weekNumber}</div>
                </div>
                
                ${Object.entries(week.days).map(([dayName, dayMeals]) => `
                    <div class="day-section">
                        <div class="day-name">${dayName}</div>
                        
                        ${Object.entries(dayMeals as DayMeals).map(([mealType, meal]) => {
                          const recipe = recipes[meal.name];
                          const hasRecipeData = recipe && (recipe.ingredients.length > 0 || recipe.instructions.length > 0);
                          
                          return `
                            <div class="recipe-card">
                                <div class="recipe-header">
                                    <div>
                                        <div class="meal-type-badge">${getMealTypeSwedish(mealType)}</div>
                                    </div>
                                </div>
                                
                                <div class="recipe-title">${meal.name}</div>
                                
                                ${recipe?.nutrition?.calories || recipe?.nutrition?.protein ? `
                                    <div class="recipe-meta">
                                        ${recipe.nutrition.calories ? `<div class="recipe-meta-item">🔥 ${recipe.nutrition.calories} kcal</div>` : ''}
                                        ${recipe.nutrition.protein ? `<div class="recipe-meta-item">🥩 ${recipe.nutrition.protein}g protein</div>` : ''}
                                        ${recipe.nutrition.carbs ? `<div class="recipe-meta-item">🍞 ${recipe.nutrition.carbs}g kolhydrater</div>` : ''}
                                        ${recipe.nutrition.fat ? `<div class="recipe-meta-item">🧈 ${recipe.nutrition.fat}g fett</div>` : ''}
                                    </div>
                                ` : ''}
                                
                                ${hasRecipeData ? `
                                    ${recipe.ingredients.length > 0 ? `
                                        <div class="ingredients-section">
                                            <div class="section-title">Ingredienser</div>
                                            <ul class="ingredients-list">
                                                ${recipe.ingredients.map(ing => `
                                                    <li class="ingredient-item">${ing}</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                    
                                    ${recipe.instructions.length > 0 ? `
                                        <div class="instructions-section">
                                            <div class="section-title">Instruktioner</div>
                                            <ol class="instructions-list">
                                                ${recipe.instructions.map(inst => `
                                                    <li class="instruction-item">${inst}</li>
                                                `).join('')}
                                            </ol>
                                        </div>
                                    ` : ''}
                                ` : `
                                    <p style="color: #6c757d; font-style: italic; margin-top: 15px;">
                                        Receptinformation kommer snart...
                                    </p>
                                `}
                            </div>
                          `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
          `;
        }).join('')}
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="footer-logo">Ulrika Functional Foods</div>
        <div class="footer-tagline">
            Din personliga guide till hälsosam mat och välmående
        </div>
        <div class="footer-info">
            © ${new Date().getFullYear()} Ulrika Functional Foods • functionalfoods.se
        </div>
    </div>
</body>
</html>`;

      // Create and download PDF
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000); // Longer delay to allow recipe data to load
        };
      }
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Det uppstod ett fel vid generering av PDF. Försök igen.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMealTypeSwedish = (mealType: string): string => {
    const translations: Record<string, string> = {
      'breakfast': 'Frukost',
      'lunch': 'Lunch', 
      'dinner': 'Middag',
      'snack': 'Mellanmål'
    };
    return translations[mealType] || mealType;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-[#014421] to-[#116530] rounded-3xl shadow-xl p-8 text-white"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Package className="text-3xl" />
            Komplett Kurspaket
          </h3>
          <p className="text-white/80 text-lg">
            Ladda ner alla recept med ingredienser och instruktioner
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">{Object.keys(courseData).length}</div>
          <div className="text-sm text-white/70">Veckor</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">{Object.keys(courseData).length * 7}</div>
          <div className="text-sm text-white/70">Dagar</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">{totalMeals}</div>
          <div className="text-sm text-white/70">Måltider</div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
          <div className="text-2xl font-bold mb-1">PDF</div>
          <div className="text-sm text-white/70">Format</div>
        </div>
      </div>

      {/* Features List */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="text-xl text-white/80" />
          <span className="text-white/90">Alla {Object.keys(courseData).length} veckors recept</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="text-xl text-white/80" />
          <span className="text-white/90">Fullständiga ingredienslistor</span>
        </div>
        <div className="flex items-center gap-3">
          <Book className="text-xl text-white/80" />
          <span className="text-white/90">Steg-för-steg instruktioner</span>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="text-xl text-white/80" />
          <span className="text-white/90">Näringsv\u00e4rden per recept</span>
        </div>
      </div>

      {/* Download Button */}
      <motion.button
        onClick={generateCompletePDF}
        disabled={isGenerating}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white text-[#014421] px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#014421]"></div>
            <span>Hämtar recept och genererar PDF...</span>
          </>
        ) : (
          <>
            <Download className="text-xl" />
            <span>Ladda ner komplett receptbok (PDF)</span>
          </>
        )}
      </motion.button>

      <div className="mt-4 text-center">
        <p className="text-white/60 text-sm">
          {isGenerating 
            ? 'Hämtar alla recept från databasen...' 
            : 'PDF:en innehåller alla recept med ingredienser och instruktioner'}
        </p>
      </div>
    </motion.div>
  );
}
