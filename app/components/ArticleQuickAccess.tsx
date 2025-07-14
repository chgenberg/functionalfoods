'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Populära artiklar
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-background-secondary hover:bg-background border-2 border-accent rounded-full px-6 py-3 shadow-lg flex items-center gap-3 group transition-all duration-300 hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulsating ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-accent"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
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
        </motion.button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[50%] -translate-y-1/2 max-w-4xl mx-auto bg-background-secondary rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-primary text-white p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                      <Image
                        src="/davidsson.png"
                        alt="Ulrika Davidsson"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Ulrikas artikeltips</h2>
                      <p className="text-white/80">Handplockade artiklar för din hälsoresa</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    whileHover={{ rotate: 90 }}
                  >
                    <FiX className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="grid gap-4 md:grid-cols-2">
                  {articles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={article.href}
                        onClick={() => setIsOpen(false)}
                        className="block bg-background rounded-xl p-5 hover:shadow-lg transition-all duration-300 group border border-border hover:border-accent"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                            {article.category}
                          </span>
                          <span className="text-xs text-text-secondary flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center text-primary text-sm font-medium">
                          Läs mer
                          <FiExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* View All Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <Link
                    href="/kunskapsbank/blogg"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-light transition-colors"
                  >
                    Se alla artiklar
                    <FiExternalLink className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 