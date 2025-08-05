'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter, FiCoffee, FiClock, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar recept...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recepthantering</h1>
            <p className="text-gray-600">Hantera alla recept på plattformen</p>
          </div>
          <Link 
            href="/admin/recipes/new"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            Skapa nytt recept
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Totalt antal</p>
                <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiCoffee className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gratis recept</p>
                <p className="text-2xl font-bold text-primary">
                  {recipes.filter(r => r.isFree && !r.isPremium).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-background-secondary rounded-xl flex items-center justify-center">
                <FiCoffee className="w-6 h-6 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Premium recept</p>
                <p className="text-2xl font-bold text-purple-600">
                  {recipes.filter(r => r.isPremium).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiCoffee className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Alla
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'free' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Gratis
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'premium' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Premium
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
          >
            {/* Recipe Image */}
            <div className="h-48 bg-gray-200 relative">
              {recipe.imageUrl && recipe.imageUrl !== '/images/recipe-placeholder.svg' ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <FiCoffee className="w-16 h-16 text-orange-400" />
                </div>
              )}
              
              {/* Status badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {recipe.isPremium && (
                  <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Premium
                  </span>
                )}
                {recipe.isFree && (
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                    Gratis
                  </span>
                )}
                {recipe.status === 'DRAFT' && (
                  <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Utkast
                  </span>
                )}
              </div>
            </div>

            {/* Recipe Info */}
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">{recipe.title}</h3>
              
              {recipe.excerpt && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.excerpt}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.categories.slice(0, 2).map((category, index) => (
                  <span 
                    key={index}
                    className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {recipe.categories.length > 2 && (
                  <span className="text-gray-500 text-xs">+{recipe.categories.length - 2}</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {recipe.difficulty && (
                  <span className="flex items-center gap-1">
                    <FiFilter className="w-4 h-4" />
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    {recipe.servings} port
                  </span>
                )}
                {recipe.prepTime && (
                  <span className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {recipe.prepTime}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/recipes/${recipe.slug}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 px-4 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Redigera
                </Link>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 px-4 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Ta bort
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center py-16">
          <FiCoffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500 text-lg">
            {searchTerm ? 'Inga recept hittades för din sökning.' : 'Inga recept hittades.'}
          </div>
          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center gap-2 mt-4 text-orange-600 hover:text-orange-700"
          >
            <FiPlus className="w-5 h-5" />
            Skapa ditt första recept
          </Link>
        </div>
      )}
    </div>
  );
} 