'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Check, Clock, Heart, Minus, Plus, Printer, Star, Users, X, Camera, ChefHat, Flame, Utensils } from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';
import { useT } from '@/app/lib/i18n/LanguageProvider';
import { optimizeImageUrl, getResponsiveSizes } from '../../../lib/imageOptimization';
import { getRawMaterials, findRawMaterial, type RawMaterial } from '../../../lib/ingredientLinker';
import LinkedIngredient from '../../../components/LinkedIngredient';
import { useSearchParams } from 'next/navigation';
import { mealPlans, flowMealPlans, energyMealPlans } from '../../../data/mealPlans';

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
  ingredientsStructured?: any[]; // Added for structured ingredients
  requiresPremium?: boolean; // Added for premium access check
  isAdminOnly?: boolean; // Added for admin-only access check
}

export default function RecipePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const t = useT();
  const searchParams = useSearchParams();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [nutrition, setNutrition] = useState<any>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [userHasAccess, setUserHasAccess] = useState(false);
  const [userCourses, setUserCourses] = useState<string[]>([]);

  // Check if this recipe appears as "rester" later in the same week
  const checkIfRecipeAppearsAsRester = (recipeSlug: string, fromCourse?: string, fromWeek?: string) => {
    if (!fromCourse || !fromWeek) return false;
    
    const weekNum = parseInt(fromWeek);
    if (isNaN(weekNum)) return false;
    
    // Get the right meal plan based on course
    let courseMealPlans;
    if (fromCourse === 'basics') {
      courseMealPlans = mealPlans;
    } else if (fromCourse === 'flow') {
      courseMealPlans = flowMealPlans;
    } else if (fromCourse === 'energy') {
      courseMealPlans = energyMealPlans;
    } else {
      return false;
    }
    
    const weekKey = `week${weekNum}` as keyof typeof courseMealPlans;
    const weekData = courseMealPlans[weekKey];
    if (!weekData) return false;
    
    // Check all days in the week for "rester" meals with this recipe
    for (const day of Object.values(weekData.days)) {
      const allMeals = [day.breakfast, day.lunch, day.dinner, day.snack, day.dessert].filter(Boolean);
      for (const meal of allMeals) {
        if (meal && meal.name.toLowerCase().includes('rester') && meal.recipeLink?.includes(recipeSlug)) {
          return true;
        }
      }
    }
    
    return false;
  };

  const isRecipeInCourse = (recipeSlug: string, course: string | null): boolean => {
    if (!course) return false;

    const extractSlug = (link?: string) => {
      if (!link) return '';
      const parts = link.split('/');
      return parts[parts.length - 1] || '';
    };

    const collectSlugsFromWeekPlan = (plan: any) => {
      const slugs = new Set<string>();
      if (!plan) return slugs;
      Object.values(plan).forEach((week: any) => {
        if (!week?.days) return;
        Object.values(week.days).forEach((day: any) => {
          const meals = [day.breakfast, day.lunch, day.dinner, day.snack, day.dessert].filter(Boolean);
          meals.forEach((meal: any) => {
            const slug = extractSlug(meal?.recipeLink);
            if (slug) slugs.add(slug);
          });
        });
      });
      return slugs;
    };

    if (course === 'basics' || course === 'basic') {
      return collectSlugsFromWeekPlan(mealPlans).has(recipeSlug);
    }
    if (course === 'flow') {
      return collectSlugsFromWeekPlan(flowMealPlans).has(recipeSlug);
    }
    if (course === 'energy') {
      return collectSlugsFromWeekPlan(energyMealPlans).has(recipeSlug);
    }
    return false;
  };

  useEffect(() => {
    // Restore token from URL if present (when opened from course modal)
    try {
      const url = new URL(window.location.href);
      const tk = url.searchParams.get('tk');
      if (tk) {
        localStorage.setItem('token', tk);
        console.log('🔑 Token restored from URL in first useEffect');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (slug) {
      fetchRecipe();
    }
  }, [slug, userCourses]); // Changed dependency to userCourses instead of user

  useEffect(() => {
    // Fetch raw materials for ingredient linking
    const loadRawMaterials = async () => {
      const materials = await getRawMaterials();
      setRawMaterials(materials);
    };
    loadRawMaterials();
  }, []);

  useEffect(() => {
    if (recipe) {
      // Check if recipe is favorited
      const savedFavorites = localStorage.getItem('favoriteRecipeIds');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites) as string[];
        setIsFavorited(favoriteIds.includes(recipe.id));
      }
      
      // Check if coming from a meal plan and if the recipe appears as "rester"
      const fromCourse = searchParams.get('course');
      const fromWeek = searchParams.get('week');
      
      if (fromCourse && fromWeek && checkIfRecipeAppearsAsRester(slug, fromCourse, fromWeek)) {
        // Set servings to 2 for recipes that will have leftovers
        setServings(2);
      } else if (recipe.servings) {
        // Otherwise use recipe default or 1 portion
        setServings(1);
      }
      
      // Use nutrition from DB if available and in correct format, otherwise calculate
      if (recipe.nutrition && recipe.nutrition.perServing) {
        setNutrition(recipe.nutrition);
        setNutritionLoading(false);
      } else {
        // Nutrition disabled
        setNutrition(null);
        setNutritionLoading(false);
      }
    }
  }, [recipe, searchParams, slug]);

  useEffect(() => {
    // First check for token in URL
    try {
      const url = new URL(window.location.href);
      const tk = url.searchParams.get('tk');
      if (tk) {
        localStorage.setItem('token', tk);
        console.log('🔑 Token restored from URL');
      }
    } catch {}
    
    // Then check access
    const token = localStorage.getItem('token');
    if (token) {
      const checkAccess = async () => {
        try {
          const response = await fetch('/api/user/access', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserHasAccess(data.hasCourseAccess);
            
            // Set user's purchased courses
            const courseNames = data.courses?.map((course: any) => {
              // Map course titles to course tags used in recipes
              if (course.title.includes('Functional Basics') || course.slug === 'functional-basics') return 'Basic';
              if (course.title.includes('Functional Flow') || course.slug === 'functional-flow') return 'Flow';
              if (course.title.includes('Functional Energy') || course.slug === 'functional-energy') return 'Energy';
              return course.slug;
            }).filter(Boolean) || [];
            
            setUserCourses(courseNames);
            console.log('👤 User courses:', courseNames);
            
            // Legacy support - if user has legacy access, give them all courses
            if (data.hasLegacyAccess) {
              setUserCourses(['Basic', 'Flow', 'Energy']);
              console.log('🔓 Legacy access granted');
            }
          }
        } catch (error) {
          console.error('Error checking access:', error);
        }
      };
      
      checkAccess();
    }
  }, []);

  const getToken = () => {
    const stored = localStorage.getItem('token');
    if (stored) return stored;
    try {
      const url = new URL(window.location.href);
      const tk = url.searchParams.get('tk');
      if (tk) {
        localStorage.setItem('token', tk);
        return tk;
      }
    } catch {}
    return null;
  };

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
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
        }
        throw new Error(t('recipes.detail.loadError','Kunde inte ladda receptet'));
      }

      const data = await response.json();
      console.log('🔍 Recipe data:', { 
        requiresCourse: data.requiresCourse, 
        requiresPremium: data.requiresPremium,
        isLoggedIn: !!token,
        courseTags: data.courseTags 
      });
      
      const isLoggedIn = !!token;
      
      // Derive course recipe on the client as a fallback in case API flags are stale
      const isCourseRecipeClient = Boolean(data?.requiresCourse) 
        || (Array.isArray(data?.courseTags) && data.courseTags.length > 0)
        || (Array.isArray(data?.tags) && data.tags.some((t: string) => ['Basic','Flow','Energy'].includes(t)));
      
      // Check access rules in order of priority
      
      // 1. Admin-only recipes
      if (data.isAdminOnly && user?.role !== 'ADMIN') {
        console.log('❌ Admin only recipe, user is not admin');
        setError('adminOnly');
        setRecipe(data);
        return;
      }
      
      // 2. Course recipes (server or client derived)
      if (isCourseRecipeClient) {
        console.log('🔍 Course recipe detected, checking user access...');
        console.log('  Recipe tags:', data.tags);
        console.log('  Course tags:', data.courseTags);
        console.log('  User courses:', userCourses);
        console.log('  Is logged in:', isLoggedIn);
        
        // Check if user has access to any of the required courses
        const requiredCourses = data.courseTags || data.tags?.filter((t: string) => ['Basic','Flow','Energy'].includes(t)) || [];
        const hasAccess = requiredCourses.length === 0 || requiredCourses.some((course: string) => userCourses.includes(course));
        
        console.log('  Required courses:', requiredCourses);
        console.log('  Has access:', hasAccess);
        
        if (!isLoggedIn) {
          console.log('❌ Course recipe, user not logged in');
          setError('login');
          setRecipe(data);
          return;
        } else if (!hasAccess && userCourses.length === 0 && user) {
          // User is logged in but courses haven't loaded yet - allow access temporarily
          console.log('⏳ User courses not loaded yet, allowing temporary access');
          setError(null);
          setRecipe(data);
          return;
        } else if (!hasAccess) {
          console.log('❌ Course recipe, user has no access to required courses');
          setError('course');
          setRecipe(data);
          return;
        }
        console.log('✅ Course recipe, user has access');
        setError(null);
        setRecipe(data);
        return;
      }
      
      // 3. Premium recipes (non-course)
      if (data.requiresPremium && !userHasAccess) {
        console.log('❌ Premium recipe, user has no premium access');
        setError('premium');
        setRecipe(data);
        return;
      }
      
      // 4. Free recipes or user has access
      console.log('✅ Free recipe or user has access - ALLOWING ACCESS');
      setError(null);
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
    const baseServings = typeof originalServings === 'number' && originalServings > 0 ? originalServings : 4;
    const scaleFactor = servings / baseServings;
    
    return ingredient.replace(/(\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st|st\.|stycken|styck|burk|burkar|påse|påsar|förpackning|förpackningar)?/gi, 
      (match, amount, unit) => {
        const numAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numAmount) || !isFinite(numAmount)) {
          return match; // keep original if not a valid number
        }
        let scaledAmount = numAmount * scaleFactor;
        
        // Format numbers nicely
        if (scaledAmount % 1 === 0) {
          return `${scaledAmount}${unit ? ' ' + unit : ''}`;
        } else if (scaledAmount < 1) {
          // For amounts less than 1, show fractions
          if (Math.abs(scaledAmount - 0.5) < 1e-9) return `½${unit ? ' ' + unit : ''}`;
          if (Math.abs(scaledAmount - 0.25) < 1e-9) return `¼${unit ? ' ' + unit : ''}`;
          if (Math.abs(scaledAmount - 0.75) < 1e-9) return `¾${unit ? ' ' + unit : ''}`;
          if (scaledAmount > 0.32 && scaledAmount < 0.35) return `⅓${unit ? ' ' + unit : ''}`;
          if (scaledAmount > 0.65 && scaledAmount < 0.68) return `⅔${unit ? ' ' + unit : ''}`;
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

  useEffect(() => {
    if (!recipe) return;
    if (recipe.imageUrl && !imageError) return;
    (async () => {
      try {
        const mapRes = await fetch(`/api/recipes/batch-images?v=${Date.now()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          cache: 'no-store',
          body: JSON.stringify({ recipeNames: [recipe.title], recipeSlugs: [recipe.slug], size: 'xl' })
        });
        if (mapRes.ok) {
          const { images } = await mapRes.json();
          const mapped = images && images[recipe.title];
          if (mapped) {
            setRecipe(prev => prev ? { ...prev, imageUrl: mapped } : prev);
            setImageError(false);
          }
        }
      } catch (e) {
        console.warn('Detail image batch-map failed', e);
      }
    })();
  }, [recipe?.slug, imageError]);

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

  if (error) {
    if (error === 'premium') {
      return (
        <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Star className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('recipes.detail.premiumRequiredTitle','Premium-prenumeration krävs')}</h1>
            <p className="text-gray-600 mb-6">{t('recipes.detail.premiumRequiredText','Detta recept kräver en premium-prenumeration för att du ska kunna se det.')}</p>
            <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 bg-[#FF7E70] text-white px-6 py-3 rounded-full hover:bg-[#ff6b5a] transition-colors">
              <ArrowLeft />
              {t('recipes.detail.backToRecipes','Tillbaka till recept')}
            </Link>
          </div>
        </div>
      );
    } else if (error === 'adminOnly') {
      return (
        <div className="min-h-screen bg-[#F3EFE3] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('recipes.detail.adminOnlyTitle','Administratörsbara recept')}</h1>
            <p className="text-gray-600 mb-6">{t('recipes.detail.adminOnlyText','Detta recept är endast för administratörer.')}</p>
            <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 bg-[#FF7E70] text-white px-6 py-3 rounded-full hover:bg-[#ff6b5a] transition-colors">
              <ArrowLeft />
              {t('recipes.detail.backToRecipes','Tillbaka till recept')}
            </Link>
          </div>
        </div>
      );
    } else {
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
  }

  if (!recipe) {
    return null; // Should not happen if error is handled
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
        <div className="max-w-7xl mx-auto px-4 pb-4 md:pb-6 no-print header-safe">
          <Link href="/kunskapsbank/recept" className="inline-flex items-center gap-2 text-[#014421] hover:text-[#93C560] transition-colors font-medium text-sm md:text-base">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span>{t('recipes.detail.backToRecipes','Tillbaka till recept')}</span>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16">
          {/* Modern Layout with Better Portrait Image Handling */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Side - Image and Basic Info */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-8">
                {/* Image Container - Optimized for Portrait Images */}
                <div className="relative w-full bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
                  <div className="relative aspect-[3/4] md:aspect-[3/4] lg:aspect-[4/5]">
                    {(recipe.imageUrl || recipe.imageMobileUrl) && !imageError ? (
                      <Image
                        src={optimizeImageUrl(recipe.imageUrl || recipe.imageMobileUrl, 'large', 'portrait')}
                        alt={recipe.imageAlt || recipe.title}
                        fill
                        className="object-cover"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                        priority
                        sizes={getResponsiveSizes('large')}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#93C560]/20 to-[#014421]/10">
                        <Camera className="w-16 h-16 md:w-20 md:h-20 text-[#014421]/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Recipe Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 md:p-6">
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                      {recipe.categories.map((category, index) => (
                        <span key={index} className="bg-white/20 backdrop-blur-sm text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium">
                          {category}
                        </span>
                      ))}
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2">{recipe.title}</h1>
                    {recipe.excerpt && (
                      <p className="text-white/90 text-sm md:text-base lg:text-lg line-clamp-2">{recipe.excerpt}</p>
                    )}
                  </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4 md:mt-6">
                  {recipe.prepTime && (
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 text-center shadow-md">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#93C560] mx-auto mb-1 md:mb-2" />
                      <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Förberedelse</p>
                      <p className="font-bold text-[#014421] text-sm md:text-base">{recipe.prepTime}</p>
                    </div>
                  )}
                  {recipe.cookTime && (
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 text-center shadow-md">
                      <Flame className="w-5 h-5 md:w-6 md:h-6 text-[#FF7E70] mx-auto mb-1 md:mb-2" />
                      <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Tillagning</p>
                      <p className="font-bold text-[#014421] text-sm md:text-base">{recipe.cookTime}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 text-center shadow-md">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-[#014421] mx-auto mb-1 md:mb-2" />
                    <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Portioner</p>
                    <p className="font-bold text-[#014421] text-sm md:text-base">{servings}</p>
                  </div>
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 no-print">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleFavorite}
                    className={`flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                      isFavorited 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md'
                    }`}
                  >
                    <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Sparad' : 'Spara recept'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrint}
                    className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white shadow-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Printer className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Right Side - Recipe Details */}
            <div className="lg:col-span-7">
              {/* Ingredients Section */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-[#014421] flex items-center gap-2 md:gap-3">
                    <span className="bg-[#93C560]/20 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Utensils className="w-5 h-5 md:w-6 md:h-6 text-[#93C560]" />
                    </span>
                    {t('recipes.detail.ingredients','Ingredienser')}
                  </h2>
                  
                  {/* Servings Selector - No Print */}
                  <div className="flex items-center gap-2 md:gap-3 bg-[#F3EFE3] rounded-full px-3 md:px-4 py-1.5 md:py-2 no-print self-start sm:self-auto">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-[#014421]"
                    >
                      <Minus className="w-3 h-3 md:w-4 md:h-4" />
                    </motion.button>
                    <span className="text-base md:text-lg font-bold text-[#014421] w-6 md:w-8 text-center">{servings}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setServings(servings + 1)}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-[#014421]"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Print Servings Info */}
                <div className="hidden print:block mb-4">
                  <p className="font-medium text-[#014421]">{t('recipes.detail.forServings','För')} {servings} {t('recipes.detail.portions','portioner')}</p>
                </div>

                {/* Ingredients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {(recipe as any).ingredientsStructured && Array.isArray((recipe as any).ingredientsStructured) && (recipe as any).ingredientsStructured.length > 0 ? (
                    (recipe as any).ingredientsStructured.map((item: any, index: number) => {
                      const baseServings = recipe.servings && recipe.servings > 0 ? recipe.servings : 4;
                      const scale = servings / baseServings;
                      
                      // Calculate scaled amount
                      const amount = typeof item.baseAmount === 'number' ? item.baseAmount * scale : null;
                      const unit = item.baseUnit || '';
                      
                      // Format amount text
                      let amountText = '';
                      if (amount !== null && isFinite(amount)) {
                        if (amount % 1 === 0) {
                          amountText = `${Math.round(amount)}`;
                        } else {
                          // Handle fractions
                          if (Math.abs(amount - 0.25) < 0.01) amountText = '¼';
                          else if (Math.abs(amount - 0.5) < 0.01) amountText = '½';
                          else if (Math.abs(amount - 0.75) < 0.01) amountText = '¾';
                          else if (Math.abs(amount - 0.33) < 0.01) amountText = '⅓';
                          else if (Math.abs(amount - 0.67) < 0.01) amountText = '⅔';
                          else amountText = amount.toFixed(1).replace('.', ',');
                        }
                      }
                      
                      // Extract ingredient name without parentheses
                      const labelText = (item.label || '').replace(/\([^\)]*\)/g, '').trim();
                      
                      // Build display text with amount and unit
                      const display = amountText && unit ? 
                        `${amountText} ${unit} ${labelText}` : 
                        amountText ? 
                          `${amountText} ${labelText}` : 
                          labelText;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => toggleIngredient(index)}
                          className={`flex items-center p-2.5 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all border-2 no-print ${
                            checkedIngredients.includes(index) 
                              ? 'bg-[#93C560]/10 border-[#93C560] text-gray-500' 
                              : 'bg-[#F3EFE3]/50 border-transparent hover:border-[#93C560]/30'
                          }`}
                        >
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg border-2 mr-2 md:mr-3 flex items-center justify-center transition-all flex-shrink-0 no-print ${
                            checkedIngredients.includes(index) 
                              ? 'bg-[#93C560] border-[#93C560]' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {checkedIngredients.includes(index) && (
                              <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                            )}
                          </div>
                          <LinkedIngredient
                            ingredient={display}
                            rawMaterial={findRawMaterial(labelText, rawMaterials)}
                            className={`text-sm md:text-base ${checkedIngredients.includes(index) ? 'line-through opacity-60' : ''}`}
                          />
                        </motion.div>
                      );
                    })
                  ) : (
                    scaledIngredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => toggleIngredient(index)}
                        className={`flex items-center p-2.5 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all border-2 no-print ${
                          checkedIngredients.includes(index) 
                            ? 'bg-[#93C560]/10 border-[#93C560] text-gray-500' 
                            : 'bg-[#F3EFE3]/50 border-transparent hover:border-[#93C560]/30'
                        }`}
                      >
                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg border-2 mr-2 md:mr-3 flex items-center justify-center transition-all flex-shrink-0 no-print ${
                          checkedIngredients.includes(index) 
                            ? 'bg-[#93C560] border-[#93C560]' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {checkedIngredients.includes(index) && (
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                          )}
                        </div>
                        <LinkedIngredient
                          ingredient={ingredient}
                          rawMaterial={findRawMaterial(ingredient, rawMaterials)}
                          className={`text-sm md:text-base ${checkedIngredients.includes(index) ? 'line-through opacity-60' : ''}`}
                        />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Instructions Section */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 lg:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#014421] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <span className="bg-[#FF7E70]/20 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-[#FF7E70]" />
                  </span>
                  {t('recipes.detail.instructions','Gör så här')}
                </h2>
                
                {/* Instructions Steps */}
                <div className="space-y-3 md:space-y-4">
                  {instructionSteps.length > 0 ? (
                    instructionSteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 md:gap-4"
                      >
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#014421] text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-[#014421] leading-relaxed text-sm md:text-base">{step}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : recipe.content ? (
                    <div className="prose prose-sm md:prose max-w-none">
                      <p className="text-[#014421] leading-relaxed text-sm md:text-base">{recipe.content}</p>
                    </div>
                  ) : null}
                </div>

                {/* Tips Section */}
                {recipe.tips && (
                  <div className="mt-6 md:mt-8 p-4 md:p-6 bg-[#93C560]/10 rounded-xl md:rounded-2xl border-2 border-[#93C560]/20">
                    <h3 className="font-bold text-[#014421] mb-2 text-base md:text-lg">💡 Tips</h3>
                    <p className="text-[#014421] text-sm md:text-base">{recipe.tips}</p>
                  </div>
                )}
              </div>

              {/* Nutrition disabled */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}