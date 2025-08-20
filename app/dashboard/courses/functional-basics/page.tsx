'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiClock, FiCheckCircle, FiBook, FiDownload,
  FiTrendingUp, FiAward, FiStar, FiChevronRight, FiUsers,
  FiShoppingCart, FiCalendar, FiLock, FiArrowRight, FiSettings,
  FiHelpCircle, FiSun
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import HelpGuide from '@/app/components/HelpGuide';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import { getWeekData } from '@/app/data/mealPlans';

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export default function FunctionalBasicsPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate current week and day based on start date
    const savedStartDate = localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const calculatedWeek = Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
      const calculatedDay = Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else {
      const today = new Date();
      localStorage.setItem('basicsStartDate', today.toISOString());
      setCourseStartDate(today);
    }
    
    // Check if help guide should be shown (only first time)
    const hasSeenHelpGuide = localStorage.getItem('basics_help_guide_seen');
    if (!hasSeenHelpGuide) {
      setShowHelpGuide(true);
      localStorage.setItem('basics_help_guide_seen', 'true');
    }
  }, []);

  const weeks = [
    { number: 1, title: "Grunden i Functional Foods", color: "#014421" },
    { number: 2, title: "Proteiner & aminosyror", color: "#112A12" },
    { number: 3, title: "Fetter & kolhydrater", color: "#014421" },
    { number: 4, title: "Vitaminer & mineraler", color: "#112A12" },
    { number: 5, title: "Antioxidanter & fytokemikalier", color: "#014421" },
    { number: 6, title: "Att komma igång", color: "#112A12" }
  ];

  const getDaysForWeek = (weekNumber: number): WeekDay[] => {
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

  return (
    <>
      {/* Hero Section with Video */}
      <div className="relative h-[300px] md:h-[400px] bg-[#112A12] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image 
            src="/Ulrika_portratt/udavidssondesktop.png" 
            alt="Ulrika Davidsson"
            fill
            className="object-cover opacity-60 hidden md:block object-top"
            priority
          />
          <Image 
            src="/Ulrika_portratt/udavidssonmobile.png" 
            alt="Ulrika Davidsson"
            fill
            className="object-cover opacity-60 block md:hidden object-top"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Din Functional Foods Resa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
          >
            Välkommen till vecka {currentWeek} - {weeks[currentWeek - 1].title}
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowVideoModal(true)}
            className="relative overflow-hidden rounded-full px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium text-white bg-[#014421] hover:bg-[#112A12] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            style={{
              backgroundImage: window.innerWidth >= 768 
                ? "url('/Ulrika_portratt/udavidssondesktop.png')" 
                : "url('/Ulrika_portratt/udavidssonmobile.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-[#014421]/80"></div>
            <FiPlay className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
            <span className="relative z-10">Se introduktionsvideo</span>
          </motion.button>
        </div>

        {/* Help Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowHelpGuide(true)}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          title="Öppna hjälpguide"
        >
          <FiHelpCircle className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-[#F3EFE3]/80"></div>
      </div>

      {/* Course Navigation - After Hero Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="basics" currentWeek={currentWeek} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Days Journey */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Din vecka</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 md:gap-4">
            {getDaysForWeek(currentWeek).map((day) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.day * 0.05 }}
                className={`
                  relative p-4 md:p-4 md:p-6 rounded-2xl transition-all cursor-pointer
                  ${day.current 
                    ? 'bg-[#FFB5A7] shadow-xl scale-105' 
                    : day.completed
                    ? 'bg-white hover:shadow-lg'
                    : day.locked
                    ? 'bg-gray-50 opacity-60'
                    : 'bg-white hover:shadow-lg'
                  }
                `}
                onClick={() => !day.locked && (window.location.href = `/dashboard/courses/functional-basics/week/${currentWeek}/day/${day.day}`)}
              >
                {/* Date tag */}
                <div className={`
                  absolute -top-2 -right-2 px-3 py-1 text-xs rounded-full font-medium
                  ${day.current ? 'bg-[#014421] text-white' : 'bg-[#014421] text-white'}
                `}>
                  {day.current ? 'Idag' : formatDate(currentWeek, day.day).split('.')[0] + ' ' + formatDate(currentWeek, day.day).split(' ')[1]}
                </div>

                <div className="text-center">
                  <span className="text-xs md:text-sm text-gray-600 mb-1">{formatDate(currentWeek, day.day)}</span>
                  <h3 className="font-bold text-base md:text-base md:text-lg mb-3">{day.name}</h3>
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 mx-auto
                    ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}
                  `}>
                    {day.completed ? (
                      <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    ) : day.current ? (
                      <div className="w-3 h-3 bg-[#014421] rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <span className={`
                    text-xs md:text-sm font-medium
                    ${day.completed ? 'text-green-600' : day.current ? 'text-[#112A12]' : 'text-gray-400'}
                  `}>
                    {day.completed ? 'Genomförd' : day.current ? 'Påbörjad' : 'Planerad'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Meal Schedule List */}
        <div className="mb-12 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-[#014421] mb-6">Veckans måltider</h3>
          
          {getDaysForWeek(currentWeek).map((day) => {
            const weekData = getWeekData(currentWeek);
            const swedishDayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
            const dayMeals = weekData?.days[swedishDayNames[day.day - 1]];

            if (!dayMeals) return null;

            return (
              <div key={day.day} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                <h4 className="text-lg font-semibold text-[#014421] mb-3">{day.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Breakfast */}
                  {dayMeals.breakfast && (
                    <div className="bg-orange-50 rounded-lg p-4 flex items-start gap-3">
                      <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                        <FiSun className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#014421]">Frukost</span>
                          <span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded-full">07:00</span>
                        </div>
                        <p className="text-sm text-gray-700">{dayMeals.breakfast.name}</p>
                        {dayMeals.breakfast.recipeLink && (
                                  <Link 
                                    href={dayMeals.breakfast.recipeLink}
                                    className="text-sm text-orange-600 hover:underline mt-1 inline-block"
                                  >
                                    Se recept →
                                  </Link>
                                )}
                      </div>
                    </div>
                  )}

                  {/* Lunch */}
                  {dayMeals.lunch && (
                    <div className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                        <FiSun className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#014421]">Lunch</span>
                          <span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded-full">12:00</span>
                        </div>
                        <p className="text-sm text-gray-700">{dayMeals.lunch.name}</p>
                        {dayMeals.lunch.recipeLink && (
                                  <Link 
                                    href={dayMeals.lunch.recipeLink}
                                    className="text-sm text-green-600 hover:underline mt-1 inline-block"
                                  >
                                    Se recept →
                                  </Link>
                                )}
                      </div>
                    </div>
                  )}

                  {/* Dinner */}
                  {dayMeals.dinner && (
                    <div className="bg-purple-50 rounded-lg p-4 flex items-start gap-3">
                      <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                        <FiSun className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#014421]">Middag</span>
                          <span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded-full">18:00</span>
                        </div>
                        <p className="text-sm text-gray-700">{dayMeals.dinner.name}</p>
                        {dayMeals.dinner.recipeLink && (
                                  <Link 
                                    href={dayMeals.dinner.recipeLink}
                                    className="text-sm text-purple-600 hover:underline mt-1 inline-block"
                                  >
                                    Se recept →
                                  </Link>
                                )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Link to weekly meals */}
          <div className="mt-6 text-center">
            <Link 
              href={`/dashboard/courses/functional-basics/week/${currentWeek}`}
              className="inline-flex items-center gap-2 text-[#014421] hover:text-[#112A12] font-medium"
            >
              <FiCalendar className="w-5 h-5" />
              Se hela veckans kostschema
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Snabbval</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={`/dashboard/courses/functional-basics/kostschema?view=week&week=${currentWeek}`} className="block">
              <div className="bg-[#F3EFE3] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-[#014421]">
                <div className="flex items-center mb-4">
                  <div className="bg-[#014421] rounded-full p-3 mr-4">
                    <FiCalendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-[#014421]">Veckans kostschema</h3>
                </div>
                <p className="text-gray-600 text-sm">Se alla recept och måltider för vecka {currentWeek}</p>
              </div>
            </Link>

            <Link href={`/dashboard/courses/functional-basics/inkopslista?week=${currentWeek}`} className="block">
              <div className="bg-[#FFB5A7] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-[#014421]">
                <div className="flex items-center mb-4">
                  <div className="bg-white rounded-full p-3 mr-4">
                    <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#014421]" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Inköpslista</h3>
                </div>
                <p className="text-white/90 text-sm">Allt du behöver för veckans recept</p>
              </div>
            </Link>

            <Link href="/dashboard/community" className="block">
              <div className="bg-[#014421] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-[#FFB5A7]">
                <div className="flex items-center mb-4">
                  <div className="bg-white rounded-full p-3 mr-4">
                    <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-[#014421]" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Community</h3>
                </div>
                <p className="text-white/90 text-sm">Dela erfarenheter med andra deltagare</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Week Materials */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Veckans material</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#014421] rounded-full p-3 mr-4">
                  <FiDownload className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#014421]">Kostschema PDF</h3>
              </div>
              <p className="text-gray-600 mb-4">Ladda ner veckans kostschema som PDF</p>
              <button className="w-full bg-[#014421] text-white rounded-lg py-3 hover:bg-[#112A12] transition-colors">
                Ladda ner
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#FFB5A7] rounded-full p-3 mr-4">
                  <FiBook className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#014421]">Bonusmaterial</h3>
              </div>
              <p className="text-gray-600 mb-4">Extra recept och tips för veckan</p>
              <button className="w-full bg-[#FFB5A7] text-white rounded-lg py-3 hover:bg-[#FFA493] transition-colors">
                Öppna material
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-black rounded-2xl overflow-hidden max-w-4xl w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://player.vimeo.com/video/1056709544?h=9265a3d6ae"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                title="Functional Basics Intro"
              />
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />
    </>
  );
} 