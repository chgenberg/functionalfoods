'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  isFree: boolean;
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  date: string;
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [filter, searchTerm]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter === 'free') {
        params.append('status', 'published');
      } else if (filter === 'premium') {
        params.append('status', 'premium');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      params.append('limit', '100'); // Visa många recept i admin

      const response = await fetch(`/api/recipes?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecipes(data.recipes);
      } else {
        setError(data.error || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: string, title: string) => {
    if (!confirm(`Är du säker på att du vill ta bort receptet "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        alert('Receptet har tagits bort');
      } else {
        const data = await response.json();
        alert(`Fel vid borttagning: ${data.error}`);
      }
    } catch (err) {
      alert('Fel vid borttagning av recept');
      console.error('Error deleting recipe:', err);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (filter === 'free') return recipe.isFree && !recipe.isPremium;
    if (filter === 'premium') return recipe.isPremium;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Recepthantering</h1>
            <Link 
              href="/admin/recipes/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Lägg till nytt recept
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Alla ({recipes.length})
              </button>
              <button
                onClick={() => setFilter('free')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'free' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Gratis ({recipes.filter(r => r.isFree && !r.isPremium).length})
              </button>
              <button
                onClick={() => setFilter('premium')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'premium' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Premium ({recipes.filter(r => r.isPremium).length})
              </button>
            </div>

            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Sök recept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Recipe Image */}
              <div className="h-48 bg-gray-200 relative">
                {recipe.imageUrl && recipe.imageUrl !== '/images/recipe-placeholder.svg' ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {recipe.isPremium && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                  {recipe.isFree && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Gratis
                    </span>
                  )}
                </div>
              </div>

              {/* Recipe Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                
                {recipe.excerpt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.excerpt}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.categories.slice(0, 2).map((category, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {category}
                    </span>
                  ))}
                  {recipe.categories.length > 2 && (
                    <span className="text-gray-500 text-xs">+{recipe.categories.length - 2}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{recipe.difficulty || 'Okänd'}</span>
                  <span>{recipe.servings || 'N/A'} port.</span>
                  <span>{recipe.prepTime || 'N/A'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/recipes/${recipe.id}/edit`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Redigera
                  </Link>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Ta bort
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecipes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchTerm ? 'Inga recept hittades för din sökning.' : 'Inga recept hittades.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 