'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ShoppingCart, 
  BookOpen, 
  ChevronRight, 
  Play,
  Clock,
  Users,
  Download
} from 'lucide-react';
import CourseNavigation from '../../../components/CourseNavigation';
import DayModal from '../../../components/DayModal';

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

export default function ProvaPaVeckaWeek1() {
  const [mealPlan, setMealPlan] = useState<MealPlanWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ dayNumber: number; dayName: string; meals: DayMeals } | null>(null);

  useEffect(() => {
    // Save this course as the last visited
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastVisitedCourse', 'prova-pa-vecka');
    }

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
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />

      {/* Navigation */}
      <CourseNavigation courseType="prova-pa-vecka" currentWeek={1} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Text Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-[#93C560]/20 text-[#014421] px-4 py-2 rounded-full text-sm font-medium mb-4 w-fit">
                <Calendar className="w-4 h-4" />
                Vecka 1
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
                Prova på-veckan med Functional Foods! 🌿
              </h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                Denna vecka får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start. Du kommer märka skillnad redan efter några dagar!
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/courses/prova-pa-vecka/kostschema"
                  className="inline-flex items-center gap-2 bg-[#014421] text-white px-5 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  Kostschema
                </Link>
                <Link
                  href="/dashboard/courses/prova-pa-vecka/inkopslista"
                  className="inline-flex items-center gap-2 bg-white border-2 border-[#014421] text-[#014421] px-5 py-3 rounded-full font-medium hover:bg-[#014421]/5 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Inköpslista
                </Link>
              </div>
            </div>

            {/* Video/Image */}
            <div className="relative aspect-video md:aspect-auto">
              <iframe
                src="https://player.vimeo.com/video/1156756899"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Välkommen till Prova på-veckan"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Week Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#014421]">Veckans måltider</h2>
          <Link
            href="/dashboard/courses/prova-pa-vecka/material"
            className="text-[#014421] hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            Läsmaterial
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Days Grid */}
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

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/courses/prova-pa-vecka/kostschema"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#014421]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Kostschema</h3>
              <p className="text-sm text-gray-500">Se alla måltider</p>
            </div>
          </Link>

          <Link
            href="/dashboard/courses/prova-pa-vecka/inkopslista"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#014421]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Inköpslista</h3>
              <p className="text-sm text-gray-500">Veckans ingredienser</p>
            </div>
          </Link>

          <Link
            href="/dashboard/courses/prova-pa-vecka/material"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#014421]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Kunskapsmaterial</h3>
              <p className="text-sm text-gray-500">Läs och lär dig mer</p>
            </div>
          </Link>
        </div>

        {/* Community Link */}
        <div className="mt-8">
          <a
            href="https://www.facebook.com/groups/provapavecka/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1877F2] text-white rounded-2xl shadow-lg p-6 flex items-center justify-between hover:bg-[#166FE1] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Gå med i Facebook-gruppen!</h3>
                <p className="text-sm text-white/80">Få stöd och inspiration av andra deltagare</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </a>
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
    </main>
  );
}
