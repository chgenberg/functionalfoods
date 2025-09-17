'use client';
import React, { useRef } from 'react';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Image from 'next/image';

interface Meal {
  name: string;
  recipeLink?: string;
}

interface DayMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack?: Meal;
}

interface PrintableMealPlanProps {
  mealPlan: Record<string, DayMeals>;
  weekNumber: number;
  courseName: string;
}

export default function PrintableMealPlan({ mealPlan, weekNumber, courseName }: PrintableMealPlanProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${courseName} - Vecka ${weekNumber} - Måltidsplan`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  const formatMealName = (name: string) => {
    return name.replace(/^\d+\.\s*/, '');
  };

  const translateMealType = (mealType: string) => {
    const translations: Record<string, string> = {
      breakfast: 'Frukost',
      lunch: 'Lunch',
      dinner: 'Middag',
      snack: 'Mellanmål'
    };
    return translations[mealType] || mealType;
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors print:hidden"
      >
        <Printer className="w-4 h-4" />
        Skriv ut måltidsplan
      </button>

      {/* Hidden printable content */}
      <div className="hidden">
        <div ref={componentRef} className="print-content">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              .print-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1a1a1a;
              }
              .print-header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #014421;
              }
              .print-logo {
                margin: 0 auto 20px;
                display: block;
              }
              .print-title {
                font-size: 28px;
                font-weight: bold;
                color: #014421;
                margin-bottom: 10px;
              }
              .print-subtitle {
                font-size: 18px;
                color: #666;
              }
              .day-section {
                margin-bottom: 30px;
                page-break-inside: avoid;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                overflow: hidden;
              }
              .day-header {
                background-color: #014421;
                color: white;
                padding: 12px 20px;
                font-size: 20px;
                font-weight: bold;
              }
              .meals-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 0;
              }
              .meal-item {
                padding: 20px;
                border-right: 1px solid #e5e5e5;
              }
              .meal-item:last-child {
                border-right: none;
              }
              .meal-type {
                font-weight: bold;
                color: #014421;
                margin-bottom: 8px;
                font-size: 14px;
                text-transform: uppercase;
              }
              .meal-name {
                font-size: 14px;
                line-height: 1.4;
                color: #333;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                padding-top: 20px;
                border-top: 1px solid #e5e5e5;
              }
            }
          `}} />

          <div className="print-header">
            <Image 
              src="/logo.png" 
              alt="Functional Foods" 
              width={150} 
              height={50} 
              className="print-logo"
            />
            <h1 className="print-title">{courseName}</h1>
            <p className="print-subtitle">Vecka {weekNumber} - Måltidsplan</p>
          </div>

          <div className="meal-plan-content">
            {Object.entries(mealPlan).map(([day, meals]) => (
              <div key={day} className="day-section">
                <div className="day-header">{day}</div>
                <div className="meals-grid">
                  {Object.entries(meals).map(([mealType, meal]) => (
                    <div key={mealType} className="meal-item">
                      <div className="meal-type">{translateMealType(mealType)}</div>
                      <div className="meal-name">{formatMealName(meal.name)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="footer">
            <p>© {new Date().getFullYear()} Ulrika Functional Foods - www.ulrika-functional-foods.com</p>
            <p>Detta dokument är personligt och får inte delas utan tillstånd.</p>
          </div>
        </div>
      </div>
    </>
  );
}
