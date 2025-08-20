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
import { getFlowWeekData } from '@/app/data/mealPlans';

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export default function FunctionalFlowPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate current week and day based on start date
    const savedStartDate = localStorage.getItem('flowStartDate');
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
      localStorage.setItem('flowStartDate', today.toISOString());
      setCourseStartDate(today);
    }
  }, []);

  const weeks = [
    { number: 1, title: "Optimera din energi", color: "#014421" },
    { number: 2, title: "Avancerad näringsoptimering", color: "#112A12" },
    { number: 3, title: "Prestationshöjande kost", color: "#014421" },
    { number: 4, title: "Antiinflammatorisk livsstil", color: "#112A12" },
    { number: 5, title: "Longevity & återhämtning", color: "#014421" },
    { number: 6, title: "Personlig optimering", color: "#112A12" }
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
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Hero Section with Video */}
      <div className="relative h-[300px] md:h-[400px] bg-[#112A12] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image 
            src="/Ulrika_portratt/udavidssondesktop.png" 
            alt="Ulrika Davidsson"
            fill
            className="object-cover opacity-60 hidden md:block"
            priority
          />
          <Image 
            src="/Ulrika_portratt/udavidssonmobile.png" 
            alt="Ulrika Davidsson"
            fill
            className="object-cover opacity-60 block md:hidden"
            priority
          />
          
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Din Functional Flow Resa
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
            className="bg-white text-[#112A12] px-8 py-4 rounded-full font-semibold flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
          >
            <FiPlay className="w-5 h-5" />
            Se introduktionsvideo
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
          <FiHelpCircle className="w-6 h-6" />
        </motion.button>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F3EFE3] to-transparent"></div>
      </div>{/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Days Journey */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#112A12] mb-6">Din vecka</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {getDaysForWeek(currentWeek).map((day) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.day * 0.05 }}
                className={`
                  relative p-6 rounded-2xl transition-all cursor-pointer
                  ${day.current 
                    ? 'bg-gradient-to-br from-[#FFB5A7] to-[#FCD5CE] shadow-xl scale-105' 
                    : day.completed
                    ? 'bg-white hover:shadow-lg'
                    : day.locked
                    ? 'bg-gray-50 opacity-60'
                    : 'bg-white hover:shadow-lg'
                  }
                `}
                onClick={() => !day.locked && (window.location.href = `/dashboard/courses/functional-flow/week/${currentWeek}/day/${day.day}`)}
              >
                {day.current && (
                  <div className="absolute -top-2 -right-2 bg-[#112A12] text-white text-xs px-3 py-1 rounded-full">
                    Idag
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-gray-600 mb-1">{formatDate(currentWeek, day.day)}</span>
                  <h3 className="font-bold text-lg mb-3">{day.name}</h3>
                  
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-3
                    ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}
                  `}>
                    {day.completed ? (
                      <FiCheckCircle className="w-6 h-6 text-green-600" />
                    ) : day.current ? (
                      <div className="w-3 h-3 bg-[#112A12] rounded-full animate-pulse"></div>
                    ) : (
                      <FiLock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <span className={`
                    text-sm font-medium
                    ${day.completed ? 'text-green-600' : day.current ? 'text-[#112A12]' : 'text-gray-400'}
                  `}>
                    {day.completed ? 'Genomförd' : day.current ? 'Påbörjad' : 'Låst'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Meal Schedule List */}
        <div className="mb-12 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-[#112A12] mb-6">Veckans måltider</h3>
          
          {getDaysForWeek(currentWeek).map((day) => {
            const weekData = getFlowWeekData(currentWeek);
            const swedishDayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
            const dayMeals = weekData?.days[swedishDayNames[day.day - 1]];

            if (!dayMeals) return null;

            return (
              <div key={day.day} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                <h4 className="text-lg font-semibold text-[#112A12] mb-3">{day.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Breakfast */}
                  {dayMeals.breakfast && (
                    <div className="bg-orange-50 rounded-lg p-4 flex items-start gap-3">
                      <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                        <FiSun className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#112A12]">Frukost</span>
                          <span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded-full">07:00</span>
                        </div>
                        <p className="text-sm text-gray-700">{dayMeals.breakfast.name}</p>
                        {(dayMeals.breakfast as any).slug && (
                          <Link 
                            href={`/kunskapsbank/recept/${(dayMeals.breakfast as any).slug}`}
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
                          <span className="font-semibold text-[#112A12]">Lunch</span>
                          <span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded-full">12:00</span>
                        </div>
                        <p className="text-sm text-gray-700">{dayMeals.lunch.name}</p>
                        {dayMeals.lunch.slug && !dayMeals.lunch.name.includes('rester') && (
                          <Link 
                            href={`/kunskapsbank/recept/${dayMeals.lunch.slug}`}
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
                          <span className="font-semibold text-[#112A12]">Middag</span>
                          <span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded-full">18:00</span>
                        </div>
                        <p className="text-sm text-gray-700">{dayMeals.dinner.name}</p>
                        {dayMeals.dinner.slug && (
                          <Link 
                            href={`/kunskapsbank/recept/${dayMeals.dinner.slug}`}
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href={`/dashboard/courses/functional-flow/kostschema?view=week&week=${currentWeek}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-[#112A12]" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Veckans kostschema</h3>
              <p className="text-gray-600">Se alla recept och måltider för vecka {currentWeek}</p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href={`/dashboard/courses/functional-flow/inkopslista?week=${currentWeek}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiShoppingCart className="w-6 h-6 text-[#112A12]" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Inköpslista</h3>
              <p className="text-gray-600">Allt du behöver för veckans recept</p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/dashboard/community">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-[#112A12]" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-gray-600">Dela erfarenheter med andra deltagare</p>
            </Link>
          </motion.div>
        </div>

        {/* Week Materials */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-[#112A12] mb-6">Veckans material</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#112A12]" />
                <span className="font-medium">Vecka {currentWeek} - Arbetsbok (PDF)</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#112A12]" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#112A12]" />
                <span className="font-medium">Avancerade recept vecka {currentWeek}</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#112A12]" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#112A12]" />
                <span className="font-medium">Forskningsartiklar - Vecka {currentWeek}</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#112A12]" />
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
                src="https://player.vimeo.com/video/1084929149"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Functional Flow Intro"
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
    </div>
  );
} 