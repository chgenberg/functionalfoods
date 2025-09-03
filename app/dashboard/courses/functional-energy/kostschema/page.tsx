"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, Utensils, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEnergyWeekData } from '@/app/data/mealPlans';
import DayModal from '../../components/DayModal';

export default function FunctionalEnergyKostschemaPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const weekData = getEnergyWeekData(selectedWeek);

  const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

  const weekDescriptions = [
    "Introduktion till stabilt blodsocker - Denna vecka lägger vi grunden för din energiresa med recept som stabiliserar blodsockret.",
    "Blodsocker & energi - Nu fördjupar vi oss i sambandet mellan mat och energi med fokus på långsamma kolhydrater.",
    "Måltidsplanering för energi - Lär dig planera måltider som ger långvarig energi och håller dig mätt.",
    "Smarta kolhydrater - Denna vecka handlar om att välja rätt kolhydrater för stabil energi.",
    "Energistabila vanor - Nu bygger vi vanor som håller med strategier för att hantera utmaningar.",
    "Långsiktig hållbarhet - Sista veckan sammanfattar vi och planerar för din fortsatta energiresa."
  ];

  const weekColors = [
    "from-green-400 to-green-600",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-yellow-400 to-yellow-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600"
  ];

  const getMealIcon = (mealType: string) => {
    switch(mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/functional-energy/oversikt" className="text-gray-600 hover:text-[#014421]">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#014421]">Kostschema - Functional Energy</h1>
                <p className="text-sm text-gray-600">6 veckors måltidsplan för stabil energi</p>
              </div>
            </div>
            
            {/* Week selector for desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/dashboard/courses/functional-energy/inkopslista"
                className="bg-[#93C560] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7FBA3D] transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Inköpslistor
              </Link>
              <a 
                href="/api/courses/functional-energy/pdf"
                download
                className="bg-[#014421] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#116530] transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Ladda ner PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Välj vecka</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek === 1}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-[#014421]" />
              </button>
              <span className="px-4 py-2 bg-white rounded-lg shadow-md font-medium text-[#014421]">
                Vecka {selectedWeek}
              </span>
              <button
                onClick={() => setSelectedWeek(Math.min(6, selectedWeek + 1))}
                disabled={selectedWeek === 6}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-[#014421]" />
              </button>
            </div>
          </div>

          {/* Week Pills */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6].map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedWeek === week
                    ? 'bg-gradient-to-r text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md'
                } ${selectedWeek === week ? weekColors[week - 1] : ''}`}
              >
                Vecka {week}
              </button>
            ))}
          </div>

          {/* Week Description */}
          <div className="bg-gradient-to-r from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-[#014421] mb-2">
              {weekData?.title || `Vecka ${selectedWeek}`}
            </h3>
            <p className="text-gray-700">{weekDescriptions[selectedWeek - 1]}</p>
          </div>
        </div>

        {/* Meal Plan Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWeek}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6"
          >
            {weekData && Object.entries(weekData.days).map(([day, meals], index) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedDay(day)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#014421] flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-[#93C560]" />
                      {day}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      3 måltider
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Breakfast */}
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMealIcon('breakfast')}</span>
                        <h4 className="font-medium text-gray-700">Frukost</h4>
                      </div>
                      <p className="text-sm text-gray-600">{meals.breakfast.name}</p>
                    </div>

                    {/* Lunch */}
                    <div className="bg-orange-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMealIcon('lunch')}</span>
                        <h4 className="font-medium text-gray-700">Lunch</h4>
                      </div>
                      <p className="text-sm text-gray-600">{meals.lunch.name}</p>
                    </div>

                    {/* Dinner */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMealIcon('dinner')}</span>
                        <h4 className="font-medium text-gray-700">Middag</h4>
                      </div>
                      <p className="text-sm text-gray-600">{meals.dinner.name}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Action Buttons */}
        <div className="md:hidden mt-8 space-y-3">
          <Link 
            href="/dashboard/courses/functional-energy/inkopslista"
            className="w-full bg-[#93C560] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#7FBA3D] transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Visa inköpslistor
          </Link>
          <a 
            href="/api/courses/functional-energy/pdf"
            download
            className="w-full bg-[#014421] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#116530] transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Ladda ner komplett kurspaket (PDF)
          </a>
        </div>
      </div>

      {/* Day Modal */}
      {selectedDay && weekData && (
        <DayModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          weekNumber={selectedWeek}
          dayNumber={dayNames.indexOf(selectedDay) + 1}
          dayName={selectedDay}
          meals={[
            { 
              mealType: 'breakfast', 
              time: '07:00', 
              meal: weekData.days[selectedDay].breakfast.name, 
              calories: '400',
              recipeLink: weekData.days[selectedDay].breakfast.recipeLink 
            },
            { 
              mealType: 'lunch', 
              time: '12:00', 
              meal: weekData.days[selectedDay].lunch.name, 
              calories: '500',
              recipeLink: weekData.days[selectedDay].lunch.recipeLink 
            },
            { 
              mealType: 'dinner', 
              time: '18:00', 
              meal: weekData.days[selectedDay].dinner.name, 
              calories: '600',
              recipeLink: weekData.days[selectedDay].dinner.recipeLink 
            }
          ]}
          courseType="energy"
        />
      )}
    </main>
  );
} 