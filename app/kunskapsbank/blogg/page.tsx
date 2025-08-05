"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiClock, FiArrowRight, FiSearch, FiTag } from 'react-icons/fi';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string;
  slug: string;
  author?: {
    name?: string;
    email: string;
  };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog?published=true&limit=50');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract categories from posts
  const categories = Array.from(new Set(posts.map(post => 'Functional Foods'))); // For now, default category

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'Functional Foods';
    return matchesSearch && matchesCategory;
  });

  // Calculate read time based on content length (rough estimate)
  const calculateReadTime = (content?: string) => {
    if (!content) return '5 min';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar artiklar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-background-secondary py-20">
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight">
            Kunskapsbank <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">Artiklar</span>
          </h1>
          <p className="text-xl text-text-secondary text-center max-w-3xl mx-auto">
            Utforska våra artiklar om functional foods, hälsa och välmående. 
            Få vetenskapligt baserade tips för ett längre och friskare liv.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container-custom py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök artiklar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:border-accent focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  !selectedCategory 
                    ? 'bg-accent text-white' 
                    : 'bg-background-secondary text-text-secondary hover:bg-gray-200'
                }`}
              >
                Alla
              </button>
              <button
                onClick={() => setSelectedCategory('Functional Foods')}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  selectedCategory === 'Functional Foods' 
                    ? 'bg-accent text-white' 
                    : 'bg-background-secondary text-text-secondary hover:bg-gray-200'
                }`}
              >
                Functional Foods
              </button>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/kunskapsbank/blogg/${post.slug}`}>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.coverImage || '/images/blog-placeholder.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/blog-placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-sm font-medium">
                        Functional Foods
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(post.publishedAt).toLocaleDateString('sv-SE')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {calculateReadTime(post.excerpt)}
                      </span>
                    </div>

                    <h2 className="text-2xl font-medium text-primary mb-3 group-hover:text-accent transition-colors duration-200">
                      {post.title}
                    </h2>

                    <p className="text-text-secondary mb-4 line-clamp-3">
                      {post.excerpt || 'Läs mer om detta intressanta ämne inom functional foods...'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                        <FiTag className="w-4 h-4" />
                        Functional Foods
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                        <FiTag className="w-4 h-4" />
                        Hälsa
                      </span>
                    </div>

                    <div className="flex items-center text-accent font-medium group-hover:gap-2 transition-all duration-200">
                      <span>Läs mer</span>
                      <FiArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              {posts.length === 0 
                ? 'Inga artiklar publicerade än. Kom tillbaka snart!' 
                : 'Inga artiklar hittades. Prova att ändra din sökning eller filter.'
              }
            </p>
          </div>
        )}
      </section>
    </div>
  );
} 