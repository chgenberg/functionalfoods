'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import Image from 'next/image';
import HelpGuide from '@/app/components/HelpGuide';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import DayModal from '@/app/dashboard/courses/components/DayModal';
import { dayImages } from '@/app/data/dayImages';
import { mealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';
import { Play, Clock, CheckCircle, Book, Download, TrendingUp, Award, Star, ChevronRight, Users, ShoppingCart, Calendar, Lock, ArrowRight, Settings, HelpCircle, Sun } from 'lucide-react';

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

interface WeekTemplateProps {
  weekNumber: number;
  courseType: 'basics' | 'flow' | 'energy';
  weekTitle: string;
  weekSubtitle: string;
  heroImage?: string;
  videoUrl?: string;
  mealPlans: any; // The specific meal plan data for this course
  courseStartDate: Date | null;
}

// Week-specific welcome messages
const weekMessages: Record<string, Record<number, string>> = {
  basics: {
    1: `Nu har du en spännande resa framför dig under dessa 6 veckor med näringsrika och hälsobringade recept och du kommer att få lära dig grunderna i Functional Foods. Du får praktiska kostscheman att följa, recept för alla måltider och inköpslistor för varje vecka.

Efter dessa 6 veckor har du dels lärt dig mycket om matlagning och hur du får in alla näringsämnen i din kost samt fördelarna som kommer: ökad näringsnivå, förbättrad matsmältning, bättre hjärthälsa, minskad inflammation i kroppen, ökade energinivåer och ett bättre immunförsvar.

Du kommer att tacka dig själv, även om det kan finnas dagar när det känns tufft. Mitt bästa tips är planering! Förbered dig för veckan och laga gärna upp flera maträtter på samma gång så att du är väl förberedd.

Varmt välkommen till framtidens kost för en god hälsa och ett friskare liv!

/Ulrika`,
    2: "Vecka 2 fokuserar på proteiner och aminosyror - kroppens byggstenar. Du kommer att lära dig om olika proteinkällor och hur du optimerar ditt proteinintag för bättre hälsa och återhämtning.",
    3: "Denna vecka dyker vi djupt in i fetter och kolhydrater. Du får lära dig skillnaden mellan olika typer av fetter och kolhydrater samt hur de påverkar din kropp och energinivåer.",
    4: "Vecka 4 handlar om vitaminer och mineraler - de essentiella mikronäringsämnena. Du upptäcker hur du säkerställer att du får i dig alla viktiga vitaminer och mineraler genom din kost.",
    5: "Nu utforskar vi antioxidanter och fytokemikalier - naturens egna försvarssystem. Lär dig hur dessa kraftfulla ämnen skyddar din kropp och främjar långsiktig hälsa.",
    6: "Sista veckan! Nu sätter vi ihop alla pusselbitar och skapar en hållbar livsstil. Du får verktyg och strategier för att fortsätta din resa mot optimal hälsa."
  },
  flow: {
    1: "Välkommen till Functional Flow! Under dessa 6 veckor kommer du att optimera din energi och prestationsförmåga genom avancerad näringsplanering.",
    2: "Vecka 2 fokuserar på avancerad näringsoptimering. Du lär dig att finjustera din kost för maximal energi och mental klarhet.",
    3: "Denna vecka handlar om prestationshöjande kost. Upptäck hur du kan använda mat som ett verktyg för att nå dina mål.",
    4: "Vecka 4 introducerar antiinflammatorisk livsstil. Lär dig hur du minskar inflammation och främjar återhämtning genom kosten.",
    5: "Nu utforskar vi longevity och återhämtning. Få insikter i hur du kan optimera din kost för ett långt och hälsosamt liv.",
    6: "Sista veckan fokuserar på personlig optimering. Du får verktyg att skräddarsy din kost efter dina unika behov och mål."
  },
  energy: {
    1: "Välkommen till Functional Energy! Under dessa 6 veckor kommer du att lära dig att stabilisera din energi och blodsocker genom smart mat.",
    2: "Vecka 2 fokuserar på blodsocker och energi. Du får djupare förståelse för hur olika livsmedel påverkar dina energinivåer.",
    3: "Denna vecka handlar om måltidsplanering för stabil energi. Lär dig att strukturera dina måltider för jämn energi hela dagen.",
    4: "Vecka 4 introducerar smarta kolhydrater. Upptäck vilka kolhydrater som ger långvarig energi utan blodsockertoppar.",
    5: "Nu fokuserar vi på energistabila vanor. Du får praktiska strategier för att skapa rutiner som stödjer din energi.",
    6: "Sista veckan handlar om långsiktig hållbarhet. Du får verktyg att bibehålla dina nya vanor och fortsätta må bra."
  }
};

export default function WeekTemplate({
  courseType,
  weekNumber,
  weekTitle,
  weekSubtitle,
  heroImage = '/Ulrika_portratt/udavidssondesktop.png',
  videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  mealPlans,
  courseStartDate
}: WeekTemplateProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayThumbnails, setDayThumbnails] = useState<Record<number, string>>({});
  const [mealImages, setMealImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = () => {
      setShowHelpGuide(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  // Get current week's meal plan
  const weekKey = `week${weekNumber}`;
  const mealPlan = mealPlans[weekKey];
  
  // Validate meal plan data
  if (!mealPlan && process.env.NODE_ENV === 'development') {
    console.warn(`No meal plan found for ${weekKey}. Available keys:`, Object.keys(mealPlans));
  }

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

  const weekDays = getDaysForWeek(weekNumber);

  // Load meal images for all meals in the week
  useEffect(() => {
    const loadMealImages = async () => {
      try {
        if (!mealPlan || !mealPlan.days) return;
        const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
        const allMeals: { name: string; slug: string | null; key: string }[] = [];

        for (let i = 0; i < 7; i++) {
          const dayNum = i + 1;
          const swedishDayKey = dayNames[i];
          const numberDayKey = `day${dayNum}`;
          const dayData = mealPlan.days[swedishDayKey] || mealPlan.days[numberDayKey];
          if (!dayData) continue;

          // Collect all meals for this day
          ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
            const meal = dayData[mealType];
            if (meal && meal.name) {
              let slug: string | null = null;
              if (meal.recipeLink) {
                try {
                  const url = new URL(meal.recipeLink, window.location.origin);
                  const parts = url.pathname.split('/');
                  slug = parts[parts.length - 1] || null;
                } catch {}
              }
              allMeals.push({ 
                name: meal.name, 
                slug: slug,
                key: `${dayNum}-${mealType}`
              });
            }
          });
        }

        if (allMeals.length === 0) return;

        console.log('🖼️ WeekTemplate fetching images for all meals:', allMeals.length);

        const resp = await fetch(`/api/recipes/batch-images?v=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          cache: 'no-store',
          body: JSON.stringify({ 
            recipeNames: allMeals.map(m => m.name), 
            recipeSlugs: allMeals.map(m => m.slug), 
            size: 'small',
            usage: 'card'
          })
        });
        
        if (!resp.ok) {
          console.error('❌ WeekTemplate batch-images failed:', resp.status);
          return;
        }
        
        const data = await resp.json();
        const images: Record<string, string> = data.images || {};
        
        // Map images by meal key
        const imageMap: Record<string, string> = {};
        allMeals.forEach((meal, idx) => {
          const url = images[meal.name];
          if (url) {
            imageMap[meal.key] = url;
          }
        });
        
        setMealImages(imageMap);
        console.log('✅ WeekTemplate loaded', Object.keys(imageMap).length, 'meal images');
      } catch (e) {
        console.error('❌ WeekTemplate image loading error:', e);
      }
    };
    loadMealImages();
  }, [mealPlan, weekNumber]);

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

  // Get the appropriate welcome message
  const welcomeMessage = weekMessages[courseType]?.[weekNumber] || '';

  return (
    <>
      {/* Welcome Message Box */}
      <div className="bg-gradient-to-b from-[#F3EFE3] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-[#014421]/10 relative overflow-hidden"
          >
            {/* Subtle pulsing glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#014421]/5 via-[#014421]/10 to-[#014421]/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="relative z-10">
              <div className="text-center mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-2">
                  {weekTitle}
                </h1>
                <p className="text-lg text-gray-600">
                  Vecka {weekNumber}
                </p>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700">
                {welcomeMessage.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Navigation */}
      <div className="bg-white shadow-lg -mt-2">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType={courseType} currentWeek={weekNumber} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Week Meals */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#014421] mb-4">Veckans måltider</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Klicka på en måltid för att se receptet
            </p>
          </div>

          {/* Days with Meals */}
          <div className="space-y-8">
            {weekDays.map((day) => {
              const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
              const swedishDayKey = dayNames[day.day - 1];
              const numberDayKey = `day${day.day}`;
              const dayData = mealPlan?.days?.[swedishDayKey] || mealPlan?.days?.[numberDayKey];
              
              if (!dayData) return null;

              const meals = [
                { type: 'breakfast', label: 'Frukost', data: dayData.breakfast },
                { type: 'lunch', label: 'Lunch', data: dayData.lunch },
                { type: 'dinner', label: 'Middag', data: dayData.dinner }
              ];

              return (
                <div key={day.day} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-[#014421]">{day.name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(weekNumber, day.day)}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {meals.map((meal) => {
                      if (!meal.data) return null;
                      
                      const mealName = meal.data.name.replace(/\s*\(\d+\s*kcal\)/, '');
                      const calorieMatch = meal.data.name.match(/\((\d+\s*kcal)\)/);
                      const calories = calorieMatch ? calorieMatch[1] : '';
                      const imageUrl = mealImages[`${day.day}-${meal.type}`];

                      return (
                        <motion.div
                          key={meal.type}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="group cursor-pointer"
                          onClick={() => {
                            if (meal.data.recipeLink) {
                              window.location.href = meal.data.recipeLink;
                            }
                          }}
                        >
                          <div className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                            <div className="aspect-[4/3] relative bg-gray-100">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={mealName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-16 h-16 bg-[#014421]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                      <span className="text-2xl">🍽️</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-4 bg-white">
                              <h4 className="font-semibold text-[#014421] mb-1">{meal.label}</h4>
                              <p className="text-sm text-gray-700 line-clamp-2">{mealName}</p>
                              {calories && (
                                <p className="text-xs text-gray-500 mt-1">{calories}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
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
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#014421]">Inköpslista</h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Skapa inköpslista för veckans måltider</p>
              <Link href={`/dashboard/courses/functional-${courseType}/inkopslista?week=${weekNumber}`}>
                <button className="w-full bg-[#014421] text-white rounded-lg py-2.5 sm:py-3 hover:bg-[#112A12] transition-colors text-sm sm:text-base">
                  Visa inköpslista
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#014421] rounded-full p-2.5 sm:p-3 mr-3 sm:mr-4">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
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
                  <Book className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
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

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpGuide} 
        onClose={() => setShowHelpGuide(false)} 
      />

      {/* Day Modal */}
      {selectedDay && mealPlan && weekDays && (
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          weekNumber={weekNumber}
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
            
            console.log('DayModal Debug (WeekTemplate):', {
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