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
    if (!name) return 'Inget planerat';
    return name.replace(/^\d+\.\s*/, '').replace(/\s*\(\d+\s*kcal\)/, '').trim();
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

  const getMealName = (mealType: string) => {
    const names: Record<string, string> = {
      breakfast: 'Frukost',
      lunch: 'Lunch',
      dinner: 'Middag',
      snack: 'Mellanmål',
      dessert: 'Efterrätt'
    };
    return names[mealType] || mealType;
  };

  const dayOrder = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  if (!mealPlan) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Laddar kostschema...</p>
      </div>
    );
  }

  const sortedDays = dayOrder.filter(day => mealPlan[day]);

  return (
    <div className="print-wrapper">
      {/* Screen header */}
      <div className="screen-header no-print">
        <div className="header-content">
          <button onClick={() => router.back()} className="back-btn">
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
          <div className="header-title">
            <strong>{courseName}</strong>
            <span>Vecka {weekNumber} • Kostschema</span>
          </div>
          <button onClick={() => window.print()} className="print-btn">
            <Printer className="w-4 h-4" />
            <span>Skriv ut</span>
          </button>
        </div>
      </div>

      {/* Print content */}
      <div className="print-content">
        {/* Header */}
        <div className="page-header">
          <div className="brand">
            <span className="brand-icon">🌿</span>
            <span className="brand-name">Functional Foods</span>
          </div>
          <h1 className="main-title">Kostschema</h1>
          <p className="subtitle">{courseName} • Vecka {weekNumber}</p>
        </div>

        {/* Days grid */}
        <div className="days-container">
          {sortedDays.map((day) => {
            const meals = mealPlan[day];
            if (!meals) return null;
            
            return (
              <div key={day} className="day-row">
                <div className="day-name">{day}</div>
                <div className="meals-row">
                  {mealOrder.map((mealType) => {
                    const meal = meals[mealType];
                    if (!meal) return null;
                    
                    return (
                      <div key={mealType} className="meal-cell">
                        <div className="meal-type">
                          <span className="meal-icon">{getMealIcon(mealType)}</span>
                          <span className="meal-label">{getMealName(mealType)}</span>
                        </div>
                        <div className="meal-name">{formatMealName(meal.name)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="tips-box">
          <h3>💡 Tips för veckan</h3>
          <ul>
            <li>Förbered gärna flera portioner för att spara tid</li>
            <li>Använd inköpslistan för effektiv handling</li>
            <li>Anpassa portionsstorlekarna efter dina behov</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="page-footer">
          <span>www.functionalfoods.se</span>
          <span>© {new Date().getFullYear()} Functional Foods</span>
        </div>
      </div>

      <style jsx>{`
        .loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F7F1E8;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #014421;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .print-wrapper {
          background: white;
          min-height: 100vh;
        }

        /* Screen header */
        .screen-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          color: white;
          padding: 1rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .header-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Print content */
        .print-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .page-header {
          background: #014421;
          color: white;
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .brand-name {
          font-size: 0.9rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .main-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0;
        }

        /* Days */
        .days-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .day-row {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          overflow: hidden;
        }

        .day-name {
          background: #014421;
          color: white;
          padding: 0.6rem 1rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .meals-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .meal-cell {
          padding: 0.75rem;
          border-right: 1px solid #eee;
          border-bottom: 1px solid #eee;
          background: #fafafa;
        }

        .meal-cell:last-child {
          border-right: none;
        }

        .meal-type {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.4rem;
        }

        .meal-icon {
          font-size: 1rem;
        }

        .meal-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #93C560;
          letter-spacing: 0.5px;
        }

        .meal-name {
          font-size: 0.85rem;
          color: #333;
          line-height: 1.3;
        }

        /* Tips */
        .tips-box {
          background: #F7F1E8;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          margin-top: 1.5rem;
        }

        .tips-box h3 {
          font-size: 1rem;
          color: #014421;
          margin: 0 0 0.75rem;
        }

        .tips-box ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .tips-box li {
          font-size: 0.85rem;
          color: #555;
          margin-bottom: 0.35rem;
        }

        /* Footer */
        .page-footer {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          margin-top: 1.5rem;
          border-top: 1px solid #eee;
          font-size: 0.8rem;
          color: #888;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body, html {
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-wrapper {
            background: white;
          }

          .print-content {
            max-width: none;
            padding: 10mm;
            margin: 0;
          }

          .page-header {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-radius: 0;
            margin-bottom: 1rem;
            padding: 1rem;
          }

          .day-row {
            page-break-inside: avoid;
            border-radius: 0;
          }

          .day-name {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0.5rem 0.75rem;
          }

          .meal-cell {
            background: #fafafa !important;
            -webkit-print-color-adjust: exact !important;
            padding: 0.5rem;
          }

          .meal-label {
            color: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .tips-box {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            page-break-inside: avoid;
            margin-top: 1rem;
            padding: 0.75rem 1rem;
          }

          .page-footer {
            margin-top: 1rem;
            padding-top: 0.75rem;
          }
        }

        @page {
          size: A4;
          margin: 8mm;
        }
      `}</style>
    </div>
  );
}

export default function PrintMealPlanPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F1E8' }}>
        <p style={{ color: '#014421' }}>Laddar...</p>
      </div>
    }>
      <PrintMealPlanContent />
    </Suspense>
  );
}
