'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiShoppingCart, FiBook, FiTarget,
  FiChevronRight, FiClock, FiUsers, FiCheckCircle, FiDownload,
  FiStar, FiHeart, FiAward, FiTrendingUp, FiSun, FiLock, FiArrowRight,
  FiPlay, FiHelpCircle
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal,
  GiWheat, GiMeat, GiWaterBottle
} from 'react-icons/gi';
import { FaLeaf } from 'react-icons/fa';
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';
import { getWeekData } from '@/app/data/mealPlans';
import { dayImages } from '@/app/data/dayImages';
import HelpGuide from '@/app/components/HelpGuide';
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';
import VideoModal from '@/app/dashboard/courses/components/VideoModal';
import DayModal from '@/app/dashboard/courses/components/DayModal';

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

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export default function Week1Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Add current week/day handling to mirror main dashboard
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const weekTitle = "Grunden i Functional Foods";

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedStartDate = window.localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const calculatedWeek = 2; // force to this week
      const calculatedDay = Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else {
      const today = new Date();
      window.localStorage.setItem('basicsStartDate', today.toISOString());
      setCourseStartDate(today);
    }
  }, []);

  const getDaysForWeek = (weekNumber: number): WeekDay[] => {
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    
    // Get actual current date
    const today = new Date();
    const savedStartDate = typeof window !== 'undefined' ? window.localStorage.getItem('basicsStartDate') : null;
    let isCurrentWeek = false;
    let actualCurrentDay = 0;
    
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const calculatedWeek = Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
      const calculatedDay = Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      
      isCurrentWeek = calculatedWeek === weekNumber;
      actualCurrentDay = isCurrentWeek ? calculatedDay : 0;
    }
    
    return dayNames.map((name, index) => {
      const dayNumber = index + 1;
      const totalDayNumber = (weekNumber - 1) * 7 + dayNumber;
      const currentTotalDay = Math.floor((today.getTime() - new Date(savedStartDate || today).getTime()) / (1000 * 3600 * 24)) + 1;
      
      return {
        day: dayNumber,
        name,
        completed: totalDayNumber < currentTotalDay,
        current: isCurrentWeek && dayNumber === actualCurrentDay,
        locked: false
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

  // Hämta centraliserad måltidsdata för vecka 1
  const weekData = getWeekData(1);
  
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
      {/* Hero with Video */}
      <WeekHeroWithVideo
        weekNumber={1}
        weekTitle={weekTitle}
        weekSubtitle="Upptäck hur rätt kost kan optimera din hälsa och välbefinnande"
        heroImage="/Ulrika_portratt/udavidssondesktop.png"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />

      {/* Course Navigation - After Hero Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="basics" currentWeek={1} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Days Journey */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Din vecka</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 md:gap-4">
            {getDaysForWeek(1).map((day) => (
              <div 
                key={day.day}
                className={`relative p-4 md:p-4 md:p-6 rounded-2xl transition-all ${day.current ? 'bg-[#FFB5A7] shadow-xl scale-105' : day.completed ? 'bg-white hover:shadow-lg' : day.locked ? 'bg-gray-50 opacity-60' : 'bg-white hover:shadow-lg'}`}
                onClick={() => !day.locked && setSelectedDay(day.day)}
              >
                {/* Date tag */}
                <div className={`
                  absolute -top-2 -right-2 px-3 py-1 text-xs rounded-full font-medium
                  ${day.current ? 'bg-[#014421] text-white' : 'bg-[#014421] text-white'}
                `}>
                  {day.current ? 'Idag' : formatDate(1, day.day).split('.')[0] + ' ' + formatDate(1, day.day).split(' ')[1]}
                </div>

                <div className="text-center">
                  <span className="text-xs md:text-sm text-gray-600 mb-1">{formatDate(1, day.day)}</span>
                  <h3 className="font-bold text-base md:text-base md:text-lg mb-3">{day.name}</h3>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 mx-auto overflow-hidden relative ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}`}>
                    {dayImages["1"]?.[day.day.toString()] ? (
                      <>
                        <Image
                          src={dayImages["1"][day.day.toString()]!}
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
                  <span className={`text-xs md:text-sm font-medium ${day.completed ? 'text-green-600' : day.current ? 'text-[#112A12]' : 'text-gray-400'}`}>{day.completed ? 'Genomförd' : day.current ? 'Påbörjad' : 'Planerad'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Meal Schedule List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#014421]">Frukost</span>
                        <span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded-full">07:00</span>
                      </div>
                      <p className="text-sm text-gray-700">{dayMeals.breakfast.name}</p>
                      {dayMeals.breakfast.recipeLink && (
                        <Link href={dayMeals.breakfast.recipeLink} className="text-sm text-orange-600 hover:underline mt-1 inline-block">Se recept →</Link>
                      )}
                    </div>
                  )}
                  {dayMeals.lunch && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#014421]">Lunch</span>
                        <span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded-full">12:00</span>
                      </div>
                      <p className="text-sm text-gray-700">{dayMeals.lunch.name}</p>
                      {dayMeals.lunch.recipeLink && (
                        <Link href={dayMeals.lunch.recipeLink} className="text-sm text-green-600 hover:underline mt-1 inline-block">Se recept →</Link>
                      )}
                    </div>
                  )}
                  {dayMeals.dinner && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#014421]">Middag</span>
                        <span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded-full">18:00</span>
                      </div>
                      <p className="text-sm text-gray-700">{dayMeals.dinner.name}</p>
                      {dayMeals.dinner.recipeLink && (
                        <Link href={dayMeals.dinner.recipeLink} className="text-sm text-purple-600 hover:underline mt-1 inline-block">Se recept →</Link>
                      )}
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

        {/* Hide old tabbed UI */}
        {false && (
          <>
            {/* Tab Navigation (hidden) */}
            <div className="mb-4 md:mb-8">
              <div className="bg-[#F3EFE3] rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-1.5 md:p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r text-white shadow-md md:shadow-lg transform scale-105'
                          : 'bg-white text-[#112A12] hover:bg-[#F3EFE3]'
                      } ${activeTab === tab.id ? tab.color : ''}`}
                    >
                      <tab.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                        activeTab === tab.id ? 'text-white' : 'text-[#112A12]'
                      }`} />
                      <span className={`text-xs md:text-sm font-medium ${
                        activeTab === tab.id ? 'text-white' : 'text-[#112A12]'
                      }`}>
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="pb-16">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Welcome Message */}
                    <div className="bg-primary rounded-3xl p-8 text-white shadow-xl">
                      <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 2!</h2>
                      <p className="text-lg leading-relaxed mb-6">
                        Nu har du kommit igång med din resa och det är dags att bygga vidare på grunderna. 
                        Denna vecka introducerar vi nya spännande recept och tekniker som kommer hjälpa dig 
                        att variera din kost samtidigt som du håller dig till Functional Foods principerna.
                      </p>
                      <p className="text-lg leading-relaxed">
                        Kom ihåg att lyssna på din kropp och anpassa portionsstorlekarna efter dina behov. 
                        Fokusera på att njuta av maten och känn hur din energi och välmående förbättras dag för dag.
                      </p>
                    </div>

                    {/* Week Progress */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 rounded-full p-3">
                          <FiTrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">Veckans fokus</h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-background rounded-xl p-6">
                              <h4 className="font-semibold text-gray-900 mb-3">Nya smaker</h4>
                              <p className="text-gray-700 mb-3">
                                Utforska nya kryddor och smakkombinationer. Prova de asiatiska 
                                köttbullarna och den turkiska lammfärsen för inspiration.
                              </p>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start space-x-2">
                                  <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                                  <span>Experimentera med kryddor</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                  <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                                  <span>Våga prova nya grönsaker</span>
                                </li>
                              </ul>
                            </div>
                            <div className="bg-background rounded-xl p-6">
                              <h4 className="font-semibold text-gray-900 mb-3">Meal prep</h4>
                              <p className="text-gray-700 mb-3">
                                Börja förbereda måltider i förväg. Många av veckans mellanmål 
                                lämpar sig utmärkt för att laga i större mängder.
                              </p>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start space-x-2">
                                  <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>Spara tid i vardagen</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                  <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>Minska matsvinn</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <GiMeal className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                        <h4 className="text-2xl font-bold text-gray-900">8</h4>
                        <p className="text-gray-600">Nya recept</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h4 className="text-2xl font-bold text-gray-900">2/6</h4>
                        <p className="text-gray-600">Veckor klara</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <GiFruitBowl className="w-12 h-12 text-primary mx-auto mb-3" />
                        <h4 className="text-2xl font-bold text-gray-900">30+</h4>
                        <p className="text-gray-600">Ingredienser</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                        <h4 className="text-2xl font-bold text-gray-900">100%</h4>
                        <p className="text-gray-600">Hälsosamt</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                  <motion.div
                    key="goals"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <GoalsSection weekNumber={2} />
                  </motion.div>
                )}

                {/* Meal Plan Tab */}
                {activeTab === 'mealplan' && (
                  <motion.div
                    key="mealplan"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Calendar View */}
                    <CalendarView mealPlan={mealPlan} weekNumber={2} />
                    
                    {/* Recipe Highlights */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Veckans mellanmål</h3>
                      <p className="text-gray-600">Upptäck nya smaker och tekniker med veckans utvalda recept.</p>
                    </div>
                  </motion.div>
                )}

                {/* Shopping List Tab */}
                {activeTab === 'shopping' && (
                  <motion.div
                    key="shopping"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Inköpslista</h3>
                      <p className="text-gray-600">Planera dina inköp för vecka 2.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Next Week Button */}
            <div className="pb-16">
              <div className="bg-primary rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Redo för nästa steg?</h3>
                <p className="text-lg mb-6">
                  När du känner dig redo, fortsätt till vecka 3 för att utforska flexibilitet och fasta.
                </p>
                <Link
                  href="/dashboard/courses/functional-basics/week/3"
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Fortsätt till vecka 3
                  <FiChevronRight className="ml-2" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Day Modal */}
      {selectedDay && (
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          weekNumber={1}
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
        weekNumber={1}
        weekTitle={weekTitle}
      />
      

    </div>
  );
}

 