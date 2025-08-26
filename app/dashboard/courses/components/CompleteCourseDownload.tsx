'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiBook, FiCalendar, FiUser, FiFileText, FiPackage } from 'react-icons/fi';
import { mealPlans, flowMealPlans, WeekMealPlan, DayMeals, MealItem } from '@/app/data/mealPlans';

interface CompleteCourseDownloadProps {
  courseType: 'basics' | 'flow';
}

export default function CompleteCourseDownload({ courseType }: CompleteCourseDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const courseName = courseType === 'basics' ? 'Functional Basics' : 'Functional Flow';
  const courseData = courseType === 'basics' ? mealPlans : flowMealPlans;

  // Count total recipes and meals
  const totalRecipes = Object.values(courseData).reduce((total, week) => {
    return total + Object.values(week.days).reduce((weekTotal, day) => {
      return weekTotal + Object.values(day as DayMeals).filter((meal: MealItem) => meal.recipeLink).length;
    }, 0);
  }, 0);

  const totalMeals = Object.values(courseData).reduce((total, week) => {
    return total + Object.values(week.days).reduce((weekTotal, day) => {
      return weekTotal + Object.values(day as DayMeals).length;
    }, 0);
  }, 0);

  const generateCompletePDF = async () => {
    setIsGenerating(true);
    
    try {
      const today = new Date().toLocaleDateString('sv-SE');
      
      // Collect all unique recipes
      const uniqueRecipes = new Map();
      Object.values(courseData).forEach((week, weekIndex) => {
        Object.entries(week.days).forEach(([dayName, dayMeals]) => {
          Object.entries(dayMeals as DayMeals).forEach(([mealType, meal]) => {
            if (meal.recipeLink && !meal.name.toLowerCase().includes('rester')) {
              const recipeKey = meal.recipeLink;
              if (!uniqueRecipes.has(recipeKey)) {
                uniqueRecipes.set(recipeKey, {
                  name: meal.name,
                  link: meal.recipeLink,
                  week: weekIndex + 1,
                  day: dayName,
                  mealType: mealType
                });
              }
            }
          });
        });
      });

      const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Komplett Kurspaket - ${courseName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
            font-family: 'Playfair Display', serif;
            font-size: 4rem;
            font-weight: 700;
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
        
        /* Header for content pages */
        .page-header {
            background: linear-gradient(135deg, #014421 0%, #116530 100%);
            color: white;
            padding: 60px 40px;
            margin: -40px -20px 40px -20px;
            text-align: center;
        }
        
        .page-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .page-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        /* Table of Contents */
        .toc {
            background: #f8f9fa;
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 40px;
            page-break-after: always;
        }
        
        .toc h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            color: #014421;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .toc-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px dashed #e0e0e0;
        }
        
        .toc-item:last-child {
            border-bottom: none;
        }
        
        .toc-title {
            font-weight: 500;
            color: #014421;
        }
        
        .toc-page {
            color: #666;
            font-size: 0.9rem;
        }
        
        /* Week Section */
        .week-section {
            margin-bottom: 60px;
            page-break-inside: avoid;
        }
        
        .week-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-radius: 20px 20px 0 0;
            border-left: 5px solid #014421;
        }
        
        .week-number {
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            font-weight: 700;
            color: #014421;
            margin-bottom: 10px;
        }
        
        .week-title {
            font-size: 1.4rem;
            color: #495057;
            font-weight: 400;
        }
        
        /* Day Cards Grid */
        .days-container {
            background: white;
            padding: 30px;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .day-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }
        
        .day-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 25px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .day-card:hover {
            box-shadow: 0 4px 12px rgba(1,68,33,0.1);
        }
        
        .day-name {
            font-weight: 700;
            font-size: 1.2rem;
            color: #014421;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .day-name::before {
            content: '';
            width: 8px;
            height: 8px;
            background: #014421;
            border-radius: 50%;
        }
        
        .meal-item {
            margin-bottom: 15px;
            padding-left: 20px;
            position: relative;
        }
        
        .meal-item:last-child {
            margin-bottom: 0;
        }
        
        .meal-type {
            font-weight: 600;
            color: #6c757d;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .meal-name {
            color: #2c3e50;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        
        /* Recipe Section */
        .recipes-section {
            margin-top: 80px;
            page-break-before: always;
        }
        
        .recipes-header {
            text-align: center;
            margin-bottom: 50px;
        }
        
        .recipes-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            color: #014421;
            margin-bottom: 10px;
        }
        
        .recipes-header p {
            font-size: 1.1rem;
            color: #6c757d;
        }
        
        .recipe-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
        }
        
        .recipe-card {
            background: white;
            border: 2px solid #f0f0f0;
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .recipe-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, #014421 0%, #116530 100%);
        }
        
        .recipe-number {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            background: #014421;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }
        
        .recipe-name {
            font-weight: 600;
            font-size: 1.1rem;
            color: #014421;
            margin-bottom: 10px;
            margin-right: 50px;
        }
        
        .recipe-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .recipe-meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.85rem;
            color: #6c757d;
        }
        
        .recipe-meta-icon {
            width: 16px;
            height: 16px;
            opacity: 0.6;
        }
        
        .recipe-link {
            font-size: 0.8rem;
            color: #0066cc;
            background: #e8f4ff;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Monaco', 'Courier New', monospace;
            word-break: break-all;
            display: block;
            text-decoration: none;
            border: 1px solid #b3d9ff;
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
        }
        
        .footer-logo {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            font-weight: 700;
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
                padding: 0;
            }
            .cover-page {
                height: 100vh;
            }
            .day-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
            .recipe-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            .week-section {
                page-break-inside: avoid;
            }
            .recipe-card {
                page-break-inside: avoid;
            }
        }
        
        @page {
            margin: 0;
            size: A4;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <h1>${courseName}</h1>
        <div class="subtitle">Komplett kurspaket med alla recept och kostscheman</div>
        
        <div class="cover-stats">
            <div class="cover-stat">
                <div class="cover-stat-number">${Object.keys(courseData).length}</div>
                <div class="cover-stat-label">Veckor</div>
            </div>
            <div class="cover-stat">
                <div class="cover-stat-number">${uniqueRecipes.size}</div>
                <div class="cover-stat-label">Unika Recept</div>
            </div>
            <div class="cover-stat">
                <div class="cover-stat-number">${totalMeals}</div>
                <div class="cover-stat-label">Måltider</div>
            </div>
        </div>
        
        <div class="cover-date">Genererad ${today}</div>
    </div>
    
    <div class="container">
        <!-- Table of Contents -->
        <div class="toc">
            <h2>Innehållsförteckning</h2>
            ${Object.entries(courseData).map(([weekKey, week], index) => {
              const weekNumber = weekKey.replace('week', '');
              return `
                <div class="toc-item">
                    <div class="toc-title">Vecka ${weekNumber}: ${week.title}</div>
                    <div class="toc-page">Sida ${index + 3}</div>
                </div>
              `;
            }).join('')}
            <div class="toc-item">
                <div class="toc-title">Alla recept i kursen</div>
                <div class="toc-page">Sida ${Object.keys(courseData).length + 3}</div>
            </div>
        </div>
        
        <!-- Weekly Meal Plans -->
        <div class="page-header">
            <h2>Veckokostscheman</h2>
            <p>Komplett översikt för ${Object.keys(courseData).length} veckor</p>
        </div>
        
        ${Object.entries(courseData).map(([weekKey, week]) => {
          const weekNumber = weekKey.replace('week', '');
          return `
            <div class="week-section">
                <div class="week-header">
                    <div class="week-number">Vecka ${weekNumber}</div>
                    <div class="week-title">${week.title}</div>
                </div>
                
                <div class="days-container">
                    <div class="day-grid">
                        ${Object.entries(week.days).map(([dayName, dayMeals]) => `
                            <div class="day-card">
                                <div class="day-name">${dayName}</div>
                                ${Object.entries(dayMeals as DayMeals).map(([mealType, meal]) => `
                                    <div class="meal-item">
                                        <div class="meal-type">${getMealTypeSwedish(mealType)}</div>
                                        <div class="meal-name">${meal.name}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
          `;
        }).join('')}
        
        <!-- Recipe Collection -->
        <div class="recipes-section">
            <div class="recipes-header">
                <h2>Receptsamling</h2>
                <p>Alla ${uniqueRecipes.size} unika recept från kursen</p>
            </div>
            
            <div class="recipe-grid">
                ${Array.from(uniqueRecipes.values()).map((recipe, index) => `
                    <div class="recipe-card">
                        <div class="recipe-number">${index + 1}</div>
                        <div class="recipe-name">${recipe.name}</div>
                        <div class="recipe-meta">
                            <div class="recipe-meta-item">
                                <svg class="recipe-meta-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 6h12v10H4V6z"/>
                                </svg>
                                Vecka ${recipe.week}
                            </div>
                            <div class="recipe-meta-item">
                                <svg class="recipe-meta-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                </svg>
                                ${getMealTypeSwedish(recipe.mealType)}
                            </div>
                        </div>
                        <a href="https://functionalfoods.se${recipe.link}" class="recipe-link">
                            functionalfoods.se${recipe.link}
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
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
          }, 500);
        };
      }
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
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
            <FiPackage className="text-3xl" />
            Komplett Kurspaket
          </h3>
          <p className="text-white/80 text-lg">
            Ladda ner alla recept och kostscheman som en snygg PDF
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
          <div className="text-2xl font-bold mb-1">{totalRecipes}</div>
          <div className="text-sm text-white/70">Recept</div>
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
          <FiCalendar className="text-xl text-white/80" />
          <span className="text-white/90">Alla 6 veckors kostscheman</span>
        </div>
        <div className="flex items-center gap-3">
          <FiUser className="text-xl text-white/80" />
          <span className="text-white/90">Kompletta receptsamling</span>
        </div>
        <div className="flex items-center gap-3">
          <FiBook className="text-xl text-white/80" />
          <span className="text-white/90">Snygg layout för utskrift</span>
        </div>
        <div className="flex items-center gap-3">
          <FiFileText className="text-xl text-white/80" />
          <span className="text-white/90">Direktlänkar till recept</span>
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
            <span>Genererar PDF...</span>
          </>
        ) : (
          <>
            <FiDownload className="text-xl" />
            <span>Ladda ner komplett kurspaket (PDF)</span>
          </>
        )}
      </motion.button>

      <div className="mt-4 text-center">
        <p className="text-white/60 text-sm">
          PDF:en öppnas i en ny flik där du kan spara eller skriva ut den
        </p>
      </div>
    </motion.div>
  );
} 