"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Filter, Grid, List, Search } from "lucide-react";
import { useAuth } from '../../hooks/useAuth';
import { useT } from '@/app/lib/i18n/LanguageProvider';
import { optimizeImageUrl, getResponsiveSizes } from '../../lib/imageOptimization';

interface Recipe {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  isFree: boolean;
  isAccessible?: boolean;
  isComingSoon?: boolean;
  date: string;
  author: {
    name: string;
    username: string;
  };
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
}

interface RecipeData {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  categories: string[];
  statistics: {
    total: number;
    free: number;
    premium: number;
    visible: number;
  };
}

const RecipesPage = () => {
  // All state declarations first
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccess, setUserAccess] = useState<{ hasAccess: boolean; userId: string | null }>({ hasAccess: false, userId: null });
  const [statistics, setStatistics] = useState({ total: 0, free: 0, premium: 0, visible: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // All refs after state
  const searchRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  // All hooks after refs
  const { user } = useAuth();
  const t = useT();

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Define fetchRecipes before any effects that reference it to avoid TDZ errors
  const fetchRecipes = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setPage(1);
        setRecipes([]);
      }
      
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const token = getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      params.append('limit', '12');
      params.append('page', page.toString());
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/recipes?${params}`, { headers, cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data: RecipeData = await response.json();
      const fetchedRecipes = data.recipes || [];

      setRecipes(prev => reset ? fetchedRecipes : [...prev, ...fetchedRecipes]);
      setCategories(data.categories || []);
      setStatistics(data.statistics || { total: 0, free: 0, premium: 0, visible: 0 });
      setHasMore(data.pagination.hasMore);
      
      setUserAccess({ 
        hasAccess: !!user && !!token, 
        userId: user?.email || null 
      });
      
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av recept');
      setRecipes([]);
      setCategories([]);
      setStatistics({ total: 0, free: 0, premium: 0, visible: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedStatus, searchQuery, user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecipes();
    }, 300); // Debounce search by 300ms
    
    return () => clearTimeout(timeoutId);
  }, [user, selectedCategory, selectedStatus, searchQuery]);

  // Trigger fetching when page increments (infinite scroll)
  useEffect(() => {
    if (page > 1) {
      fetchRecipes();
    }
  }, [page, fetchRecipes]);

  useEffect(() => {
    // Reset recipes and page when filters change
    setRecipes([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    // Generate search suggestions based on search query
    if (searchQuery.length > 1) {
      const suggestions = recipes
        .filter(recipe => 
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map(recipe => recipe.title)
        .slice(0, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, recipes]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const lastRecipeElementRef = useCallback((node: Element | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || (recipe.categories && recipe.categories.includes(selectedCategory));
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'free' && recipe.isFree && !recipe.isPremium) ||
                         (selectedStatus === 'premium' && recipe.isPremium) ||
                         (selectedStatus === 'coming-soon' && recipe.isComingSoon === true);
    const matchesSearch = !searchQuery || 
                         recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (recipe.excerpt && recipe.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (recipe.ingredients && recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-800">{t('recipes.list.loading','Laddar recept...')}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('recipes.list.errorTitle','Kunde inte ladda recept')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchRecipes(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
          >
            {t('recipes.list.retry','Försök igen')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3EFE3' }}>
      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 px-4" style={{ backgroundColor: '#F3EFE3' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('recipes.list.title','Våra Recept')}
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t('recipes.list.subtitle','Upptäck hälsosamma och näringsrika recept med funktionella livsmedel')}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold text-orange-600">{statistics.total}</p>
              <p className="text-xs text-gray-600">{t('recipes.list.stats.total','Totalt')}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold text-primary">{statistics.free}</p>
              <p className="text-xs text-gray-600">{t('recipes.list.stats.free','Gratis')}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold text-amber-600">{statistics.premium}</p>
              <p className="text-xs text-gray-600">{t('recipes.list.stats.premium','Premium')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="sticky top-0 z-20 backdrop-blur-sm border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#F3EFE3E6' }} >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search with Autocomplete */}
            <div className="flex-1 relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('recipes.list.search.placeholder','Sök recept eller ingredienser...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-2"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                showFilters 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>{t('recipes.list.filters.button','Filter')}</span>
              {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {[selectedCategory !== 'all', selectedStatus !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* View Mode */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{t('recipes.list.filters.category','Kategori')}</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            selectedCategory === 'all'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('recipes.list.filters.all','Alla')}
                        </button>
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                              selectedCategory === category
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{t('recipes.list.filters.type','Typ')}</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'all', label: t('recipes.list.filters.typeAll','Alla'), color: 'gray' },
                          { value: 'free', label: t('recipes.list.filters.typeFree','Gratis'), color: 'green' },
                          { value: 'premium', label: t('recipes.list.filters.typePremium','Premium'), color: 'amber' },
                          { value: 'coming-soon', label: 'Kommer snart', color: 'gray' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setSelectedStatus(option.value)}
                            className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                              selectedStatus === option.value
                                ? `bg-${option.color}-500 text-white`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={selectedStatus === option.value ? {
                              backgroundColor: option.color === 'green' ? '#10b981' : option.color === 'amber' ? '#f59e0b' : '#6b7280',
                              color: 'white'
                            } : {}}
                          >
                            {selectedStatus === option.value && <Check className="w-3 h-3" />}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                    <div className="flex items-center gap-2 mt-4 text-sm">
                      <span className="text-gray-500">{t('recipes.list.filters.active','Aktiva filter:')}</span>
                      <div className="flex flex-wrap gap-2">
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {t('recipes.list.filters.searchLabel','Sökning:')} "{searchQuery}"
                            <button onClick={() => setSearchQuery('')} className="hover:text-orange-900">
                              <Search className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedCategory !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory('all')} className="hover:text-orange-900">
                              <Search className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedStatus !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {selectedStatus === 'free' ? t('recipes.list.filters.typeFree','Gratis') : 
                             selectedStatus === 'premium' ? t('recipes.list.filters.typePremium','Premium') : 
                             selectedStatus === 'coming-soon' ? 'Kommer snart' : ''}
                            <button onClick={() => setSelectedStatus('all')} className="hover:text-orange-900">
                              <Search className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recipe Grid/List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                ref={index === filteredRecipes.length - 1 ? lastRecipeElementRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RecipeCard recipe={recipe} userAccess={userAccess} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                ref={index === filteredRecipes.length - 1 ? lastRecipeElementRef : null}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RecipeListItem recipe={recipe} userAccess={userAccess} />
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg mb-2">{t('recipes.list.empty.title','Inga recept hittades')}</p>
            <p className="text-gray-500 text-sm mb-6">{t('recipes.list.empty.subtitle','Prova att ändra dina sökkriterier')}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              {t('recipes.list.empty.clearButton','Rensa filter')}
            </button>
          </motion.div>
        )}
      </div>

      {/* CTA Section */}
      {!userAccess.hasAccess && recipes.some(r => r.isPremium) && (
        <div className="bg-gradient-to-br from-orange-100 to-yellow-50 py-16 mt-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('recipes.list.cta.title','Få tillgång till alla premium-recept')}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {t('recipes.list.cta.subtitle','Köp en kurs och lås upp hela vårt receptbibliotek med exklusiva, näringsrika recept')}
            </p>
            <Link
              href="/utbildning"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t('recipes.list.cta.button','Utforska våra kurser')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Recipe Card Component
const RecipeCard: React.FC<{ recipe: Recipe; userAccess: any }> = ({ recipe, userAccess }) => {
  const canAccess = recipe.isAccessible !== false && (recipe.isFree || !recipe.isPremium || userAccess.hasAccess);
  const isComingSoon = recipe.isComingSoon === true;
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => {
    const primary = recipe.imageUrl ? optimizeImageUrl(recipe.imageUrl, 'medium', 'landscape') : '';
    return primary || '';
  });
  const [fallbackStep, setFallbackStep] = useState(0);
  const t = useT();

  const handleImageError = () => {
    // Try alternative sources based on known storage folders, then fallback to placeholder
    const candidates = [
      '/images/recipe-placeholder.svg'
    ];
    if (fallbackStep < candidates.length) {
      setImageSrc(candidates[fallbackStep]);
      setFallbackStep(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <Link href={canAccess && !isComingSoon ? `/kunskapsbank/recept/${recipe.slug}` : '#'}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {imageSrc && !imageError ? (
            <Image
              src={imageSrc}
              alt={recipe.imageAlt || recipe.title}
              fill
              sizes={getResponsiveSizes('medium')}
              className="object-cover group-hover:scale-110 transition-transform duration-700 recipe-image"
              style={{ 
                objectFit: 'cover', 
                objectPosition: 'center',
                imageOrientation: 'from-image'
              }}
              onError={handleImageError}
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
              <span className="text-6xl opacity-50">🍽️</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          {isComingSoon && (
            <div className="absolute top-3 right-3">
              <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                Kommer snart
              </span>
            </div>
          )}
          {!isComingSoon && recipe.isPremium && (
            <div className="absolute top-3 right-3">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {t('recipes.card.badgePremium','Premium')}
              </span>
            </div>
          )}
          {!isComingSoon && recipe.isFree && !recipe.isPremium && (
            <div className="absolute top-3 right-3">
              <span className="bg-[#93C560] md:bg-primary text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                {t('recipes.card.badgeFree','Gratis')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {recipe.excerpt || t('recipes.card.excerptFallback','Upptäck detta läckra recept.')}
          </p>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {recipe.prepTime && (
              <span className="flex items-center gap-1">
                <span>⏱️</span> {recipe.prepTime}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <span>👥</span> {recipe.servings} {t('recipes.card.meta.servings','port')}
              </span>
            )}
          </div>
        </div>

        {/* Locked overlay for premium/coming soon recipes */}
        {((!canAccess && !isComingSoon) || isComingSoon) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">{isComingSoon ? '⏳' : '🔒'}</div>
              <p className="text-sm font-medium">
                {isComingSoon ? 'Kommer snart' : t('recipes.card.locked','Premium recept')}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

// Recipe List Item Component
const RecipeListItem: React.FC<{ recipe: Recipe; userAccess: any }> = ({ recipe, userAccess }) => {
  const canAccess = recipe.isFree || !recipe.isPremium || userAccess.hasAccess;
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => {
    const primary = recipe.imageUrl ? optimizeImageUrl(recipe.imageUrl, 'small', 'square') : '';
    return primary || optimizeImageUrl(`/recept_images_optimized/${recipe.slug}.webp`, 'small', 'square');
  });
  const [fallbackStep, setFallbackStep] = useState(0);
  const t = useT();

  const handleImageError = () => {
    const candidates = [
      optimizeImageUrl(`/recept_images_vision_optimized/${recipe.slug}.webp`, 'small', 'square'),
      optimizeImageUrl(`/recept_images_2025/${recipe.slug}.webp`, 'small', 'square'),
      '/images/recipe-placeholder.svg'
    ];
    if (fallbackStep < candidates.length) {
      setImageSrc(candidates[fallbackStep]);
      setFallbackStep(prev => prev + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <Link href={canAccess ? `/kunskapsbank/recept/${recipe.slug}` : '#'}>
      <motion.div 
        whileHover={{ x: 5 }}
        className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-4"
      >
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {imageSrc && !imageError ? (
              <Image
                src={imageSrc}
                alt={recipe.imageAlt || recipe.title}
                fill
                sizes={getResponsiveSizes('small')}
                className="object-cover group-hover:scale-110 transition-transform duration-700 recipe-image"
                style={{ 
                  objectFit: 'cover', 
                  objectPosition: 'center',
                  imageOrientation: 'from-image'
                }}
                onError={handleImageError}
                priority={false}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
                <span className="text-3xl opacity-50">🍽️</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {recipe.title}
              </h3>
              {recipe.isPremium && (
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                  {t('recipes.card.badgePremium','Premium')}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {recipe.excerpt || t('recipes.card.excerptFallback','Upptäck detta läckra recept.')}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {recipe.prepTime && (
                <span>⏱️ {recipe.prepTime}</span>
              )}
              {recipe.servings && (
                <span>👥 {recipe.servings} {t('recipes.listitem.portions','portioner')}</span>
              )}
              {recipe.categories?.slice(0, 2).map((cat, i) => (
                <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Locked overlay for premium recipes */}
        {!canAccess && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="text-white text-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-medium">{t('recipes.card.locked','Premium recept')}</p>
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default dynamic(() => Promise.resolve(RecipesPage), { ssr: false });