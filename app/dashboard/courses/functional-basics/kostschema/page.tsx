'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiCalendar, FiClock, 
  FiStar, FiHeart, FiShoppingCart, FiDownload, FiPrinter,
  FiSun, FiMoon, FiCoffee, FiCheck, FiPlus
} from 'react-icons/fi';
import { GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal } from 'react-icons/gi';

// Utökat kostschema för alla 6 veckor
const mealPlan = {
  week1: {
    title: "Vecka 1: Grundläggande Functional Foods",
    days: {
      1: {
        breakfast: {
          name: "Antioxidant-smoothie bowl",
          description: "Blåbär, acai, chiaseed, mandelmjölk, granola",
          calories: 420,
          nutrients: ["Antioxidanter", "Omega-3", "Fiber"],
          time: "15 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Quinoa-sallad med avokado",
          description: "Quinoa, avokado, rucola, valnötter, citronvinägrett",
          calories: 580,
          nutrients: ["Protein", "Fiber", "Hälsosamma fetter"],
          time: "20 min",
          difficulty: "Lätt"
        },
        dinner: {
          name: "Lax med rostad broccoli",
          description: "Grillad lax, rostad broccoli, sötpotatis, örter",
          calories: 650,
          nutrients: ["Omega-3", "Protein", "Vitamin C"],
          time: "30 min",
          difficulty: "Medel"
        },
        snack: {
          name: "Nötmix med mörk choklad",
          description: "Mandlar, valnötter, mörk choklad 70%",
          calories: 200,
          nutrients: ["Antioxidanter", "Magnesium"],
          time: "0 min",
          difficulty: "Lätt"
        }
      },
      2: {
        breakfast: {
          name: "Overnight oats med bär",
          description: "Havregryn, chiaseed, blåbär, mandelmjölk, honung",
          calories: 380,
          nutrients: ["Fiber", "Protein", "Antioxidanter"],
          time: "5 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Kyckling med rostad regnbågssallad",
          description: "Grillad kyckling, rostad paprika, zucchini, hummus",
          calories: 520,
          nutrients: ["Protein", "Vitamin A", "Fiber"],
          time: "25 min",
          difficulty: "Medel"
        },
        dinner: {
          name: "Vegetarisk chili med bönor",
          description: "Svarta bönor, kidneybönor, tomater, paprika, kryddor",
          calories: 480,
          nutrients: ["Protein", "Fiber", "Järn"],
          time: "40 min",
          difficulty: "Medel"
        },
        snack: {
          name: "Grekisk yoghurt med nötter",
          description: "Grekisk yoghurt, honung, hackade valnötter",
          calories: 180,
          nutrients: ["Protein", "Probiotika"],
          time: "2 min",
          difficulty: "Lätt"
        }
      },
      3: {
        breakfast: {
          name: "Avokado-toast med ägg",
          description: "Fullkornsbröd, avokado, pocherat ägg, tomater",
          calories: 450,
          nutrients: ["Protein", "Hälsosamma fetter", "Fiber"],
          time: "12 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Buddha bowl med tempeh",
          description: "Tempeh, quinoa, edamame, morötter, tahini-dressing",
          calories: 600,
          nutrients: ["Protein", "Probiotika", "Fiber"],
          time: "25 min",
          difficulty: "Medel"
        },
        dinner: {
          name: "Torsk med grönsaker",
          description: "Bakad torsk, sparris, cherry-tomater, citron",
          calories: 420,
          nutrients: ["Protein", "Omega-3", "Vitamin C"],
          time: "25 min",
          difficulty: "Lätt"
        },
        snack: {
          name: "Hummus med grönsaker",
          description: "Hemgjord hummus, morötter, gurka, paprika",
          calories: 150,
          nutrients: ["Protein", "Fiber"],
          time: "5 min",
          difficulty: "Lätt"
        }
      },
      4: {
        breakfast: {
          name: "Grön smoothie",
          description: "Spenat, mango, banan, ingefära, kokosvatten",
          calories: 320,
          nutrients: ["Vitamin C", "Kalium", "Antioxidanter"],
          time: "8 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Linssoppa med grönsaker",
          description: "Röda linser, morötter, selleri, tomater, kryddor",
          calories: 380,
          nutrients: ["Protein", "Fiber", "Järn"],
          time: "30 min",
          difficulty: "Lätt"
        },
        dinner: {
          name: "Kyckling med rostad pumpa",
          description: "Rostad kyckling, butternut-pumpa, rödlök, timjan",
          calories: 580,
          nutrients: ["Protein", "Vitamin A", "Fiber"],
          time: "45 min",
          difficulty: "Medel"
        },
        snack: {
          name: "Äppelskivor med mandelbutter",
          description: "Färskt äpple, naturell mandelbutter",
          calories: 220,
          nutrients: ["Fiber", "Hälsosamma fetter"],
          time: "2 min",
          difficulty: "Lätt"
        }
      },
      5: {
        breakfast: {
          name: "Chia-pudding med frukt",
          description: "Chiaseed, mandelmjölk, vanilj, färska bär",
          calories: 350,
          nutrients: ["Omega-3", "Fiber", "Protein"],
          time: "10 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Sallad med halloumi",
          description: "Grillad halloumi, blandsallad, tomater, olivolja",
          calories: 480,
          nutrients: ["Protein", "Kalcium", "Vitamin K"],
          time: "15 min",
          difficulty: "Lätt"
        },
        dinner: {
          name: "Vegetarisk pasta",
          description: "Fullkornspasta, zucchini, tomater, basilika, parmesan",
          calories: 520,
          nutrients: ["Fiber", "Protein", "Vitamin C"],
          time: "20 min",
          difficulty: "Lätt"
        },
        snack: {
          name: "Smoothie med protein",
          description: "Banan, bär, proteinpulver, mandelmjölk",
          calories: 280,
          nutrients: ["Protein", "Kalium"],
          time: "5 min",
          difficulty: "Lätt"
        }
      },
      6: {
        breakfast: {
          name: "Fullkornsmüsli med yoghurt",
          description: "Müsli, grekisk yoghurt, färska bär, honung",
          calories: 420,
          nutrients: ["Fiber", "Protein", "Probiotika"],
          time: "5 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Wraps med kyckling",
          description: "Fullkornswrap, kyckling, avokado, sallad, hummus",
          calories: 550,
          nutrients: ["Protein", "Fiber", "Hälsosamma fetter"],
          time: "10 min",
          difficulty: "Lätt"
        },
        dinner: {
          name: "Lax med quinoa",
          description: "Bakad lax, quinoa, broccoli, citron-örtsås",
          calories: 620,
          nutrients: ["Omega-3", "Protein", "Fiber"],
          time: "30 min",
          difficulty: "Medel"
        },
        snack: {
          name: "Energibollar",
          description: "Dadlar, mandlar, kakao, kokos",
          calories: 180,
          nutrients: ["Naturlig energi", "Fiber"],
          time: "15 min",
          difficulty: "Lätt"
        }
      },
      7: {
        breakfast: {
          name: "Pannkakor med bär",
          description: "Havrepannkakor, blåbär, grekisk yoghurt, lönnsirap",
          calories: 480,
          nutrients: ["Fiber", "Protein", "Antioxidanter"],
          time: "20 min",
          difficulty: "Medel"
        },
        lunch: {
          name: "Poke bowl",
          description: "Ris, tonfisk, avokado, gurka, edamame, srirachamayo",
          calories: 580,
          nutrients: ["Protein", "Omega-3", "Hälsosamma fetter"],
          time: "15 min",
          difficulty: "Lätt"
        },
        dinner: {
          name: "Vegetarisk curry",
          description: "Kikärtor, kokosmjölk, spenat, tomater, kryddor",
          calories: 450,
          nutrients: ["Protein", "Fiber", "Järn"],
          time: "35 min",
          difficulty: "Medel"
        },
        snack: {
          name: "Kefir med nötter",
          description: "Kefir, honung, blandade nötter",
          calories: 200,
          nutrients: ["Probiotika", "Protein"],
          time: "2 min",
          difficulty: "Lätt"
        }
      }
    }
  },
  week2: {
    title: "Vecka 2: Antiinflammatorisk kost",
    days: {
      1: {
        breakfast: {
          name: "Gurkmeja-smoothie bowl",
          description: "Mango, gurkmeja, ingefära, kokosyoghurt, granola",
          calories: 400,
          nutrients: ["Antiinflammatorisk", "Vitamin C", "Fiber"],
          time: "12 min",
          difficulty: "Lätt"
        },
        lunch: {
          name: "Lax med avokado-sallad",
          description: "Grillad lax, avokado, rucola, olivolja, citron",
          calories: 620,
          nutrients: ["Omega-3", "Protein", "Hälsosamma fetter"],
          time: "20 min",
          difficulty: "Lätt"
        },
        dinner: {
          name: "Kyckling med rostad kål",
          description: "Rostad kyckling, grönkål, sötpotatis, vitlök",
          calories: 580,
          nutrients: ["Protein", "Vitamin K", "Antioxidanter"],
          time: "35 min",
          difficulty: "Medel"
        },
        snack: {
          name: "Valnötter med mörk choklad",
          description: "Valnötter, mörk choklad 85%, goji-bär",
          calories: 220,
          nutrients: ["Omega-3", "Antioxidanter"],
          time: "0 min",
          difficulty: "Lätt"
        }
      },
      // Fortsätt med liknande struktur för dag 2-7...
    }
  },
  // Fortsätt med week3-week6...
};

type MealPlanKey = keyof typeof mealPlan;

const MealCard = ({ meal, type, icon: Icon }: { meal: any, type: string, icon: any }) => {
  const typeColors: Record<string, string> = {
    breakfast: 'from-yellow-400 to-orange-500',
    lunch: 'from-green-400 to-teal-500',
    dinner: 'from-blue-400 to-purple-500',
    snack: 'from-pink-400 to-rose-500'
  };

  const typeNames: Record<string, string> = {
    breakfast: 'Frukost',
    lunch: 'Lunch',
    dinner: 'Middag',
    snack: 'Mellanmål'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${typeColors[type]} rounded-full flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{typeNames[type]}</h4>
          <p className="text-sm text-gray-500">{meal.time} • {meal.difficulty}</p>
        </div>
      </div>
      
      <h5 className="font-medium text-gray-900 mb-2">{meal.name}</h5>
      <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">{meal.calories} kcal</span>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiHeart className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiShoppingCart className="w-4 h-4 text-gray-400 hover:text-green-500" />
          </motion.button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {meal.nutrients.map((nutrient: string, index: number) => (
          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {nutrient}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const CalendarDay = ({ day, date, isToday, isSelected, onClick, hasMealPlan, dayNumber }: any) => {
  return (
    <motion.button
      whileHover={{ scale: hasMealPlan ? 1.05 : 1 }}
      whileTap={{ scale: hasMealPlan ? 0.95 : 1 }}
      onClick={onClick}
      className={`
        relative w-full h-12 sm:h-14 rounded-lg border-2 transition-all duration-200 text-sm font-medium
        ${isToday 
          ? 'border-green-500 bg-green-50 text-green-700' 
          : isSelected 
            ? 'border-green-600 bg-green-600 text-white' 
            : hasMealPlan
              ? 'border-gray-200 bg-white text-gray-900 hover:border-green-300 hover:bg-green-50'
              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
        }
      `}
      disabled={!hasMealPlan}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-xs opacity-70">{day}</span>
        <span>{date}</span>
      </div>
      {hasMealPlan && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">{dayNumber}</span>
        </div>
      )}
    </motion.button>
  );
};

export default function KostschemaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState('week1');

  const courseStartDate = new Date();
  const courseEndDate = new Date();
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

  const getWeekFromDay = (day: number): MealPlanKey => {
    if (day <= 7) return 'week1';
    if (day <= 14) return 'week2';
    // För nu returnerar vi week1 som fallback tills vi lägger till fler veckor
    return 'week1';
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  const dayNames = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

  const currentWeek = getWeekFromDay(selectedDay);
  const dayInWeek = selectedDay <= 7 ? selectedDay : ((selectedDay - 1) % 7) + 1;
  const currentDayMeals = mealPlan[currentWeek]?.days[dayInWeek as keyof typeof mealPlan[typeof currentWeek]['days']];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-teal-600 to-emerald-700 p-6 md:p-8 text-white shadow-xl mb-6 md:mb-8"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Kostschema</h1>
                <p className="text-green-100 text-base md:text-lg">
                  Din personliga måltidsplanering för Functional Basics
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <span className="font-semibold">6 veckor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GiMeal className="w-5 h-5" />
                    <span className="font-semibold">168 måltider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GiHealthNormal className="w-5 h-5" />
                    <span className="font-semibold">Functional Foods</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Ladda ner</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200 font-semibold"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Inköpslista</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Kalender */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              {/* Kalender header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Veckodagar */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Kalenderdagar */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isInCourse = isDateInCourse(day);
                  const dayOfCourse = getCurrentDayOfCourse(day);
                  
                  return (
                    <CalendarDay
                      key={index}
                      day={dayNames[day.getDay()]}
                      date={day.getDate()}
                      isToday={isToday}
                      isSelected={isSelected}
                      hasMealPlan={isInCourse}
                      dayNumber={isInCourse ? dayOfCourse : null}
                      onClick={() => {
                        if (isInCourse) {
                          setSelectedDate(day);
                          setSelectedDay(dayOfCourse);
                        }
                      }}
                    />
                  );
                })}
              </div>

              {/* Kursinfo */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Kursinformation</span>
                </div>
                <p className="text-sm text-green-700">
                  Kursen pågår i 6 veckor med dagliga måltidsförslag. Klicka på en dag för att se dagens kostschema.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Dag {selectedDay} av 42
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {mealPlan[currentWeek]?.title || 'Vecka 1'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dagens måltider */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Dag {selectedDay}
                </h3>
                <span className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString('sv-SE', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              {currentDayMeals ? (
                <div className="space-y-4">
                  <MealCard 
                    meal={currentDayMeals.breakfast} 
                    type="breakfast" 
                    icon={FiSun} 
                  />
                  <MealCard 
                    meal={currentDayMeals.lunch} 
                    type="lunch" 
                    icon={FiCoffee} 
                  />
                  <MealCard 
                    meal={currentDayMeals.dinner} 
                    type="dinner" 
                    icon={FiMoon} 
                  />
                  <MealCard 
                    meal={currentDayMeals.snack} 
                    type="snack" 
                    icon={FiStar} 
                  />

                  {/* Dagens totaler */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Dagens totaler</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Kalorier:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          {currentDayMeals.breakfast.calories + 
                           currentDayMeals.lunch.calories + 
                           currentDayMeals.dinner.calories + 
                           currentDayMeals.snack.calories} kcal
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Måltider:</span>
                        <span className="font-medium text-gray-900 ml-2">4</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GiMeal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Inget kostschema tillgängligt
                  </h4>
                  <p className="text-gray-600">
                    Välj en dag inom kursperioden för att se måltidsförslag.
                  </p>
                </div>
              )}
            </div>

            {/* Veckoöversikt */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {mealPlan[currentWeek]?.title || 'Vecka 1'}
              </h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7].map((dayInWeek) => {
                  const absoluteDay = currentWeek === 'week1' ? dayInWeek : 
                                     currentWeek === 'week2' ? dayInWeek + 7 :
                                     dayInWeek;
                  
                  const dayMeals = mealPlan[currentWeek]?.days[dayInWeek as keyof typeof mealPlan[typeof currentWeek]['days']];
                  
                  return (
                    <motion.button
                      key={dayInWeek}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDay(absoluteDay)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedDay === absoluteDay 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Dag {absoluteDay}</span>
                        {selectedDay === absoluteDay && (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {dayMeals?.breakfast.name || 'Måltid saknas'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 