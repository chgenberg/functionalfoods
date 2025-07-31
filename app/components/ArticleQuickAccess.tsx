'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiExternalLink, FiClock, FiTrendingUp } from 'react-icons/fi';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  href: string;
  coverImage?: string;
}

export default function ArticleQuickAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real blog posts from the database
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/blog?limit=6');
        if (response.ok) {
          const blogPosts = await response.json();
          
          // Transform blog posts to article format
          const transformedArticles: Article[] = blogPosts.map((post: any) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || 'Läs mer om detta ämne...',
            category: getCategoryFromTitle(post.title),
            readTime: calculateReadTime(post.content),
            href: `/kunskapsbank/blogg/${post.slug}`,
            coverImage: post.coverImage
          }));
          
          setArticles(transformedArticles);
        } else {
          // Fallback to some articles if API fails
          setArticles([
            {
              id: '1',
              title: 'Vad är Functional Foods?',
              excerpt: 'En introduktion till funktionella livsmedel och deras hälsofördelar',
              category: 'Grunderna',
              readTime: '5 min',
              href: '/kunskapsbank/blogg'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        // Fallback articles
        setArticles([
          {
            id: '1',
            title: 'Utforska våra artiklar',
            excerpt: 'Upptäck värdefull information om functional foods och hälsa',
            category: 'Kunskapsbas',
            readTime: '5 min',
            href: '/kunskapsbank/blogg'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  // Helper function to extract category from title
  function getCategoryFromTitle(title: string): string {
    if (title.toLowerCase().includes('protein')) return 'Näring';
    if (title.toLowerCase().includes('probiotika')) return 'Maghälsa';
    if (title.toLowerCase().includes('blue zones') || title.toLowerCase().includes('longevity')) return 'Longevity';
    if (title.toLowerCase().includes('3d') || title.toLowerCase().includes('framtid')) return 'Innovation';
    if (title.toLowerCase().includes('functional')) return 'Grunderna';
    if (title.toLowerCase().includes('bcaa') || title.toLowerCase().includes('eaa') || title.toLowerCase().includes('kollagen')) return 'Tillskott';
    if (title.toLowerCase().includes('polyfenoler')) return 'Antioxidanter';
    return 'Hälsa';
  }

  // Helper function to calculate read time
  function calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content ? content.split(' ').length : 300;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 md:top-24 md:left-1/2 md:-translate-x-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-background-secondary hover:bg-background border-2 border-accent rounded-full p-3 md:px-6 md:py-3 shadow-lg flex items-center gap-3 group transition-all duration-300 hover:shadow-xl"
        >
          {/* Pulsating ring effect - properly positioned */}
          <div
            className="absolute -inset-1 rounded-full border-2 border-accent opacity-75"
            style={{ 
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          
          {/* Ulrika's image */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
            <Image
              src="/davidsson.png"
              alt="Ulrika Davidsson"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Text - hidden on mobile, shown on desktop */}
          <span className="hidden md:inline text-text-primary font-semibold">Snabbläs artiklar</span>
          
          <FiTrendingUp className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-accent to-accent-hover p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                    <Image
                      src="/davidsson.png"
                      alt="Ulrika Davidsson"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Ulrikas artikeltips</h2>
                    <p className="text-green-100">Snabba insikter om functional foods</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={article.href}
                      onClick={() => setIsOpen(false)}
                      className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-accent"
                    >
                      {/* Article Image */}
                      {article.coverImage && (
                        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      {/* Category badge */}
                      <div className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-medium mb-3">
                        {article.category}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      {/* Meta info */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-accent group-hover:text-accent-hover transition-colors">
                          <span>Läs mer</span>
                          <FiExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* See all articles link */}
              <div className="mt-8 text-center">
                <Link
                  href="/kunskapsbank/blogg"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  <span>Se alla artiklar</span>
                  <FiExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 