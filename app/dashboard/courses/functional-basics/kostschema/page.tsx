'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiCalendar, FiClock, 
  FiStar, FiHeart, FiShoppingCart, FiDownload, FiPrinter,
  FiSun, FiMoon, FiCoffee, FiCheck, FiPlus
} from 'react-icons/fi';
import { GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal } from 'react-icons/gi';
import { getMealForDay, getWeekData } from '@/app/data/mealPlans';

const MealCard = ({ meal, type, icon: Icon }: { meal: any, type: string, icon: any }) => {
  const typeColors: Record<string, string> = {
    breakfast: 'from-yellow-400 to-orange-500',
    lunch: 'from-green-400 to-teal-500',
    dinner: 'from-blue-400 to-purple-500',
    snack: 'from-pink-400 to-rose-500',
    dessert: 'from-purple-400 to-pink-500'
  };

  const typeNames: Record<string, string> = {
    breakfast: 'Frukost',
    lunch: 'Lunch',
    dinner: 'Middag',
    snack: 'Mellanmål',
    dessert: 'Efterrätt'
  };

  const typeTimes: Record<string, string> = {
    breakfast: '07:00',
    lunch: '12:00',
    dinner: '18:00',
    snack: '15:00',
    dessert: '20:00'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${typeColors[type]} rounded-full flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{typeNames[type]}</h4>
          <p className="text-sm text-gray-500">{typeTimes[type]}</p>
        </div>
      </div>
      
      <h5 className="font-medium text-gray-900 mb-2">{meal.name}</h5>
      {meal.note && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
          {meal.note}
        </span>
      )}
      
      <div className="flex items-center justify-between">
        {meal.recipeLink && (
          <a 
            href={meal.recipeLink}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Se recept →
          </a>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiHeart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiShoppingCart className="w-4 h-4 text-gray-400 hover:text-green-500" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const CalendarDay = ({ day, date, isToday, isSelected, onClick, hasMealPlan, dayNumber, isCurrentWeek }: any) => {
  const weekNumber = Math.ceil(dayNumber / 7);
  const weekColors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'
  ];
  
  return (
    <motion.button
      whileHover={{ scale: hasMealPlan ? 1.05 : 1 }}
      whileTap={{ scale: hasMealPlan ? 0.95 : 1 }}
      onClick={onClick}
      className={`
        relative w-full h-12 sm:h-14 rounded-lg border-2 transition-all duration-200 text-sm font-medium
        ${isToday 
          ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
          : isSelected 
            ? 'border-green-600 bg-green-600 text-white shadow-lg' 
            : hasMealPlan
              ? isCurrentWeek
                ? 'border-green-300 bg-green-50 text-gray-900 hover:border-green-400'
                : 'border-gray-200 bg-white text-gray-900 hover:border-green-300 hover:bg-green-50'
              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
        }
      `}
      disabled={!hasMealPlan}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-xs opacity-70">{day}</span>
        <span className={isSelected ? 'font-bold' : ''}>{date}</span>
      </div>
      {hasMealPlan && (
        <div className={`absolute -top-1 -right-1 w-5 h-5 ${weekColors[(weekNumber - 1) % 6]} rounded-full flex items-center justify-center shadow-sm`}>
          <span className="text-xs text-white font-bold">{dayNumber}</span>
        </div>
      )}
      {isToday && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
      )}
    </motion.button>
  );
};

export default function KostschemaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(1);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Hämta användarens kursstartdatum
  useEffect(() => {
    const fetchCourseStartDate = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Fallback till dagens datum om ingen token
          const today = new Date();
          setCourseStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/course-start-date', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCourseStartDate(new Date(data.courseStartDate));
        } else {
          // Fallback till dagens datum om API-anrop misslyckas
          const today = new Date();
          setCourseStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        }
      } catch (error) {
        console.error('Error fetching course start date:', error);
        // Fallback till dagens datum
        const today = new Date();
        setCourseStartDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStartDate();
  }, []);

  // Visa loading state medan vi hämtar kursstartdatum
  if (loading || !courseStartDate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar kostschema...</p>
        </div>
      </div>
    );
  }

  const courseEndDate = new Date(courseStartDate);
  courseEndDate.setDate(courseEndDate.getDate() + 42); // 6 veckor

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isDateInCourse = (date: Date) => {
    return date >= courseStartDate && date <= courseEndDate;
  };

  const getCurrentDayOfCourse = (date: Date) => {
    const diffTime = date.getTime() - courseStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(diffDays, 42));
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

  // Get current day's meals from centralized data
  const currentDayMeals = getMealForDay(selectedDay);
  const currentWeekNumber = Math.ceil(selectedDay / 7);
  const currentWeekData = getWeekData(currentWeekNumber);

  // Calculate meal totals
  const calculateTotalCalories = () => {
    if (!currentDayMeals) return 0;
    let total = 0;
    // These are approximate values - you can adjust them
    if (currentDayMeals.breakfast) total += 380;
    if (currentDayMeals.lunch) total += 520;
    if (currentDayMeals.dinner) total += 580;
    if (currentDayMeals.snack) total += 200;
    if (currentDayMeals.dessert) total += 250;
    return total;
  };

  const countMeals = () => {
    if (!currentDayMeals) return 0;
    let count = 0;
    if (currentDayMeals.breakfast) count++;
    if (currentDayMeals.lunch) count++;
    if (currentDayMeals.dinner) count++;
    if (currentDayMeals.snack) count++;
    if (currentDayMeals.dessert) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-700 p-6 md:p-8 text-white shadow-xl mb-6 md:mb-8"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Kostschema</h1>
                <p className="text-green-100 text-base md:text-lg">
                  Din personliga måltidsplanering för Functional Basics
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <span className="font-semibold">6 veckor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GiMeal className="w-5 h-5" />
                    <span className="font-semibold">168 måltider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GiHealthNormal className="w-5 h-5" />
                    <span className="font-semibold">Functional Foods</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Ladda ner</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200 font-semibold"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Inköpslista</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Kalender */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              {/* Kalender header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Veckodagar */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Kalenderdagar */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isInCourse = isDateInCourse(day);
                  const dayOfCourse = getCurrentDayOfCourse(day);
                  const isCurrentWeek = dayOfCourse && Math.ceil(dayOfCourse / 7) === currentWeekNumber;
                  
                  return (
                    <CalendarDay
                      key={index}
                      day={dayNames[day.getDay()]}
                      date={day.getDate()}
                      isToday={isToday}
                      isSelected={isSelected}
                      hasMealPlan={isInCourse}
                      dayNumber={isInCourse ? dayOfCourse : null}
                      isCurrentWeek={isCurrentWeek}
                      onClick={() => {
                        if (isInCourse) {
                          setSelectedDate(day);
                          setSelectedDay(dayOfCourse);
                        }
                      }}
                    />
                  );
                })}
              </div>

              {/* Kursinfo */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Kursinformation</span>
                </div>
                <p className="text-sm text-green-700">
                  Kursen pågår i 6 veckor med dagliga måltidsförslag. Klicka på en dag för att se dagens kostschema.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Dag {selectedDay} av 42
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {currentWeekData?.title || `Vecka ${currentWeekNumber}`}
                  </span>
                </div>
                
                {/* Snabbnavigering veckor */}
                <div className="mt-4 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700 mb-2 font-medium">Snabbnavigering:</p>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3, 4, 5, 6].map((week) => (
                      <motion.button
                        key={week}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const firstDayOfWeek = (week - 1) * 7 + 1;
                          setSelectedDay(firstDayOfWeek);
                          const newDate = new Date(courseStartDate);
                          newDate.setDate(newDate.getDate() + firstDayOfWeek - 1);
                          setSelectedDate(newDate);
                          
                          // Uppdatera kalendermånaden om nödvändigt
                          if (newDate.getMonth() !== currentMonth.getMonth() || 
                              newDate.getFullYear() !== currentMonth.getFullYear()) {
                            setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
                          }
                        }}
                        className={`text-xs px-2 py-1.5 rounded-lg transition-all ${
                          currentWeekNumber === week
                            ? 'bg-green-600 text-white font-semibold'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        V{week}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dagens måltider */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Dag {selectedDay}
                </h3>
                <span className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString('sv-SE', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              {currentDayMeals ? (
                <div className="space-y-4">
                  <MealCard 
                    meal={currentDayMeals.breakfast} 
                    type="breakfast" 
                    icon={FiSun} 
                  />
                  <MealCard 
                    meal={currentDayMeals.lunch} 
                    type="lunch" 
                    icon={FiCoffee} 
                  />
                  <MealCard 
                    meal={currentDayMeals.dinner} 
                    type="dinner" 
                    icon={FiMoon} 
                  />
                  {currentDayMeals.snack && (
                    <MealCard 
                      meal={currentDayMeals.snack} 
                      type="snack" 
                      icon={FiStar} 
                    />
                  )}
                  {currentDayMeals.dessert && (
                    <MealCard 
                      meal={currentDayMeals.dessert} 
                      type="dessert" 
                      icon={GiFruitBowl} 
                    />
                  )}

                  {/* Dagens totaler */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Dagens totaler</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Kalorier:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          {calculateTotalCalories()} kcal
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Måltider:</span>
                        <span className="font-medium text-gray-900 ml-2">{countMeals()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GiMeal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Inget kostschema tillgängligt
                  </h4>
                  <p className="text-gray-600">
                    Välj en dag inom kursperioden för att se måltidsförslag.
                  </p>
                </div>
              )}
            </div>

            {/* Veckoöversikt */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {currentWeekData?.title || `Vecka ${currentWeekNumber}`}
              </h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((dayInWeek) => {
                  const absoluteDay = ((currentWeekNumber - 1) * 7) + dayInWeek;
                  const dayMeals = getMealForDay(absoluteDay);
                  
                  return (
                    <motion.button
                      key={dayInWeek}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDay(absoluteDay);
                        // Update selected date to match the day
                        const newDate = new Date(courseStartDate);
                        newDate.setDate(newDate.getDate() + absoluteDay - 1);
                        setSelectedDate(newDate);
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedDay === absoluteDay 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Dag {absoluteDay}</span>
                        {selectedDay === absoluteDay && (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {dayMeals?.breakfast.name || 'Måltid saknas'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 