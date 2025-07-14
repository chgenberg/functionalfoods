'use client';

import { useState } from 'react';
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
}

export default function ArticleQuickAccess() {
  const [isOpen, setIsOpen] = useState(false);

  // VIKTIGT: Uppdatera denna lista när nya artiklar läggs till på hemsidan
  // Välj de mest populära/relevanta artiklarna för snabb åtkomst
  const articles: Article[] = [
    {
      id: '1',
      title: 'Vad är Functional Foods?',
      excerpt: 'En introduktion till funktionella livsmedel och deras hälsofördelar',
      category: 'Grunderna',
      readTime: '5 min',
      href: '/kunskapsbank/blogg/functional-foods'
    },
    {
      id: '2',
      title: 'Antiinflammatorisk kost - din guide',
      excerpt: 'Lär dig hur du kan minska inflammation genom rätt kostval',
      category: 'Hälsa',
      readTime: '8 min',
      href: '/kunskapsbank/blogg/functional-foods'
    },
    {
      id: '3',
      title: 'Omega-3: Allt du behöver veta',
      excerpt: 'Fördjupning om omega-3 fettsyror och deras betydelse för hälsan',
      category: 'Näring',
      readTime: '6 min',
      href: '/kunskapsbank/blogg/functional-foods'
    },
    {
      id: '4',
      title: 'Probiotika för bättre maghälsa',
      excerpt: 'Så fungerar probiotika och vilka livsmedel som innehåller dem',
      category: 'Maghälsa',
      readTime: '7 min',
      href: '/kunskapsbank/blogg/functional-foods'
    },
    {
      id: '5',
      title: 'Functional Foods topplista',
      excerpt: 'De bästa funktionella livsmedlen för optimal hälsa',
      category: 'Tips',
      readTime: '4 min',
      href: '/kunskapsbank/blogg/functional-foods'
    },
    {
      id: '6',
      title: 'Longevity - lev längre och friskare',
      excerpt: 'Vetenskapens senaste rön om hur du kan förlänga ditt liv',
      category: 'Longevity',
      readTime: '10 min',
      href: '/kunskapsbank/blogg/longevity'
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-background-secondary hover:bg-background border-2 border-accent rounded-full px-6 py-3 shadow-lg flex items-center gap-3 group transition-all duration-300 hover:shadow-xl"
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
          
          {/* Text */}
          <span className="text-text-primary font-semibold">Snabbläs artiklar</span>
          
          {/* Trending icon */}
          <FiTrendingUp className="w-4 h-4 text-accent group-hover:animate-bounce" />
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-5xl bg-background rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-fade-in flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
                  }} />
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src="/davidsson.png"
                        alt="Ulrika Davidsson"
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">Ulrikas artikeltips</h2>
                      <p className="text-white/90 text-lg">Handplockade artiklar för din hälsoresa</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90"
                  >
                    <FiX className="w-7 h-7" />
                  </button>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <div key={article.id} className="group">
                      <Link
                        href={article.href}
                        onClick={() => setIsOpen(false)}
                        className="block bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent h-full flex flex-col"
                      >
                        {/* Category and time */}
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-xs font-bold text-white bg-accent px-3 py-1.5 rounded-full uppercase tracking-wide">
                            {article.category}
                          </span>
                          <span className="text-xs text-text-secondary flex items-center gap-1 font-medium">
                            <FiClock className="w-3.5 h-3.5" />
                            {article.readTime}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-bold text-lg text-text-primary mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        
                        {/* Excerpt */}
                        <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-grow">
                          {article.excerpt}
                        </p>
                        
                        {/* Read more link */}
                        <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
                          <span>Läs artikel</span>
                          <FiExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-8 text-center pb-4">
                  <Link
                    href="/kunskapsbank/blogg"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-primary-light text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Utforska alla artiklar
                    <FiExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
} 