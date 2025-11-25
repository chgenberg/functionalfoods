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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F1E8]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#014421] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#014421] font-medium">Förbereder recept...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-wrapper">
      {/* Screen header - hidden when printing */}
      <div className="screen-header no-print">
        <div className="header-content">
          <button onClick={() => router.back()} className="back-btn">
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
          <div className="header-title">
            <strong>{courseName}</strong>
            <span>Vecka {week} • {recipes.length} recept</span>
          </div>
          <button onClick={() => window.print()} className="print-btn">
            <Printer className="w-4 h-4" />
            <span>Skriv ut</span>
          </button>
        </div>
      </div>

      {/* Printable recipes - one per page */}
      <div className="recipes-container">
        {recipes.length > 0 ? (
          recipes.map((recipe, index) => (
            <div key={index} className="recipe-page">
              {/* Page header */}
              <div className="page-header">
                <div className="brand">
                  <span className="brand-icon">🌿</span>
                  <span className="brand-name">Functional Foods</span>
                </div>
                <div className="page-info">
                  <span className="course-name">{courseName}</span>
                  <span className="separator">•</span>
                  <span>Vecka {week}</span>
                </div>
              </div>

              {/* Recipe title section */}
              <div className="recipe-title-section">
                <div className="meal-badge">
                  <span className="badge-day">{recipe.dayName}</span>
                  <span className="badge-dot">•</span>
                  <span className="badge-meal">{recipe.mealType}</span>
                </div>
                <h1 className="recipe-name">{recipe.recipeName || recipe.title}</h1>
                <div className="recipe-meta">
                  {recipe.servings && (
                    <span className="meta-item">👥 {recipe.servings} portioner</span>
                  )}
                  {recipe.cookingTime && (
                    <span className="meta-item">⏱️ {recipe.cookingTime}</span>
                  )}
                </div>
              </div>

              {/* Two column layout */}
              <div className="recipe-content">
                {/* Left column - Ingredients */}
                <div className="ingredients-box">
                  <h2 className="section-title">
                    <span className="title-icon">🥗</span>
                    Ingredienser
                  </h2>
                  <ul className="ingredients-list">
                    {recipe.ingredients && recipe.ingredients.length > 0 ? (
                      recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))
                    ) : (
                      <li className="empty">Inga ingredienser</li>
                    )}
                  </ul>
                </div>

                {/* Right column - Instructions */}
                <div className="instructions-box">
                  <h2 className="section-title">
                    <span className="title-icon">👨‍🍳</span>
                    Gör så här
                  </h2>
                  <ol className="instructions-list">
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                      recipe.instructions.map((inst, i) => (
                        <li key={i}>
                          <span className="step-num">{i + 1}</span>
                          <span className="step-text">{inst}</span>
                        </li>
                      ))
                    ) : (
                      <li className="empty">Inga instruktioner</li>
                    )}
                  </ol>
                </div>
              </div>

              {/* Nutrition (if available) */}
              {recipe.nutritionalInfo && (
                <div className="nutrition-bar">
                  {recipe.nutritionalInfo.calories && (
                    <div className="nut-item">
                      <span className="nut-val">{recipe.nutritionalInfo.calories}</span>
                      <span className="nut-label">kcal</span>
                    </div>
                  )}
                  {recipe.nutritionalInfo.protein && (
                    <div className="nut-item">
                      <span className="nut-val">{recipe.nutritionalInfo.protein}g</span>
                      <span className="nut-label">protein</span>
                    </div>
                  )}
                  {recipe.nutritionalInfo.carbs && (
                    <div className="nut-item">
                      <span className="nut-val">{recipe.nutritionalInfo.carbs}g</span>
                      <span className="nut-label">kolhydrater</span>
                    </div>
                  )}
                  {recipe.nutritionalInfo.fat && (
                    <div className="nut-item">
                      <span className="nut-val">{recipe.nutritionalInfo.fat}g</span>
                      <span className="nut-label">fett</span>
                    </div>
                  )}
                </div>
              )}

              {/* Page footer */}
              <div className="page-footer">
                <span>www.functionalfoods.se</span>
                <span>Recept {index + 1} av {recipes.length}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-recipes">
            <p>Inga recept tillgängliga för denna vecka.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .print-wrapper {
          background: white;
        }

        /* Screen-only header */
        .screen-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          color: white;
          padding: 1rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .header-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .header-title strong {
          font-size: 1.1rem;
        }

        .header-title span {
          font-size: 0.85rem;
          opacity: 0.85;
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .print-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        /* Recipe container */
        .recipes-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        /* Recipe page */
        .recipe-page {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          margin-bottom: 2rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .page-header {
          background: #014421;
          color: white;
          padding: 0.75rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .brand-icon {
          font-size: 1.25rem;
        }

        .brand-name {
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .page-info {
          font-size: 0.85rem;
          opacity: 0.9;
          display: flex;
          gap: 0.5rem;
        }

        .recipe-title-section {
          padding: 1.5rem;
          text-align: center;
          border-bottom: 2px solid #93C560;
        }

        .meal-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #F7F1E8;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          color: #014421;
          margin-bottom: 0.75rem;
        }

        .badge-day {
          font-weight: 600;
        }

        .badge-dot {
          opacity: 0.5;
        }

        .recipe-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #014421;
          margin: 0 0 0.75rem;
          line-height: 1.3;
        }

        .recipe-meta {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .recipe-content {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 0;
        }

        .ingredients-box {
          background: #F7F1E8;
          padding: 1.25rem;
          border-right: 1px solid #e5ddd0;
        }

        .instructions-box {
          padding: 1.25rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          color: #014421;
          margin: 0 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #93C560;
        }

        .title-icon {
          font-size: 1.1rem;
        }

        .ingredients-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ingredients-list li {
          padding: 0.4rem 0;
          border-bottom: 1px dashed #d5cdc0;
          font-size: 0.9rem;
          color: #333;
          position: relative;
          padding-left: 1rem;
        }

        .ingredients-list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #93C560;
          font-weight: bold;
        }

        .ingredients-list li:last-child {
          border-bottom: none;
        }

        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instructions-list li {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          color: #333;
          line-height: 1.5;
        }

        .step-num {
          width: 24px;
          height: 24px;
          background: #014421;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-text {
          flex: 1;
          padding-top: 2px;
        }

        .nutrition-bar {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 1rem;
          background: #f8f8f8;
          border-top: 1px solid #eee;
        }

        .nut-item {
          text-align: center;
        }

        .nut-val {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: #014421;
        }

        .nut-label {
          font-size: 0.7rem;
          color: #888;
          text-transform: uppercase;
        }

        .page-footer {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background: #f5f5f5;
          font-size: 0.8rem;
          color: #888;
        }

        .empty {
          color: #999;
          font-style: italic;
        }

        .no-recipes {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body, html {
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-wrapper {
            background: white;
          }

          .recipes-container {
            max-width: none;
            padding: 0;
            margin: 0;
          }

          .recipe-page {
            page-break-after: always;
            page-break-inside: avoid;
            border: none;
            border-radius: 0;
            box-shadow: none;
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .recipe-page:last-child {
            page-break-after: auto;
          }

          .page-header {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0.6rem 1rem;
          }

          .recipe-title-section {
            padding: 1rem 1.5rem;
            border-bottom: 2px solid #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .meal-badge {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .recipe-content {
            flex: 1;
          }

          .ingredients-box {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            padding: 1rem;
          }

          .instructions-box {
            padding: 1rem;
          }

          .section-title {
            border-bottom: 2px solid #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .step-num {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .nutrition-bar {
            background: #f8f8f8 !important;
            -webkit-print-color-adjust: exact !important;
            padding: 0.75rem;
            gap: 1.5rem;
          }

          .page-footer {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact !important;
            margin-top: auto;
          }
        }

        @page {
          size: A4;
          margin: 8mm;
        }
      `}</style>
    </div>
  );
}
