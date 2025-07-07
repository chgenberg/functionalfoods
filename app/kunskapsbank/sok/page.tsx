"use client";
import { useState, useEffect } from 'react';
import { FiSearch, FiArrowLeft, FiBookOpen, FiUser, FiTag, FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'recipe' | 'ingredient' | 'category' | 'article';
  href: string;
  imageUrl?: string;
  isPremium?: boolean;
  author?: string;
  relevanceScore: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  type: string;
  hasAccess: boolean;
}

export default function Sok() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [userHasAccess, setUserHasAccess] = useState(false);

  const { user } = useAuth();

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const performSearch = async (query: string, type: string = 'all') => {
    if (query.length < 2) {
      setSearchResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const token = getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.results);
      setTotalResults(data.total);
      setUserHasAccess(data.hasAccess);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, selectedFilter);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilter]);

  const filters = [
    { value: 'all', label: 'Alla', icon: FiSearch },
    { value: 'recipe', label: 'Recept', icon: FiBookOpen },
    { value: 'ingredient', label: 'Ingredienser', icon: FiPackage },
    { value: 'category', label: 'Kategorier', icon: FiTag },
    { value: 'article', label: 'Artiklar', icon: FiUser }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, selectedFilter);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'recipe': return FiBookOpen;
      case 'ingredient': return FiPackage;
      case 'category': return FiTag;
      case 'article': return FiUser;
      default: return FiSearch;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recipe': return 'Recept';
      case 'ingredient': return 'Ingrediens';
      case 'category': return 'Kategori';
      case 'article': return 'Artikel';
      default: return 'Innehåll';
    }
  };

  const popularSearches = [
    'Antiinflammatorisk kost', 
    'Probiotika', 
    'Omega-3', 
    'Functional foods', 
    'Maghälsa',
    'Lax',
    'Avokado',
    'Blåbär',
    'Nötter',
    'Gröna bladgrönsaker'
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/kunskapsbank" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-8 transition-colors font-medium">
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Tillbaka till kunskapsbank
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
            Sök i <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">kunskapsbanken</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hitta recept, ingredienser, kategorier och artiklar om functional foods
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="animate-fade-in mb-8" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sök efter recept, ingredienser, kategorier..."
                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:shadow-xl transition-all duration-200 border-2 border-gray-100"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                  >
                    Sök
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedFilter === filter.value
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {searchResults.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">{totalResults}</span> resultat för "{searchQuery}"
                    </p>
                    {!userHasAccess && (
                      <Link
                        href="/utbildning"
                        className="text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                      >
                        Köp kurs för alla recept
                      </Link>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {searchResults.map((result) => {
                      const IconComponent = getResultIcon(result.type);
                      return (
                        <Link
                          key={result.id}
                          href={result.href}
                          className="block bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group border border-gray-100"
                        >
                          <div className="flex items-start gap-4">
                            {result.imageUrl && result.type === 'recipe' ? (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={result.imageUrl}
                                  alt={result.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-4 flex-shrink-0">
                                <IconComponent className="w-8 h-8 text-green-600" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                                      {result.title}
                                    </h3>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      {getTypeLabel(result.type)}
                                    </span>
                                    {result.isPremium && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Premium
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{result.excerpt}</p>
                                  {result.author && (
                                    <p className="text-xs text-gray-500">Av {result.author}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <FiSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga resultat hittades</h3>
                  <p className="text-gray-600 mb-4">Inga resultat hittades för "{searchQuery}"</p>
                  <p className="text-sm text-gray-500 mb-6">Prova att söka med andra ord eller kontrollera stavningen</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Rensa sökning
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {!hasSearched || searchQuery.length === 0 ? (
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Populära sökningar</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {popularSearches.map((term, index) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="group bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
                  >
                    <div className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                      {term}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Quick access links */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/kunskapsbank/recept" className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                  <FiBookOpen className="w-12 h-12 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Alla recept</h3>
                  <p className="text-sm text-gray-600">Utforska vårt fullständiga receptbibliotek</p>
                </Link>
                
                <Link href="/kunskapsbank/blogg" className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                  <FiUser className="w-12 h-12 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Blogg & Artiklar</h3>
                  <p className="text-sm text-gray-600">Läs mer om functional foods och hälsa</p>
                </Link>
                
                <Link href="/kontakt/faq" className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                  <FiTag className="w-12 h-12 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Vanliga frågor</h3>
                  <p className="text-sm text-gray-600">Hitta svar på dina frågor</p>
                </Link>
              </div>
            </div>
          ) : null}
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

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
} 