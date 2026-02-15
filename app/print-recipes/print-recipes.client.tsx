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
}

export default function Client() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const week = parseInt(searchParams.get('week') || '1');
  const course = (searchParams.get('course') || 'basics') as 'basics' | 'flow' | 'energy' | 'hormone' | 'prova-pa-vecka';

  const courseName = course === 'basics' ? 'Functional Basics'
    : course === 'flow' ? 'Functional Flow'
    : course === 'hormone' ? 'Hormonell Balans'
    : course === 'prova-pa-vecka' ? 'Prova på vecka'
    : 'Functional Energy';

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const headersBase: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headersBase['Authorization'] = `Bearer ${token}`;

        const listRes = await fetch(`/api/shopping-list/${course}/${week}`, { headers: headersBase });

        const listData = listRes.ok ? await listRes.json() : null;
        
        const entries: Array<{ day: string; mealType: string; slug: string }> =
          Array.isArray(listData?.recipeEntries) ? listData.recipeEntries : [];

        const slugs = Array.from(
          new Set([
          ...entries.map(e => e.slug).filter(Boolean),
          ...(Array.isArray(listData?.recipes) ? listData.recipes : []).filter(Boolean),
          ])
        );

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
              description: r.description || '',
              servings: r.servings || '',
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F1E8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #014421', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#014421' }}>Laddar recept...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Global print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .recipe-page {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            break-after: page !important;
            break-inside: avoid !important;
          }
          
          .recipe-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      <div style={{ background: 'white', minHeight: '100vh' }}>
        {/* Screen header */}
        <div className="no-print" style={{ 
          background: 'linear-gradient(135deg, #014421 0%, #116530 100%)', 
          color: 'white', 
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <ArrowLeft style={{ width: 20, height: 20 }} />
              <span>Tillbaka</span>
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>{courseName}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Vecka {week} • {recipes.length} recept</div>
            </div>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' }}>
              <Printer style={{ width: 16, height: 16 }} />
              <span>Skriv ut</span>
            </button>
          </div>
        </div>

        {/* Recipes */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
          {recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <div 
                key={index} 
                className="recipe-page"
                style={{
                  background: 'white',
                  marginBottom: '2rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header */}
                <div style={{ background: '#014421', color: 'white', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🌿</span>
                    <span style={{ fontSize: '0.85rem', letterSpacing: 1 }}>FUNCTIONAL FOODS</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    {courseName} • Vecka {week}
                  </div>
                </div>

                {/* Title */}
                <div style={{ padding: '1.25rem 1.5rem', textAlign: 'center', borderBottom: '3px solid #93C560' }}>
                  <div style={{ 
                    display: 'inline-block',
                    background: '#F7F1E8', 
                    padding: '0.35rem 1rem', 
                    borderRadius: 100, 
                    fontSize: '0.8rem',
                    color: '#014421',
                    marginBottom: '0.75rem'
                  }}>
                    {recipe.dayName} • {recipe.mealType}
                  </div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#014421', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                    {recipe.title}
                  </h1>
                  <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    {recipe.servings && <span>👥 {recipe.servings} portioner</span>}
                    {recipe.cookingTime && <span>⏱️ {recipe.cookingTime}</span>}
                  </div>
                </div>

                {/* Content - two columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr' }}>
                  {/* Ingredients */}
                  <div style={{ background: '#F7F1E8', padding: '1rem 1.25rem', borderRight: '1px solid #e5ddd0' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#014421', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #93C560', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🥗</span> Ingredienser
                    </h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ing, i) => (
                          <li key={i} style={{ padding: '0.3rem 0', borderBottom: '1px dashed #d5cdc0', fontSize: '0.85rem', color: '#333', paddingLeft: '0.75rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: '#93C560', fontWeight: 'bold' }}>•</span>
                            {ing}
                          </li>
                        ))
                      ) : (
                        <li style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>Inga ingredienser</li>
                      )}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#014421', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #93C560', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>👨‍🍳</span> Gör så här
                    </h2>
                    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {recipe.instructions && recipe.instructions.length > 0 ? (
                        recipe.instructions.map((inst, i) => (
                          <li key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: '#333', lineHeight: 1.45 }}>
                            <span style={{ 
                              width: 22, 
                              height: 22, 
                              background: '#014421', 
                              color: 'white', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '0.75rem', 
                              fontWeight: 700,
                              flexShrink: 0
                            }}>{i + 1}</span>
                            <span style={{ flex: 1 }}>{inst}</span>
                          </li>
                        ))
                      ) : (
                        <li style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>Inga instruktioner</li>
                      )}
                    </ol>
                  </div>
                </div>

                {/* Nutrition */}
                {recipe.nutritionalInfo && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', padding: '0.75rem', background: '#f8f8f8', borderTop: '1px solid #eee' }}>
                    {recipe.nutritionalInfo.calories && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#014421' }}>{recipe.nutritionalInfo.calories}</div>
                        <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>kcal</div>
                      </div>
                    )}
                    {recipe.nutritionalInfo.protein && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#014421' }}>{recipe.nutritionalInfo.protein}g</div>
                        <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>protein</div>
                      </div>
                    )}
                    {recipe.nutritionalInfo.carbs && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#014421' }}>{recipe.nutritionalInfo.carbs}g</div>
                        <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>kolhydrater</div>
                      </div>
                    )}
                    {recipe.nutritionalInfo.fat && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#014421' }}>{recipe.nutritionalInfo.fat}g</div>
                        <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>fett</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1.25rem', background: '#f5f5f5', fontSize: '0.75rem', color: '#888' }}>
                  <span>www.functionalfoods.se</span>
                  <span>Recept {index + 1} av {recipes.length}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Inga recept tillgängliga.</p>
          )}
        </div>
      </div>
    </>
  );
}
