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
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';
import VideoModal from '@/app/dashboard/courses/components/VideoModal';
import DayModal from '@/app/dashboard/courses/components/DayModal';
import { getWeekData } from '@/app/data/mealPlans';
import { dayImages } from '@/app/data/dayImages';

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export default function FunctionalBasicsPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate current week and day based on start date
    const savedStartDate = localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      // Always start at week 1 for new users, but allow progression for existing users
      const calculatedWeek = daysDiff < 0 ? 1 : Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
      const calculatedDay = daysDiff < 0 ? 1 : Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else {
      const today = new Date();
      localStorage.setItem('basicsStartDate', today.toISOString());
      setCourseStartDate(today);
      setCurrentWeek(1);
      setCurrentDay(1);
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

  const getDaysForWeek = (week: number) => {
    const days = [];
    const weekDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    
    // Get the selected week's start date
    const startDate = typeof window !== 'undefined' ? localStorage.getItem('basicsStartDate') : null;
    const courseStart = startDate ? new Date(startDate) : new Date();
    const weekStart = new Date(courseStart);
    weekStart.setDate(courseStart.getDate() + (week - 1) * 7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      
      const dayDateOnly = new Date(dayDate);
      dayDateOnly.setHours(0, 0, 0, 0);
      
      const isCompleted = dayDateOnly < today;
      const isCurrent = dayDateOnly.getTime() === today.getTime();
      
      days.push({
        day: i + 1,
        name: weekDays[i],
        date: dayDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }),
        completed: isCompleted,
        current: isCurrent,
        locked: false, // Never lock days
        meals: 3
      });
    }
    
    return days;
  };

  const formatDate = (weekNumber: number, dayNumber: number) => {
    if (!courseStartDate) return '';
    const date = new Date(courseStartDate);
    date.setDate(date.getDate() + (weekNumber - 1) * 7 + (dayNumber - 1));
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  // Hämta måltidsdata för aktuell vecka
  const weekData = getWeekData(currentWeek);
  
  // Transformera mealPlan för att använda nummer som nycklar istället för dagnamn
  const mealPlan: Record<number, any> = {};
  if (weekData?.days) {
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    dayNames.forEach((dayName, index) => {
      if (weekData.days[dayName]) {
        mealPlan[index + 1] = weekData.days[dayName];
      }
    });
  }

  return (
    <>
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={1}
        weekTitle="Functional Basics"
        weekSubtitle="Vecka 1 - Lär dig grunderna i functional foods och hur du optimerar din hälsa"
        heroImage="/Ulrika_portratt/udavidssondesktop.png"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />

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
            {getDaysForWeek(currentWeek).map((day) => {
              const dayContent = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: day.day * 0.05 }}
                  className={`
                    relative p-4 md:p-4 md:p-6 rounded-2xl transition-all cursor-pointer
                    ${day.current 
                      ? 'bg-[#014421] shadow-xl scale-105' 
                      : day.completed
                      ? 'bg-white hover:shadow-lg'
                      : day.locked
                      ? 'bg-gray-50 opacity-60'
                      : 'bg-white hover:shadow-lg'
                    }
                  `}
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
                    <h3 className="font-bold text-sm sm:text-base md:text-lg mb-3">{day.name}</h3>
                    <div className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 mx-auto overflow-hidden relative
                      ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}
                    `}>
                      {dayImages[currentWeek.toString()]?.[day.day.toString()] ? (
                        <>
                          <Image
                            src={dayImages[currentWeek.toString()][day.day.toString()]!}
                            alt={`Day ${day.day} meal`}
                            fill
                            className="object-cover"
                          />
                          {day.completed && (
                            <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                              <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                          )}
                          {day.current && (
                            <div className="absolute inset-0 bg-[#014421]/20 flex items-center justify-center">
                              <div className="w-3 h-3 bg-[#014421] rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Fallback to original circles if no image
                        <>
                          {day.completed ? (
                            <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                          ) : day.current ? (
                            <div className="w-3 h-3 bg-[#014421] rounded-full animate-pulse"></div>
                          ) : (
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          )}
                        </>
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
              );

              return (
                <div 
                  key={day.day} 
                  className={`${day.locked ? 'pointer-events-none' : 'cursor-pointer'}`}
                  onClick={() => !day.locked && setSelectedDay(day.day)}
                >
                  {dayContent}
                </div>
              );
            })}
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
        </div>



        {/* Week Materials */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#014421] mb-4 sm:mb-6">Veckans material</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Inköpslista</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Skapa inköpslista för veckans måltider</p>
              <Link href={`/dashboard/courses/functional-basics/inkopslista?week=${currentWeek}`}>
                <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
                  Visa inköpslista
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Community</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Diskutera och dela erfarenheter</p>
              <Link href="/dashboard/community">
                <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
                  Gå till community
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg sm:col-span-2 md:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <FiBook className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Bonusmaterial</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Extra recept och tips för veckan</p>
              <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
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

      {/* Day Modal */}
      {selectedDay && (
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          weekNumber={currentWeek}
          dayNumber={selectedDay}
          dayName={['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'][selectedDay - 1]}
          meals={(() => {
            const dayData = mealPlan[selectedDay] || { breakfast: null, lunch: null, dinner: null };
            const meals = [];
            
            if (dayData.breakfast) {
              const match = dayData.breakfast.name.match(/\((\d+\s*kcal)\)/);
              const calories = match ? match[1] : '';
              const mealName = dayData.breakfast.name.replace(/\s*\(\d+\s*kcal\)/, '');
              
              meals.push({
                mealType: 'Frukost',
                time: '07:00',
                meal: mealName,
                calories: calories,
                recipeLink: dayData.breakfast.recipeLink
              });
            }
            
            if (dayData.lunch) {
              const match = dayData.lunch.name.match(/\((\d+\s*kcal)\)/);
              const calories = match ? match[1] : '';
              const mealName = dayData.lunch.name.replace(/\s*\(\d+\s*kcal\)/, '');
              
              meals.push({
                mealType: 'Lunch',
                time: '12:00',
                meal: mealName,
                calories: calories,
                recipeLink: dayData.lunch.recipeLink
              });
            }
            
            if (dayData.dinner) {
              const match = dayData.dinner.name.match(/\((\d+\s*kcal)\)/);
              const calories = match ? match[1] : '';
              const mealName = dayData.dinner.name.replace(/\s*\(\d+\s*kcal\)/, '');
              
              meals.push({
                mealType: 'Middag',
                time: '18:00',
                meal: mealName,
                calories: calories,
                recipeLink: dayData.dinner.recipeLink
              });
            }
            
            return meals;
          })()}
        />
      )}

      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        weekNumber={0}
        weekTitle="Din Functional Foods Resa"
      />
    </>
  );
} 