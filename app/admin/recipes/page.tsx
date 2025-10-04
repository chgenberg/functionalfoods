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
  const [courseFilter, setCourseFilter] = useState<'all' | 'functional-basics' | 'functional-flow' | 'functional-energy'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [fallbackImages, setFallbackImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRecipes();
  }, [filter, courseFilter, searchTerm]);

  // Fetch optimized images after recipes are loaded
  useEffect(() => {
    if (recipes.length > 0) {
      fetchRecipeImages();
    }
  }, [recipes]);

  const fetchRecipeImages = async () => {
    try {
      const recipeNames = recipes.map(recipe => recipe.title);
      const response = await fetch('/api/recipes/batch-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeNames,
          size: 'medium',
          usage: 'card'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update recipes with optimized image URLs
        setRecipes(prevRecipes => 
          prevRecipes.map(recipe => ({
            ...recipe,
            imageUrl: data.images[recipe.title] || recipe.imageUrl
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching recipe images:', error);
    }
  };

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
      
      if (courseFilter !== 'all') {
        // Map UI filter to actual tags in database
        const courseTagMap: Record<string, string> = {
          'functional-basics': 'Basic',
          'functional-flow': 'Flow',
          'functional-energy': 'Energy'
        };
        params.append('courseFilter', courseTagMap[courseFilter] || courseFilter);
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

  const handleDeleteRecipe = async (slug: string, title: string) => {
    if (!confirm(`Är du säker på att du vill ta bort receptet "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${slug}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecipes(recipes.filter(recipe => recipe.slug !== slug));
        // Uppdatera stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          free: recipes.find(r => r.slug === slug)?.isFree ? prev.free - 1 : prev.free,
          premium: recipes.find(r => r.slug === slug)?.isPremium ? prev.premium - 1 : prev.premium
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
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar recept...</p>
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
            <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Recepthantering</h1>
            <p className="text-[var(--text-secondary)] font-light">Hantera alla recept på plattformen</p>
          </div>
          <Link 
            href="/admin/recipes/new"
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Skapa nytt recept
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value">{stats.total}</div>
                <div className="admin-stat-label">Totalt antal</div>
              </div>
              <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[var(--primary-green)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value">{stats.free}</div>
                <div className="admin-stat-label">Gratis recept</div>
              </div>
              <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[var(--primary-light-green)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value">{stats.premium}</div>
                <div className="admin-stat-label">Premium recept</div>
              </div>
              <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[var(--coral-accent)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="admin-stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value">{stats.visible}</div>
                <div className="admin-stat-label">Publicerade</div>
              </div>
              <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[var(--primary-green)]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`admin-btn ${
                filter === 'all' 
                  ? 'admin-btn-primary' 
                  : 'admin-btn-secondary'
              }`}
            >
              Alla
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`admin-btn ${
                filter === 'free' 
                  ? 'admin-btn-primary' 
                  : 'admin-btn-secondary'
              }`}
            >
              Gratis
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`admin-btn ${
                filter === 'premium' 
                  ? 'admin-btn-primary' 
                  : 'admin-btn-secondary'
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Course Filter */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCourseFilter('all')}
              className={`admin-btn ${
                courseFilter === 'all' 
                  ? 'bg-[#014421] text-white border-[#014421]' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#014421]'
              }`}
            >
              🌟 Alla kurser
            </button>
            <button
              onClick={() => setCourseFilter('functional-basics')}
              className={`admin-btn ${
                courseFilter === 'functional-basics' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-600'
              }`}
            >
              🌱 Basics
            </button>
            <button
              onClick={() => setCourseFilter('functional-flow')}
              className={`admin-btn ${
                courseFilter === 'functional-flow' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-green-50 text-green-700 border-green-200 hover:border-green-600'
              }`}
            >
              🌊 Flow
            </button>
            <button
              onClick={() => setCourseFilter('functional-energy')}
              className={`admin-btn ${
                courseFilter === 'functional-energy' 
                  ? 'bg-orange-600 text-white border-orange-600' 
                  : 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-600'
              }`}
            >
              ⚡ Energy
            </button>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-full"
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
            className="admin-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
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
                  <span className="admin-badge admin-badge-warning">
                    Premium
                  </span>
                )}
                {recipe.isFree && !recipe.isPremium && (
                  <span className="admin-badge admin-badge-success">
                    Gratis
                  </span>
                )}
                {recipe.status === 'DRAFT' && (
                  <span className="admin-badge admin-badge-info">
                    Utkast
                  </span>
                )}
              </div>
            </div>

            {/* Recipe Info */}
            <div className="p-5">
              <h3 className="font-medium text-lg mb-2 line-clamp-2 text-[var(--text-primary)]">{recipe.title}</h3>
              
              {recipe.excerpt && (
                <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2 font-light">{recipe.excerpt}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.categories.slice(0, 2).map((category, index) => (
                  <span 
                    key={index}
                    className="bg-[var(--primary-beige)] text-[var(--text-primary)] text-xs px-3 py-1 rounded-full font-light border border-[var(--border-light)]"
                  >
                    {category}
                  </span>
                ))}
                {recipe.categories.length > 2 && (
                  <span className="text-[var(--text-secondary)] text-xs">+{recipe.categories.length - 2}</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-4">
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
                  className="flex-1 admin-btn admin-btn-secondary justify-center"
                >
                  <Edit3 className="w-4 h-4" />
                  Redigera
                </Link>
                <button
                  onClick={() => handleDeleteRecipe(recipe.slug, recipe.title)}
                  className="admin-btn admin-btn-danger justify-center"
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
          <Coffee className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <div className="text-[var(--text-secondary)] text-lg font-light">
            {searchTerm ? 'Inga recept hittades för din sökning.' : 'Inga recept hittades.'}
          </div>
          <Link
            href="/admin/recipes/new"
            className="inline-flex items-center gap-2 mt-4 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Skapa ditt första recept
          </Link>
        </div>
      )}
    </div>
  );
} 