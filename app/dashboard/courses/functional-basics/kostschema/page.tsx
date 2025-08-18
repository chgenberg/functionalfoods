'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiCalendar, FiClock, 
  FiStar, FiHeart, FiShoppingCart, FiDownload, FiPrinter,
  FiSun, FiMoon, FiCoffee, FiCheck, FiPlus
} from 'react-icons/fi';
import { GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal } from 'react-icons/gi';
import { getMealForDay, getWeekData } from '@/app/data/mealPlans';
import Link from 'next/link';
// no next/navigation hooks to avoid suspense in export

// Helper function to generate recipe slug from name
const generateRecipeSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[åäÅÄ]/g, 'a')
    .replace(/[öÖ]/g, 'o')
    .replace(/[éÉ]/g, 'e')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim();
};

const MealCard = ({ meal, type, icon: Icon }: { meal: any, type: string, icon: any }) => {
  const typeColors: Record<string, string> = {
    breakfast: 'from-yellow-400 to-orange-500',
    lunch: 'from-emerald-400 to-teal-500',
    dinner: 'from-purple-400 to-pink-500',
    snack: 'from-blue-400 to-indigo-500'
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

  // Generate recipe link from meal name if not provided
  const recipeLink = meal.recipeLink || `/kunskapsbank/recept/${generateRecipeSlug(meal.name)}`;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-200"
    >
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
      {meal.note && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2 break-words">
          {meal.note}
        </span>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Link 
          href={recipeLink}
          className="text-xs sm:text-sm text-primary hover:text-secondary font-medium truncate"
        >
          Se recept →
        </Link>
        <div className="flex items-center gap-2 justify-end sm:ml-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiHeart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-primary" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const CalendarDay = ({ day, date, isToday, isSelected, onClick, hasMealPlan, dayNumber, isCurrentWeek }: any) => {
  const weekNumber = Math.ceil(dayNumber / 7);
  const weekColors = [
    'bg-purple-500', 'bg-blue-500', 'bg-primary', 
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
          ? 'border-primary bg-background text-secondary shadow-md' 
          : isSelected 
            ? 'border-primary bg-primary text-white shadow-lg' 
            : hasMealPlan
              ? isCurrentWeek
                ? 'border-border bg-background text-gray-900 hover:border-primary'
                : 'border-gray-200 bg-white text-gray-900 hover:border-border hover:bg-background'
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
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
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
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedWeek, setSelectedWeek] = useState(Math.ceil(selectedDay / 7));
  const [apiWeekPlan, setApiWeekPlan] = useState<any | null>(null);
  // no searchParams hook

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

  useEffect(() => {
    if (!courseStartDate) return;
    const today = new Date();
    const dayNumber = getCurrentDayOfCourse(today);
    setSelectedDay(dayNumber);
    setSelectedWeek(Math.ceil(dayNumber / 7));
    setSelectedDate(today);
  }, [courseStartDate]);

  // Läs query-parametrar (?view=week&week=N) via window (CSR only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const weekParam = params.get('week');
    if (view === 'week') setViewMode('week');
    if (weekParam) {
      const w = parseInt(weekParam, 10);
      if (!isNaN(w) && w >= 1 && w <= 6) {
        setSelectedWeek(w);
        setSelectedDay((w - 1) * 7 + 1);
      }
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'week') return;
    const controller = new AbortController();
    const loadWeek = async () => {
      try {
        const res = await fetch(`/api/courses/functional-basics/week/${selectedWeek}/meal-plan`, { signal: controller.signal });
        if (res.ok) {
          const json = await res.json();
          setApiWeekPlan(json.plan || null);
        } else {
          setApiWeekPlan(null);
        }
      } catch {
        setApiWeekPlan(null);
      }
    };
    loadWeek();
    return () => controller.abort();
  }, [viewMode, selectedWeek]);

  // Visa loading state medan vi hämtar kursstartdatum
  if (loading || !courseStartDate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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

  const currentTotalCalories = calculateTotalCalories();
  const currentMealCount = countMeals();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Mitt Kostschema
            </h1>
            <Link
              href="/dashboard/courses/functional-basics/inkopslista"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-all duration-200 shadow-sm"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Visa Inköpslistor</span>
            </Link>
          </div>
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronLeft />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-lg">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                  const dayNumber = getCurrentDayOfCourse(today);
                  setSelectedDay(dayNumber);
                  setSelectedDate(today);
                }}
                className="px-3 py-1 text-xs rounded-full border hover:bg-gray-50"
              >
                Idag
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-xs rounded-full border ${viewMode==='month' ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}
              >
                Månad
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-xs rounded-full border ${viewMode==='week' ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}
              >
                Vecka
              </button>
            </div>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Month or Week */}
          {viewMode === 'month' ? (
            <>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 my-4">
                {dayNames.map(name => (
                  <div key={name} className="text-center text-xs font-medium text-gray-500">{name}</div>
                ))}
                {days.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const today = new Date();
                  const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
                  const dayNumber = isDateInCourse(day) ? getCurrentDayOfCourse(day) + 1 : 0;
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

                  return (
                    <CalendarDay
                      key={index}
                      day={day.toLocaleDateString('sv-SE', { weekday: 'short' })}
                      date={day.getDate()}
                      isToday={isToday}
                      isSelected={isSelected}
                      onClick={() => {
                        if (isDateInCourse(day)) {
                          setSelectedDate(day);
                          setSelectedDay(dayNumber);
                          setSelectedWeek(Math.ceil(dayNumber / 7));
                        }
                      }}
                      hasMealPlan={isDateInCourse(day)}
                      dayNumber={dayNumber}
                      isCurrentWeek={isCurrentMonth}
                    />
                  );
                })}
              </div>

              {/* Day Detail */}
              <div className="mt-8">
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {currentDayMeals ? (
                      <>
                        {currentDayMeals.breakfast && <MealCard meal={currentDayMeals.breakfast} type="breakfast" icon={FiSun} />}
                        {currentDayMeals.lunch && <MealCard meal={currentDayMeals.lunch} type="lunch" icon={FiCoffee} />}
                        {currentDayMeals.dinner && <MealCard meal={currentDayMeals.dinner} type="dinner" icon={FiMoon} />}
                        {currentDayMeals.snack && <MealCard meal={currentDayMeals.snack} type="snack" icon={GiFruitBowl} />}
                        {currentDayMeals.dessert && <MealCard meal={currentDayMeals.dessert} type="dessert" icon={FiStar} />}
                      </>
                    ) : (
                      <p>Inget kostschema för denna dag.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            <>
              {/* Week Selector */}
              <div className="flex items-center gap-2 flex-wrap my-4">
                {[1, 2, 3, 4, 5, 6].map((week) => (
                  <button
                    key={week}
                    onClick={() => {
                      setSelectedWeek(week);
                      setSelectedDay((week - 1) * 7 + 1);
                    }}
                    className={`px-3 py-1 text-xs rounded-full border ${selectedWeek === week ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'}`}
                  >
                    Vecka {week}
                  </button>
                ))}
                <Link
                  href={`/dashboard/courses/functional-basics/inkopslista?week=${selectedWeek}`}
                  className="ml-auto flex items-center gap-2 px-3 py-1 text-xs rounded-full border hover:bg-gray-50"
                >
                  <FiShoppingCart className="w-4 h-4" /> Inköpslista v{selectedWeek}
                </Link>
              </div>

              {/* Weekly Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const weekData = apiWeekPlan || getWeekData(selectedWeek);
                  const weekMeals = (weekData?.days as any) || {};
                  const weekDays = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
                  return weekDays.map((name, idx) => {
                    const meals = weekMeals[name];
                    const absoluteDay = (selectedWeek - 1) * 7 + idx + 1;
                    const isActive = selectedDay === absoluteDay;
                    return (
                      <button
                        key={name}
                        onClick={() => setSelectedDay(absoluteDay)}
                        className={`text-left bg-white rounded-xl border p-4 hover:shadow-sm transition ${isActive ? 'border-primary' : 'border-gray-100'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800">{name}</span>
                          <span className="text-xs text-gray-500">Dag {absoluteDay}</span>
                        </div>
                        {meals ? (
                          <div className="flex flex-col gap-2 text-sm text-gray-700">
                            {meals.breakfast && <div className="truncate"><span className="text-gray-500">Frukost: </span>{meals.breakfast.name}</div>}
                            {meals.lunch && <div className="truncate"><span className="text-gray-500">Lunch: </span>{meals.lunch.name}</div>}
                            {meals.dinner && <div className="truncate"><span className="text-gray-500">Middag: </span>{meals.dinner.name}</div>}
                            {meals.snack && <div className="truncate"><span className="text-gray-500">Mellanmål: </span>{meals.snack.name}</div>}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Ingen plan för denna dag</div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Day Detail */}
              <div className="mt-8">
                <motion.div
                  key={`week-${selectedWeek}-day-${selectedDay}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {currentDayMeals ? (
                      <>
                        {currentDayMeals.breakfast && <MealCard meal={currentDayMeals.breakfast} type="breakfast" icon={FiSun} />}
                        {currentDayMeals.lunch && <MealCard meal={currentDayMeals.lunch} type="lunch" icon={FiCoffee} />}
                        {currentDayMeals.dinner && <MealCard meal={currentDayMeals.dinner} type="dinner" icon={FiMoon} />}
                        {currentDayMeals.snack && <MealCard meal={currentDayMeals.snack} type="snack" icon={GiFruitBowl} />}
                        {currentDayMeals.dessert && <MealCard meal={currentDayMeals.dessert} type="dessert" icon={FiStar} />}
                      </>
                    ) : (
                      <p>Inget kostschema för denna dag.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
    </div>
  );
} 