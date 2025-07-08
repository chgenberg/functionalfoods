'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiChevronLeft, FiChevronRight,
  FiSun, FiSunrise, FiSunset
} from 'react-icons/fi';
import { GiMeal, GiCookingPot, GiFruitBowl } from 'react-icons/gi';
import Link from 'next/link';

interface MealItem {
  name: string;
  recipeLink?: string;
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

interface CalendarViewProps {
  mealPlan: Record<string, DayMeals>;
  weekNumber: number;
}

export function CalendarView({ mealPlan, weekNumber }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<string>(Object.keys(mealPlan)[0]);
  const days = Object.keys(mealPlan);
  
  const dayIcons = {
    breakfast: { icon: FiSunrise, color: 'from-orange-400 to-yellow-500', time: '07:00' },
    lunch: { icon: FiSun, color: 'from-blue-400 to-cyan-500', time: '12:00' },
    dinner: { icon: FiSunset, color: 'from-purple-400 to-pink-500', time: '18:00' },
    snack: { icon: GiFruitBowl, color: 'from-green-400 to-teal-500', time: '15:00' }
  };

  const currentDayIndex = days.indexOf(selectedDay);

  const navigateDay = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentDayIndex - 1 + days.length) % days.length
      : (currentDayIndex + 1) % days.length;
    setSelectedDay(days[newIndex]);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FiCalendar className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Vecka {weekNumber} - Kostschema</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateDay('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Selector */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-3 px-2 rounded-xl font-medium transition-all ${
                selectedDay === day
                  ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <div className="text-xs opacity-90">{day.slice(0, 3)}</div>
              <div className="text-sm font-bold">{day.slice(0, 1)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Meals */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{selectedDay}</h3>
            
            <div className="grid gap-4">
              {Object.entries(mealPlan[selectedDay]).map(([mealType, meal]) => {
                const mealInfo = dayIcons[mealType as keyof typeof dayIcons];
                return (
                  <motion.div
                    key={mealType}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-2xl shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${mealInfo.color} opacity-10`} />
                    <div className="relative p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`bg-gradient-to-r ${mealInfo.color} p-3 rounded-xl text-white`}>
                          <mealInfo.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                            <FiClock className="w-4 h-4" />
                            <span>{mealInfo.time}</span>
                            <span className="capitalize font-medium">{mealType}</span>
                          </div>
                          {meal.recipeLink ? (
                            <Link 
                              href={meal.recipeLink}
                              className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                            >
                              {meal.name}
                            </Link>
                          ) : (
                            <p className="text-lg font-semibold text-gray-900">{meal.name}</p>
                          )}
                        </div>
                      </div>
                      {meal.recipeLink && (
                        <Link
                          href={meal.recipeLink}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Stats for the Day */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Måltider</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Object.keys(mealPlan[selectedDay]).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recept</p>
                  <p className="text-xl font-bold text-purple-600">
                    {Object.values(mealPlan[selectedDay]).filter(m => m.recipeLink).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rester</p>
                  <p className="text-xl font-bold text-green-600">
                    {Object.values(mealPlan[selectedDay]).filter(m => m.name.includes('Rester')).length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 