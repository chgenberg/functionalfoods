"use client";
import { useState } from 'react';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function Sok() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Mock search results
  const mockResults = [
    {
      id: 1,
      title: "Antiinflammatorisk kost - En guide",
      excerpt: "Lär dig hur du kan minska inflammation i kroppen genom rätt kostval...",
      type: "article",
      icon: FiSearch,
      href: "/kunskapsbank/blogg/antiinflammatorisk-kost"
    },
    {
      id: 2,
      title: "Gröna smoothies för energi",
      excerpt: "Recept på näringsrika smoothies som ger dig energi hela dagen...",
      type: "recipe",
      icon: FiSearch,
      href: "/kunskapsbank/recept/grona-smoothies"
    },
    {
      id: 3,
      title: "Vad är probiotika?",
      excerpt: "Allt du behöver veta om probiotika och dess hälsofördelar...",
      type: "faq",
      icon: FiSearch,
      href: "/kontakt/faq#probiotika"
    }
  ];

  const filters = [
    { value: 'all', label: 'Alla' },
    { value: 'article', label: 'Artiklar' },
    { value: 'recipe', label: 'Recept' },
    { value: 'faq', label: 'FAQ' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 500);
  };

  const filteredResults = searchQuery.length > 2 
    ? mockResults.filter(result => 
        (selectedFilter === 'all' || result.type === selectedFilter) &&
        (result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         result.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Back Link */}
        <Link href="/kunskapsbank" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors">
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till kunskapsbank
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
            Sök i <span className="text-gradient">kunskapsbanken</span>
          </h1>
          <p className="text-lg text-text-secondary">
            Hitta artiklar, recept och svar på dina frågor om functional foods
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Vad letar du efter?"
                className="w-full px-6 py-4 pl-14 rounded-2xl bg-white shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-accent focus:shadow-xl transition-all duration-200"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2"
              >
                Sök
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex items-center justify-center gap-2 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <FiSearch className="w-4 h-4 text-text-secondary" />
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                  selectedFilter === filter.value
                    ? 'bg-accent text-white'
                    : 'bg-white text-text-secondary hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {searchQuery.length > 2 && (
            <div className="mt-12 space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  <p className="text-text-secondary mt-4">Söker...</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <>
                  <p className="text-text-secondary mb-6">
                    {filteredResults.length} resultat för "{searchQuery}"
                  </p>
                  {filteredResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="block bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-accent/10 rounded-lg p-3">
                          <result.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-primary group-hover:text-accent transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-text-secondary mt-1">{result.excerpt}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-secondary">Inga resultat hittades för "{searchQuery}"</p>
                  <p className="text-sm text-text-secondary mt-2">Prova att söka med andra ord</p>
                </div>
              )}
            </div>
          )}

          {/* Popular Searches */}
          {searchQuery.length === 0 && (
            <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-xl font-light text-primary mb-6 text-center">Populära sökningar</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['Antiinflammatorisk kost', 'Probiotika', 'Omega-3', 'Functional foods', 'Maghälsa'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-2 bg-white rounded-full text-sm text-text-secondary hover:bg-accent hover:text-white transition-all duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 