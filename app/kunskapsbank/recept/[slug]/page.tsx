"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

interface Recipe {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  categories: string[];
  ingredients: string[];
  instructions: string[];
  slug: string;
  status: 'publish' | 'draft';
  isPremium: boolean;
  date: string;
  author: {
    name: string;
    username: string;
    email: string;
  };
  permalink: string;
  nutritionInfo?: {
    description?: string;
    carbs?: string;
    fat?: string;
    protein?: string;
    calories?: string;
    fiber?: string;
  };
  featuredIngredients?: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
}

interface RecipePageData {
  recipe: Recipe;
  userAccess: {
    hasAccess: boolean;
    userId: string | null;
  };
}

const RecipeDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccess, setUserAccess] = useState<{ hasAccess: boolean; userId: string | null }>({ hasAccess: false, userId: null });
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'featured' | 'nutrition'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (params.slug) {
      fetchRecipe(params.slug as string);
    }
  }, [params.slug, user]);

  const fetchRecipe = async (slug: string) => {
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

      const response = await fetch(`/api/recipes/${slug}`, { headers });
      
      if (response.status === 404) {
        setError('Recipe not found');
        return;
      }

      if (response.status === 403) {
        const data = await response.json();
        setError(data.message || 'Access denied');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const data: RecipePageData = await response.json();
      setRecipe(data.recipe);
      setUserAccess(data.userAccess);
      
      // Fetch related recipes
      fetchRelatedRecipes(slug, data.recipe.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedRecipes = async (currentSlug: string, categories: string[]) => {
    try {
      const categoriesParam = categories.join(',');
      const response = await fetch(`/api/recipes/related?current=${currentSlug}&categories=${categoriesParam}&limit=3`);
      
      if (response.ok) {
        const data = await response.json();
        setRelatedRecipes(data.recipes || []);
      }
    } catch (err) {
      console.error('Failed to fetch related recipes:', err);
      // Don't show error to user, just continue without related recipes
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const extractInstructions = (content: string) => {
    // Remove HTML tags but keep line breaks
    const text = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    // Split into steps by numbers or line breaks
    const steps = text
      .split(/(?:\n\n|\n(?=\d+\.))/)
      .filter(step => step.trim())
      .map(step => step.trim());
    
    return steps;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          </div>
          <p className="text-gray-700 mt-4 text-lg font-medium">Laddar receptet...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Receptet kunde inte laddas</h3>
          <p className="text-gray-600 mb-6">{error || 'Receptet hittades inte'}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/kunskapsbank/recept')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Tillbaka till recept
            </button>
            {error?.includes('tillgång') && (
              <a
                href="/utbildning"
                className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Köp kurs för tillgång
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Receptet kunde inte laddas.</p>
        </div>
      </div>
    );
  }

  const canAccess = !recipe.isPremium || userAccess.hasAccess;
  const instructions = extractInstructions(recipe.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {recipe.imageUrl ? (
          <>
            <Image
              src={recipe.imageUrl}
              alt={recipe.imageAlt || recipe.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.push('/kunskapsbank/recept')}
          className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white transition-all shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title and meta */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {recipe.categories?.map((category, index) => (
                <span
                  key={index}
                  className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {category}
                </span>
              ))}
              {recipe.isPremium && (
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Premium Recept</span>
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              {recipe.title}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl animate-fade-in animation-delay-200">
              {recipe.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 -mt-16 relative z-20">
        {/* Quick info card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Tillagningstid</p>
              <p className="font-semibold">{recipe.prepTime || '30 min'}</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Portioner</p>
              <p className="font-semibold">{recipe.servings || '4 portioner'}</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Ingredienser</p>
              <p className="font-semibold">{recipe.ingredients?.length || 0} st</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-2 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Skapad av</p>
              <p className="font-semibold">{recipe.author?.name || 'Functional Foods'}</p>
            </div>
          </div>
        </div>

        {canAccess ? (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 p-1">
              <div className="flex flex-wrap">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                    activeTab === 'ingredients'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Ingredienser
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                    activeTab === 'instructions'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Instruktioner
                </button>
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                    activeTab === 'featured'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Utvalda råvaror
                </button>
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                    activeTab === 'nutrition'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Näringsvärde
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {activeTab === 'ingredients' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Ingredienser</h2>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <div className="space-y-3">
                      {recipe.ingredients.map((ingredient, index) => (
                        <label
                          key={index}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checkedIngredients.has(index)}
                            onChange={() => toggleIngredient(index)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className={`ml-3 text-lg ${checkedIngredients.has(index) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {ingredient}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Inga ingredienser angivna för detta recept.</p>
                  )}
                </div>
              )}

              {activeTab === 'instructions' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Så här gör du</h2>
                  <div className="space-y-6">
                    {instructions.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'featured' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Utvalda råvaror</h2>
                  {recipe.featuredIngredients && recipe.featuredIngredients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recipe.featuredIngredients.map((ingredient, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{ingredient}</h3>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['Aubergine', 'Ricottaost', 'Bladspenat'].map((ingredient, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{ingredient}</h3>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Näringsvärden</h2>
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {recipe.nutritionInfo?.carbs || '23'}
                        </div>
                        <div className="text-sm text-gray-600">gram</div>
                        <div className="text-base font-medium text-gray-900 mt-1">Kolhydrater</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {recipe.nutritionInfo?.fat || '42'}
                        </div>
                        <div className="text-sm text-gray-600">gram</div>
                        <div className="text-base font-medium text-gray-900 mt-1">Fett</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {recipe.nutritionInfo?.protein || '19'}
                        </div>
                        <div className="text-sm text-gray-600">gram</div>
                        <div className="text-base font-medium text-gray-900 mt-1">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-600 mb-1">
                          {recipe.nutritionInfo?.calories || '536'}
                        </div>
                        <div className="text-sm text-gray-600">kcal</div>
                        <div className="text-base font-medium text-gray-900 mt-1">Energi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {recipe.nutritionInfo?.fiber || '5'}
                        </div>
                        <div className="text-sm text-gray-600">gram</div>
                        <div className="text-base font-medium text-gray-900 mt-1">Fiber</div>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-600 mt-3">Per portion</div>
                      </div>
                    </div>
                    {recipe.nutritionInfo?.description && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-gray-700 text-center">{recipe.nutritionInfo.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Print button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center bg-white border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-all font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Skriv ut recept
              </button>
            </div>
          </>
        ) : (
          /* Premium lock screen */
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 text-amber-600 rounded-full mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Premium Recept</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Detta är ett exklusivt recept som endast är tillgängligt för våra kurselever.
            </p>
            <a
              href="/utbildning"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Köp kurs för full tillgång
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Få tillgång till alla {recipe.isPremium ? 'premium' : ''} recept och mycket mer
            </p>
          </div>
        )}

        {/* Related recipes section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fler recept att utforska</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedRecipes.length > 0 ? (
              relatedRecipes.map((relatedRecipe) => (
                <a
                  key={relatedRecipe.id}
                  href={`/kunskapsbank/recept/${relatedRecipe.slug}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="relative h-48 overflow-hidden">
                    {relatedRecipe.imageUrl ? (
                      <Image
                        src={relatedRecipe.imageUrl}
                        alt={relatedRecipe.imageAlt || relatedRecipe.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {relatedRecipe.isPremium && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>Premium</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {relatedRecipe.categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors mb-2 line-clamp-2">
                      {relatedRecipe.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {relatedRecipe.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {relatedRecipe.author.name}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {relatedRecipe.ingredients.length} ingredienser
                      </span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              // Fallback placeholders while loading or if no related recipes found
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      <div className="h-4 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RecipeDetailPage; 