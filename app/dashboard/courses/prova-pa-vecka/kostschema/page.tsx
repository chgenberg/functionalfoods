'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Calendar, Clock, Utensils } from 'lucide-react';
import DayModal from '../../components/DayModal';

interface Meal {
  name: string;
  recipeLink: string;
}

interface DayMeals {
  breakfast?: Meal | null;
  lunch?: Meal | null;
  dinner?: Meal | null;
  snack?: Meal | null;
  dessert?: Meal | null;
}

interface MealPlanWeek {
  days: Record<string, DayMeals>;
}

const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

export default function ProvaPaVeckaKostschema() {
  const [mealPlan, setMealPlan] = useState<MealPlanWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ dayNumber: number; dayName: string; meals: DayMeals } | null>(null);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=prova-pa-vecka&week=1');
        if (res.ok) {
          const data = await res.json();
          setMealPlan(data);
        }
      } catch (error) {
        console.error('Failed to fetch meal plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Frukost',
      lunch: 'Lunch',
      dinner: 'Middag',
      snack: 'Mellanmål',
      dessert: 'Efterrätt'
    };
    return labels[type] || type;
  };

  const getMealTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
      dessert: '🍨'
    };
    return emojis[type] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#014421] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/prova-pa-vecka/oversikt" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ChevronLeft className="w-5 h-5" /> Tillbaka
              </Link>
            </div>
            <span className="text-[#014421] font-bold">Kostschema</span>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#014421]">
                Prova på-veckans kostschema
              </h1>
              <p className="text-gray-600 mt-2">
                Klicka på en dag för att se alla måltider och recept
              </p>
            </div>
            <Link
              href="/dashboard/courses/prova-pa-vecka/inkopslista"
              className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
            >
              <Download className="w-5 h-5" />
              Ladda ner inköpslista
            </Link>
          </div>
        </div>
      </div>

      {/* Meal Plan Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="grid gap-4">
          {dayNames.map((dayName, index) => {
            const dayMeals = mealPlan?.days?.[dayName] || {};
            const mealCount = Object.values(dayMeals).filter(m => m).length;

            return (
              <motion.div
                key={dayName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedDay({ dayNumber: index + 1, dayName, meals: dayMeals })}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#014421] rounded-xl flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{dayName}</h3>
                      <p className="text-sm text-gray-500">{mealCount} måltider</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Meal preview */}
                    <div className="hidden md:flex items-center gap-2">
                      {Object.entries(dayMeals)
                        .filter(([_, meal]) => meal)
                        .slice(0, 3)
                        .map(([type, meal]) => (
                          <span
                            key={type}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                            title={meal?.name}
                          >
                            {getMealTypeEmoji(type)} {getMealTypeLabel(type)}
                          </span>
                        ))}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Mobile meal preview */}
                <div className="md:hidden mt-4 flex flex-wrap gap-2">
                  {Object.entries(dayMeals)
                    .filter(([_, meal]) => meal)
                    .map(([type, meal]) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {getMealTypeEmoji(type)} {meal?.name?.slice(0, 20)}...
                      </span>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Day Modal */}
      {selectedDay && (
        <DayModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          weekNumber={1}
          dayNumber={selectedDay.dayNumber}
          dayName={selectedDay.dayName}
          meals={selectedDay.meals}
          courseType="prova-pa-vecka"
        />
      )}
    </div>
  );
}