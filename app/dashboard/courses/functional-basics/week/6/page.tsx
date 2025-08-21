'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiShoppingCart, FiBook, FiTarget,
  FiChevronRight, FiClock, FiUsers, FiCheckCircle, FiDownload,
  FiStar, FiHeart, FiAward, FiTrendingUp, FiSun, FiLock, FiPlay, FiHelpCircle
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
import DayModal from '@/app/dashboard/courses/components/DayModal';
import { dayImages } from '@/app/data/dayImages';
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';
import VideoModal from '@/app/dashboard/courses/components/VideoModal';
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const weekTitle = "Avslutning och reflektion";

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dayNames.map((name, index) => {
      const dayNumber = index + 1;
      
      // Beräkna det verkliga datumet för denna dag
      if (!courseStartDate) {
        return {
          day: dayNumber,
          name,
          completed: false,
          current: false,
          locked: false
        };
      }
      
      const dayDate = new Date(courseStartDate);
      dayDate.setDate(courseStartDate.getDate() + (weekNumber - 1) * 7 + (dayNumber - 1));
      dayDate.setHours(0, 0, 0, 0);
      
      const totalDayNumber = (weekNumber - 1) * 7 + dayNumber;
      const currentTotalDay = (currentWeek - 1) * 7 + currentDay;
      
      return {
        day: dayNumber,
        name,
        completed: totalDayNumber < currentTotalDay,
        current: dayDate.getTime() === today.getTime(), // Använd verkligt datum
        locked: false // Alla dagar ska vara klickbara
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
  
  // Transformera mealPlan för att använda nummer som nycklar istället för dagnamn
  const mealPlan: Record<number, DayMeals> = {};
  if (weekData?.days) {
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    dayNames.forEach((dayName, index) => {
      if (weekData.days[dayName]) {
        mealPlan[index + 1] = weekData.days[dayName];
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={6}
        weekTitle={weekTitle}
        weekSubtitle="Fira din framgång och planera framåt"
        heroImage="/Ulrika_portratt/udavidssondesktop.png"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />

      {/* Course Navigation - After Hero Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="basics" currentWeek={6} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Days Journey */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Din vecka</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
            {getDaysForWeek(6).map((day) => (
              <div key={day.day} className={`relative p-4 md:p-6 rounded-2xl transition-all cursor-pointer ${day.current ? 'bg-[#FFB5A7] shadow-xl scale-105' : day.completed ? 'bg-white hover:shadow-lg' : day.locked ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-lg'}`} onClick={() => !day.locked && setSelectedDay(day.day)}>
                {/* Date tag */}
                <div className={`
                  absolute -top-2 -right-2 px-3 py-1 text-xs rounded-full font-medium
                  ${day.current ? 'bg-[#014421] text-white' : 'bg-[#014421] text-white'}
                `}>
                  {day.current ? 'Idag' : formatDate(6, day.day).split('.')[0] + ' ' + formatDate(6, day.day).split(' ')[1]}
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-gray-600 mb-1">{formatDate(6, day.day)}</span>
                  <h3 className="font-bold text-base md:text-lg mb-3">{day.name}</h3>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 overflow-hidden relative ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}`}>
                    {dayImages["6"]?.[day.day.toString()] ? (
                      <>
                        <Image
                          src={dayImages["6"][day.day.toString()]!}
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
                  <span className={`text-sm font-medium ${day.completed ? 'text-green-600' : day.current ? 'text-[#112A12]' : 'text-gray-400'}`}>{day.completed ? 'Genomförd' : day.current ? 'Påbörjad' : 'Planerad'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Meal Schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Veckans måltider</h3>
          {['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'].map((dayName, index) => {
            const dayMeals = mealPlan[index + 1];
            if (!dayMeals) return null;
            
            return (
            <div key={dayName} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
              <h4 className="text-lg font-semibold text-[#014421] mb-3">{dayName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dayMeals.breakfast && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-[#014421]">Frukost</span><span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded-full">07:00</span></div>
                    <p className="text-sm text-gray-700">{dayMeals.breakfast.name}</p>
                    {dayMeals.breakfast.recipeLink && (<Link href={dayMeals.breakfast.recipeLink} className="text-sm text-orange-600 hover:underline mt-1 inline-block">Se recept →</Link>)}
                  </div>
                )}
                {dayMeals.lunch && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-[#014421]">Lunch</span><span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded-full">12:00</span></div>
                    <p className="text-sm text-gray-700">{dayMeals.lunch.name}</p>
                    {dayMeals.lunch.recipeLink && (<Link href={dayMeals.lunch.recipeLink} className="text-sm text-green-600 hover:underline mt-1 inline-block">Se recept →</Link>)}
                  </div>
                )}
                {dayMeals.dinner && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-[#014421]">Middag</span><span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded-full">18:00</span></div>
                    <p className="text-sm text-gray-700">{dayMeals.dinner.name}</p>
                    {dayMeals.dinner.recipeLink && (<Link href={dayMeals.dinner.recipeLink} className="text-sm text-purple-600 hover:underline mt-1 inline-block">Se recept →</Link>)}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>





        {/* Quick Actions */}
        <div className="bg-[#F3EFE3] rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Veckans material</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#014421] rounded-full p-3 mr-4">
                  <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#014421]">Inköpslista</h3>
              </div>
              <p className="text-gray-600 mb-4">Skapa inköpslista för veckans måltider</p>
              <Link href={`/dashboard/courses/functional-basics/inkopslista?week=${currentWeek}`}>
                                  <button className="w-full bg-[#014421] text-white rounded-lg py-3 hover:bg-[#112A12] transition-colors">
                    Visa inköpslista
                  </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#FFB5A7] rounded-full p-3 mr-4">
                  <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#014421]">Community</h3>
              </div>
              <p className="text-gray-600 mb-4">Diskutera och dela erfarenheter</p>
              <Link href="/dashboard/community">
                <button className="w-full bg-[#FFB5A7] text-white rounded-lg py-3 hover:bg-[#FFA493] transition-colors">
                  Gå till community
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-[#014421] rounded-full p-3 mr-4">
                  <FiBook className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[#014421]">Bonusmaterial</h3>
              </div>
              <p className="text-gray-600 mb-4">Extra recept och tips för veckan</p>
              <button className="w-full bg-[#014421] text-white rounded-lg py-3 hover:bg-[#112A12] transition-colors">
                Öppna material
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day Modal */}
      {selectedDay && (
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          weekNumber={6}
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
        weekNumber={6}
        weekTitle={weekTitle}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
    </div>
  );
}

 