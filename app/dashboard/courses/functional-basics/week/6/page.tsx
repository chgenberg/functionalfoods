'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiShoppingCart, FiBook, FiTarget,
  FiChevronRight, FiClock, FiUsers, FiCheckCircle, FiDownload,
  FiStar, FiHeart, FiAward, FiTrendingUp, FiSun, FiLock
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal,
  GiWheat, GiMeat, GiWaterBottle
} from 'react-icons/gi';
import { FaLeaf } from 'react-icons/fa';
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';
import { getWeekData } from '@/app/data/mealPlans';

import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

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
}

export default function Week6Page() {
  const [activeTab, setActiveTab] = useState('overview');

  const [currentWeek, setCurrentWeek] = useState(6);
  const [currentDay, setCurrentDay] = useState(1);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const calculatedDay = Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      setCurrentDay(calculatedDay);
    } else {
      const today = new Date();
      localStorage.setItem('basicsStartDate', today.toISOString());
      setCourseStartDate(today);
    }
  }, []);

  const getDaysForWeek = (weekNumber: number) => {
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    return dayNames.map((name, index) => {
      const dayNumber = index + 1;
      const totalDayNumber = (weekNumber - 1) * 7 + dayNumber;
      const currentTotalDay = (currentWeek - 1) * 7 + currentDay;
      return {
        day: dayNumber,
        name,
        completed: totalDayNumber < currentTotalDay,
        current: weekNumber === currentWeek && dayNumber === currentDay,
        locked: totalDayNumber > currentTotalDay
      };
    });
  };

  const formatDate = (weekNumber: number, dayNumber: number) => {
    if (!courseStartDate) return '';
    const date = new Date(courseStartDate);
    date.setDate(date.getDate() + (weekNumber - 1) * 7 + (dayNumber - 1));
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-[#da695c] to-[#da695c]' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-[#da695c] to-[#da695c]' }
  ];

  // Hämta centraliserad måltidsdata för vecka 6
  const weekData = getWeekData(6);
  const mealPlan = weekData?.days || {};

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Hero */}
      <div className="relative h-[260px] md:h-[340px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('/Ulrika_portratt/udavidssondesktop.png')" }} />
        
        <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Din Functional Foods Resa</h1>
          <p className="text-white/90 text-lg">Välkommen till vecka 6 - Att komma igång</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-[#F3EFE3]/80"></div>
      </div>

      {/* Course Navigation */}
      <CourseNavigation courseType="basics" currentWeek={6} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Days Journey */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Din vecka</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
            {getDaysForWeek(6).map((day) => (
              <div key={day.day} className={`relative p-4 md:p-6 rounded-2xl transition-all ${day.current ? 'bg-[#FFB5A7] shadow-xl scale-105' : day.completed ? 'bg-white hover:shadow-lg' : day.locked ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-lg'}`} onClick={() => (window.location.href = `/dashboard/courses/functional-basics/week/6/day/${day.day}`)}>
                {day.current && (<div className="absolute -top-2 -right-2 bg-[#014421] text-white text-xs px-3 py-1 rounded-full">Idag</div>)}
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-gray-600 mb-1">{formatDate(6, day.day)}</span>
                  <h3 className="font-bold text-base md:text-lg mb-3">{day.name}</h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}`}>{day.completed ? (<FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />) : day.current ? (<div className="w-3 h-3 bg-[#014421] rounded-full animate-pulse"></div>) : (<div className="w-3 h-3 bg-gray-400 rounded-full"></div>)}</div>
                  <span className={`text-sm font-medium ${day.completed ? 'text-green-600' : day.current ? 'text-[#112A12]' : 'text-gray-400'}`}>{day.completed ? 'Genomförd' : day.current ? 'Påbörjad' : 'Planerad'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Meal Schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Veckans måltider</h3>
          {Object.entries(mealPlan).map(([dayName, dayMeals]: [string, any]) => (
            <div key={dayName} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
              <h4 className="text-lg font-semibold text-[#014421] mb-3">{dayName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dayMeals.breakfast && (<div className="bg-orange-50 rounded-lg p-4"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-[#014421]">Frukost</span><span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded-full">07:00</span></div><p className="text-sm text-gray-700">{dayMeals.breakfast.name}</p>{dayMeals.breakfast.recipeLink || dayMeals.breakfast.slug ? (<Link href={dayMeals.breakfast.recipeLink || `/kunskapsbank/recept/${dayMeals.breakfast.slug}`} className="text-sm text-orange-600 hover:underline mt-1 inline-block">Se recept →</Link>) : null}</div>)}
                {dayMeals.lunch && (<div className="bg-green-50 rounded-lg p-4"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-[#014421]">Lunch</span><span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded-full">12:00</span></div><p className="text-sm text-gray-700">{dayMeals.lunch.name}</p>{dayMeals.lunch.recipeLink || (dayMeals.lunch.slug && !dayMeals.lunch.name.includes('rester')) ? (<Link href={dayMeals.lunch.recipeLink || `/kunskapsbank/recept/${dayMeals.lunch.slug}`} className="text-sm text-green-600 hover:underline mt-1 inline-block">Se recept →</Link>) : null}</div>)}
                {dayMeals.dinner && (<div className="bg-purple-50 rounded-lg p-4"><div className="flex items-center gap-2 mb-1"><span className="font-semibold text-[#014421]">Middag</span><span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded-full">18:00</span></div><p className="text-sm text-gray-700">{dayMeals.dinner.name}</p>{dayMeals.dinner.recipeLink || dayMeals.dinner.slug ? (<Link href={dayMeals.dinner.recipeLink || `/kunskapsbank/recept/${dayMeals.dinner.slug}`} className="text-sm text-purple-600 hover:underline mt-1 inline-block">Se recept →</Link>) : null}</div>)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-8">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <Link href={`/dashboard/courses/functional-basics/kostschema?view=week&week=6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 md:w-6 md:h-6 text-[#014421]" />
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Veckans kostschema</h3>
              <p className="text-gray-600">Se alla recept och måltider för vecka 6</p>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <Link href={`/dashboard/courses/functional-basics/inkopslista?week=6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#014421]" />
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Inköpslista</h3>
              <p className="text-gray-600">Allt du behöver för veckans recept</p>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <Link href="/dashboard/community">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-[#014421]" />
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-gray-600">Dela erfarenheter med andra deltagare</p>
            </Link>
          </motion.div>
        </div>

        {/* Week Materials */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-[#014421] mb-6">Veckans material</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#014421]" />
                <span className="font-medium">Vecka 6 - Arbetsbok (PDF)</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#014421]" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#014421]" />
                <span className="font-medium">Receptsamling vecka 6</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#014421]" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#014421]" />
                <span className="font-medium">Bonusmaterial - Extra recept</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#014421]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

 