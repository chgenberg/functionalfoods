'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users } from 'lucide-react';

interface Recipe {
  title: string;
  description?: string;
  servings?: number;
  cookingTime?: string;
  ingredients?: string[];
  instructions?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

export default function Client() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const week = parseInt(searchParams.get('week') || '1');
  const course = (searchParams.get('course') || 'basics') as 'basics' | 'flow' | 'energy' | 'hormone';

  const courseName = course === 'basics' ? 'Functional Basics'
    : course === 'flow' ? 'Functional Flow'
    : course === 'hormone' ? 'Hormonell Balans'
    : 'Functional Energy';

  useEffect(() => {
    async function fetchRecipes() {
      try {
        // Get JWT token if present (for premium access)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // Get meal plan slugs from API built for shopping list (it extracts slugs too)
        const listRes = await fetch(`/api/shopping-list/${course}/${week}`);
        const listData = listRes.ok ? await listRes.json() : null;
        
        console.log('📋 Shopping list API response:', listData);
        const entries: Array<{ day: string; mealType: string; slug: string }> = Array.isArray(listData?.recipeEntries) ? listData.recipeEntries : [];
        const slugs: string[] = entries.map(e => e.slug);

        console.log('🔍 Recipe slugs:', slugs);

        // Use batch API to fetch details efficiently if available
        let fetched: any[] = [];
        if (slugs.length > 0) {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          
          console.log('📡 Fetching recipes with token:', !!token);
          
          const resp = await fetch('/api/recipes/batch', {
            method: 'POST',
            headers,
            body: JSON.stringify({ slugs })
          });
          if (resp.ok) {
            fetched = await resp.json();
            console.log('✅ Fetched recipes:', fetched.length);
          } else {
            console.error('❌ Batch API error:', resp.status, await resp.text());
          }
        } else {
          console.warn('⚠️ No recipe slugs found in shopping list API');
        }

        // Map slug -> recipe details
        const bySlug = new Map<string, any>();
        (fetched || []).forEach((r: any) => { bySlug.set(r.slug, r); });
        // Build normalized list in the exact day/meal order
        const normalized: Recipe[] = entries
          .map((e) => {
            const r = bySlug.get(e.slug);
            if (!r) return null;
            return {
              title: `${e.day} • ${e.mealType === 'breakfast' ? 'Frukost' : e.mealType === 'lunch' ? 'Lunch' : e.mealType === 'dinner' ? 'Middag' : e.mealType === 'snack' ? 'Mellanmål' : 'Dessert'} — ${r.title}`,
              description: r.description || '',
              servings: r.servings || 4,
              cookingTime: r.cookingTime || r.totalTime || r.prepTime || '',
              ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
              instructions: Array.isArray(r.instructions) ? r.instructions : [],
              nutritionalInfo: r.nutritionPerServing || undefined
            } as Recipe;
          })
          .filter(Boolean) as Recipe[];

        setRecipes(normalized);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipes();
  }, [week, course]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => window.print(), 400);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto mb-4"></div>
          <p className="text-gray-600">Förbereder recept...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* No-print header */}
      <div className="no-print bg-[#F3EFE3] border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka till kursen</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#116530] transition-all"
          >
            Skriv ut
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-content max-w-4xl mx-auto">
        {recipes.length > 0 ? (
          <div>
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-page">
                {/* Recipe header */}
                <div className="recipe-header">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
                  <div className="text-sm text-gray-500 mb-6">
                    {courseName} • Vecka {week}
                  </div>
                  {(recipe.servings || recipe.cookingTime) && (
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings} portioner</span>
                        </div>
                      )}
                      {recipe.cookingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.cookingTime}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {recipe.description && (
                    <p className="text-gray-700 italic mb-4">{recipe.description}</p>
                  )}
                </div>

                {/* Recipe content */}
                <div className="recipe-content">
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredienser</h3>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ingredient, i) => (
                          <li key={i} className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Instruktioner</h3>
                      <ol className="space-y-2">
                        {recipe.instructions.map((instruction, i) => (
                          <li key={i} className="text-gray-700 flex">
                            <span className="font-semibold mr-3 flex-shrink-0">{i + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {recipe.nutritionalInfo && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Näringsvärde per portion</h3>
                      <div className="bg-gray-50 p-3 rounded-lg inline-block">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          {recipe.nutritionalInfo.calories && (
                            <div>Kalorier: <span className="font-medium">{recipe.nutritionalInfo.calories} kcal</span></div>
                          )}
                          {recipe.nutritionalInfo.protein && (
                            <div>Protein: <span className="font-medium">{recipe.nutritionalInfo.protein}g</span></div>
                          )}
                          {recipe.nutritionalInfo.carbs && (
                            <div>Kolhydrater: <span className="font-medium">{recipe.nutritionalInfo.carbs}g</span></div>
                          )}
                          {recipe.nutritionalInfo.fat && (
                            <div>Fett: <span className="font-medium">{recipe.nutritionalInfo.fat}g</span></div>
                          )}
                          {recipe.nutritionalInfo.fiber && (
                            <div>Fiber: <span className="font-medium">{recipe.nutritionalInfo.fiber}g</span></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Inga recept tillgängliga för denna vecka.</p>
        )}
      </div>

      <style jsx>{`
        @media print {
          .no-print { 
            display: none !important; 
          }
          
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          
          .print-content { 
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
          }
          
          .recipe-page { 
            page-break-before: auto;
            page-break-after: always;
            page-break-inside: avoid;
            padding: 40px;
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .recipe-page:first-child {
            page-break-before: auto;
          }
          
          .recipe-page:last-child {
            page-break-after: auto;
          }
          
          .recipe-header {
            margin-bottom: 30px;
          }
          
          .recipe-content {
            flex: 1;
          }
          
          h1 { 
            font-size: 28px !important;
            margin-bottom: 10px !important;
            color: #1a1a1a !important; 
          }
          
          h3 { 
            font-size: 18px !important;
            margin-top: 20px !important;
            margin-bottom: 10px !important;
            color: #333 !important; 
          }
          
          .bg-gray-50 { 
            background-color: #f5f5f5 !important;
            border: 1px solid #e0e0e0 !important;
          }
          
          ul, ol {
            margin: 0;
            padding-left: 20px;
          }
          
          li {
            margin-bottom: 5px;
          }
        }
      `}</style>
    </div>
  );
}


