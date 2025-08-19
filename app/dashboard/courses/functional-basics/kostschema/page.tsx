'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiCalendar, FiClock, 
  FiStar, FiHeart, FiShoppingCart, FiDownload, FiPrinter,
  FiSun, FiCoffee, FiCheck, FiArrowLeft, FiSearch, FiFilter
} from 'react-icons/fi';
import { MdDinnerDining } from 'react-icons/md';
import { getMealForDay, getWeekData } from '@/app/data/mealPlans';
import Link from 'next/link';
import Image from 'next/image';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';

const MealCard = ({ meal, type, icon: Icon, time, day }: { meal: any, type: string, icon: any, time: string, day: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const typeColors: Record<string, { bg: string, text: string, accent: string }> = {
    breakfast: { bg: 'bg-gradient-to-br from-yellow-50 to-orange-50', text: 'text-orange-700', accent: 'bg-orange-400' },
    lunch: { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', text: 'text-teal-700', accent: 'bg-teal-400' },
    dinner: { bg: 'bg-gradient-to-br from-purple-50 to-pink-50', text: 'text-purple-700', accent: 'bg-purple-400' }
  };

  const typeNames: Record<string, string> = {
    breakfast: 'Frukost',
    lunch: 'Lunch',
    dinner: 'Middag'
  };

  if (!meal?.name) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative p-6 rounded-2xl shadow-lg transition-all cursor-pointer
        ${typeColors[type]?.bg || 'bg-white'}
        ${isCompleted ? 'opacity-70' : ''}
      `}
    >
      {/* Time badge */}
      <div className={`absolute -top-3 -right-3 ${typeColors[type]?.accent} text-white text-xs px-3 py-1 rounded-full shadow-md`}>
        {time}
      </div>

      {/* Complete checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsCompleted(!isCompleted);
        }}
        className={`
          absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
          ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}
        `}
      >
        {isCompleted && <FiCheck className="w-4 h-4 text-white" />}
      </button>

      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full ${typeColors[type]?.accent} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${typeColors[type]?.text}`} />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-semibold text-lg mb-1 ${typeColors[type]?.text}`}>
            {typeNames[type]}
          </h4>
          <p className="text-gray-700 font-medium mb-2">{meal.name}</p>
          
          {meal.recipeLink && (
            <Link 
              href={meal.recipeLink}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-[#014421] hover:text-[#112A12] font-medium transition-colors"
            >
              Se recept
              <motion.span
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </Link>
          )}
        </div>
      </div>

      {/* Hover effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 rounded-2xl ring-2 ring-[#014421] ring-opacity-20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function KostschemaPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');

  useEffect(() => {
    // Get view and week from URL without useSearchParams
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as 'week' | 'month' | 'day' || 'week';
      const week = parseInt(params.get('week') || '1');
      setViewMode(view);
      setCurrentWeek(week);
    }
  }, []);

  const weekData = getWeekData(currentWeek);
  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

  const weekTitles = [
    'Grunden i Functional Foods',
    'Proteiner & aminosyror',
    'Fetter & kolhydrater',
    'Vitaminer & mineraler',
    'Antioxidanter & fytokemikalier',
    'Att komma igång'
  ];

  const getMealIcon = (type: string) => {
    switch(type) {
      case 'breakfast': return FiSun;
      case 'lunch': return FiCoffee;
      case 'dinner': return MdDinnerDining;
      default: return FiSun;
    }
  };

  const getMealTime = (type: string) => {
    switch(type) {
      case 'breakfast': return '07:00';
      case 'lunch': return '12:00';
      case 'dinner': return '18:00';
      default: return '15:00';
    }
  };

  const filterMeals = (meals: any) => {
    if (filterType === 'all') return meals;
    return {
      ...meals,
      [filterType]: meals[filterType]
    };
  };

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Course Navigation */}
      <CourseNavigation courseType="basics" currentWeek={currentWeek} />

      {/* Main Content */}
              <div>
                <h1 className="text-2xl font-bold text-[#014421]">Kostschema</h1>
                <p className="text-sm text-gray-600">Vecka {currentWeek} - {weekTitles[currentWeek - 1]}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök recept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
              >
                <option value="all">Alla måltider</option>
                <option value="breakfast">Frukost</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Middag</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`
                  py-4 px-2 border-b-2 font-medium transition-all
                  ${viewMode === mode 
                    ? 'border-[#014421] text-[#014421]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {mode === 'day' ? 'Dag' : mode === 'week' ? 'Vecka' : 'Månad'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((week) => (
              <button
                key={week}
                onClick={() => setCurrentWeek(week)}
                className={`
                  px-4 py-2 rounded-full font-medium transition-all
                  ${currentWeek === week 
                    ? 'bg-[#014421] text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                V{week}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentWeek(Math.min(6, currentWeek + 1))}
            disabled={currentWeek === 6}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'week' && weekData && (
          <div className="space-y-8">
            {days.map((day, index) => {
              const dayMeals = weekData.days[day];
              if (!dayMeals) return null;

              const filteredMeals = filterMeals(dayMeals);
              const hasMatchingMeals = Object.entries(filteredMeals).some(([_, meal]: [string, any]) => 
                meal?.name && meal.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && !hasMatchingMeals) return null;

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#014421]">{day}</h3>
                    <Link 
                      href={`/dashboard/courses/functional-basics/inkopslista?week=${currentWeek}&day=${index + 1}`}
                      className="flex items-center gap-2 text-sm text-[#014421] hover:text-[#112A12] font-medium"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Inköpslista
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                      const meal = filteredMeals[mealType];
                      if (!meal || (searchQuery && !meal.name?.toLowerCase().includes(searchQuery.toLowerCase()))) {
                        return null;
                      }
                      return (
                        <MealCard
                          key={mealType}
                          meal={meal}
                          type={mealType}
                          icon={getMealIcon(mealType)}
                          time={getMealTime(mealType)}
                          day={day}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {viewMode === 'day' && (
          <div className="space-y-8">
            <div className="flex gap-2 justify-center mb-8">
              {days.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index + 1)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${selectedDay === index + 1 
                      ? 'bg-[#014421] text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {weekData && weekData.days[days[selectedDay - 1]] && (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-[#014421] mb-8 text-center">
                  {days[selectedDay - 1]}
                </h2>
                
                <div className="space-y-6">
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                    const dayMeals = weekData.days[days[selectedDay - 1]];
                    const meal = dayMeals ? dayMeals[mealType as 'breakfast' | 'lunch' | 'dinner'] : null;
                    if (!meal) return null;
                    
                    return (
                      <MealCard
                        key={mealType}
                        meal={meal}
                        type={mealType}
                        icon={getMealIcon(mealType)}
                        time={getMealTime(mealType)}
                        day={days[selectedDay - 1]}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#FFB5A7] to-[#FCD5CE] rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <Link href={`/dashboard/courses/functional-basics/inkopslista?week=${currentWeek}`}>
              <FiShoppingCart className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Veckans inköpslista</h3>
              <p className="text-white/90 text-sm">Få alla ingredienser för vecka {currentWeek}</p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#014421] to-[#112A12] rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <FiDownload className="w-8 h-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Ladda ner schema</h3>
            <p className="text-white/90 text-sm">Spara som PDF för offline</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <FiHeart className="w-8 h-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Mina favoriter</h3>
            <p className="text-white/90 text-sm">Se dina sparade recept</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 