'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GiFruitBowl } from 'react-icons/gi';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Printer, Sun, Moon, Coffee, Star, Heart } from 'lucide-react';
import { useFavoriteRecipes } from '@/app/hooks/useFavoriteRecipes';
import CourseNavigation from '../../components/CourseNavigation';

const generateRecipeSlug = (name: string): string => {
  return name.toLowerCase().replace(/[åäÅÄ]/g, 'a').replace(/[öÖ]/g, 'o').replace(/[éÉ]/g, 'e').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim();
};

const MealCard = ({ meal, type, icon: Icon }: { meal: any, type: string, icon: any }) => {
  const { toggleFavorite, isFavorite } = useFavoriteRecipes();
  const typeColors: Record<string, string> = { breakfast: 'from-yellow-400 to-orange-500', lunch: 'from-emerald-400 to-teal-500', dinner: 'from-purple-400 to-pink-500', snack: 'from-blue-400 to-indigo-500' };
  const typeNames: Record<string, string> = { breakfast: 'Frukost', lunch: 'Lunch', dinner: 'Middag', snack: 'Mellanmål', dessert: 'Efterrätt' };
  const typeTimes: Record<string, string> = { breakfast: '07:00', lunch: '12:00', dinner: '18:00', snack: '15:00', dessert: '20:00' };
  const recipeLink = meal.recipeLink || `/kunskapsbank/recept/${generateRecipeSlug(meal.name)}`;
  const fav = { name: meal.name as string, recipeLink, courseType: 'hormone' as const, weekNumber: 1 as const, dayName: 'Dag', mealType: (type as 'breakfast'|'lunch'|'dinner'|'snack'|'dessert') };
  const active = isFavorite(fav);

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${typeColors[type]} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{typeNames[type]}</h4>
          <p className="text-xs sm:text-sm text-gray-500">{typeTimes[type]}</p>
        </div>
      </div>
      <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base break-words">{meal.name}</h5>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Link href={recipeLink} className="text-xs sm:text-sm text-primary hover:text-secondary font-medium truncate">Se recept →</Link>
        <div className="flex items-center gap-2 justify-end sm:ml-auto">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggleFavorite(fav)} className={`p-1 rounded-full transition-colors ${active ? 'bg-yellow-100' : 'hover:bg-gray-100'}`}>
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${active ? 'text-yellow-600' : 'text-gray-400 hover:text-red-500'}`} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-primary" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function KostschemaPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weekData, setWeekData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const w = params.get('week');
      if (w) setSelectedWeek(parseInt(w, 10));
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/meal-plans?course=hormone&week=${selectedWeek}`);
        const data = await res.json();
        setWeekData(data);
      } catch (e) {
        setWeekData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedWeek]);

  const weekDays = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="h-16 md:h-0" />
      <CourseNavigation courseType="hormone" currentWeek={selectedWeek} />
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Kostschema - Hormonell Balans</h1>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Printer className="w-5 h-5" />
                <span className="hidden sm:inline">Skriv ut</span>
              </button>
              <Link href={`/dashboard/courses/hormone/inkopslista?week=${selectedWeek}`} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Inköpslista</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-6">
          {[1,2,3,4,5,6].map((w) => (
            <button key={w} onClick={() => setSelectedWeek(w)} className={`px-3 py-1 text-xs rounded-full border ${selectedWeek===w ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}>Vecka {w}</button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div><p className="text-gray-600">Laddar...</p></div>
        ) : !weekData?.days ? (
          <div className="text-center py-12"><p className="text-gray-600">Inget kostschema för vecka {selectedWeek}</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {weekDays.map((dayName, idx) => {
              const meals = weekData.days[dayName];
              if (!meals) return null;
              return (
                <div key={dayName} className="bg-white rounded-xl border p-4 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{dayName} - Dag {(selectedWeek-1)*7+idx+1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.breakfast && <MealCard meal={meals.breakfast} type="breakfast" icon={Sun} />}
                    {meals.lunch && <MealCard meal={meals.lunch} type="lunch" icon={Coffee} />}
                    {meals.dinner && <MealCard meal={meals.dinner} type="dinner" icon={Moon} />}
                    {meals.snack && <MealCard meal={meals.snack} type="snack" icon={GiFruitBowl} />}
                    {meals.dessert && <MealCard meal={meals.dessert} type="dessert" icon={Star} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

