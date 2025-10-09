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
  // Optional fields provided by API for access control/tagging
  courseTags?: string[];
  tags?: string[];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccess, setUserAccess] = useState<{ hasAccess: boolean; userId: string | null; userCourses: string[] }>({ hasAccess: false, userId: null, userCourses: [] });
  const [statistics, setStatistics] = useState({ total: 0, free: 0, premium: 0, visible: 0 });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [usePagedNavigation, setUsePagedNavigation] = useState(true);
  
  // All refs after state
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // All hooks after refs
  const { user } = useAuth();
  const t = useT();

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Define fetchRecipes before any effects that reference it to avoid TDZ errors
  const fetchRecipes = useCallback(async (reset = false, pageOverride?: number) => {
    try {
      if (reset) setRecipes([]);
      
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
      params.append('limit', '21');
      const effectivePage = typeof pageOverride === 'number' ? pageOverride : page;
      params.append('page', effectivePage.toString());
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
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

      // Replace list on paged navigation; only append when explicitly desired
      setRecipes(prev => reset ? fetchedRecipes : [...prev, ...fetchedRecipes]);
      setCategories(data.categories || []);
      setStatistics(data.statistics || { total: 0, free: 0, premium: 0, visible: 0 });
      setHasMore(data.pagination.hasMore);
      
      // Fetch user's purchased courses
      let userCourses: string[] = [];
      if (user && token) {
        try {
          const purchasesResponse = await fetch('/api/user/purchases', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (purchasesResponse.ok) {
            const purchasesData = await purchasesResponse.json();
            // Extract course names from purchases
            userCourses = purchasesData.purchases?.map((p: any) => {
              const courseName = p.course?.name || '';
              // Map course names to tags (Basic, Flow, Energy)
              if (courseName.includes('Basics')) return 'Basic';
              if (courseName.includes('Flow')) return 'Flow';
              if (courseName.includes('Energy')) return 'Energy';
              return '';
            }).filter(Boolean) || [];
            console.log('👤 User purchased courses:', userCourses);
          }
        } catch (err) {
          console.error('Error fetching user courses:', err);
        }
      }
      
      setUserAccess({ 
        hasAccess: !!user && !!token, 
        userId: user?.email || null,
        userCourses
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
  }, [page, selectedCategory, searchQuery, user]);

  useEffect(() => {
    // Only auto-fetch when filters change, not on search query change
    fetchRecipes();
  }, [user, selectedCategory]);

  // Removed auto-append on page change; navigation buttons will fetch with reset

  useEffect(() => {
    // Reset recipes and page when filters change (not search query)
    setRecipes([]);
    setPage(1);
    setHasMore(true);
    // Scroll to top when filters change for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  useEffect(() => {
    // Enhanced intelligent search suggestions
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      const scoredRecipes = recipes.map(recipe => {
        let score = 0;
        const title = recipe.title.toLowerCase();
        
        // Exact title match gets highest score
        if (title === query) score += 100;
        // Title starts with query
        else if (title.startsWith(query)) score += 50;
        // Title contains query
        else if (title.includes(query)) score += 30;
        
        // Check ingredients
        if (recipe.ingredients?.some(ing => ing.toLowerCase().includes(query))) score += 20;
        
        // Check categories
        if (recipe.categories?.some(cat => cat.toLowerCase().includes(query))) score += 15;
        
        // Check excerpt
        if (recipe.excerpt?.toLowerCase().includes(query)) score += 10;
        
        return { recipe, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.recipe.title);
      
      // Remove duplicates
      const uniqueSuggestions = [...new Set(scoredRecipes)];
      
      setSearchSuggestions(uniqueSuggestions);
      setShowSuggestions(uniqueSuggestions.length > 0 && isSearchFocused);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, recipes, isSearchFocused]);

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


  // Removed automatic infinite scroll - using manual "Load More" button instead

	// Filter recipes based on user's purchased courses
	const visibleRecipes = recipes.filter(recipe => {
    // Always show free recipes
    if (recipe.isFree || !recipe.isPremium) {
      return true;
    }
    
    // If not logged in, hide premium recipes
    if (!userAccess.hasAccess) {
      return false;
    }
    
    // Check if recipe belongs to user's purchased courses
    const recipeCourses = recipe.courseTags || recipe.tags?.filter((t: string) => ['Basic', 'Flow', 'Energy'].includes(t)) || [];
    
    // If recipe has no course tags, it's available to all logged in users (old premium recipes)
    if (recipeCourses.length === 0) {
      return true;
    }
    
    // Check if user has access to ANY of the required courses
    const hasAccess = recipeCourses.some((course: string) => userAccess.userCourses.includes(course));
    
    console.log(`🔍 Recipe "${recipe.title}":`, {
      recipeCourses,
      userCourses: userAccess.userCourses,
      hasAccess
    });
    
    return hasAccess;
  });

	const filteredRecipes = visibleRecipes.filter(recipe => {
    const matchesCategory = selectedCategory === 'all' || (recipe.categories && recipe.categories.includes(selectedCategory));
    const matchesSearch = !searchQuery || 
                         recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (recipe.excerpt && recipe.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (recipe.ingredients && recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
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
      <div className="sticky top-0 z-20 backdrop-blur-md bg-white/95 border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Enhanced Search with Intelligence */}
            <div className={`flex-1 relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''} flex gap-2`} ref={searchRef}>
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isSearchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('recipes.list.search.placeholder','Sök recept, ingredienser eller kategori...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setRecipes([]);
                      setPage(1);
                      fetchRecipes(true);
                    }
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    searchQuery.length > 0 && setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/90 backdrop-blur-sm hover:border-gray-300"
                />
              </div>
              <button
                onClick={() => {
                  setRecipes([]);
                  setPage(1);
                  fetchRecipes(true);
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-300 whitespace-nowrap font-medium"
              >
                Sök
              </button>
              
              {/* Enhanced Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="py-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(suggestion);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200 flex items-center gap-3 group"
                        >
                          <Search className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          <span className="text-gray-700 group-hover:text-gray-900">{suggestion}</span>
                          <span className="ml-auto text-xs text-gray-400 group-hover:text-orange-500">↵</span>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Tryck <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-gray-600 font-mono text-[10px]">Enter</kbd> för att söka</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105 ${
                showFilters 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:text-gray-900 border-2 border-gray-200 hover:border-orange-300'
              }`}
            >
              <Filter className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              <span>{t('recipes.list.filters.button','Filter')}</span>
              {selectedCategory !== 'all' && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  showFilters ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
                }`}>
                  1
                </span>
              )}
            </button>

            {/* Enhanced View Mode Toggle */}
            <div className="flex gap-1 p-1.5 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Rutnätsvy"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Listvy"
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
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Enhanced Category Filter */}
                    <div>
                      <label className="text-sm font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                        <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                        {t('recipes.list.filters.category','Kategori')}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                            selectedCategory === 'all'
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:text-gray-900 border-2 border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          {t('recipes.list.filters.all','Alla kategorier')}
                        </button>
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                              selectedCategory === category
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:text-gray-900 border-2 border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                  </div>
                  </div>

                  {/* Enhanced Active Filters Summary */}
                  {(selectedCategory !== 'all' || searchQuery) && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">{t('recipes.list.filters.active','Aktiva filter:')}</span>
                        <div className="flex flex-wrap gap-2">
                          {searchQuery && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-full shadow-sm border border-gray-200 font-medium text-sm">
                              <Search className="w-3.5 h-3.5 text-orange-500" />
                              "{searchQuery}"
                              <button 
                                onClick={() => setSearchQuery('')} 
                                className="ml-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                                title="Ta bort sökning"
                              >
                                <svg className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          )}
                          {selectedCategory !== 'all' && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-full shadow-sm border border-gray-200 font-medium text-sm">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              {selectedCategory}
                              <button 
                                onClick={() => setSelectedCategory('all')} 
                                className="ml-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                                title="Ta bort kategori"
                              >
                                <svg className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                          Rensa alla
                        </button>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RecipeListItem recipe={recipe} userAccess={userAccess} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Paged Navigation */}
        {!loading && filteredRecipes.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => {
                const nextPage = Math.max(1, p - 1);
                fetchRecipes(true, nextPage);
                return nextPage;
              })}
              className={`px-4 py-2 rounded-lg border ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              Föregående
            </button>
            <span className="text-sm text-gray-600">
              Sida {page} av {Math.max(1, Math.ceil(statistics.visible / 20))}
            </span>
            <button
              disabled={!hasMore}
              onClick={() => setPage(p => {
                const nextPage = p + 1;
                fetchRecipes(true, nextPage);
                return nextPage;
              })}
              className={`px-4 py-2 rounded-lg border ${!hasMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              Nästa
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loading && recipes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-3"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl animate-pulse">🍳</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Laddar fler läckra recept...</p>
          </motion.div>
        )}

        {/* No Results */}
        {filteredRecipes.length === 0 && !loading && (
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
              }}
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              {t('recipes.list.empty.clearButton','Rensa filter')}
            </button>
          </motion.div>
        )}
      </div>

    </div>
  );
};

// Recipe Card Component
const RecipeCard: React.FC<{ recipe: Recipe; userAccess: any }> = ({ recipe, userAccess }) => {
  // Check course-specific access
  const recipeCourses = recipe.courseTags || recipe.tags?.filter((t: string) => ['Basic', 'Flow', 'Energy'].includes(t)) || [];
  const requiresCourse = recipe.isPremium && recipeCourses.length > 0;
  const hasCourseAccess = !requiresCourse || recipeCourses.some((course: string) => userAccess.userCourses?.includes(course));
  
  const canAccess = recipe.isAccessible !== false && (recipe.isFree || !recipe.isPremium || (userAccess.hasAccess && hasCourseAccess));
  const isComingSoon = recipe.isComingSoon === true;
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const t = useT();

  // Load image using batch-images API for consistency with recipe detail page
  useEffect(() => {
    if (!recipe.title || !recipe.slug) return;
    
    const loadImage = async () => {
      try {
        setImageLoading(true);
        
        // Use batch-images API to get the same image as on detail page
        const response = await fetch('/api/recipes/batch-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeNames: [recipe.title],
            recipeSlugs: [recipe.slug],
            size: 'medium',
            usage: 'card'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const image = data.images?.[recipe.title] || data.images?.[recipe.slug];
          if (image) {
            setImageSrc(image);
            setImageError(false);
          } else {
            setImageError(true);
          }
        } else {
          setImageError(true);
        }
      } catch (err) {
        console.error('Image load error:', err);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [recipe.title, recipe.slug]);

  return (
    <Link href={canAccess && !isComingSoon ? `/kunskapsbank/recept/${recipe.slug}` : '#'}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="animate-pulse">
                <span className="text-4xl opacity-30">🍽️</span>
              </div>
            </div>
          ) : imageSrc && !imageError ? (
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
              onError={() => setImageError(true)}
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
  // Check course-specific access
  const recipeCourses = recipe.courseTags || recipe.tags?.filter((t: string) => ['Basic', 'Flow', 'Energy'].includes(t)) || [];
  const requiresCourse = recipe.isPremium && recipeCourses.length > 0;
  const hasCourseAccess = !requiresCourse || recipeCourses.some((course: string) => userAccess.userCourses?.includes(course));
  
  const canAccess = recipe.isFree || !recipe.isPremium || (userAccess.hasAccess && hasCourseAccess);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const t = useT();

  // Load image using batch-images API for consistency
  useEffect(() => {
    if (!recipe.title || !recipe.slug) return;
    
    const loadImage = async () => {
      try {
        setImageLoading(true);
        
        const response = await fetch('/api/recipes/batch-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeNames: [recipe.title],
            recipeSlugs: [recipe.slug],
            size: 'small',
            usage: 'thumb'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const image = data.images?.[recipe.title] || data.images?.[recipe.slug];
          if (image) {
            setImageSrc(image);
            setImageError(false);
          } else {
            setImageError(true);
          }
        } else {
          setImageError(true);
        }
      } catch (err) {
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [recipe.title, recipe.slug]);

  return (
    <Link href={canAccess ? `/kunskapsbank/recept/${recipe.slug}` : '#'}>
      <motion.div 
        whileHover={{ x: 5 }}
        className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-4"
      >
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="animate-pulse">
                  <span className="text-2xl opacity-30">🍽️</span>
                </div>
              </div>
            ) : imageSrc && !imageError ? (
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
                onError={() => setImageError(true)}
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