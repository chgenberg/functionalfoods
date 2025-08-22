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
import { dayImages } from '@/app/data/dayImages';

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

interface CourseTemplateProps {
  courseType: 'basics' | 'flow';
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  videoUrl?: string;
  weekTitle: string;
  mealPlans: any; // The specific meal plan data for this course
  currentWeek: number;
  currentDay: number;
  courseStartDate: Date | null;
}

export default function CourseTemplate({
  courseType,
  heroTitle,
  heroSubtitle,
  heroImage = '/Ulrika_portratt/udavidssondesktop.png',
  videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  weekTitle,
  mealPlans,
  currentWeek,
  currentDay,
  courseStartDate
}: CourseTemplateProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setShowHelpGuide(true);
    window.addEventListener('open-help-guide', handler as EventListener);
    return () => window.removeEventListener('open-help-guide', handler as EventListener);
  }, []);

  // Get current week's meal plan
  const weekKey = `week${currentWeek}`;
  const mealPlan = mealPlans[weekKey];
  
  // Debug logging
  console.log('CourseTemplate Debug:', {
    currentWeek,
    weekKey,
    mealPlan: !!mealPlan,
    mealPlansKeys: Object.keys(mealPlans),
    mealPlanDays: mealPlan ? Object.keys(mealPlan.days) : 'No mealPlan'
  });

  // Generate days for current week
  const getDaysForWeek = (weekNum: number): WeekDay[] => {
    const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    
    return days.map((name, index) => {
      const dayNumber = index + 1;
      
      // Calculate if this day is current based on actual dates
      let isCurrent = false;
      if (courseStartDate) {
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - courseStartDate.getTime()) / (1000 * 3600 * 24));
        const currentWeekFromDate = Math.ceil((daysSinceStart + 1) / 7);
        const currentDayFromDate = ((daysSinceStart % 7) + 1);
        
        isCurrent = (currentWeekFromDate === weekNum && currentDayFromDate === dayNumber);
      }
      
      return {
        day: dayNumber,
        name,
        completed: false, // This could be calculated based on user progress
        current: isCurrent,
        locked: false // All days are unlocked for modal access
      };
    });
  };

  const weekDays = getDaysForWeek(currentWeek);

  // Format date for display
  const formatDate = (week: number, day: number) => {
    if (!courseStartDate) return `Dag ${day}`;
    
    const startDate = new Date(courseStartDate);
    const dayOffset = (week - 1) * 7 + (day - 1);
    const targetDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    
    return `${dayNames[targetDate.getDay()]} ${targetDate.getDate()} ${monthNames[targetDate.getMonth()]}`;
  };

  return (
    <>
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={1}
        weekTitle={heroTitle}
        weekSubtitle={heroSubtitle}
        heroImage={heroImage}
        videoUrl={videoUrl}
      />

      {/* Course Navigation - After Hero Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType={courseType} currentWeek={1} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Overview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#014421] mb-4">{weekTitle}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Följ ditt personliga schema och upptäck nya smaker varje dag
            </p>
          </div>

          {/* Week Days Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {weekDays.map((day) => {
              const dayContent = (
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative rounded-2xl p-4 shadow-lg border-2 transition-all duration-300 cursor-pointer
                    ${day.current 
                      ? 'bg-[#014421] border-[#014421] shadow-xl scale-105' 
                      : day.completed
                      ? 'bg-white border-green-200 hover:shadow-lg'
                      : day.locked
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200 hover:shadow-lg'
                    }
                  `}
                >


                  <div className="text-center">
                    <span className={`text-xs md:text-sm mb-1 ${day.current ? 'text-white' : 'text-gray-600'}`}>{formatDate(currentWeek, day.day)}</span>
                    <h3 className={`font-bold text-sm sm:text-base md:text-lg mb-3 ${day.current ? 'text-white' : 'text-gray-900'}`}>{day.name}</h3>
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
                      ${day.completed ? 'text-green-600' : day.current ? 'text-white' : 'text-gray-600'}
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
              <Link href={`/dashboard/courses/functional-${courseType}/inkopslista?week=${currentWeek}`}>
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
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
        videoUrl={videoUrl}
        weekNumber={1}
        weekTitle={heroTitle}
      />

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />

      {/* Day Modal */}
      {selectedDay && mealPlan && (
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          weekNumber={currentWeek}
          dayNumber={selectedDay}
          dayName={weekDays.find(d => d.day === selectedDay)?.name || ''}
          meals={(() => {
            // Try both Swedish day names and day1, day2 format
            const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
            const swedishDayKey = dayNames[selectedDay - 1];
            const numberDayKey = `day${selectedDay}`;
            
            // Check which format exists in the data
            let dayData = mealPlan.days[swedishDayKey] || mealPlan.days[numberDayKey];
            const usedKey = mealPlan.days[swedishDayKey] ? swedishDayKey : numberDayKey;
            
            console.log('DayModal Debug (CourseTemplate):', {
              selectedDay,
              swedishDayKey,
              numberDayKey,
              usedKey,
              dayData: !!dayData,
              mealPlanDays: Object.keys(mealPlan.days)
            });
            
            if (!dayData) return [];
            
            const meals: any[] = [];
            
            // Extract meals with calorie parsing
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
          courseType={courseType}
        />
      )}
    </>
  );
} 