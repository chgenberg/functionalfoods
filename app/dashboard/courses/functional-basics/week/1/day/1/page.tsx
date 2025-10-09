'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { MdDinnerDining } from 'react-icons/md';
import { getWeekData } from '@/app/data/mealPlans';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Coffee, Heart, Lightbulb, Share2, ShoppingCart, Sun } from "lucide-react";;
import { useFavoriteRecipes } from '@/app/hooks/useFavoriteRecipes';

export default function Week1Day1Page() {
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toggleFavorite, isFavorite } = useFavoriteRecipes();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekData = getWeekData(1);
  const dayMeals = weekData?.days['Måndag'];
  
  const weekTitle = "Grunden i Functional Foods";
  const dayName = "Måndag";
  const dayDate = "12 augusti";
  
  const meals = [
    {
      type: 'breakfast',
      time: '07:00',
      icon: Sun,
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      meal: dayMeals?.breakfast
    },
    {
      type: 'lunch',
      time: '12:00',
      icon: Coffee,
      color: 'from-emerald-400 to-teal-400',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      meal: dayMeals?.lunch
    },
    {
      type: 'dinner',
      time: '18:00',
      icon: MdDinnerDining,
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      meal: dayMeals?.dinner
    }
  ];

  const toggleMealComplete = (mealType: string) => {
    setCompletedMeals(prev => 
      prev.includes(mealType) 
        ? prev.filter(m => m !== mealType)
        : [...prev, mealType]
    );
  };

  const completionPercentage = (completedMeals.length / meals.filter(m => m.meal).length) * 100;

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/functional-basics" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-sm text-gray-600">Vecka 1 - {weekTitle}</p>
                <h1 className="text-2xl font-bold text-[#014421]">{dayName}, {dayDate}</h1>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/courses/functional-basics/week/1/day/7" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-sm font-medium px-3">Dag 1 av 42</span>
              <Link href="/dashboard/courses/functional-basics/week/1/day/2" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Dagens framsteg</h2>
            <span className="text-3xl font-bold text-[#014421]">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#014421] to-[#112A12]"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completedMeals.length} av {meals.filter(m => m.meal).length} måltider genomförda
          </p>
        </motion.div>

        {/* Current Time Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#FFB5A7] rounded-2xl shadow-lg p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1">Aktuell tid</p>
              <p className="text-3xl font-bold">{currentTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <Clock className="w-12 h-12 text-white/80" />
          </div>
        </motion.div>

        {/* Meals */}
        <div className="space-y-6">
          {meals.map((mealData, index) => {
            if (!mealData.meal) return null;
            
            const isCompleted = completedMeals.includes(mealData.type);
            const Icon = mealData.icon;
            
            return (
              <motion.div
                key={mealData.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${mealData.bgColor} rounded-2xl shadow-lg p-6 relative overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mealData.color} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${mealData.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {mealData.type === 'breakfast' ? 'Frukost' : mealData.type === 'lunch' ? 'Lunch' : 'Middag'}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {mealData.time}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleMealComplete(mealData.type)}
                      className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-400'
                        }
                      `}
                    >
                      {isCompleted && <Check className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">{mealData.meal.name}</h4>
                    
                    {mealData.meal.recipeLink && (
                      <div className="flex items-center gap-4 mt-4">
                        <Link 
                          href={mealData.meal.recipeLink}
                          className="inline-flex items-center gap-2 text-[#014421] hover:text-[#112A12] font-medium transition-colors"
                        >
                          Se fullständigt recept →
                        </Link>
                        {(() => {
                          const favPayload = {
                            name: mealData.meal.name,
                            recipeLink: mealData.meal.recipeLink as string,
                            courseType: 'basics' as const,
                            weekNumber: 1 as const,
                            dayName: dayName,
                            mealType: (mealData.type as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert')
                          };
                          const active = isFavorite(favPayload);
                          return (
                            <button
                              onClick={() => toggleFavorite(favPayload)}
                              title={active ? 'Ta bort från favoriter' : 'Lägg till som favorit'}
                              className={`p-2 rounded-lg transition-colors ${active ? 'bg-yellow-100' : 'hover:bg-white/50'}`}
                            >
                              <Heart className={`w-5 h-5 ${active ? 'text-yellow-600' : 'text-gray-600'}`} />
                            </button>
                          );
                        })()}
                        
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Share2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
          >
            <Link href="/dashboard/courses/functional-basics/inkopslista?week=1&day=1" className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Dagens inköpslista</h3>
                <p className="text-gray-600 text-sm">Se alla ingredienser du behöver</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-[#014421]" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
          >
            <Link href="/dashboard/courses/functional-basics/kostschema?view=week&week=1" className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Veckans översikt</h3>
                <p className="text-gray-600 text-sm">Se hela veckans kostschema</p>
              </div>
              <Calendar className="w-8 h-8 text-[#014421]" />
            </Link>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-[#014421] to-[#112A12] rounded-2xl shadow-lg p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-3"><Lightbulb className="w-5 h-5 inline" /> Dagens tips</h3>
          <p className="text-white/90">
            Börja dagen med ett glas vatten för att kickstarta din ämnesomsättning. 
            Yoghurt med ketomüsli ger dig en perfekt balans av protein och hälsosamma fetter 
            för långvarig energi hela förmiddagen.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 