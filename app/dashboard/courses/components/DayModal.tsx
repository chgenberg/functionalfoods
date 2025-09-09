'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { useState, useEffect } from 'react';
import { useFavoriteRecipes } from '@/app/hooks/useFavoriteRecipes';
import { X, Clock, ExternalLink, Info, CheckCircle, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface Meal {
  mealType: string;
  time: string;
  meal: string;
  calories: string;
  recipeLink?: string;
}

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  dayNumber: number;
  dayName: string;
  meals: Meal[];
  courseType: 'basics' | 'flow' | 'energy';
}

export default function DayModal({
  isOpen,
  onClose,
  weekNumber,
  dayNumber,
  dayName,
  meals,
  courseType
}: DayModalProps) {
  const [hoveredMeal, setHoveredMeal] = useState<number | null>(null);
  const [completedMeals, setCompletedMeals] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoriteRecipes();
  const [recipeImages, setRecipeImages] = useState<Record<string, string>>({});

  // Load meal progress when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMealProgress();
    }
  }, [isOpen, weekNumber, dayNumber, courseType]);

  // Fetch recipe images when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchRecipeImages = async () => {
        try {
          console.log('🖼️ DayModal fetching images for meals:', meals.map(m => m.meal));
          
          // Extract slugs from recipeLinks
          const recipeSlugs = meals.map(meal => {
            if (!meal.recipeLink) return null;
            try {
              const parts = meal.recipeLink.split('/');
              const slugPart = parts[parts.length - 1] || '';
              return slugPart.split('?')[0] || null;
            } catch {
              return null;
            }
          });
          console.log('🔗 With slugs:', recipeSlugs);

          const response = await fetch(`/api/recipes/batch-images?v=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            cache: 'no-store',
            body: JSON.stringify({
              recipeNames: meals.map(m => m.meal),
              recipeSlugs: recipeSlugs,
              size: 'medium',
              usage: 'card'
            })
          });

          if (!response.ok) {
            console.error('❌ DayModal batch-images failed:', response.status);
            // Set fallback for all on API error
            const placeholders: Record<string, string> = {};
            meals.forEach(meal => {
              placeholders[meal.meal] = '/api/images/recept_images_optimized/het-ratatouille-medium.webp';
            });
            setRecipeImages(placeholders);
            return;
          }

          const data = await response.json();
          const images = data.images || {};
          console.log('✅ DayModal received images:', images);
          console.log('🍽️ DayModal: Mapped', Object.keys(images).length, 'recipe images via fuzzy matching');
          setRecipeImages(images);
        } catch (error) {
          console.error('❌ DayModal image fetch error:', error);
          // Set fallback for all on error
          const placeholders: Record<string, string> = {};
          meals.forEach(meal => {
            placeholders[meal.meal] = '/api/images/Recept_complete2.0/images/_optimized/Agg%20i%20paprika.webp';
          });
          setRecipeImages(placeholders);
        }
      };
      
      fetchRecipeImages();
    }
  }, [isOpen, meals]);

  const loadMealProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(
        `/api/meal-progress?courseType=${courseType}&weekNumber=${weekNumber}&dayNumber=${dayNumber}`,
        { headers }
      );
      
      if (response.ok) {
        const data = await response.json();
        const completedIndices = data.progress
          .filter((p: any) => p.completed)
          .map((p: any) => p.mealIndex);
        setCompletedMeals(completedIndices);
      }
    } catch (error) {
      console.error('Error loading meal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed getMealIcon - now using actual recipe images

  const getMealGradient = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'frukost':
        return 'from-orange-100 to-yellow-100';
      case 'lunch':
        return 'from-green-100 to-emerald-100';
      case 'middag':
        return 'from-purple-100 to-pink-100';
      default:
        return 'from-gray-100 to-gray-200';
    }
  };

  const toggleMealComplete = async (index: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch('/api/meal-progress', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courseType,
          weekNumber,
          dayNumber,
          mealIndex: index,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state based on server response
        setCompletedMeals(prev => 
          data.progress.completed
            ? [...prev.filter(i => i !== index), index]
            : prev.filter(i => i !== index)
        );
      }
    } catch (error) {
      console.error('Error toggling meal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to find original recipe link for "rester" meals
  const getRecipeLink = (meal: Meal) => {
    if (meal.recipeLink) {
      // Add query parameters for course and week
      const url = new URL(meal.recipeLink, window.location.origin);
      url.searchParams.set('from', courseType);
      url.searchParams.set('week', weekNumber.toString());
      const token = localStorage.getItem('token');
      if (token) {
        url.searchParams.set('tk', token);
      }
      return url.pathname + url.search;
    }
    
    // If it's a "rester" meal, try to find the original recipe
    if (meal.meal.toLowerCase().includes('rester')) {
      let originalMealName = meal.meal;
      
      // Handle different patterns of "rester" meals
      // Pattern 1: "Meal name rester" (simple case)
      originalMealName = originalMealName.replace(/\s+rester\s*$/gi, '');
      
      // Pattern 2: "Meal name rester från frysen/fysen" 
      originalMealName = originalMealName.replace(/\s+rester\s+från\s+(frysen|fysen)\s*$/gi, '');
      
      // Pattern 3: "Meal name från fysenrester" (compound case)
      originalMealName = originalMealName.replace(/\s+från\s+(fysen|frysen)rester\s*$/gi, '');
      
      // Pattern 4: "Meal name1 och meal name2rester" (compound with och)
      originalMealName = originalMealName.replace(/rester\s*$/gi, '');
      
      // Clean up any trailing "och [something]" that might be part of rester description
      originalMealName = originalMealName.replace(/\s+och\s+[^,]*rester.*$/gi, '');
      
      // Remove any remaining "från fysen/frysen" references
      originalMealName = originalMealName.replace(/\s+från\s+(fysen|frysen)\s*$/gi, '');
      
      // Clean up extra whitespace and trim
      originalMealName = originalMealName.replace(/\s+/g, ' ').trim();
      
      // Mapping of meal names to actual recipe slugs
      const mealToSlugMapping: Record<string, string> = {
        // Basics meals
        'Het ratatouille': '/kunskapsbank/recept/het-ratatouille',
        'Squashspagetti med köttfärssås': '/kunskapsbank/recept/squashspagetti-kottfarssas',
        'Pokébowl med kyckling': '/kunskapsbank/recept/poke-bowl-kyckling',
        'Köttfärsbiffar med stekt blomkål': '/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal',
        'Kycklinggryta med bakad spetskål': '/kunskapsbank/recept/kycklinggryta-roda-linser',
        'Ugnsbakad tomat med köttfärs': '/kunskapsbank/recept/ugnsbakad-tomat-kottfars',
        'Nudelsoppa med grönsaker': '/kunskapsbank/recept/nudelsoppa-gronsaker-soppa',
        'Torskrygg med ägghack och sparris': '/kunskapsbank/recept/torskrygg-agghack-sparris',
        'Turkiska lammfärsspett med raita och sallad': '/kunskapsbank/recept/turkiska-lammfarsspett-raita-sallad',
        'Kycklingröra med örter och tomat': '/kunskapsbank/recept/kycklingrora-orter-tomat',
        'Lax med fetaost och rostade rotfrukter och brysselkål': '/kunskapsbank/recept/lax-fetaost-rostade',
        'Kycklingfylld aubergine': '/kunskapsbank/recept/kycklingfylld-aubergine',
        'Rökt lax med blomkålssallad och citronyoghurt': '/kunskapsbank/recept/rokt-lax-blomkalssallad-citronyoghurt',
        'Vegetarisk currygryta med panéer': '/kunskapsbank/recept/vegetarisk-currygryta-paneer',
        'Högrevsburgare med hummus': '/kunskapsbank/recept/hogrevsburgare-hummus',
        'Ugnsbakad kyckling med tzatziki och sallad': '/kunskapsbank/recept/ugnsbakad-kyckling-tzatziki-sallad',
        'Lax med waldorfsallad': '/kunskapsbank/recept/lax-waldorfsallad-sallad',
        'Grekiska köttbullar i tomatsås med rostad sötpotatis': '/kunskapsbank/recept/grekiska-kottbullar-tomatsas-rostad',
        'Kycklinggryta med röda linser': '/kunskapsbank/recept/kycklinggryta-roda-linser',
        'Laxsallad med vindruvor': '/kunskapsbank/recept/laxsallad-vindruvor-sallad',
        'Grillade köttspett med grekisk sallad och morotstzatziki': '/kunskapsbank/recept/grillade-kottspett-grekisk-sallad',
        'Torsk från mellanöstern': '/kunskapsbank/recept/torsk-mellanostern',
        'Japansk kycklingfärswok med groddar': '/kunskapsbank/recept/japansk-kycklingfarswok-groddar',
        'Grekisk sallad med fetaost': '/kunskapsbank/recept/grekisk-sallad-sallad',
        'Köttfärslimpa med ajvar och rostad sötpotatis': '/kunskapsbank/recept/kottfarslimpa-ajvar-rostad',
        'Skaldjursgryta med torsk i gul curry': '/kunskapsbank/recept/skaldjursgryta-torsk-gul',
        'Kycklingjärpar med linssallad': '/kunskapsbank/recept/kycklingjarpar-linssallad-sallad',
        'Laxfilé med ratatouille': '/kunskapsbank/recept/laxfile-ratatouille',
        'Grönsakswok med kyckling': '/kunskapsbank/recept/gronsakswok-kyckling',
        'Köttfärspytt med italienska smaker': '/kunskapsbank/recept/kottfarspytt-italienska-smaker',
        'Indisk laxgryta med röda linser': '/kunskapsbank/recept/indisk-laxgryta-roda',
        'Quinoasallad med stekt halloumi': '/kunskapsbank/recept/quinoasallad-stekt-halloumi',
        'Torsk teriyaki med grönsaker': '/kunskapsbank/recept/torsk-teriyaki-gronsaker',
        'Lammgryta med plommon och bulgur': '/kunskapsbank/recept/lammgryta-plommon-bulgur',
        
        // Flow meals
        'Linssoppa från medelhavet': '/kunskapsbank/recept/linssoppa-medelhavet-soppa',
        'Kycklingburgare med papayasallad': '/kunskapsbank/recept/kycklingburgare-papayasallad-sallad',
        'Köttfärsbiffar med tomatsallad': '/kunskapsbank/recept/kottfarsbiffar-tomatsallad-sallad',
        'Laxgratäng med scampi och broccoli': '/kunskapsbank/recept/laxgratang-broccoli-scampi',
        'Kycklinggryta från medelhavet': '/kunskapsbank/recept/kycklinggryta-medelhavet-gryta',
        'Fänkålssallad med grapefrukt och burrata': '/kunskapsbank/recept/fankalssallad-grapefrukt-burrata',
        'Entrecote med haricot verts och bearnaisesås': '/kunskapsbank/recept/stek-torsk-bearnaisesas',
        'Grönsakswok med tonfisk och ägg': '/kunskapsbank/recept/gronsakswok-tonfisk-agg',
        'Lövbiffsgryta med champinjoner och grönsaksspagetti': '/kunskapsbank/recept/lovbiffsgryta-champinjoner-gronsaksspagetti',
        'Lax med rödbetssallad': '/kunskapsbank/recept/lax-rodbetssallad-sallad',
        'Kycklingpizza': '/kunskapsbank/recept/kycklingpizza',
        'Spenatsoppa med rostade pumpafrön': '/kunskapsbank/recept/spenatsoppa-rostade-pumpafrön',
        'Fisktaco med mangosalsa och sesamsås': '/kunskapsbank/recept/fisktaco-mangosalsa-sesamsas',
        'Ajvarspett med grekisk sallad och tzatziki': '/kunskapsbank/recept/ajvarspett-grekisk-sallad',
        'Färgstark fetaostsallad': '/kunskapsbank/recept/fargstark-fetaostsallad-sallad',
        'Nötfärstimbaler med chévreost och soltorkad tomat': '/kunskapsbank/recept/notfarstimbaler-chevreost-soltorkad',
        'Laxsallad med fetaost': '/kunskapsbank/recept/laxsallad-fetaost-sallad',
        'Torsk med guacamole och sötpotatis': '/kunskapsbank/recept/torsk-guacamole-sotpotatis',
        'Biff med nudelsallad och jordnötssås': '/kunskapsbank/recept/biff-nudelsallad-jordnotssas',
        'Morotssoppa med ingefära och rostade kikärtor': '/kunskapsbank/recept/morotssoppa-ingefara-rostade',
        'Grönsakswok med kycklingfärs': '/kunskapsbank/recept/gronsakswok-kycklingfars',
        'Ugnsbakad blomkål med ratatouille': '/kunskapsbank/recept/ugnsbakad-blomkal-ratatouille',
        'Lövbiffsrullader med brie, pesto och rödbetor': '/kunskapsbank/recept/lovbiffsrullader-brie-pesto',
        'Torsk med saffranssås': '/kunskapsbank/recept/torsk-saffranssas',
        'Kycklingrullader med gorgonzola': '/kunskapsbank/recept/kycklingrullader-gorgonzola',
        'Valnötslax med fetaostcrème': '/kunskapsbank/recept/valnotslax-fetaostcreme',
        'Zucchiniplättar med yoghurtsås': '/kunskapsbank/recept/yoghurtsas-zucchiniplättar'
      };
      
      // Check if we have a direct mapping
      if (mealToSlugMapping[originalMealName]) {
        return mealToSlugMapping[originalMealName];
      }
      
      // If no direct mapping found, try to find a partial match
      for (const [mealName, slug] of Object.entries(mealToSlugMapping)) {
        if (mealName.toLowerCase().includes(originalMealName.toLowerCase()) || 
            originalMealName.toLowerCase().includes(mealName.toLowerCase())) {
          return slug;
        }
      }
    }
    
    return null;
  };

  const totalCalories = meals.reduce((total, meal) => {
    const match = meal.calories.match(/(\d+)/);
    return total + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Solid Green */}
            <div className="relative bg-[#014421] text-white p-4 sm:p-6">
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl sm:text-3xl font-bold mb-2"
                    >
                      {dayName}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-white/90 text-sm sm:text-base"
                    >
                      Vecka {weekNumber} • Dag {dayNumber}
                    </motion.p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="text-2xl" />
                  </motion.button>
                </div>

                {/* Progress and Total Calories */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-lg" />
                    <span className="text-sm text-white/90">
                      {completedMeals.length} av {meals.length} måltider genomförda
                    </span>
                  </div>
                  <div className="text-sm text-white/90">
                    Totalt: <span className="font-semibold">{totalCalories} kcal</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-white/80 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedMeals.length / meals.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>
              </div>
            </div>

            {/* Meals Container */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(85vh-280px)]">
              <div className="space-y-3">
                {meals.map((meal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    onMouseEnter={() => setHoveredMeal(index)}
                    onMouseLeave={() => setHoveredMeal(null)}
                    className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer
                      ${completedMeals.includes(index) 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : `bg-gradient-to-r ${getMealGradient(meal.mealType)} hover:shadow-lg`
                      }
                    `}
                    onClick={() => toggleMealComplete(index)}
                  >
                    {/* Completed Checkmark */}
                    <AnimatePresence>
                      {completedMeals.includes(index) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1"
                        >
                          <CheckCircle className="text-xl" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Recipe Image instead of emoji */}
                        <motion.div 
                          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shadow-sm flex-shrink-0 bg-gray-100"
                          animate={{ 
                            scale: hoveredMeal === index ? 1.08 : 1,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Image
                            src={recipeImages[meal.meal] || '/images/recipe-placeholder.svg'}
                            alt={meal.meal}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 48px, 56px"
                            priority={index < 3}
                          />
                          {/* Subtle overlay on hover */}
                          <motion.div
                            className="absolute inset-0 bg-black"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredMeal === index ? 0.1 : 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        </motion.div>
                        
                        <div className="flex-1">
                          <div className="flex items-baseline gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {meal.mealType}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="text-xs" />
                              <span>{meal.time}</span>
                            </div>
                          </div>
                          
                          <p className={`text-gray-800 font-medium transition-all
                            ${completedMeals.includes(index) ? 'line-through opacity-60' : ''}
                          `}>
                            {meal.meal.toLowerCase().includes('rester') ? (
                              <span>
                                {meal.meal.replace(/\s*rester\s*/gi, ' ')}
                                <span className="font-bold text-[#014421]">rester</span>
                              </span>
                            ) : (
                              meal.meal
                            )}
                          </p>
                          
                          {getRecipeLink(meal) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="mt-3"
                            >
                              <Link
                                href={getRecipeLink(meal)!}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 text-[#014421] hover:text-[#116530] 
                                  transition-all text-sm font-medium group"
                              >
                                <span className="underline underline-offset-2 group-hover:underline-offset-4">
                                  {meal.meal.toLowerCase().includes('rester') ? 'Se ursprungsreceptet' : 'Se receptet'}
                                </span>
                                <ExternalLink className="text-base group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                              </Link>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Star Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            const recipeData = {
                              name: meal.meal,
                              recipeLink: getRecipeLink(meal) || undefined,
                              courseType,
                              weekNumber,
                              dayName,
                              mealType: meal.mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
                            };
                            toggleFavorite(recipeData);
                          }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-full transition-all ${
                            isFavorite({
                              name: meal.meal,
                              recipeLink: getRecipeLink(meal) || undefined,
                              courseType,
                              weekNumber,
                              dayName,
                              mealType: meal.mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
                            })
                              ? 'bg-yellow-400 text-yellow-800 shadow-lg'
                              : 'bg-white/60 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                          }`}
                          title={isFavorite({
                            name: meal.meal,
                            recipeLink: getRecipeLink(meal) || undefined,
                            courseType,
                            weekNumber,
                            dayName,
                            mealType: meal.mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
                          }) ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
                        >
                          <Star className={`text-lg ${
                            isFavorite({
                              name: meal.meal,
                              recipeLink: getRecipeLink(meal) || undefined,
                              courseType,
                              weekNumber,
                              dayName,
                              mealType: meal.mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
                            }) ? 'fill-current' : ''
                          }`} />
                        </motion.button>

                        {/* Calories Badge */}
                        <motion.div
                          animate={{ scale: hoveredMeal === index ? 1.1 : 1 }}
                          className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors
                            ${completedMeals.includes(index)
                              ? 'bg-green-200 text-green-800'
                              : 'bg-white/80 text-gray-700'
                            }
                          `}
                        >
                          {meal.calories}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tips Section - Compact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex items-center gap-2">
                  <Info className="text-blue-500 text-lg flex-shrink-0" />
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Tips:</span> Klicka på måltider för att markera som genomförda
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium 
                    rounded-full transition-colors order-2 sm:order-1"
                >
                  Stäng
                </motion.button>
                
                <Link 
                  href={`/dashboard/courses/functional-${courseType}/inkopslista?week=${weekNumber}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#014421] hover:bg-[#116530] 
                    text-white font-medium rounded-full transition-colors group order-1 sm:order-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Se inköpslista</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 