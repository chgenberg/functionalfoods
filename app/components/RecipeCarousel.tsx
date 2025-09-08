'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { optimizeImageUrl } from '@/app/lib/imageOptimization';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string | null;
  excerpt: string;
  prepTime: string | null;
  categories: string[];
}

export default function RecipeCarousel() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes/random', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!res.ok) {
          console.warn('Recipe API failed:', res.status);
          // Use fallback data instead of throwing
          setRecipes([]);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        if (data.recipes && data.recipes.length > 0) {
          // Ensure we have at least 10 recipes for smooth carousel
          const recipesToShow = data.recipes.length >= 10 ? data.recipes : [...data.recipes, ...data.recipes];
          setRecipes(recipesToShow.slice(0, 20));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!isDragging && recipes.length > 0) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, 4000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, isDragging, recipes.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recipes.length);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-gray-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 justify-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[350px] h-[450px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) return null;

  return (
    <section className="py-12 md:py-20 overflow-hidden bg-gradient-to-b from-[#F3EFE3] to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-playfair text-[#014421] mb-4"
          >
            Utforska våra gratis recept
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Hälsosamma måltider för varje dag
          </motion.p>
          
          {/* Snabblås button removed as requested */}
        </div>

        {/* Carousel Container */}
        <div className="relative" ref={containerRef}>
          {/* Navigation Buttons - Desktop */}
          <button
            onClick={handlePrevious}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-lg hover:bg-white transition-all -translate-x-6"
            aria-label="Previous recipe"
          >
            <ChevronLeft className="w-6 h-6 text-[#014421]" />
          </button>
          
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-lg hover:bg-white transition-all translate-x-6"
            aria-label="Next recipe"
          >
            <ChevronRight className="w-6 h-6 text-[#014421]" />
          </button>

          {/* Carousel */}
          <div 
            ref={carouselRef}
            className="overflow-hidden mx-auto max-w-[1200px]"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: -((recipes.length - 1) * 380), right: 0 }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              animate={{ x: -(currentIndex * 380) }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex gap-6 cursor-grab active:cursor-grabbing"
              style={{ x }}
            >
              {recipes.map((recipe, index) => (
                <motion.div
                  key={`${recipe.id}-${index}`}
                  className="flex-shrink-0 w-[350px]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link href={`/kunskapsbank/recept/${recipe.slug}`} className="block group">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-[450px] flex flex-col">
                      {/* Image Container */}
                      <div className="relative h-[250px] overflow-hidden">
                        {recipe.imageUrl ? (
                          <>
                            <Image 
                              src={optimizeImageUrl(recipe.imageUrl, 'large', 'landscape')} 
                              alt={recipe.imageAlt || recipe.title} 
                              fill 
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="350px"
                              unoptimized={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#014421]/10 to-[#014421]/5 flex items-center justify-center">
                            <span className="text-6xl opacity-50">🍽️</span>
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        {recipe.categories && recipe.categories.length > 0 && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#014421] text-sm font-medium rounded-full">
                              {recipe.categories[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold text-[#014421] mb-2 line-clamp-2 group-hover:text-[#014421]/80 transition-colors">
                          {recipe.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                          {recipe.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          {recipe.prepTime && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{recipe.prepTime}</span>
                            </div>
                          )}
                          
                          <span className="text-[#014421] font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            Läs mer
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {recipes.slice(0, Math.min(recipes.length, 8)).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex % Math.min(recipes.length, 8)
                    ? 'w-8 bg-[#014421]'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to recipe ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile swipe hint */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 mt-4 md:hidden"
        >
          Svep för att se fler recept →
        </motion.p>
      </div>
    </section>
  );
} 