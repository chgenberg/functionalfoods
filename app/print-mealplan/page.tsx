'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PrintMealPlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [printed, setPrinted] = useState(false);
  
  const weekNumber = parseInt(searchParams.get('week') || '1', 10);
  const courseType = searchParams.get('course') || 'basics';
  const courseName = courseType === 'basics' 
    ? 'Functional Basics' 
    : courseType === 'flow' 
    ? 'Functional Gut Health/Flow' 
    : courseType === 'hormone'
    ? 'Hormonell Balans'
    : 'Functional Insulin balance/Energy';

  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    // For hormone course, fetch from API (database)
    if (courseType === 'hormone') {
      fetch(`/api/meal-plans?course=hormone&week=${weekNumber}`)
        .then(res => res.json())
        .then(data => {
          setMealPlan(data?.days || {});
        })
        .catch(() => setMealPlan({}));
    } else {
      // Dynamically import static meal plan data for other courses
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
    if (mealPlan && !printed) {
      // Auto-print once loaded
      setTimeout(() => {
        window.print();
        setPrinted(true);
      }, 500);
    }
  }, [mealPlan, printed]);

  const formatMealName = (name: string) => {
    if (!name) return '';
    return name.replace(/^\d+\.\s*/, '').replace(/\s*\(\d+\s*kcal\)/, '').trim();
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

  if (!mealPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#014421] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar måltidsplan...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; margin: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-white p-8">
        {/* Back button - hidden on print */}
        <div className="no-print mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#014421] hover:text-[#116530] font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Tillbaka till kursen
          </button>
        </div>

        {/* Printable content */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 pb-8 border-b-4 border-[#014421]">
            <h1 className="text-4xl font-bold text-[#014421] mb-2">Functional Foods</h1>
            <p className="text-gray-600 mb-4">Din personliga guide till hälsosam mat och välmående</p>
            <h2 className="text-3xl font-bold text-[#014421] mb-2">{courseName}</h2>
            <h3 className="text-2xl text-gray-700 font-medium">Vecka {weekNumber} - Måltidsplan</h3>
            <p className="text-sm text-gray-500 mt-4">
              {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Meal Plan */}
          <div className="space-y-6">
            {Object.entries(mealPlan).map(([day, meals]: [string, any]) => (
              <div key={day} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm" style={{ pageBreakInside: 'avoid' }}>
                <div className="bg-gradient-to-r from-[#014421] to-[#116530] text-white px-6 py-4 flex items-center justify-between">
                  <span className="text-xl font-semibold">{day}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                  {Object.entries(meals)
                    .filter(([_, meal]) => meal)
                    .map(([mealType, meal]: [string, any], idx, arr) => (
                      <div 
                        key={mealType} 
                        className={`p-5 bg-gray-50 ${idx < arr.length - 1 ? 'border-r border-gray-200' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getMealIcon(mealType)}</span>
                          <span className="text-xs font-semibold uppercase text-[#93C560] tracking-wide">
                            {translateMealType(mealType)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-snug">
                          {formatMealName(meal.name) || 'Inget planerat'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-[#F7F1E8] rounded-xl p-8" style={{ pageBreakInside: 'avoid' }}>
            <h3 className="text-xl font-bold text-[#014421] mb-4 flex items-center gap-2">
              <span>💡</span>
              Tips för veckan
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#93C560] font-bold text-xl">✓</span>
                <span className="text-gray-700">Förbered gärna flera portioner av måltiderna för att spara tid</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#93C560] font-bold text-xl">✓</span>
                <span className="text-gray-700">Handla alla ingredienser i början av veckan med hjälp av inköpslistan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#93C560] font-bold text-xl">✓</span>
                <span className="text-gray-700">Anpassa portionsstorlekarna efter dina behov och mål</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#93C560] font-bold text-xl">✓</span>
                <span className="text-gray-700">Drick mycket vatten genom dagen för optimal hälsa</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center text-sm text-gray-600">
            <p className="font-semibold text-[#014421] mb-2">Ulrika Functional Foods</p>
            <p>
              <a href="https://www.functionalfoods.se" className="text-[#93C560] hover:underline">
                www.functionalfoods.se
              </a>
            </p>
            <p className="mt-2">© {new Date().getFullYear()} Alla rättigheter förbehållna</p>
            <p className="mt-2 italic text-xs">Detta dokument är personligt och får inte delas utan tillstånd</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PrintMealPlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#014421] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    }>
      <PrintMealPlanContent />
    </Suspense>
  );
}

