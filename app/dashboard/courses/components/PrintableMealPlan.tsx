'use client';
import React from 'react';
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
}

export default function PrintableMealPlan({ mealPlan, weekNumber, courseName }: PrintableMealPlanProps) {
  const formatMealName = (name: string) => {
    if (!name) return '';
    // Remove leading numbers and clean up
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

  const handlePrint = () => {
    // Open synchronously and write a quick placeholder to avoid popup blockers
    const printWindow = window.open('', '_blank', 'noopener');
    if (!printWindow) {
      alert('Din webbläsare blockerade popup-fönstret. Tillåt popup för denna sida och försök igen.');
      return;
    }

    // Lightweight placeholder keeps window alive while content is built
    printWindow.document.write(`<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8"><title>Förbereder utskrift...</title><style>body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;color:#1a1a1a}</style></head><body><p>Förbereder utskrift av vecka ${weekNumber} ...</p></body></html>`);
    printWindow.document.close();

    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseName} - Vecka ${weekNumber} - Måltidsplan</title>
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
      
      .no-break {
        page-break-inside: avoid;
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
    
    .logo-section {
      margin-bottom: 20px;
    }
    
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 10px;
    }
    
    .logo-text {
      font-size: 32px;
      font-weight: 700;
      color: #014421;
      letter-spacing: -0.5px;
    }
    
    .tagline {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
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
    
    .date-range {
      font-size: 14px;
      color: #999;
      margin-top: 10px;
    }
    
    /* Meal Plan Grid */
    .meal-plan {
      margin-bottom: 40px;
    }
    
    .day-card {
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      page-break-inside: avoid;
    }
    
    .day-header {
      background: linear-gradient(135deg, #014421 0%, #116530 100%);
      color: white;
      padding: 16px 24px;
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .day-date {
      font-size: 14px;
      font-weight: 400;
      opacity: 0.9;
    }
    
    .meals-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0;
    }
    
    .meal-item {
      padding: 20px;
      border-right: 1px solid #e5e7eb;
      background: #fafafa;
      transition: background 0.2s;
    }
    
    .meal-item:last-child {
      border-right: none;
    }
    
    .meal-item:hover {
      background: #f3f4f6;
    }
    
    .meal-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    
    .meal-icon {
      font-size: 20px;
    }
    
    .meal-type {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      color: #93C560;
      letter-spacing: 0.5px;
    }
    
    .meal-name {
      font-size: 15px;
      color: #374151;
      line-height: 1.5;
      font-weight: 500;
    }
    
    .meal-name.empty {
      color: #9ca3af;
      font-style: italic;
    }
    
    /* Nutrition Tips */
    .tips-section {
      background: #F7F1E8;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .tips-title {
      font-size: 18px;
      font-weight: 600;
      color: #014421;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .tips-list {
      list-style: none;
    }
    
    .tips-list li {
      position: relative;
      padding-left: 28px;
      margin-bottom: 12px;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .tips-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #93C560;
      font-weight: bold;
      font-size: 18px;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      line-height: 1.8;
    }
    
    .footer-logo {
      font-weight: 600;
      color: #014421;
      margin-bottom: 8px;
    }
    
    .website {
      color: #93C560;
      text-decoration: none;
    }
    
    /* Special styles */
    .highlight {
      background: linear-gradient(to right, #93C560, #7BA94D);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }
    
    .badge {
      display: inline-block;
      background: #93C560;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-text">Functional Foods</div>
        <div class="tagline">Din personliga guide till hälsosam mat och välmående</div>
      </div>
      <h1 class="course-title">${courseName}</h1>
      <h2 class="week-title">Vecka ${weekNumber} - Måltidsplan</h2>
      <div class="date-range">${new Date().toLocaleDateString('sv-SE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
    </div>
    
    <!-- Meal Plan -->
    <div class="meal-plan">
      ${Object.entries(mealPlan).map(([day, meals]) => `
        <div class="day-card no-break">
          <div class="day-header">
            <span>${day}</span>
          </div>
          <div class="meals-container">
            ${Object.entries(meals).filter(([_, meal]) => meal).map(([mealType, meal]) => `
              <div class="meal-item">
                <div class="meal-header">
                  <span class="meal-icon">${getMealIcon(mealType)}</span>
                  <span class="meal-type">${translateMealType(mealType)}</span>
                </div>
                <div class="meal-name ${!meal.name ? 'empty' : ''}">
                  ${formatMealName(meal.name) || 'Inget planerat'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <!-- Tips Section -->
    <div class="tips-section no-break">
      <h3 class="tips-title">
        <span>💡</span>
        Tips för veckan
      </h3>
      <ul class="tips-list">
        <li>Förbered gärna flera portioner av måltiderna för att spara tid</li>
        <li>Handla alla ingredienser i början av veckan med hjälp av inköpslistan</li>
        <li>Anpassa portionsstorlekarna efter dina behov och mål</li>
        <li>Drick mycket vatten genom dagen för optimal hälsa</li>
      </ul>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">Ulrika Functional Foods</div>
      <p>
        <a href="https://ulrika-functional-foods.com" class="website">www.ulrika-functional-foods.com</a>
      </p>
      <p>© ${new Date().getFullYear()} Alla rättigheter förbehållna</p>
      <p style="margin-top: 10px; font-style: italic;">
        Detta dokument är personligt och får inte delas utan tillstånd
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Replace placeholder with full content and print
    setTimeout(() => {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 300);
    }, 50);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePrint}
      className="flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-xl hover:bg-[#116530] transition-all shadow-lg hover:shadow-xl font-medium"
    >
      <Printer className="w-5 h-5" />
      <span>Skriv ut måltidsplan</span>
    </motion.button>
  );
}