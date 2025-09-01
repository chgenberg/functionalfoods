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
  type: 'recipe' | 'ingredient' | 'category' | 'article' | 'raw-material';
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
    { value: 'raw-material', label: 'Råvaror', icon: FiPackage },
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
      case 'raw-material': return FiPackage;
      case 'ingredient': return FiPackage;
      case 'category': return FiTag;
      case 'article': return FiUser;
      default: return FiSearch;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recipe': return 'Recept';
      case 'raw-material': return 'Råvara';
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
    'Gröna bladgrönsaker',
    'Gurkmeja',
    'Ingefära',
    'Gojibär',
    'Matcha'
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/kunskapsbank" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors font-medium">
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Tillbaka till kunskapsbank
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-text-primary">
            Sök i <span className="text-accent">kunskapsbanken</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Hitta recept, råvaror, ingredienser och artiklar om functional foods
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
                placeholder="Sök efter recept, råvaror, ingredienser..."
                className="w-full px-6 py-4 pl-14 rounded-2xl bg-background-secondary shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-xl transition-all duration-200 border-2 border-border"
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
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                ) : (
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-all shadow-md"
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
                      ? 'bg-accent text-white shadow-lg'
                      : 'bg-background-secondary text-text-secondary hover:bg-background shadow-md'
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
                    <p className="text-text-secondary">
                      <span className="font-semibold text-text-primary">{totalResults}</span> resultat för "{searchQuery}"
                    </p>
                    {!userHasAccess && (
                      <Link
                        href="/utbildning"
                        className="text-sm bg-[#FF7e70] text-white px-4 py-2 rounded-lg hover:bg-[#e56b5e] transition-all"
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
                          className="block bg-background-secondary rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group border border-border"
                        >
                          <div className="flex items-start gap-4">
                            {result.imageUrl && result.type === 'recipe' ? (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={result.imageUrl}
                                  alt={result.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="bg-accent/20 rounded-lg p-4 flex-shrink-0">
                                <IconComponent className="w-8 h-8 text-accent" />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-text-secondary bg-background px-2 py-1 rounded-full">
                                  {getTypeLabel(result.type)}
                                </span>
                                {result.isPremium && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-accent text-white">
                                    Premium
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                                {result.title}
                              </h3>
                              <p className="text-text-secondary text-sm line-clamp-2 mb-2">
                                {result.excerpt}
                              </p>
                              {result.author && (
                                <p className="text-xs text-text-light">
                                  Av {result.author}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Inga resultat hittades
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Försök med andra sökord eller välj en annan kategori
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    <Link href="/kunskapsbank/recept" className="group bg-background-secondary rounded-xl p-6 text-center hover:shadow-lg transition-all">
                      <FiBookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
                      <h4 className="font-semibold text-text-primary group-hover:text-primary">Recept</h4>
                    </Link>
                    <Link href="/kunskapsbank/ingredienser" className="group bg-background-secondary rounded-xl p-6 text-center hover:shadow-lg transition-all">
                      <FiPackage className="w-8 h-8 text-accent mx-auto mb-3" />
                      <h4 className="font-semibold text-text-primary group-hover:text-primary">Råvaror</h4>
                    </Link>
                    <Link href="/kunskapsbank/blogg" className="group bg-background-secondary rounded-xl p-6 text-center hover:shadow-lg transition-all">
                      <FiUser className="w-8 h-8 text-accent mx-auto mb-3" />
                      <h4 className="font-semibold text-text-primary group-hover:text-primary">Artiklar</h4>
                    </Link>
                    <Link href="/kontakt/faq" className="group bg-background-secondary rounded-xl p-6 text-center hover:shadow-lg transition-all">
                      <FiTag className="w-8 h-8 text-accent mx-auto mb-3" />
                      <h4 className="font-semibold text-text-primary group-hover:text-primary">FAQ</h4>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {!hasSearched && (
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Populära sökningar
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setSearchQuery(search)}
                      className="px-4 py-2 bg-background-secondary text-text-secondary rounded-full hover:bg-accent hover:text-white transition-all text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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