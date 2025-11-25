'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

function PrintMealPlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [printed, setPrinted] = useState(false);
  
  const weekNumber = parseInt(searchParams.get('week') || '1', 10);
  const courseType = searchParams.get('course') || 'basics';
  const courseName = courseType === 'basics' 
    ? 'Functional Basics' 
    : courseType === 'flow' 
    ? 'Functional Flow' 
    : courseType === 'hormone'
    ? 'Hormonell Balans'
    : 'Functional Energy';

  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    if (courseType === 'hormone') {
      fetch(`/api/meal-plans?course=hormone&week=${weekNumber}`)
        .then(res => res.json())
        .then(data => {
          setMealPlan(data?.days || {});
        })
        .catch(() => setMealPlan({}));
    } else {
      import('@/app/data/mealPlans').then(module => {
        const getData = courseType === 'basics' 
          ? module.getWeekData 
          : courseType === 'flow' 
          ? module.getFlowWeekData 
          : module.getEnergyWeekData;
        
        const data = getData(weekNumber);
        setMealPlan(data?.days || {});
      });
    }
  }, [weekNumber, courseType]);

  useEffect(() => {
    if (mealPlan && Object.keys(mealPlan).length > 0 && !printed) {
      setTimeout(() => {
        window.print();
        setPrinted(true);
      }, 600);
    }
  }, [mealPlan, printed]);

  const formatMealName = (name: string) => {
    if (!name) return '';
    return name.replace(/^\d+\.\s*/, '').replace(/\s*\(\d+\s*kcal\)/, '').trim();
  };

  const getMealTypeInfo = (mealType: string) => {
    const info: Record<string, { name: string; icon: string; color: string }> = {
      breakfast: { name: 'Frukost', icon: '☕', color: '#F59E0B' },
      lunch: { name: 'Lunch', icon: '🥗', color: '#10B981' },
      dinner: { name: 'Middag', icon: '🍽️', color: '#6366F1' },
      snack: { name: 'Mellanmål', icon: '🥪', color: '#EC4899' },
      dessert: { name: 'Efterrätt', icon: '🍰', color: '#8B5CF6' }
    };
    return info[mealType] || { name: mealType, icon: '🍴', color: '#6B7280' };
  };

  const dayOrder = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  if (!mealPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F1E8] to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#014421]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#014421] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[#014421] font-medium text-lg">Laddar måltidsplan...</p>
        </div>
      </div>
    );
  }

  const sortedDays = dayOrder.filter(day => mealPlan[day]);

  return (
    <>
      <div className="min-h-screen bg-white print-document">
        {/* Screen-only header */}
        <div className="no-print sticky top-0 z-50 bg-gradient-to-r from-[#014421] to-[#116530] text-white shadow-lg">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Tillbaka</span>
            </button>
            <div className="text-center">
              <h1 className="font-bold text-lg">{courseName}</h1>
              <p className="text-white/80 text-sm">Vecka {weekNumber} • Kostschema</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="font-medium">Skriv ut</span>
            </button>
          </div>
        </div>

        {/* Print content */}
        <div className="print-content">
          {/* Header section */}
          <div className="mealplan-header">
            <div className="header-decoration"></div>
            <div className="header-content">
              <div className="logo-section">
                <span className="logo-icon">🌿</span>
                <h1 className="logo-text">Functional Foods</h1>
              </div>
              <div className="title-section">
                <h2 className="course-name">{courseName}</h2>
                <div className="title-divider"></div>
                <h3 className="week-title">Vecka {weekNumber} • Kostschema</h3>
              </div>
              <p className="header-date">
                {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Meal plan grid */}
          <div className="mealplan-grid">
            {sortedDays.map((day, dayIndex) => {
              const meals = mealPlan[day];
              if (!meals) return null;
              
              return (
                <div key={day} className="day-card">
                  <div className="day-header">
                    <span className="day-number">{dayIndex + 1}</span>
                    <span className="day-name">{day}</span>
                  </div>
                  <div className="meals-grid">
                    {mealOrder.map((mealType) => {
                      const meal = meals[mealType];
                      if (!meal) return null;
                      const mealInfo = getMealTypeInfo(mealType);
                      
                      return (
                        <div key={mealType} className="meal-item">
                          <div className="meal-header">
                            <span className="meal-icon">{mealInfo.icon}</span>
                            <span className="meal-type">{mealInfo.name}</span>
                          </div>
                          <p className="meal-name">{formatMealName(meal.name) || 'Inget planerat'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips section */}
          <div className="tips-section">
            <div className="tips-header">
              <span className="tips-icon">💡</span>
              <h3>Tips för veckan</h3>
            </div>
            <div className="tips-grid">
              <div className="tip-item">
                <span className="tip-check">✓</span>
                <span>Förbered gärna flera portioner för att spara tid i veckan</span>
              </div>
              <div className="tip-item">
                <span className="tip-check">✓</span>
                <span>Använd inköpslistan för att handla effektivt</span>
              </div>
              <div className="tip-item">
                <span className="tip-check">✓</span>
                <span>Anpassa portionsstorlekarna efter dina behov</span>
              </div>
              <div className="tip-item">
                <span className="tip-check">✓</span>
                <span>Drick mycket vatten genom hela dagen</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mealplan-footer">
            <div className="footer-logo">
              <span>🌿</span>
              <span>Functional Foods</span>
            </div>
            <p className="footer-url">www.functionalfoods.se</p>
            <p className="footer-copyright">© {new Date().getFullYear()} Alla rättigheter förbehållna</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .print-document {
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* Screen styles */
        .print-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .mealplan-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          border-radius: 20px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header-decoration {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 200px;
          height: 200px;
          background: rgba(147, 197, 96, 0.15);
          border-radius: 50%;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0;
        }

        .title-section {
          margin-bottom: 1rem;
        }

        .course-name {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem;
        }

        .title-divider {
          width: 60px;
          height: 3px;
          background: #93C560;
          margin: 0 auto 1rem;
        }

        .week-title {
          font-size: 1.25rem;
          font-weight: 400;
          opacity: 0.9;
          margin: 0;
        }

        .header-date {
          font-size: 0.9rem;
          opacity: 0.75;
          margin: 0;
        }

        .mealplan-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .day-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #e5e5e5;
        }

        .day-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .day-number {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .day-name {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .meals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0;
        }

        .meal-item {
          padding: 1rem 1.25rem;
          background: #fafafa;
          border-right: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }

        .meal-item:last-child {
          border-right: none;
        }

        .meal-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .meal-icon {
          font-size: 1.25rem;
        }

        .meal-type {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #93C560;
        }

        .meal-name {
          font-size: 0.9rem;
          color: #333;
          line-height: 1.4;
          margin: 0;
        }

        .tips-section {
          background: #F7F1E8;
          border-radius: 16px;
          padding: 1.5rem 2rem;
          margin-top: 2rem;
        }

        .tips-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .tips-icon {
          font-size: 1.5rem;
        }

        .tips-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #014421;
          margin: 0;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #444;
        }

        .tip-check {
          color: #93C560;
          font-weight: 700;
          font-size: 1rem;
        }

        .mealplan-footer {
          text-align: center;
          padding: 2rem 0;
          margin-top: 2rem;
          border-top: 2px solid #eee;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #014421;
          margin-bottom: 0.5rem;
        }

        .footer-url {
          color: #93C560;
          font-size: 0.9rem;
          margin: 0 0 0.25rem;
        }

        .footer-copyright {
          color: #999;
          font-size: 0.8rem;
          margin: 0;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-content {
            max-width: none;
            padding: 1.5rem;
            margin: 0;
          }

          .mealplan-header {
            background: linear-gradient(135deg, #014421 0%, #116530 100%) !important;
            -webkit-print-color-adjust: exact !important;
            border-radius: 0;
            padding: 1.5rem 2rem;
            margin-bottom: 1.5rem;
          }

          .header-decoration {
            display: none;
          }

          .logo-section {
            margin-bottom: 1rem;
          }

          .course-name {
            font-size: 1.5rem;
          }

          .week-title {
            font-size: 1rem;
          }

          .day-card {
            page-break-inside: avoid;
            border-radius: 8px;
            margin-bottom: 0.75rem;
          }

          .day-header {
            background: linear-gradient(135deg, #014421 0%, #116530 100%) !important;
            -webkit-print-color-adjust: exact !important;
            padding: 0.75rem 1rem;
          }

          .day-number {
            background: rgba(255,255,255,0.2) !important;
            -webkit-print-color-adjust: exact !important;
            width: 26px;
            height: 26px;
          }

          .day-name {
            font-size: 1rem;
          }

          .meal-item {
            padding: 0.75rem 1rem;
            background: #fafafa !important;
            -webkit-print-color-adjust: exact !important;
          }

          .meal-type {
            color: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .tips-section {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            page-break-inside: avoid;
            margin-top: 1.5rem;
            padding: 1rem 1.5rem;
            border-radius: 8px;
          }

          .tips-grid {
            gap: 0.5rem;
          }

          .tip-check {
            color: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .mealplan-footer {
            padding: 1rem 0;
            margin-top: 1rem;
          }

          .footer-logo {
            color: #014421 !important;
          }

          .footer-url {
            color: #93C560 !important;
          }
        }

        @page {
          size: A4;
          margin: 10mm;
        }
      `}</style>
    </>
  );
}

export default function PrintMealPlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F1E8] to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#014421]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#014421] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[#014421] font-medium text-lg">Laddar...</p>
        </div>
      </div>
    }>
      <PrintMealPlanContent />
    </Suspense>
  );
}
