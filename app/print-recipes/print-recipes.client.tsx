'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';

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
  dayName?: string;
  mealType?: string;
  recipeName?: string;
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
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const listRes = await fetch(`/api/shopping-list/${course}/${week}`);
        const listData = listRes.ok ? await listRes.json() : null;
        
        const entries: Array<{ day: string; mealType: string; slug: string }> = Array.isArray(listData?.recipeEntries) ? listData.recipeEntries : [];
        const slugs: string[] = entries.map(e => e.slug);

        let fetched: any[] = [];
        if (slugs.length > 0) {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          
          const resp = await fetch('/api/recipes/batch', {
            method: 'POST',
            headers,
            body: JSON.stringify({ slugs })
          });
          if (resp.ok) {
            fetched = await resp.json();
          }
        }

        const bySlug = new Map<string, any>();
        (fetched || []).forEach((r: any) => { bySlug.set(r.slug, r); });
        
        const normalized: Recipe[] = entries
          .map((e) => {
            const r = bySlug.get(e.slug);
            if (!r) return null;
            const mealTypeSwedish = e.mealType === 'breakfast' ? 'Frukost' : e.mealType === 'lunch' ? 'Lunch' : e.mealType === 'dinner' ? 'Middag' : e.mealType === 'snack' ? 'Mellanmål' : 'Dessert';
            return {
              title: r.title,
              dayName: e.day,
              mealType: mealTypeSwedish,
              recipeName: r.title,
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
    if (!isLoading && recipes.length > 0) {
      setTimeout(() => window.print(), 600);
    }
  }, [isLoading, recipes]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F1E8] to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#014421]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#014421] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[#014421] font-medium text-lg">Förbereder dina recept...</p>
          <p className="text-gray-500 text-sm mt-2">Detta kan ta några sekunder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print-document">
      {/* Screen-only header */}
      <div className="no-print sticky top-0 z-50 bg-gradient-to-r from-[#014421] to-[#116530] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Tillbaka</span>
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">{courseName}</h1>
            <p className="text-white/80 text-sm">Vecka {week} • {recipes.length} recept</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="font-medium">Skriv ut</span>
          </button>
        </div>
      </div>

      {/* Print content */}
      <div className="print-content">
        {recipes.length > 0 ? (
          <>
            {/* Cover page */}
            <div className="cover-page">
              <div className="cover-content">
                <div className="cover-decoration"></div>
                <div className="cover-logo">
                  <div className="logo-icon">🌿</div>
                  <h1>Functional Foods</h1>
                </div>
                <div className="cover-title">
                  <h2>{courseName}</h2>
                  <div className="cover-divider"></div>
                  <h3>Vecka {week} • Receptsamling</h3>
                </div>
                <div className="cover-info">
                  <p>{recipes.length} recept för hela veckan</p>
                  <p className="cover-date">{new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="cover-footer">
                  <p>www.functionalfoods.se</p>
                </div>
              </div>
            </div>

            {/* Recipe pages */}
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-page">
                <div className="recipe-header">
                  <div className="recipe-badge">
                    <span className="badge-day">{recipe.dayName}</span>
                    <span className="badge-separator">•</span>
                    <span className="badge-meal">{recipe.mealType}</span>
                  </div>
                  <h1 className="recipe-title">{recipe.recipeName || recipe.title}</h1>
                  {recipe.description && (
                    <p className="recipe-description">{recipe.description}</p>
                  )}
                  <div className="recipe-meta">
                    {recipe.servings && (
                      <div className="meta-item">
                        <span className="meta-icon">👥</span>
                        <span>{recipe.servings} portioner</span>
                      </div>
                    )}
                    {recipe.cookingTime && (
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span>{recipe.cookingTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="recipe-body">
                  <div className="recipe-columns">
                    {/* Ingredients column */}
                    <div className="ingredients-column">
                      <div className="section-header">
                        <span className="section-icon">🥗</span>
                        <h2>Ingredienser</h2>
                      </div>
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        <ul className="ingredients-list">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i}>
                              <span className="ingredient-bullet"></span>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-content">Inga ingredienser tillgängliga</p>
                      )}
                    </div>

                    {/* Instructions column */}
                    <div className="instructions-column">
                      <div className="section-header">
                        <span className="section-icon">👨‍🍳</span>
                        <h2>Gör så här</h2>
                      </div>
                      {recipe.instructions && recipe.instructions.length > 0 ? (
                        <ol className="instructions-list">
                          {recipe.instructions.map((instruction, i) => (
                            <li key={i}>
                              <span className="step-number">{i + 1}</span>
                              <span className="step-text">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="no-content">Inga instruktioner tillgängliga</p>
                      )}
                    </div>
                  </div>

                  {/* Nutrition info */}
                  {recipe.nutritionalInfo && (
                    <div className="nutrition-section">
                      <h3>Näringsvärde per portion</h3>
                      <div className="nutrition-grid">
                        {recipe.nutritionalInfo.calories && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{recipe.nutritionalInfo.calories}</span>
                            <span className="nutrition-label">kcal</span>
                          </div>
                        )}
                        {recipe.nutritionalInfo.protein && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{recipe.nutritionalInfo.protein}g</span>
                            <span className="nutrition-label">Protein</span>
                          </div>
                        )}
                        {recipe.nutritionalInfo.carbs && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{recipe.nutritionalInfo.carbs}g</span>
                            <span className="nutrition-label">Kolhydrater</span>
                          </div>
                        )}
                        {recipe.nutritionalInfo.fat && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{recipe.nutritionalInfo.fat}g</span>
                            <span className="nutrition-label">Fett</span>
                          </div>
                        )}
                        {recipe.nutritionalInfo.fiber && (
                          <div className="nutrition-item">
                            <span className="nutrition-value">{recipe.nutritionalInfo.fiber}g</span>
                            <span className="nutrition-label">Fiber</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="recipe-footer">
                  <span>{courseName} • Vecka {week}</span>
                  <span>Recept {index + 1} av {recipes.length}</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="no-recipes">
            <p>Inga recept tillgängliga för denna vecka.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .print-document {
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* Screen styles */
        .print-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .cover-page {
          display: none;
        }

        .recipe-page {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .recipe-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .recipe-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .badge-day {
          font-weight: 600;
        }

        .badge-separator {
          opacity: 0.6;
        }

        .badge-meal {
          opacity: 0.9;
        }

        .recipe-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          line-height: 1.3;
        }

        .recipe-description {
          opacity: 0.9;
          font-style: italic;
          max-width: 600px;
          margin: 0 auto 1rem;
          line-height: 1.5;
        }

        .recipe-meta {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          font-size: 0.9rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-icon {
          font-size: 1.1rem;
        }

        .recipe-body {
          padding: 2rem;
        }

        .recipe-columns {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #93C560;
        }

        .section-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #014421;
          margin: 0;
        }

        .section-icon {
          font-size: 1.25rem;
        }

        .ingredients-column {
          background: #F7F1E8;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .ingredients-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ingredients-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px dashed #ddd;
          font-size: 0.95rem;
          color: #333;
        }

        .ingredients-list li:last-child {
          border-bottom: none;
        }

        .ingredient-bullet {
          width: 6px;
          height: 6px;
          background: #93C560;
          border-radius: 50%;
          margin-top: 0.5rem;
          flex-shrink: 0;
        }

        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
          counter-reset: step;
        }

        .instructions-list li {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #333;
        }

        .step-number {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #014421, #116530);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step-text {
          flex: 1;
          padding-top: 0.25rem;
        }

        .nutrition-section {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #eee;
        }

        .nutrition-section h3 {
          font-size: 1rem;
          color: #014421;
          margin: 0 0 1rem;
          text-align: center;
        }

        .nutrition-grid {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .nutrition-item {
          text-align: center;
          background: #F7F1E8;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
        }

        .nutrition-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: #014421;
        }

        .nutrition-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .recipe-footer {
          display: flex;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: #f9f9f9;
          font-size: 0.8rem;
          color: #666;
        }

        .no-content {
          color: #999;
          font-style: italic;
        }

        .no-recipes {
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-content {
            max-width: none;
            padding: 0;
            margin: 0;
          }

          .cover-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #014421 0%, #0a5c2f 50%, #116530 100%) !important;
            page-break-after: always;
            position: relative;
            overflow: hidden;
          }

          .cover-content {
            text-align: center;
            color: white;
            padding: 3rem;
            position: relative;
            z-index: 1;
          }

          .cover-decoration {
            position: absolute;
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: rgba(147, 197, 96, 0.1);
            border-radius: 50%;
          }

          .cover-logo {
            margin-bottom: 3rem;
          }

          .logo-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .cover-logo h1 {
            font-size: 2.5rem;
            font-weight: 300;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin: 0;
          }

          .cover-title {
            margin-bottom: 3rem;
          }

          .cover-title h2 {
            font-size: 2.25rem;
            font-weight: 700;
            margin: 0 0 1.5rem;
          }

          .cover-divider {
            width: 80px;
            height: 3px;
            background: #93C560;
            margin: 0 auto 1.5rem;
          }

          .cover-title h3 {
            font-size: 1.25rem;
            font-weight: 400;
            opacity: 0.9;
            margin: 0;
          }

          .cover-info {
            margin-bottom: 3rem;
            font-size: 1rem;
            opacity: 0.85;
          }

          .cover-info p {
            margin: 0.5rem 0;
          }

          .cover-date {
            font-style: italic;
            margin-top: 1rem !important;
          }

          .cover-footer {
            font-size: 0.9rem;
            opacity: 0.7;
            letter-spacing: 1px;
          }

          .recipe-page {
            page-break-before: always;
            page-break-inside: avoid;
            min-height: 100vh;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
            display: flex;
            flex-direction: column;
          }

          .recipe-page:first-of-type {
            page-break-before: auto;
          }

          .recipe-header {
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #014421 0%, #116530 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .recipe-badge {
            background: rgba(255,255,255,0.2) !important;
            -webkit-print-color-adjust: exact !important;
          }

          .recipe-title {
            font-size: 1.5rem;
          }

          .recipe-body {
            flex: 1;
            padding: 1.5rem 2rem;
          }

          .recipe-columns {
            gap: 1.5rem;
          }

          .ingredients-column {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            padding: 1rem;
          }

          .section-header {
            border-bottom-color: #93C560 !important;
          }

          .ingredient-bullet {
            background: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .step-number {
            background: linear-gradient(135deg, #014421, #116530) !important;
            -webkit-print-color-adjust: exact !important;
          }

          .nutrition-section {
            margin-top: 1rem;
            padding-top: 1rem;
          }

          .nutrition-item {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            padding: 0.5rem 1rem;
          }

          .nutrition-value {
            color: #014421 !important;
          }

          .recipe-footer {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact !important;
            padding: 0.75rem 2rem;
            margin-top: auto;
          }
        }

        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
