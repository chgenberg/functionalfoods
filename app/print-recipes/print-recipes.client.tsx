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
  const course = (searchParams.get('course') || 'basics') as 'basics' | 'flow' | 'energy';

  const courseName = course === 'basics' ? 'Functional Basics'
    : course === 'flow' ? 'Functional Flow'
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
        
        const slugs: string[] = Array.isArray(listData?.recipes)
          ? listData.recipes
          : [];

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

        const normalized: Recipe[] = (fetched || []).map((r: any) => ({
          title: r.title,
          description: r.description || '',
          servings: r.servings || 4,
          cookingTime: r.cookingTime || r.totalTime || r.prepTime || '',
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          instructions: Array.isArray(r.instructions) ? r.instructions : [],
          nutritionalInfo: r.nutritionPerServing || undefined
        }));

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
      <div className="print-content max-w-4xl mx-auto p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Veckans recept</h1>
          <p className="text-lg text-gray-600">{courseName} - Vecka {week}</p>
        </div>

        {recipes.length > 0 ? (
          <div className="space-y-8">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-page">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                  {recipe.nutritionalInfo && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Näringsvärde per portion</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
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

                {recipe.instructions && recipe.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Instruktioner</h3>
                    <ol className="space-y-3">
                      {recipe.instructions.map((instruction, i) => (
                        <li key={i} className="text-gray-700 flex">
                          <span className="font-semibold mr-3 flex-shrink-0">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {index < recipes.length - 1 && (
                  <div className="page-break mt-8 pt-8 border-t-2 border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Inga recept tillgängliga för denna vecka.</p>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print-content { max-width: 100%; padding: 20px; }
          h1, h2, h3 { color: #1a1a1a !important; }
          .bg-gray-50 { background-color: #f9f9f9 !important; }
          .page-break { page-break-before: always; }
          .recipe-page { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}


