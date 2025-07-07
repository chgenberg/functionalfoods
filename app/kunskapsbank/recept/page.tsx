"use client";

import React, { useState, useEffect } from 'react';
import RecipeCard from '../../components/RecipeCard';
import { useAuth } from '../../hooks/useAuth';

interface Recipe {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'publish' | 'draft';
  isPremium: boolean;
  date: string;
  author: {
    name: string;
    username: string;
  };
}

interface RecipeData {
  recipes: Recipe[];
  userAccess: {
    hasAccess: boolean;
    userId: string | null;
  };
  statistics: {
    total: number;
    free: number;
    premium: number;
    visible: number;
  };
}

const RecipesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccess, setUserAccess] = useState<{ hasAccess: boolean; userId: string | null }>({ hasAccess: false, userId: null });
  const [statistics, setStatistics] = useState({ total: 0, free: 0, premium: 0, visible: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { user } = useAuth();

  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  const fetchRecipes = async () => {
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

      const response = await fetch('/api/recipes?limit=100', { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data: RecipeData = await response.json();
      setRecipes(data.recipes);
      setUserAccess(data.userAccess);
      setStatistics(data.statistics || { total: 0, free: 0, premium: 0, visible: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get all unique categories from recipes
  const categories = ['all', ...new Set(recipes.flatMap(recipe => recipe.categories || []))];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || (recipe.categories && recipe.categories.includes(selectedCategory));
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'free' && !recipe.isPremium) ||
                         (selectedStatus === 'premium' && recipe.isPremium);
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (recipe.ingredients && recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          </div>
          <p className="text-gray-700 mt-4 text-lg font-medium">Laddar läckra recept...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Något gick fel</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRecipes}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-green-900 opacity-20"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
              Våra Recept
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto animate-fade-in animation-delay-200">
              Upptäck hälsosamma och näringsrika recept med funktionella livsmedel
            </p>
            {userAccess.hasAccess && (
              <div className="mt-6 inline-flex items-center bg-green-700 bg-opacity-50 backdrop-blur-sm px-4 py-2 rounded-full animate-fade-in animation-delay-400">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Full tillgång till alla premium-recept</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow-lg relative z-10 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
          <div className="text-center group">
            <div className="text-4xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">{statistics.total}</div>
            <div className="text-sm text-gray-600 mt-1">Totalt antal recept</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">{statistics.free}</div>
            <div className="text-sm text-gray-600 mt-1">Gratis recept</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">{statistics.premium}</div>
            <div className="text-sm text-gray-600 mt-1">Premium recept</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors">{filteredRecipes.length}</div>
            <div className="text-sm text-gray-600 mt-1">Visar just nu</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Filtrera recept</h2>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                title="Rutnätsvy"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                title="Listvy"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                Sök recept
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="Sök recept eller ingredienser..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori
              </label>
              <select
                id="category"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '🍽️ Alla kategorier' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Tillgänglighet
              </label>
              <select
                id="status"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">✨ Alla recept</option>
                <option value="free">🆓 Gratis recept</option>
                <option value="premium">💎 Premium recept</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Sökning: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-green-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Kategori: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="ml-2 hover:text-blue-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                  {selectedStatus === 'free' ? 'Gratis' : 'Premium'}
                  <button onClick={() => setSelectedStatus('all')} className="ml-2 hover:text-amber-900">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Recipe Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RecipeCard
                  recipe={recipe}
                  userAccess={userAccess}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="animate-fade-in bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <img
                      src={recipe.imageUrl || '/images/recipe-placeholder.jpg'}
                      alt={recipe.imageAlt || recipe.title}
                      className="w-full h-48 md:h-32 object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:w-3/4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                        <p className="text-gray-600 mb-3">{recipe.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {recipe.categories?.map((cat, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {recipe.isPremium && (
                          <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs px-3 py-1 rounded-full font-medium mb-2">
                            Premium
                          </span>
                        )}
                        <a
                          href={`/kunskapsbank/recept/${recipe.slug}`}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Läs mer →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">Inga recept hittades</p>
            <p className="text-gray-500 text-sm mb-6">Prova att ändra dina sökkriterier</p>
            {!userAccess.hasAccess && selectedStatus === 'premium' && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-gray-700 mb-4">
                  Vill du få tillgång till alla premium-recept?
                </p>
                <a
                  href="/utbildning"
                  className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Köp en kurs
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!userAccess.hasAccess && recipes.some(r => r.isPremium) && (
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Få tillgång till alla {statistics.premium} premium-recept
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Köp en kurs och lås upp hela vårt receptbibliotek med exklusiva, näringsrika recept
            </p>
            <a
              href="/utbildning"
              className="inline-flex items-center bg-white text-green-700 px-8 py-4 rounded-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Utforska våra kurser
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};

export default RecipesPage; 