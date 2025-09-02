'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, Check, ChevronDown, ChevronUp, Clock, Heart, Minus, Plus, Printer, Star, Users, X, Camera, ChefHat, Flame, Utensils } from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';
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
  const [nutrition, setNutrition] = useState<any>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchRecipe();
    }
  }, [slug, user]);

  useEffect(() => {
    if (recipe) {
      // Check if recipe is favorited
      const savedFavorites = localStorage.getItem('favoriteRecipeIds');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites) as string[];
        setIsFavorited(favoriteIds.includes(recipe.id));
      }
      
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
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/recipes/${slug}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t('recipes.detail.notFound','Receptet hittades inte'));
        } else if (response.status === 403) {
          throw new Error(t('recipes.detail.premiumRequired','Detta recept kräver en premium-prenumeration'));
        }
        throw new Error(t('recipes.detail.loadError','Kunde inte ladda receptet'));
      }

      const data = await response.json();
      setRecipe(data);
      
      // Initialize servings from recipe data
      if (data.servings) {
        setServings(data.servings);
      }
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError(err instanceof Error ? err.message : t('recipes.detail.unknownError','Ett okänt fel uppstod'));
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrition = async () => {
    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) return;
    
    setNutritionLoading(true);
    try {
      // Here you would normally call an API to calculate nutrition
      // For now, we'll set a placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Placeholder nutrition data
      setNutrition({
        perServing: {
          calories: Math.round(250 + Math.random() * 300),
          protein: Math.round(10 + Math.random() * 20),
          carbs: Math.round(20 + Math.random() * 40),
          fat: Math.round(5 + Math.random() * 15)
        },
        total: {
          calories: Math.round((250 + Math.random() * 300) * servings),
          protein: Math.round((10 + Math.random() * 20) * servings),
          carbs: Math.round((20 + Math.random() * 40) * servings),
          fat: Math.round((5 + Math.random() * 15) * servings)
        }
      });
    } catch (error) {
      console.error('Error calculating nutrition:', error);
    } finally {
      setNutritionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleFavorite = () => {
    if (!recipe) return;
    
    // Simple favorite system using localStorage with recipe IDs
    const savedFavorites = localStorage.getItem('favoriteRecipeIds');
    let favoriteIds: string[] = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    if (isFavorited) {
      // Remove from favorites
      favoriteIds = favoriteIds.filter(id => id !== recipe.id);
      setIsFavorited(false);
    } else {
      // Add to favorites
      if (!favoriteIds.includes(recipe.id)) {
        favoriteIds.push(recipe.id);
      }
      setIsFavorited(true);
    }
    
    localStorage.setItem('favoriteRecipeIds', JSON.stringify(favoriteIds));
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

  const scaleIngredient = (ingredient: string, originalServings: number = 4) => {
    const scaleFactor = servings / originalServings;
    
    return ingredient.replace(/(\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st|st\.|stycken|styck|burk|burkar|påse|påsar|förpackning|förpackningar)?/gi, 
      (match, amount, unit) => {
        const numAmount = parseFloat(amount.replace(',', '.'));
        let scaledAmount = numAmount * scaleFactor;
        
        // Format numbers nicely
        if (scaledAmount % 1 === 0) {
          return `${scaledAmount}${unit ? ' ' + unit : ''}`;
        } else if (scaledAmount < 1) {
          // For amounts less than 1, show fractions
          if (scaledAmount === 0.5) return `½${unit ? ' ' + unit : ''}`;
          if (scaledAmount === 0.25) return `¼${unit ? ' ' + unit : ''}`;
          if (scaledAmount === 0.75) return `¾${unit ? ' ' + unit : ''}`;
          if (scaledAmount === 0.33 || scaledAmount === 0.34) return `⅓${unit ? ' ' + unit : ''}`;
          if (scaledAmount === 0.67 || scaledAmount === 0.66) return `⅔${unit ? ' ' + unit : ''}`;
          return `${scaledAmount.toFixed(1).replace('.', ',')}${unit ? ' ' + unit : ''}`;
        } else {
          // For amounts greater than 1, show one decimal if needed
          const formatted = scaledAmount.toFixed(1);
          if (formatted.endsWith('.0')) {
            return `${Math.round(scaledAmount)}${unit ? ' ' + unit : ''}`;
          }
          return `${formatted.replace('.', ',')}${unit ? ' ' + unit : ''}`;
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF7E70] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('recipes.detail.loading','Laddar recept...')}</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('recipes.detail.notFoundTitle','Receptet hittades inte')}</h1>
          <p className="text-gray-600 mb-6">{error || t('recipes.detail.notFoundText','Det verkar som att receptet du letar efter inte finns.')}</p>
          <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 bg-[#FF7E70] text-white px-6 py-3 rounded-full hover:bg-[#ff6b5a] transition-colors">
            <ArrowLeft />
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
            .split(/\s*(?=(Blanda|Forma|Hetta|Stek|Dela|Krydda|Servera|Tillsätt|Värm|Koka|Rör|Hacka|Skiva|Lägg|Placera|Skär|Finhacka|Grädda|Toppa|Strö|Fyll|Smula)\b)/i)
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

      <div id="printable-recipe" className="bg-[#F3EFE3] min-h-screen">
        {/* Back Button - No Print */}
        <div className="container mx-auto px-4 py-6 no-print">
          <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 text-[#014421] hover:text-[#93C560] transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>{t('recipes.detail.backToRecipes','Tillbaka till recept')}</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Modern Layout with Better Portrait Image Handling */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Side - Image and Basic Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-8">
                {/* Image Container - Optimized for Portrait Images */}
                <div className="relative w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="relative aspect-[3/4] lg:aspect-[4/5]">
                    {(recipe.imageUrl || recipe.imageMobileUrl) && !imageError ? (
                      <Image
                        src={recipe.imageUrl || recipe.imageMobileUrl!}
                        alt={recipe.imageAlt || recipe.title}
                        fill
                        className="object-cover"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#93C560]/20 to-[#014421]/10">
                        <Camera className="w-20 h-20 text-[#014421]/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Recipe Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recipe.categories.map((category, index) => (
                        <span key={index} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          {category}
                        </span>
                      ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{recipe.title}</h1>
                    {recipe.excerpt && (
                      <p className="text-white/90 text-lg">{recipe.excerpt}</p>
                    )}
                  </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {recipe.prepTime && (
                    <div className="bg-white rounded-2xl p-4 text-center shadow-md">
                      <Clock className="w-6 h-6 text-[#93C560] mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Förberedelse</p>
                      <p className="font-bold text-[#014421]">{recipe.prepTime}</p>
                    </div>
                  )}
                  {recipe.cookTime && (
                    <div className="bg-white rounded-2xl p-4 text-center shadow-md">
                      <Flame className="w-6 h-6 text-[#FF7E70] mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Tillagning</p>
                      <p className="font-bold text-[#014421]">{recipe.cookTime}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl p-4 text-center shadow-md">
                    <Users className="w-6 h-6 text-[#014421] mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-1">Portioner</p>
                    <p className="font-bold text-[#014421]">{servings}</p>
                  </div>
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex gap-3 mt-6 no-print">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleFavorite}
                    className={`flex-1 p-4 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isFavorited 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Sparad' : 'Spara recept'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrint}
                    className="p-4 rounded-2xl bg-white shadow-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Right Side - Recipe Details */}
            <div className="lg:col-span-7">
              {/* Ingredients Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#014421] flex items-center gap-3">
                    <span className="bg-[#93C560]/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-[#93C560]" />
                    </span>
                    {t('recipes.detail.ingredients','Ingredienser')}
                  </h2>
                  
                  {/* Servings Selector - No Print */}
                  <div className="flex items-center gap-3 bg-[#F3EFE3] rounded-full px-4 py-2 no-print">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-[#014421]"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="text-lg font-bold text-[#014421] w-8 text-center">{servings}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setServings(servings + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-[#014421]"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Print Servings Info */}
                <div className="hidden print:block mb-4">
                  <p className="font-medium text-[#014421]">{t('recipes.detail.forServings','För')} {servings} {t('recipes.detail.portions','portioner')}</p>
                </div>

                {/* Ingredients Grid */}
                <div className="grid md:grid-cols-2 gap-3">
                  {scaledIngredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => toggleIngredient(index)}
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border-2 no-print ${
                        checkedIngredients.includes(index) 
                          ? 'bg-[#93C560]/10 border-[#93C560] text-gray-500' 
                          : 'bg-[#F3EFE3]/50 border-transparent hover:border-[#93C560]/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 mr-3 flex items-center justify-center transition-all flex-shrink-0 no-print ${
                        checkedIngredients.includes(index) 
                          ? 'bg-[#93C560] border-[#93C560]' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {checkedIngredients.includes(index) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className={`text-[#014421] ${checkedIngredients.includes(index) ? 'line-through opacity-60' : ''}`}>
                        {ingredient}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Instructions Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-[#014421] mb-8 flex items-center gap-3">
                  <span className="bg-[#FF7E70]/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-[#FF7E70]" />
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
                      className={`group cursor-pointer transition-all ${
                        checkedSteps.includes(index) ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`relative flex-shrink-0 transition-all ${
                          checkedSteps.includes(index) 
                            ? 'scale-90' 
                            : 'group-hover:scale-105'
                        }`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${
                            checkedSteps.includes(index) 
                              ? 'bg-[#93C560] text-white' 
                              : 'bg-[#FF7E70]/20 text-[#FF7E70] group-hover:bg-[#FF7E70]/30'
                          }`}>
                            {checkedSteps.includes(index) ? <Check className="w-6 h-6" /> : index + 1}
                          </div>
                          {index < instructionSteps.length - 1 && (
                            <div className={`absolute top-12 left-1/2 w-0.5 h-8 -translate-x-1/2 transition-all ${
                              checkedSteps.includes(index) 
                                ? 'bg-[#93C560]' 
                                : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className={`text-[#014421] text-lg leading-relaxed transition-all ${
                            checkedSteps.includes(index) 
                              ? 'line-through' 
                              : 'group-hover:text-[#014421]/80'
                          }`}>
                            {step}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Tips Section */}
                {recipe.tips && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200"
                  >
                    <h3 className="font-bold text-[#014421] mb-3 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Tips & tricks
                    </h3>
                    <p className="text-[#014421]/80 leading-relaxed">
                      {recipe.tips}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Nutrition Information */}
              {(nutrition || nutritionLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => setShowNutrition(!showNutrition)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors no-print"
                  >
                    <h3 className="text-xl font-bold text-[#014421] flex items-center gap-3">
                      <span className="bg-[#014421]/10 w-10 h-10 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#014421]" />
                      </span>
                      {t('recipes.detail.nutrition','Näringsvärden')}
                    </h3>
                    {showNutrition ? <ChevronUp className="text-[#014421]" /> : <ChevronDown className="text-[#014421]" />}
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
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#014421] mx-auto"></div>
                            <p className="text-gray-600 mt-2">{t('recipes.detail.calculating','Beräknar näringsvärden...')}</p>
                          </div>
                        ) : nutrition ? (
                          <div className="p-6 border-t border-gray-100">
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-2">Per portion ({recipe.servings || 4} portioner totalt)</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-[#F3EFE3] rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600">{t('recipes.detail.kcal','Kalorier')}</p>
                                <p className="text-2xl font-bold text-[#014421]">{nutrition?.perServing?.calories || '-'}</p>
                              </div>
                              <div className="bg-[#F3EFE3] rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600">{t('recipes.detail.protein','Protein')}</p>
                                <p className="text-2xl font-bold text-[#014421]">{nutrition?.perServing?.protein || '-'}g</p>
                              </div>
                              <div className="bg-[#F3EFE3] rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600">{t('recipes.detail.carbs','Kolhydrater')}</p>
                                <p className="text-2xl font-bold text-[#014421]">{nutrition?.perServing?.carbs || '-'}g</p>
                              </div>
                              <div className="bg-[#F3EFE3] rounded-xl p-4 text-center">
                                <p className="text-sm text-gray-600">{t('recipes.detail.fat','Fett')}</p>
                                <p className="text-2xl font-bold text-[#014421]">{nutrition?.perServing?.fat || '-'}g</p>
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
      </div>
    </>
  );
}