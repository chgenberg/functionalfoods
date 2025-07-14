'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiUsers, FiHeart, FiShare2, FiBookmark, FiCheck, FiPlus, FiMinus, FiPrinter, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import RandomRecipes from '../../../components/RandomRecipes';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  instructions?: string;
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

  useEffect(() => {
    if (slug) {
      fetchRecipe();
    }
  }, [slug, user]);

  useEffect(() => {
    if (recipe) {
      // Beräkna näringsvärden automatiskt
      calculateNutrition();
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
    
    // Kontrollera om vi redan har näringsvärden
    if (recipe.nutrition) {
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

  // Parse instructions into steps
  const instructionSteps = recipe?.instructions && typeof recipe.instructions === 'string'
    ? recipe.instructions.split('\\n').filter(step => step.trim())
    : [];

  // Function to scale ingredient amounts
  const scaleIngredient = (ingredient: string, originalServings: number, newServings: number) => {
    if (!ingredient || originalServings === 0) return ingredient;
    
    const ratio = newServings / originalServings;
    const numberPattern = /(\d+(?:\/\d+)?(?:[.,]\d+)?)\s*([a-zA-ZåäöÅÄÖ]*)/g;
    
    return ingredient.replace(numberPattern, (match, numberStr, unit) => {
      let num: number;
      
      if (numberStr.includes('/')) {
        const [numerator, denominator] = numberStr.split('/').map((n: string) => parseInt(n.trim()));
        if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return match;
        num = numerator / denominator;
      } else {
        num = parseFloat(numberStr.replace(',', '.'));
        if (isNaN(num)) return match;
      }
      
      const scaledNum = num * ratio;
      const formattedNum = formatScaledNumber(scaledNum);
      
      return `${formattedNum}${unit ? ' ' + unit : ''}`;
    });
  };

  const formatScaledNumber = (num: number): string => {
    const commonFractions = [
      { decimal: 0.125, fraction: '1/8' },
      { decimal: 0.25, fraction: '1/4' },
      { decimal: 0.333, fraction: '1/3' },
      { decimal: 0.5, fraction: '1/2' },
      { decimal: 0.667, fraction: '2/3' },
      { decimal: 0.75, fraction: '3/4' },
      { decimal: 1.25, fraction: '1 1/4' },
      { decimal: 1.333, fraction: '1 1/3' },
      { decimal: 1.5, fraction: '1 1/2' },
      { decimal: 1.667, fraction: '1 2/3' },
      { decimal: 1.75, fraction: '1 3/4' },
      { decimal: 2.5, fraction: '2 1/2' },
      { decimal: 3.5, fraction: '3 1/2' }
    ];
    
    for (const frac of commonFractions) {
      if (Math.abs(num - frac.decimal) < 0.01) {
        return frac.fraction;
      }
    }
    
    if (Math.abs(num - Math.round(num)) < 0.01) {
      return Math.round(num).toString();
    }
    
    if (num < 1) {
      return num.toFixed(2).replace(/\.?0+$/, '');
    } else {
      return num.toFixed(1).replace(/\.0$/, '');
    }
  };

  const scaledIngredients = recipe?.ingredients?.map(ingredient => 
    scaleIngredient(ingredient, recipe.servings || 1, servings)
  ) || [];

  const hasAccess = recipe && (recipe.isFree || !recipe.isPremium || (user && getToken()));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-800">Laddar recept...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Receptet kunde inte hittas
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Det receptet du letar efter existerar inte.'}
          </p>
          <Link
            href="/kunskapsbank/recept"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Tillbaka till recept
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-10 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tillgång nekad</h2>
          <p className="text-gray-600 mb-6">Detta är ett premiumrecept. Vänligen logga in för att se innehållet.</p>
          <Link href="/login" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            Logga in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12">

          {/* Bildsektion */}
          {recipe.imageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-64 md:h-96 relative">
              <Image
                src={recipe.imageUrl}
                alt={recipe.imageAlt || recipe.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}

          {/* Header-sektion */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-8"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {(recipe.categories || []).map((category, index) => (
                <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {recipe.title}
            </h1>
            
            {recipe.excerpt && (
              <p className="text-lg text-gray-600 mb-6">
                {recipe.excerpt}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              {recipe.prepTime && (
                <span className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-orange-500" />
                  {recipe.prepTime}
                </span>
              )}
              <span className="flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-orange-500" />
                {servings} portioner
              </span>
              {recipe.difficulty && (
                <span className="flex items-center gap-2">
                  <span className="text-orange-500">★</span>
                  {recipe.difficulty}
                </span>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Ingredients */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingredienser</h2>
                
                {/* Portion Selector */}
                <div className="bg-orange-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Antal portioner</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setServings(Math.max(1, servings - 1))}
                        className="w-8 h-8 rounded-full bg-white border border-orange-200 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-8 text-center text-orange-600">{servings}</span>
                      <button 
                        onClick={() => setServings(servings + 1)}
                        className="w-8 h-8 rounded-full bg-white border border-orange-200 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {scaledIngredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleIngredient(index)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        checkedIngredients.includes(index) 
                          ? 'bg-green-50 text-green-800' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                        checkedIngredients.includes(index) 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {checkedIngredients.includes(index) && (
                          <FiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${checkedIngredients.includes(index) ? 'line-through' : ''}`}>
                        {ingredient}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <button className="mt-6 w-full flex items-center justify-center gap-2 bg-orange-100 text-orange-700 px-4 py-3 rounded-lg hover:bg-orange-200 transition-colors">
                  <FiShoppingCart className="w-4 h-4" />
                  <span className="text-sm font-medium">Lägg till i inköpslista</span>
                </button>
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tillagning</h2>
                
                <div className="space-y-4">
                  {instructionSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleStep(index)}
                      className={`flex gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        checkedSteps.includes(index) 
                          ? 'bg-green-50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition-all ${
                        checkedSteps.includes(index) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {checkedSteps.includes(index) ? <FiCheck className="w-5 h-5" /> : index + 1}
                      </div>
                      <p className={`text-gray-700 pt-2 ${checkedSteps.includes(index) ? 'line-through opacity-60' : ''}`}>
                        {step}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {recipe.tips && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 bg-yellow-50 rounded-2xl p-6"
                >
                  <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Tips
                  </h3>
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    {recipe.tips}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex gap-3"
              >
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                  <FiPrinter className="w-4 h-4" />
                  <span className="text-sm font-medium">Skriv ut</span>
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Nutrition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Näringsvärde per portion</h2>
            
            {nutritionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Beräknar näringsvärden...</span>
              </div>
            ) : nutrition ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(nutrition.perServing?.calories || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Kalorier</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(nutrition.perServing?.protein || 0)}g
                  </p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(nutrition.perServing?.carbs || 0)}g
                  </p>
                  <p className="text-sm text-gray-600">Kolhydrater</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(nutrition.perServing?.fat || 0)}g
                  </p>
                  <p className="text-sm text-gray-600">Fett</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">-</p>
                  <p className="text-sm text-gray-600">Kalorier</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">-</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">-</p>
                  <p className="text-sm text-gray-600">Kolhydrater</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">-</p>
                  <p className="text-sm text-gray-600">Fett</p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              {nutrition ? 'Näringsvärden är beräknade uppskattningar' : 'Näringsvärden beräknas automatiskt'}
            </p>
          </motion.div>

          {/* Random Recipes */}
          <RandomRecipes excludeId={recipe?.id} />
        </div>
      </div>
    </>
  );
} 