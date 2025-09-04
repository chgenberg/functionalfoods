'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useT } from '@/app/lib/i18n/LanguageProvider';
import { X, ExternalLink, Clock, TrendingUp } from 'lucide-react';

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
  const t = useT();

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/blog?limit=6&published=true');
        if (response.ok) {
          const data = await response.json();
          const blogPosts = data.posts || [];
          const transformedArticles: Article[] = blogPosts.map((post: any) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || extractExcerptFromContent(post.content) || t('articles.quick.excerptFallback','Upptäck värdefull information om functional foods och hälsa...'),
            category: getCategoryFromTitle(post.title),
            readTime: calculateReadTime(post.content),
            href: `/kunskapsbank/blogg/${post.slug}`,
            coverImage: post.coverImage || null
          }));
          setArticles(transformedArticles);
        } else {
          // No articles found - show empty state
          setArticles([]);
        }
      } catch (error) {
        // Show empty state on error instead of placeholder content
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [t]);

  function getCategoryFromTitle(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('protein') || titleLower.includes('bcaa') || titleLower.includes('eaa') || titleLower.includes('kollagen')) return t('articles.quick.cat.supplements','Näring & Tillskott');
    if (titleLower.includes('3d') || titleLower.includes('printad') || titleLower.includes('framtid')) return t('articles.quick.cat.innovation','Innovation');
    if (titleLower.includes('blue zones') || titleLower.includes('longevity') || titleLower.includes('långt liv')) return 'Longevity';
    if (titleLower.includes('probiotika') || titleLower.includes('maghälsa') || titleLower.includes('tarm')) return t('articles.quick.cat.gut','Maghälsa');
    if (titleLower.includes('polyfenoler') || titleLower.includes('antioxidant')) return t('articles.quick.cat.antioxidants','Antioxidanter');
    if (titleLower.includes('functional') || titleLower.includes('grunderna')) return t('articles.quick.cat.basics','Grunderna');
    if (titleLower.includes('mataffär') || titleLower.includes('inköp') || titleLower.includes('råvaror')) return t('articles.quick.cat.tips','Praktiska tips');
    if (titleLower.includes('miljö') || titleLower.includes('hållbarhet')) return t('articles.quick.cat.sustain','Hållbarhet');
    return t('articles.quick.cat.health','Hälsa & Wellness');
  }

  function extractExcerptFromContent(content: string): string {
    if (!content) return '';
    const cleanContent = content.replace(/^#+\s/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n+/g, ' ').trim();
    if (cleanContent.length <= 150) return cleanContent;
    const truncated = cleanContent.substring(0, 150);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return lastSpaceIndex > 100 ? truncated.substring(0, lastSpaceIndex) + '...' : truncated + '...';
  }

  function calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content ? content.split(' ').length : 300;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 md:top-40 md:left-1/2 md:-translate-x-1/2 z-30">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-background-secondary hover:bg-background border-2 border-accent rounded-full p-3 md:px-6 md:py-3 shadow-lg flex items-center gap-3 group transition-all duration-300 hover:shadow-xl"
        >
          <div
            className="absolute -inset-1 rounded-full border-2 border-accent opacity-75"
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          />
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
            <Image src="/davidsson.png" alt="Ulrika Davidsson" fill className="object-cover" />
          </div>
          <span className="hidden md:inline text-text-primary font-semibold">{t('articles.quick.button','Snabbläs artiklar')}</span>
          <TrendingUp className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'auto' }}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-accent p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                    <Image src="/davidsson.png" alt="Ulrika Davidsson" fill className="object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{t('articles.quick.header','Ulrikas artikeltips')}</h2>
                    <p className="text-green-100">{t('articles.quick.sub','Snabba insikter om functional foods')}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-green-200 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

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
                    <Link key={article.id} href={article.href} onClick={() => setIsOpen(false)} className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-accent">
                      {article.coverImage && (
                        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                          <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="inline-block bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs font-medium mb-3">
                        {article.category}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-accent transition-colors line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-accent group-hover:text-accent-hover transition-colors">
                          <span>{t('common.readMore','Läs mer')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-8 text-center">
                <Link href="/kunskapsbank/blogg" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors">
                  <span>{t('articles.quick.seeAll','Se alla artiklar')}</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 