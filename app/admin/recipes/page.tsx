'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Search, Filter, Coffee, Clock, Users, ChefHat, BookOpen, Sparkles, Star, Sprout, Waves, Zap, Award, CheckCircle, FileEdit, Archive } from 'lucide-react';

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
  tags?: string[];
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

  useEffect(() => {
    fetchRecipes();
  }, [filter, courseFilter, searchTerm]);

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
          <div className="bg-white rounded-3xl shadow-lg p-12">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="w-20 h-20 border-3 border-[var(--primary-beige)] rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-3 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-[var(--text-secondary)] text-lg font-light">Laddar recept...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-light-green)] to-[var(--primary-green)] rounded-2xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-light text-[var(--primary-green)]">Recepthantering</h1>
            </div>
            <p className="text-[var(--text-secondary)] font-light text-lg ml-15">
              Skapa, redigera och organisera recept för alla kurser
            </p>
          </div>
          <Link 
            href="/admin/recipes/new"
            className="admin-btn admin-btn-primary shadow-lg hover:shadow-xl group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Skapa nytt recept
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-stat-card hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value bg-gradient-to-r from-[var(--primary-green)] to-[var(--primary-light-green)] bg-clip-text text-transparent">{stats.total}</div>
                <div className="admin-stat-label">Totalt antal</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-beige)] to-white rounded-2xl flex items-center justify-center shadow-inner">
                <Coffee className="w-7 h-7 text-[var(--primary-green)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-stat-card hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value text-[var(--primary-light-green)]">{stats.free}</div>
                <div className="admin-stat-label">Gratis recept</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Coffee className="w-7 h-7 text-[var(--primary-light-green)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="admin-stat-card hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value text-[var(--coral-accent)]">{stats.premium}</div>
                <div className="admin-stat-label">Premium recept</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Coffee className="w-7 h-7 text-[var(--coral-accent)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="admin-stat-card hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="admin-stat-value text-[var(--primary-green)]">{stats.visible}</div>
                <div className="admin-stat-label">Publicerade</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-beige)] to-white rounded-2xl flex items-center justify-center shadow-inner">
                <Coffee className="w-7 h-7 text-[var(--primary-green)]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-light)] p-6 mb-8">
          <div className="space-y-4">
            {/* Top row - Status filters and search */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
                  className={`admin-btn transition-all duration-200 ${
                filter === 'all' 
                      ? 'admin-btn-primary shadow-md' 
                      : 'admin-btn-secondary hover:shadow-sm'
              }`}
            >
                  <Filter className="w-4 h-4" />
                  Alla recept
            </button>
            <button
              onClick={() => setFilter('free')}
                  className={`admin-btn transition-all duration-200 ${
                filter === 'free' 
                      ? 'admin-btn-success shadow-md' 
                      : 'admin-btn-secondary hover:shadow-sm'
              }`}
            >
              Gratis
            </button>
            <button
              onClick={() => setFilter('premium')}
                  className={`admin-btn transition-all duration-200 ${
                filter === 'premium' 
                      ? 'bg-[var(--coral-accent)] text-white shadow-md' 
                      : 'admin-btn-secondary hover:shadow-sm'
              }`}
            >
              Premium
            </button>
          </div>

              {/* Search bar */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input pl-12 w-full shadow-sm focus:shadow-md transition-shadow duration-200"
                />
              </div>
            </div>

            {/* Course filters */}
            <div className="pt-4 border-t border-[var(--border-light)]">
              <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Filtrera per kurs:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCourseFilter('all')}
                  className={`admin-btn transition-all duration-200 ${
                    courseFilter === 'all' 
                      ? 'bg-gradient-to-r from-[var(--primary-green)] to-[var(--primary-light-green)] text-white shadow-md border-transparent' 
                      : 'bg-white text-[var(--text-secondary)] border-gray-200 hover:border-[var(--primary-light-green)] hover:shadow-sm'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Alla kurser
                </button>
                <button
                  onClick={() => setCourseFilter('functional-basics')}
                  className={`admin-btn transition-all duration-200 ${
                    courseFilter === 'functional-basics' 
                      ? 'bg-blue-600 text-white shadow-md border-blue-600' 
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 hover:shadow-sm'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  Basics ({recipes.filter(r => r.tags?.includes('Basic')).length})
                </button>
                <button
                  onClick={() => setCourseFilter('functional-flow')}
                  className={`admin-btn transition-all duration-200 ${
                    courseFilter === 'functional-flow' 
                      ? 'bg-green-600 text-white shadow-md border-green-600' 
                      : 'bg-green-50 text-green-700 border-green-200 hover:border-green-400 hover:shadow-sm'
                  }`}
                >
                  <Waves className="w-4 h-4" />
                  Flow ({recipes.filter(r => r.tags?.includes('Flow')).length})
                </button>
                <button
                  onClick={() => setCourseFilter('functional-energy')}
                  className={`admin-btn transition-all duration-200 ${
                    courseFilter === 'functional-energy' 
                      ? 'bg-orange-600 text-white shadow-md border-orange-600' 
                      : 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400 hover:shadow-sm'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Energy ({recipes.filter(r => r.tags?.includes('Energy')).length})
                </button>
              </div>
            </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-[var(--border-light)] hover:border-[var(--primary-light-green)]"
          >
            {/* Recipe Image */}
            <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {recipe.imageUrl && !imageError[recipe.id] ? (
                <Image
                  src={normalizeImageUrl(recipe.imageUrl)}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setImageError(prev => ({ ...prev, [recipe.id]: true }))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary-beige)] to-white">
                  <Coffee className="w-20 h-20 text-[var(--primary-light-green)] opacity-50" />
                </div>
              )}

              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {recipe.isPremium && (
                  <span className="admin-badge admin-badge-warning backdrop-blur-sm bg-opacity-90 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Premium
                  </span>
                )}
                {recipe.isFree && !recipe.isPremium && (
                  <span className="admin-badge admin-badge-success backdrop-blur-sm bg-opacity-90 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Gratis
                  </span>
                )}
                {recipe.status === 'DRAFT' && (
                  <span className="admin-badge admin-badge-info backdrop-blur-sm bg-opacity-90 flex items-center gap-1">
                    <FileEdit className="w-3 h-3" />
                    Utkast
                  </span>
                )}
                {recipe.status === 'ARCHIVED' && (
                  <span className="admin-badge admin-badge-danger backdrop-blur-sm bg-opacity-90 flex items-center gap-1">
                    <Archive className="w-3 h-3" />
                    Arkiverad
                  </span>
                )}
              </div>

              {/* Course badges */}
              <div className="absolute bottom-3 right-3 flex gap-1">
                {recipe.tags?.includes('Basic') && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm bg-opacity-90">
                    B
                  </span>
                )}
                {recipe.tags?.includes('Flow') && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm bg-opacity-90">
                    F
                  </span>
                )}
                {recipe.tags?.includes('Energy') && (
                  <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm bg-opacity-90">
                    E
                  </span>
                )}
              </div>
            </div>

            {/* Recipe Info */}
            <div className="p-5">
              <h3 className="font-medium text-lg mb-2 line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--primary-green)] transition-colors">
                {recipe.title}
              </h3>
              
              {recipe.excerpt && (
                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 font-light">
                  {recipe.excerpt}
                </p>
              )}

              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {recipe.categories.slice(0, 2).map((category, index) => (
                  <span 
                    key={index}
                    className="bg-[var(--primary-beige)] text-[var(--text-primary)] text-xs px-2.5 py-1 rounded-lg font-light"
                  >
                    {category}
                  </span>
                ))}
                {recipe.categories.length > 2 && (
                  <span className="text-[var(--text-secondary)] text-xs self-center">
                    +{recipe.categories.length - 2}
                  </span>
                )}
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-4 pb-4 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-3">
                {recipe.servings && (
                  <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {recipe.servings}
                  </span>
                )}
                {recipe.prepTime && (
                  <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                    {recipe.prepTime}
                  </span>
                )}
                </div>
                <span className="text-xs opacity-60">
                  {new Date(recipe.date).toLocaleDateString('sv-SE')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/recipes/${recipe.slug}/edit`}
                  className="flex-1 admin-btn admin-btn-secondary justify-center hover:bg-[var(--primary-beige)] group/btn"
                >
                  <Edit3 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                  Redigera
                </Link>
                <button
                  onClick={() => handleDeleteRecipe(recipe.slug, recipe.title)}
                  className="admin-btn hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors p-2.5"
                  title="Ta bort recept"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRecipes.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-[var(--border-light)] p-12 max-w-md mx-auto">
            <Coffee className="w-20 h-20 text-[var(--primary-light-green)] mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
              {searchTerm ? 'Inga recept hittades' : 'Inga recept än'}
            </h3>
            <p className="text-[var(--text-secondary)] font-light mb-6">
              {searchTerm 
                ? `Inga recept matchar sökningen "${searchTerm}".` 
                : 'Börja bygga din receptsamling genom att skapa det första receptet.'}
            </p>
            {!searchTerm && (
              <Link
                href="/admin/recipes/new"
                className="inline-flex items-center gap-2 admin-btn admin-btn-primary shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Skapa första receptet
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
} 