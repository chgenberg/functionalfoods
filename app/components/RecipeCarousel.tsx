'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useT } from '@/app/lib/i18n/LanguageProvider';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string | null;
  excerpt: string | null;
  prepTime: string | null;
  categories: string[];
}

export default function RecipeCarousel() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemWidth = 320; // 300px + 20px gap
  const t = useT();

  useEffect(() => { fetchRecipes(); }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/random');
      const data = await response.json();
      setRecipes([...(Array.isArray(data.recipes) ? data.recipes : data), ...(Array.isArray(data.recipes) ? data.recipes : data)]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const moveCarousel = async (direction: 'left' | 'right') => {
    setIsPaused(true);
    controls.stop();
    const moveBy = direction === 'left' ? -1 : 1;
    let newIndex = currentIndex + moveBy;
    const halfLength = Math.floor(recipes.length / 2);
    if (newIndex < 0) newIndex = halfLength - 1;
    else if (newIndex >= halfLength) newIndex = 0;
    setCurrentIndex(newIndex);
    await controls.start({ x: -newIndex * itemWidth, transition: { duration: 0.5, ease: 'easeInOut' } });
    setTimeout(() => { setIsPaused(false); }, 5000);
  };

  useEffect(() => {
    if (recipes.length > 0 && !isPaused) {
      const animateCarousel = async () => {
        const totalWidth = itemWidth * (recipes.length / 2);
        await controls.start({ x: -totalWidth, transition: { x: { repeat: Infinity, repeatType: 'loop', duration: recipes.length * 10, ease: 'linear' } } });
      };
      animateCarousel();
    } else if (isPaused) {
      controls.stop();
    }
  }, [recipes, controls, isPaused]);

  if (loading) {
    return (
      <div className="py-8 md:py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) return null;

  return (
    <section className="py-8 md:py-12 overflow-hidden" style={{ backgroundColor: '#F3EFE3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="text-2xl md:text-3xl font-light text-center text-gray-800">
          {t('home.recipes.title','Utforska våra ')}<span className="font-bold text-primary">{t('home.recipes.free','gratis recept')}</span>
        </h2>
        <p className="text-center text-gray-600 mt-2">{t('home.recipes.subtitle','Hälsosamma måltider för varje dag')}</p>
      </div>
      <div className="relative overflow-hidden group" ref={containerRef} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <button onClick={() => moveCarousel('left')} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-70 md:opacity-0 group-hover:opacity-100 hover:scale-110" aria-label={t('home.recipes.prev','Föregående recept')}>
          <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button onClick={() => moveCarousel('right')} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-70 md:opacity-0 group-hover:opacity-100 hover:scale-110" aria-label={t('home.recipes.next','Nästa recept')}>
          <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 z-[5] pointer-events-none" style={{ background: 'linear-gradient(to right, #F3EFE3, rgba(243,239,227,0))' }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 z-[5] pointer-events-none" style={{ background: 'linear-gradient(to left, #F3EFE3, rgba(243,239,227,0))' }} />
        <motion.div className="flex gap-5" animate={controls} style={{ width: 'fit-content' }}>
          {recipes.map((recipe, index) => (
            <Link key={`${recipe.id}-${index}`} href={`/kunskapsbank/recept/${recipe.slug}`} className="flex-shrink-0 group/card">
              <motion.div className="w-[300px] h-[380px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col" whileHover={{ y: -5 }}>
                <div className="relative h-[200px] overflow-hidden bg-gray-100">
                  {recipe.imageUrl ? (
                    <Image src={recipe.imageUrl} alt={recipe.imageAlt || recipe.title} fill className="object-cover group-hover/card:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background"><span className="text-4xl">🍽️</span></div>
                  )}
                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="absolute top-3 left-3"><span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">{recipe.categories[0]}</span></div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover/card:text-primary transition-colors">{recipe.title}</h3>
                    {recipe.excerpt && (<p className="text-sm text-gray-600 line-clamp-3 mb-3">{recipe.excerpt}</p>)}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    {recipe.prepTime && (
                      <div className="flex items-center gap-1 text-sm text-gray-500"><FiClock className="w-4 h-4" /><span>{recipe.prepTime}</span></div>
                    )}
                    <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover/card:gap-2 transition-all">
                      {t('common.readMore','Läs mer')}
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.ceil(recipes.length / 2) }, (_, i) => (
          <button key={i} onClick={() => { setIsPaused(true); setCurrentIndex(i); controls.start({ x: -i * itemWidth, transition: { duration: 0.5, ease: 'easeInOut' } }); setTimeout(() => setIsPaused(false), 5000); }} className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'}`} aria-label={t('home.recipes.goto','Gå till recept') + ` ${i + 1}`} />
        ))}
      </div>
    </section>
  );
} 