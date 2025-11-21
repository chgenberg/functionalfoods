"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Salad, Sparkles } from "lucide-react";;
import { optimizeImageUrl } from '@/app/lib/imageOptimization';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  imageAlt?: string | null;
  excerpt: string;
  prepTime: string | null;
  categories: string[];
}

export default function RecipeCarousel() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [portraitMap, setPortraitMap] = useState<Record<string, boolean>>({});
  
  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes?featured=true&limit=12&free=true', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!res.ok) {
          console.warn('Recipe API failed:', res.status);
          setRecipes([]);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        let recipesToShow = [];
        if (data.recipes && data.recipes.length > 0) {
          // Ensure we have at least 10 recipes for smooth carousel
          recipesToShow = data.recipes.length >= 10 ? data.recipes : [...data.recipes, ...data.recipes];
          recipesToShow = recipesToShow.slice(0, 20);

          // Batch-map images using filesystem fuzzy matching
          try {
            const names = recipesToShow.map((r: Recipe) => r.title);
            const slugs = recipesToShow.map((r: Recipe) => r.slug);
            const mapRes = await fetch(`/api/recipes/batch-images?v=${Date.now()}&vision=true`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
              cache: 'no-store',
              body: JSON.stringify({ 
                recipeNames: names, 
                recipeSlugs: slugs, 
                size: 'large',
                usage: 'card'
              })
            });
            if (mapRes.ok) {
              const { images } = await mapRes.json();
              recipesToShow = recipesToShow.map((r: Recipe) => {
                const mapped =
                  (images && (images[r.slug] || images[r.title])) || r.imageUrl;
                return {
                  ...r,
                  imageUrl: mapped
                };
              });
              console.log('🎠 Carousel: Mapped', Object.keys(images || {}).length, 'recipe images via fuzzy matching');
            }
          } catch (e) {
            console.warn('Carousel batch-images mapping failed, using original imageUrl', e);
          }
        }
        
        setRecipes(recipesToShow);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Enhanced auto-rotation
  useEffect(() => {
    if (!isAutoPlaying || recipes.length === 0) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recipes.length);
    }, 3500);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, isAutoPlaying, recipes.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % recipes.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white via-[#F3EFE3]/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-64 bg-gray-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[380px] h-[500px] bg-gray-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recipes.length === 0) return null;

  // Calculate visible recipes (3 on desktop, 1 on mobile)
  const visibleCount = 3;
  const getVisibleRecipes = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(recipes[(currentIndex + i) % recipes.length]);
    }
    return visible;
  };

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white via-[#F3EFE3]/30 to-white relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-48 translate-y-48" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Gratis recept</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-4"
          >
            Upptäck våra hälsosamma recept
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Functional foods för varje måltid - från frukost till middag
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-[1400px] mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all group"
            aria-label="Föregående recept"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-primary transition-colors" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all group"
            aria-label="Nästa recept"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-primary transition-colors" />
          </button>

          {/* Recipe Cards */}
          <div className="flex justify-center">
            <div className="flex gap-6 overflow-hidden px-4">
              <AnimatePresence mode="popLayout">
                {getVisibleRecipes().map((recipe, index) => (
                  <motion.div
                    key={`${recipe.id}-${currentIndex}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: 100 }}
                    animate={{ 
                      opacity: index === 1 ? 1 : 0.7,
                      scale: index === 1 ? 1 : 0.95,
                      x: 0,
                      zIndex: index === 1 ? 10 : 1
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: -100 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className={`flex-shrink-0 w-[320px] md:w-[380px] ${
                      index === 0 ? 'hidden md:block' : ''
                    } ${
                      index === 2 ? 'hidden md:block' : ''
                    }`}
                  >
                    <Link href={`/kunskapsbank/recept/${recipe.slug}`} className="block group">
                      <div className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-[480px] md:h-[520px] flex flex-col transform ${
                        index === 1 ? 'scale-100' : 'scale-95 opacity-80'
                      }`}>
                        {/* Image Container */}
                        <div className="relative overflow-hidden transition-all duration-300" style={{ height: portraitMap[recipe.slug] ? '420px' : '300px' }}>
                          {recipe.imageUrl ? (
                            <>
                              <Image 
                                src={optimizeImageUrl(recipe.imageUrl, 'large', portraitMap[recipe.slug] ? 'portrait' : 'landscape')} 
                                alt={recipe.imageAlt || recipe.title} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                sizes="(max-width: 768px) 320px, 380px"
                                priority={index === 1}
                                onLoadingComplete={(img) => {
                                  setPortraitMap(prev => ({
                                    ...prev,
                                    [recipe.slug]: img.naturalHeight > img.naturalWidth
                                  }));
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <span className="text-7xl opacity-50"><Salad className="w-5 h-5 inline" /></span>
                            </div>
                          )}
                          
                          {/* Category Badge */}
                          {recipe.categories && recipe.categories.length > 0 && (
                            <div className="absolute top-4 left-4">
                              <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-sm font-semibold rounded-full shadow-md">
                                {recipe.categories[0]}
                              </span>
                            </div>
                          )}

                          {/* Free badge */}
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-[#93C560] md:bg-green-500 text-white text-xs font-bold rounded-full shadow-md">
                              GRATIS
                            </span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                            {recipe.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2 flex-1">
                            {recipe.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            {recipe.prepTime && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>{recipe.prepTime}</span>
                              </div>
                            )}
                            
                            <span className="text-primary font-semibold text-sm group-hover:gap-3 transition-all inline-flex items-center gap-2">
                              Se recept
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {recipes.slice(0, Math.min(recipes.length, 10)).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex % Math.min(recipes.length, 10)
                    ? 'w-8 h-2 bg-primary rounded-full'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                }`}
                aria-label={`Gå till recept ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link 
            href="/kunskapsbank/recept"
            className="inline-flex items-center gap-2 bg-primary hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl group"
          >
            <span>Se alla gratis recept</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 