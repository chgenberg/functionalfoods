'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FiArrowLeft, FiArrowRight, FiClock, FiCheck, FiSun, FiCoffee,
  FiShoppingCart, FiHeart, FiShare2, FiCalendar
} from 'react-icons/fi';
import { MdDinnerDining } from 'react-icons/md';
import { getWeekData } from '@/app/data/mealPlans';
import { useParams } from 'next/navigation';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';

export default function DayPage() {
  const params = useParams();
  const weekNumber = parseInt(params.week as string);
  const dayNumber = parseInt(params.day as string);
  
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekData = getWeekData(weekNumber);
  const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const dayName = dayNames[dayNumber - 1];
  const dayMeals = weekData?.days[dayName];
  
  const weekTitles = [
    'Grunden i Functional Foods',
    'Proteiner & aminosyror',
    'Fetter & kolhydrater',
    'Vitaminer & mineraler',
    'Antioxidanter & fytokemikalier',
    'Att komma igång'
  ];
  const weekTitle = weekTitles[weekNumber - 1];
  
  // Calculate date based on course start (example: course starts on Monday Aug 12)
  const courseStartDate = new Date('2024-08-12');
  const currentDayDate = new Date(courseStartDate);
  currentDayDate.setDate(courseStartDate.getDate() + (weekNumber - 1) * 7 + (dayNumber - 1));
  const dayDate = currentDayDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
  
  const meals = [
    {
      type: 'breakfast',
      time: '07:00',
      icon: FiSun,
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      meal: dayMeals?.breakfast
    },
    {
      type: 'lunch',
      time: '12:00',
      icon: FiCoffee,
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

  const completionPercentage = meals.filter(m => m.meal).length > 0 
    ? (completedMeals.length / meals.filter(m => m.meal).length) * 100 
    : 0;

  // Calculate previous and next day links
  const totalDayNumber = (weekNumber - 1) * 7 + dayNumber;
  const prevDayNumber = totalDayNumber > 1 ? totalDayNumber - 1 : 42;
  const nextDayNumber = totalDayNumber < 42 ? totalDayNumber + 1 : 1;
  const prevWeek = Math.ceil(prevDayNumber / 7);
  const prevDay = ((prevDayNumber - 1) % 7) + 1;
  const nextWeek = Math.ceil(nextDayNumber / 7);
  const nextDay = ((nextDayNumber - 1) % 7) + 1;

  return (
    <div className="min-h-screen bg-[#F3EFE3]">{/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/functional-basics" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-sm text-gray-600">Vecka {weekNumber} - {weekTitle}</p>
                <h1 className="text-xl md:text-2xl font-bold text-[#014421]">{dayName}, {dayDate}</h1>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link href={`/dashboard/courses/functional-basics/week/${prevWeek}/day/${prevDay}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <span className="text-sm font-medium px-3">Dag {totalDayNumber} av 42</span>
              <Link href={`/dashboard/courses/functional-basics/week/${nextWeek}/day/${nextDay}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Mobile Day Navigation */}
          <div className="flex md:hidden items-center justify-between mt-3">
            <Link href={`/dashboard/courses/functional-basics/week/${prevWeek}/day/${prevDay}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-sm font-medium">Dag {totalDayNumber} av 42</span>
            <Link href={`/dashboard/courses/functional-basics/week/${nextWeek}/day/${nextDay}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Course Navigation */}
      <CourseNavigation courseType="basics" currentWeek={weekNumber} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
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
          className="bg-gradient-to-br from-[#FFB5A7] to-[#FCD5CE] rounded-2xl shadow-lg p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1">Aktuell tid</p>
              <p className="text-3xl font-bold">{currentTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <FiClock className="w-12 h-12 text-white/80" />
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
                          <FiClock className="w-4 h-4" />
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
                      {isCompleted && <FiCheck className="w-6 h-6" />}
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
                        
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <FiHeart className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <FiShare2 className="w-5 h-5 text-gray-600" />
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
            <Link href={`/dashboard/courses/functional-basics/inkopslista?week=${weekNumber}&day=${dayNumber}`} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Dagens inköpslista</h3>
                <p className="text-gray-600 text-sm">Se alla ingredienser du behöver</p>
              </div>
              <FiShoppingCart className="w-8 h-8 text-[#014421]" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
          >
            <Link href={`/dashboard/courses/functional-basics/kostschema?view=week&week=${weekNumber}`} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">Veckans översikt</h3>
                <p className="text-gray-600 text-sm">Se hela veckans kostschema</p>
              </div>
              <FiCalendar className="w-8 h-8 text-[#014421]" />
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
          <h3 className="text-xl font-bold mb-3">💡 Dagens tips</h3>
          <p className="text-white/90">
            {getDailyTip(weekNumber, dayNumber)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function getDailyTip(week: number, day: number): string {
  const tips = [
    "Börja dagen med ett glas vatten för att kickstarta din ämnesomsättning.",
    "Ta dig tid att tugga maten ordentligt - det förbättrar matsmältningen.",
    "Planera morgondagens måltider ikväll för att minska stress.",
    "Inkludera färgglada grönsaker i varje måltid för maximal näring.",
    "Lyssna på din kropp - ät när du är hungrig, sluta när du är mätt.",
    "Experimentera med nya kryddor för att göra hälsosam mat mer spännande.",
    "Vila är lika viktigt som näring - se till att få tillräckligt med sömn."
  ];
  
  return tips[(week - 1) * 7 + (day - 1) % tips.length];
} 