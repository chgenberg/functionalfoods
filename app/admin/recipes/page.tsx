'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Search, Filter, Coffee, Clock, Users } from 'lucide-react';

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

interface RecipeStats {
  total: number;
  free: number;
  premium: number;
  visible: number;
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<RecipeStats>({ total: 0, free: 0, premium: 0, visible: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [fallbackImages, setFallbackImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRecipes();
  }, [filter, searchTerm]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Hämta ALLA recept för admin, inte bara publicerade
      if (filter === 'free') {
        params.append('adminFilter', 'free');
      } else if (filter === 'premium') {
        params.append('adminFilter', 'premium');
      } else {
        params.append('adminFilter', 'all');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      params.append('limit', '200'); // Visa många recept i admin
      params.append('adminMode', 'true'); // Indikera att detta är admin-läge

      const response = await fetch(`/api/admin/recipes?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecipes(data.recipes || []);
        setStats(data.statistics || { total: 0, free: 0, premium: 0, visible: 0 });
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

  // After recipes load, compute fallbacks for any missing/placeholder images
  useEffect(() => {
    const titlesNeedingImages = recipes
      .filter(r => !r.imageUrl || r.imageUrl.includes('placeholder'))
      .map(r => r.title);
    if (titlesNeedingImages.length === 0) return;

    fetch('/api/recipes/batch-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeNames: titlesNeedingImages, size: 'small', usage: 'card' })
    })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('failed')))
      .then(data => {
        if (data && data.images) {
          setFallbackImages((prev) => ({ ...prev, ...data.images }));
        }
      })
      .catch(() => {});
  }, [recipes]);

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
        // Uppdatera stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          free: recipes.find(r => r.id === id)?.isFree ? prev.free - 1 : prev.free,
          premium: recipes.find(r => r.id === id)?.isPremium ? prev.premium - 1 : prev.premium
        }));
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

  const normalizeImageUrl = (url: string | undefined | null): string => {
    if (!url) return '/images/recipe-placeholder.svg';
    
    let normalized = url;
    
    // Hantera olika bildformat
    if (normalized.startsWith('/public/')) {
      normalized = normalized.replace('/public', '');
    }
    if (normalized.startsWith('public/')) {
      normalized = '/' + normalized.substring(7);
    }
    
    // Ensure leading slash for local assets
    if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
      normalized = '/' + normalized;
    }
    
    return normalized;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#93C560] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-500 mt-4 font-light">Laddar recept...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-light text-[#014421] mb-2">Recepthantering</h1>
            <p className="text-gray-500 font-light">Hantera alla recept på plattformen</p>
          </div>
          <Link 
            href="/admin/recipes/new"
            className="flex items-center gap-2 bg-gradient-to-r from-[#93C560] to-[#7BA94D] text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Skapa nytt recept
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-light">Totalt antal</p>
                <p className="text-3xl font-light text-[#014421]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-500/30 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-light">Gratis recept</p>
                <p className="text-3xl font-light text-[#93C560]">{stats.free}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#93C560]/20 to-[#93C560]/30 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[#93C560]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-light">Premium recept</p>
                <p className="text-3xl font-light text-purple-600">{stats.premium}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-purple-500/30 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-light">Publicerade</p>
                <p className="text-3xl font-light text-blue-600">{stats.visible}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-500/30 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all font-light ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-[#93C560] to-[#7BA94D] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Alla
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-4 py-2 rounded-xl transition-all font-light ${
                filter === 'free' 
                  ? 'bg-gradient-to-r from-[#93C560] to-[#7BA94D] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Gratis
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-2 rounded-xl transition-all font-light ${
                filter === 'premium' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Premium
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#93C560] focus:border-transparent font-light"
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
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Recipe Image */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {(() => {
                const primary = normalizeImageUrl(recipe.imageUrl);
                const fallback = fallbackImages[recipe.title];
                const useFallback = imageError[recipe.id] || !primary || primary.includes('placeholder');
                const finalSrc = useFallback ? (fallback || '/images/recipe-placeholder.svg') : primary;
                return finalSrc ? (
                  <Image
                    src={finalSrc}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(prev => ({ ...prev, [recipe.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                    <Coffee className="w-16 h-16 text-orange-400" />
                  </div>
                );
              })()}

              {/* Status badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {recipe.isPremium && (
                  <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Premium
                  </span>
                )}
                {recipe.isFree && !recipe.isPremium && (
                  <span className="bg-[#93C560] text-white text-xs px-3 py-1 rounded-full font-medium">
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
              <h3 className="font-medium text-lg mb-2 line-clamp-2 text-[#014421]">{recipe.title}</h3>
              
              {recipe.excerpt && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 font-light">{recipe.excerpt}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.categories.slice(0, 2).map((category, index) => (
                  <span 
                    key={index}
                    className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-light"
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
                    <Filter className="w-4 h-4" />
                    {recipe.difficulty}
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} port
                  </span>
                )}
                {recipe.prepTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
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
                  <Edit3 className="w-4 h-4" />
                  Redigera
                </Link>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 px-4 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Ta bort
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center py-16">
          <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500 text-lg font-light">
            {searchTerm ? 'Inga recept hittades för din sökning.' : 'Inga recept hittades.'}
          </div>
          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center gap-2 mt-4 text-[#93C560] hover:text-[#7BA94D] font-light"
          >
            <Plus className="w-5 h-5" />
            Skapa ditt första recept
          </Link>
        </div>
      )}
    </div>
  );
} 