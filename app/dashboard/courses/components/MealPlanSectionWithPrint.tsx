'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { GiCookingPot, GiMeal, GiFruitBowl, GiWaterBottle } from 'react-icons/gi';
import PrintableMealPlan from './PrintableMealPlan';

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

interface MealPlanSectionProps {
  mealPlan: Record<string, DayMeals>;
  expandedDay: string | null;
  setExpandedDay: (day: string | null) => void;
  weekNumber?: number;
  courseName?: string;
}

export function MealPlanSectionWithPrint({ 
  mealPlan, 
  expandedDay, 
  setExpandedDay,
  weekNumber = 1,
  courseName = 'Functional Foods'
}: MealPlanSectionProps) {
  
  const mealIcons = {
    breakfast: { icon: GiCookingPot, color: 'text-orange-600', bg: 'bg-orange-100' },
    lunch: { icon: GiMeal, color: 'text-blue-600', bg: 'bg-blue-100' },
    dinner: { icon: GiFruitBowl, color: 'text-purple-600', bg: 'bg-purple-100' },
    snack: { icon: GiWaterBottle, color: 'text-primary', bg: 'bg-background-secondary' }
  };

  const formatMealName = (name: string) => {
    return name.replace(/^\d+\.\s*/, '');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Veckans måltidsplan</h2>
          <PrintableMealPlan 
            mealPlan={mealPlan} 
            weekNumber={weekNumber} 
            courseName={courseName} 
          />
        </div>
        
        <div className="space-y-4">
          {Object.entries(mealPlan).map(([day, meals]) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-gray-100 hover:to-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-white rounded-lg px-4 py-2">
                    <span className="font-bold text-lg">{day}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <GiCookingPot className="mr-1" />
                      Frukost
                    </span>
                    <span className="flex items-center">
                      <GiMeal className="mr-1" />
                      Lunch
                    </span>
                    <span className="flex items-center">
                      <GiFruitBowl className="mr-1" />
                      Middag
                    </span>
                    {meals.snack && (
                      <span className="flex items-center">
                        <GiWaterBottle className="mr-1" />
                        Mellanmål
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedDay === day ? 'rotate-90' : ''
                }`} />
              </button>

              {expandedDay === day && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-4 bg-white border-t border-gray-100"
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(meals).map(([mealType, meal]) => {
                      const icon = mealIcons[mealType as keyof typeof mealIcons];
                      return (
                        <div key={mealType} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className={`${icon.bg} rounded-full p-2 mr-2`}>
                              <icon.icon className={`w-5 h-5 ${icon.color}`} />
                            </div>
                            <h4 className="font-semibold text-gray-900 capitalize">{mealType}</h4>
                          </div>
                          {meal.recipeLink ? (
                            <Link 
                              href={meal.recipeLink}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              {formatMealName(meal.name)}
                              <ExternalLink className="ml-1 w-3 h-3" />
                            </Link>
                          ) : (
                            <p className="text-sm text-gray-700">{formatMealName(meal.name)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

