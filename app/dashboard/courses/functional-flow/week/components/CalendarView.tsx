'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Moon, Nut, Sun } from "lucide-react";;

interface MealItem {
  name: string;
  recipeLink?: string;
  note?: string;
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
  dessert?: MealItem;
}

interface CalendarViewProps {
  mealPlan: Record<string, DayMeals>;
  weekNumber: number;
}

const weekDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

export function CalendarView({ mealPlan, weekNumber }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [miniChecklist, setMiniChecklist] = useState<Record<string, boolean>>(()=>{
    try { return JSON.parse(localStorage.getItem(`miniChecklist_flow_week_${weekNumber}`) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    // Calculate which day of the week it is (0 = Monday, 6 = Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert Sunday (0) to 6, and shift other days back by 1
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Calculate which week we're in and which day
    const courseStartDate = new Date('2025-01-06'); // Adjust this to actual course start
    const daysSinceStart = Math.floor((today.getTime() - courseStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(daysSinceStart / 7) + 1;
    
    if (currentWeek === weekNumber) {
      setCurrentDayIndex(adjustedDay);
      setSelectedDay(adjustedDay);
    } else if (currentWeek > weekNumber) {
      // Past week - all days are completed
      setCurrentDayIndex(7);
    } else {
      // Future week - no days are completed
      setCurrentDayIndex(-1);
    }
  }, [weekNumber]);

  useEffect(()=>{
    try { localStorage.setItem(`miniChecklist_flow_week_${weekNumber}`, JSON.stringify(miniChecklist)); } catch {}
  }, [miniChecklist, weekNumber]);

  const defaultTasks = [
    { id: 'prep', label: 'Prepp: fermenterat & fiber' },
    { id: 'move', label: '40 min rörelse idag' },
    { id: 'sleep', label: 'Sömnoptimering i kväll' },
    { id: 'goal', label: 'Veckans mål uppdaterade' }
  ];

  const getDayStatus = (dayIndex: number) => {
    if (dayIndex < currentDayIndex) return 'completed';
    if (dayIndex === currentDayIndex) return 'current';
    return 'upcoming';
  };

  const currentDayMeals = mealPlan[weekDays[selectedDay]];

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">Vecka {weekNumber}</div>
          <button onClick={() => setSelectedDay(currentDayIndex >= 0 ? currentDayIndex : 0)} className="px-3 py-1.5 rounded-full bg-primary text-white text-sm hover:bg-secondary">Idag</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <div className="text-sm font-semibold text-gray-800 mb-2">Dagens fokus</div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
          {defaultTasks.map(t => (
            <label key={t.id} className="flex items-center gap-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={!!miniChecklist[t.id]} onChange={() => setMiniChecklist(prev=>({ ...prev, [t.id]: !prev[t.id] }))} className="accent-[#93C560]" />
              <span className={miniChecklist[t.id] ? 'line-through text-gray-500' : 'text-gray-800'}>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Vecka {weekNumber} - Kostschema</h3>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDays.map((day, index) => {
            const status = getDayStatus(index);
            return (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-4 rounded-xl transition-all duration-300 ${
                  selectedDay === index
                    ? 'bg-primary text-white shadow-lg transform scale-105'
                    : status === 'completed'
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    : status === 'current'
                    ? 'bg-background-secondary text-secondary hover:bg-green-200 ring-2 ring-green-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="text-xs font-medium opacity-80 mb-1">
                  {day.slice(0, 3).toUpperCase()}
                </div>
                <div className="text-lg font-bold">
                  {index + 1}
                </div>
                {status === 'completed' && (
                  <Check className="absolute top-1 right-1 w-4 h-4" />
                )}
                {status === 'current' && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 rounded" />
            <span className="text-gray-600">Genomförd</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-background-secondary rounded ring-2 ring-green-500" />
            <span className="text-gray-600">Idag</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <span className="text-gray-600">Kommande</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded" />
            <span className="text-gray-600">Vald dag</span>
          </div>
        </div>
      </div>

      {/* Selected Day Meals */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h4 className="text-xl font-bold text-gray-900 mb-6">
          {weekDays[selectedDay]}s måltider
        </h4>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Breakfast */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-8 h-8 inline text-accent" />
              <h5 className="font-semibold text-gray-900">Frukost</h5>
              <Clock className="w-4 h-4 text-gray-500 ml-auto" />
              <span className="text-sm text-gray-500">07:00</span>
            </div>
            <p className="text-gray-700 mb-3">{currentDayMeals.breakfast.name}</p>
            {currentDayMeals.breakfast.recipeLink && (
              <a 
                href={currentDayMeals.breakfast.recipeLink}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Se recept →
              </a>
            )}
          </div>

          {/* Lunch */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
                              <Sun className="w-5 h-5 inline text-accent" />
              <h5 className="font-semibold text-gray-900">Lunch</h5>
              <Clock className="w-4 h-4 text-gray-500 ml-auto" />
              <span className="text-sm text-gray-500">12:00</span>
            </div>
            <p className="text-gray-700 mb-3">{currentDayMeals.lunch.name}</p>
            {currentDayMeals.lunch.note && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {currentDayMeals.lunch.note}
              </span>
            )}
            {currentDayMeals.lunch.recipeLink && (
              <a 
                href={currentDayMeals.lunch.recipeLink}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium block mt-2"
              >
                Se recept →
              </a>
            )}
          </div>

          {/* Dinner */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-8 h-8 inline text-accent" />
              <h5 className="font-semibold text-gray-900">Middag</h5>
              <Clock className="w-4 h-4 text-gray-500 ml-auto" />
              <span className="text-sm text-gray-500">18:00</span>
            </div>
            <p className="text-gray-700 mb-3">{currentDayMeals.dinner.name}</p>
            {currentDayMeals.dinner.note && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {currentDayMeals.dinner.note}
              </span>
            )}
            {currentDayMeals.dinner.recipeLink && (
              <a 
                href={currentDayMeals.dinner.recipeLink}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium block mt-2"
              >
                Se recept →
              </a>
            )}
          </div>
        </div>

        {/* Snack/Dessert if exists */}
        {(currentDayMeals.snack || currentDayMeals.dessert) && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {currentDayMeals.snack && (
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Nut className="w-8 h-8 inline text-accent" />
                  <h5 className="font-semibold text-gray-900">Mellanmål</h5>
                </div>
                <p className="text-gray-700">{currentDayMeals.snack.name}</p>
                {currentDayMeals.snack.recipeLink && (
                  <a 
                    href={currentDayMeals.snack.recipeLink}
                    className="text-sm text-primary hover:text-secondary font-medium block mt-2"
                  >
                    Se recept →
                  </a>
                )}
              </div>
            )}
            
            {currentDayMeals.dessert && (
              <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🍰</span>
                  <h5 className="font-semibold text-gray-900">Efterrätt</h5>
                </div>
                <p className="text-gray-700">{currentDayMeals.dessert.name}</p>
                {currentDayMeals.dessert.recipeLink && (
                  <a 
                    href={currentDayMeals.dessert.recipeLink}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium block mt-2"
                  >
                    Se recept →
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
} 