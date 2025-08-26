'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiClock, FiUsers, FiHeart, FiShare2, FiBookmark, 
  FiCheck, FiPlus, FiMinus, FiPrinter, FiX,
  FiChevronDown, FiChevronUp, FiStar, FiCamera
} from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import { GiCookingPot } from 'react-icons/gi';
import { useT } from '@/app/lib/i18n/LanguageProvider';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  imageMobileUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  instructions?: string | string[];
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  nutrition?: any;
  tips?: string;
  tags?: string[];
  isPremium: boolean;
  isFree: boolean;
  status: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
  };
}

export default function RecipePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const t = useT();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [nutrition, setNutrition] = useState<any>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchRecipe();
    }
  }, [slug, user]);

  useEffect(() => {
    if (recipe) {
      // Use nutrition from DB if available and in correct format, otherwise calculate
      if (recipe.nutrition && recipe.nutrition.perServing) {
        setNutrition(recipe.nutrition);
        setNutritionLoading(false);
      } else {
        calculateNutrition();
      }
    }
  }, [recipe]);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const token = getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/recipes?slug=${slug}`, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Receptet kunde inte hittas');
        }
        throw new Error('Kunde inte ladda receptet');
      }

      const data = await response.json();
      
      if (data.recipes && data.recipes.length > 0) {
        const foundRecipe = data.recipes[0];
        setRecipe(foundRecipe);
        setServings(foundRecipe.servings || 4);
      } else {
        throw new Error('Receptet kunde inte hittas');
      }
      
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av receptet');
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrition = async () => {
    if (!recipe?.ingredients || recipe.ingredients.length === 0) return;
    
    if (recipe.nutrition && recipe.nutrition.perServing) {
      setNutrition(recipe.nutrition);
      return;
    }

    try {
      setNutritionLoading(true);
      
      const response = await fetch('/api/recipes/calculate-nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: recipe.ingredients,
          servings: recipe.servings || 4
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNutrition(data.nutrition);
      } else {
        console.error('Failed to calculate nutrition:', response.statusText);
      }
    } catch (error) {
      console.error('Error calculating nutrition:', error);
    } finally {
      setNutritionLoading(false);
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: recipe?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Länk kopierad!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scaleIngredient = (ingredient: string, originalServings: number = 4) => {
    if (!ingredient || servings === originalServings) return ingredient;

    const ratio = servings / originalServings;
    // Updated regex to avoid scaling percentages (%) and other non-quantity numbers
    // Only scale numbers that are followed by measurement units or are standalone quantities
    const regex = /(\d+(?:[.,]\d+)?)\s*(dl|ml|l|kg|g|mg|msk|tsk|krm|st|stk|styck|stycken|klyftor|klyva|skivor|skiva)(?!\s*%)/gi;
    
    return ingredient.replace(regex, (match, amount, unit) => {
      // Skip if this looks like a percentage or temperature
      if (ingredient.includes('%') && match.includes(amount)) {
        // Check if this number is part of a percentage
        const matchIndex = ingredient.indexOf(match);
        const afterMatch = ingredient.substring(matchIndex + match.length, matchIndex + match.length + 5);
        if (afterMatch.includes('%')) {
          return match; // Don't scale percentages
        }
      }
      
      const num = parseFloat(amount.replace(',', '.'));
      const scaled = num * ratio;
      
      let formatted: string;
      if (scaled < 1 && unit && ['dl', 'l', 'kg'].includes(unit.toLowerCase())) {
        if (unit.toLowerCase() === 'dl') {
          formatted = `${Math.round(scaled * 100)} ml`;
        } else if (unit.toLowerCase() === 'l') {
          formatted = `${Math.round(scaled * 10)} dl`;
        } else if (unit.toLowerCase() === 'kg') {
          formatted = `${Math.round(scaled * 1000)} g`;
        } else {
          formatted = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1).replace('.', ',');
          if (unit) formatted += ` ${unit}`;
        }
      } else {
        formatted = scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1).replace('.', ',');
        if (unit) formatted += ` ${unit}`;
      }
      
      return formatted;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('recipes.detail.loading','Laddar recept...')}</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FiX className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('recipes.detail.notFoundTitle','Receptet hittades inte')}</h1>
          <p className="text-gray-600 mb-6">{error || t('recipes.detail.notFoundText','Det verkar som att receptet du letar efter inte finns.')}</p>
          <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            <FiArrowLeft />
            {t('recipes.detail.backToRecipes','Tillbaka till recept')}
          </Link>
        </div>
      </div>
    );
  }

  const scaledIngredients = recipe.ingredients.map(ing => 
    scaleIngredient(ing, recipe.servings)
  );

  // Handle instructions - could be string or array from API
  let instructionSteps: string[] = [];
  if (recipe.instructions) {
    if (Array.isArray(recipe.instructions)) {
      instructionSteps = recipe.instructions;
    } else if (typeof recipe.instructions === 'string') {
      // First try to split by numbered steps (1., 2., etc.)
      const numberedSteps = recipe.instructions.split(/\d+\./).filter(step => step.trim()).map(step => step.trim());
      
      if (numberedSteps.length > 1) {
        // Has numbered steps
        instructionSteps = numberedSteps;
      } else {
        // No numbered steps, split by sentences for better readability
        instructionSteps = recipe.instructions
          .split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ])/) // Split on sentence boundaries
          .filter(step => step.trim().length > 10) // Filter out very short fragments
          .map(step => step.trim());
        
        // If still only one long step, try splitting on common cooking verbs.
        // This handles cases where instructions are a single run-on sentence.
        if (instructionSteps.length <= 1) {
          // Regex looks for a verb at the beginning of a phrase (case-insensitive)
          instructionSteps = recipe.instructions
            .split(/\s*(?=(Blanda|Forma|Hetta|Stek|Dela|Krydda|Servera|Tillsätt|Värm|Koka|Rör|Hacka|Skiva|Lägg|Placera)\b)/i)
            .filter(step => step && step.trim().length > 5) // Ensure step is not empty
            .map(step => step.trim().replace(/\.$/, '') + '.'); // Ensure each step ends with a period
        }
      }
    }
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-recipe, #printable-recipe * {
            visibility: visible;
          }
          #printable-recipe {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-inside: avoid;
          }
          h1 { font-size: 24pt; }
          h2 { font-size: 16pt; }
          p, li { font-size: 11pt; }
          @page {
            margin: 2cm;
          }
        }
      `}</style>

      <div id="printable-recipe" className="bg-gray-50 min-h-screen">
        {/* Back Button - No Print */}
        <div className="container mx-auto px-4 py-4 no-print">
          <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
            <FiArrowLeft />
            <span>{t('recipes.detail.backToRecipes','Tillbaka till recept')}</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-12">
          {/* Hero Section with Image */}
          <div className="bg-white rounded-t-3xl shadow-xl overflow-hidden">
            {/* Image Container - Responsive and Better Handling */}
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-100">
              {(recipe.imageUrl || recipe.imageMobileUrl) && !imageError ? (
                <>
                  {/* Mobile image */}
                  <Image
                    src={recipe.imageMobileUrl || recipe.imageUrl!}
                    alt={recipe.imageAlt || recipe.title}
                    fill
                    className="object-cover recipe-image block md:hidden"
                    style={{ objectFit: 'cover', objectPosition: 'center', imageOrientation: 'from-image' }}
                    priority
                    sizes="100vw"
                    onError={() => setImageError(true)}
                  />
                  {/* Desktop image */}
                  {recipe.imageUrl && (
                    <Image
                      src={recipe.imageUrl}
                      alt={recipe.imageAlt || recipe.title}
                      fill
                      className="object-cover recipe-image hidden md:block"
                      style={{ objectFit: 'cover', objectPosition: 'center', imageOrientation: 'from-image' }}
                      priority
                      sizes="(max-width: 1200px) 80vw, 70vw"
                      onError={() => setImageError(true)}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
                  <FiCamera className="w-20 h-20 text-orange-300" />
                </div>
              )}

              {/* Gradient Overlay for Better Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Recipe Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.categories.map((category, index) => (
                    <span key={index} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-3">{recipe.title}</h1>
                {recipe.excerpt && (
                  <p className="text-lg opacity-90 max-w-3xl">{recipe.excerpt}</p>
                )}
              </div>
            </div>

            {/* Recipe Info Bar */}
            <div className="bg-white border-t border-gray-100 px-6 md:px-10 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  {recipe.prepTime && (
                    <div className="flex items-center gap-2">
                      <FiClock className="text-orange-500" />
                      <span className="text-gray-600">Förberedelse: {recipe.prepTime}</span>
                    </div>
                  )}
                  {recipe.cookTime && (
                    <div className="flex items-center gap-2">
                      <FiClock className="text-orange-500" />
                      <span className="text-gray-600">Tillagning: {recipe.cookTime}</span>
                    </div>
                  )}
                  {recipe.difficulty && (
                    <div className="flex items-center gap-2">
                      <FiStar className="text-orange-500" />
                      <span className="text-gray-600">{recipe.difficulty}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex items-center gap-2 no-print">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-3 rounded-full transition-colors ${
                      isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-3 rounded-full transition-colors ${
                      isBookmarked ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                  >
                    <FiBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrint}
                    className="p-3 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  >
                    <FiPrinter className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-b-3xl shadow-xl px-6 md:px-10 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Ingredients Column */}
              <div className="lg:col-span-1 print-break">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center text-orange-600">
                    <FiBookmark className="w-5 h-5" />
                  </span>
                  {t('recipes.detail.ingredients','Ingredienser')}
                </h2>

                {/* Servings Selector - No Print */}
                <div className="bg-orange-50 rounded-xl p-4 mb-6 no-print">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{t('recipes.detail.servings','Portioner')}</span>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setServings(Math.max(1, servings - 1))}
                        className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-orange-600"
                      >
                        <FiMinus />
                      </motion.button>
                      <span className="text-2xl font-bold text-orange-600 w-12 text-center">{servings}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setServings(servings + 1)}
                        className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-orange-600"
                      >
                        <FiPlus />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Print Servings Info */}
                <div className="hidden print:block mb-4">
                  <p className="font-medium">{t('recipes.detail.forServings','För')} {servings} {t('recipes.detail.portions','portioner')}</p>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2">
                  {scaledIngredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleIngredient(index)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all no-print ${
                        checkedIngredients.includes(index) 
                          ? 'bg-background text-secondary' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all no-print ${
                        checkedIngredients.includes(index) 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-300'
                      }`}>
                        {checkedIngredients.includes(index) && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`${checkedIngredients.includes(index) ? 'line-through' : ''}`}>
                        {ingredient}
                      </span>
                    </motion.div>
                  ))}
                </div>




              </div>

              {/* Instructions Column */}
              <div className="lg:col-span-2 print-break">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center text-orange-600">
                    <GiCookingPot className="w-5 h-5" />
                  </span>
                  {t('recipes.detail.instructions','Gör så här')}
                </h2>

                <div className="space-y-4">
                  {instructionSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleStep(index)}
                      className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                        checkedSteps.includes(index) 
                          ? 'bg-background' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition-all ${
                        checkedSteps.includes(index) 
                          ? 'bg-primary text-white' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {checkedSteps.includes(index) ? <FiCheck /> : index + 1}
                      </div>
                      <p className={`text-gray-700 pt-2 ${checkedSteps.includes(index) ? 'line-through opacity-60' : ''}`}>
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Tips Section */}
                {recipe.tips && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-yellow-50 rounded-xl p-6 print-break"
                  >
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Tips & tricks
                    </h3>
                    <p className="text-yellow-800 leading-relaxed">
                      {recipe.tips}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Nutrition Information */}
            {(nutrition || nutritionLoading) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 print-break"
              >
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors no-print"
                >
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-background-secondary w-10 h-10 rounded-full flex items-center justify-center text-primary">
                      <FiHeart className="w-5 h-5" />
                    </span>
                    {t('recipes.detail.nutrition','Näringsvärden')}
                  </h3>
                  {showNutrition ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                <AnimatePresence>
                  {showNutrition && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {nutritionLoading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                          <p className="text-gray-600 mt-2">{t('recipes.detail.calculating','Beräknar näringsvärden...')}</p>
                        </div>
                      ) : nutrition ? (
                        <div className="p-6">
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Per portion ({recipe.servings || 4} portioner totalt)</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600">{t('recipes.detail.kcal','Kalorier')}</p>
                              <p className="text-2xl font-bold text-gray-900">{nutrition?.perServing?.calories || '-'}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600">{t('recipes.detail.protein','Protein')}</p>
                              <p className="text-2xl font-bold text-gray-900">{nutrition?.perServing?.protein || '-'}g</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600">{t('recipes.detail.carbs','Kolhydrater')}</p>
                              <p className="text-2xl font-bold text-gray-900">{nutrition?.perServing?.carbs || '-'}g</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600">{t('recipes.detail.fat','Fett')}</p>
                              <p className="text-2xl font-bold text-gray-900">{nutrition?.perServing?.fat || '-'}g</p>
                            </div>
                          </div>
                          
                          {/* Total nutrition info */}
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-3">Totalt för hela receptet</p>
                            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                              <div className="text-center">
                                <span className="font-medium">{nutrition?.total?.calories || '-'}</span>
                                <br />kcal
                              </div>
                              <div className="text-center">
                                <span className="font-medium">{nutrition?.total?.protein || '-'}g</span>
                                <br />protein
                              </div>
                              <div className="text-center">
                                <span className="font-medium">{nutrition?.total?.carbs || '-'}g</span>
                                <br />kolh.
                              </div>
                              <div className="text-center">
                                <span className="font-medium">{nutrition?.total?.fat || '-'}g</span>
                                <br />fett
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>


        </div>
      </div>
    </>
  );
}