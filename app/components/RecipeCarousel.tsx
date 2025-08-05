'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiArrowRight } from 'react-icons/fi';

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
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/random');
      const data = await response.json();
      // Duplicera recepten för oändlig loop
      setRecipes([...data, ...data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length > 0) {
      const animateCarousel = async () => {
        // Beräkna total bredd
        const itemWidth = 320; // 300px + 20px gap
        const totalWidth = itemWidth * (recipes.length / 2);

        // Animera kontinuerligt
        await controls.start({
          x: -totalWidth,
          transition: {
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: recipes.length * 5, // 5 sekunder per recept
              ease: "linear",
            },
          },
        });
      };

      animateCarousel();
    }
  }, [recipes, controls]);

  if (loading) {
    return (
      <div className="py-8 md:py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 overflow-hidden bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="text-2xl md:text-3xl font-light text-center text-gray-800">
          Utforska våra <span className="font-bold text-primary">gratis recept</span>
        </h2>
        <p className="text-center text-gray-600 mt-2">Hälsosamma måltider för varje dag</p>
      </div>
      
      <div className="relative overflow-hidden" ref={containerRef}>
        <motion.div
          className="flex gap-5"
          animate={controls}
          style={{ width: 'fit-content' }}
        >
          {recipes.map((recipe, index) => (
            <Link
              key={`${recipe.id}-${index}`}
              href={`/kunskapsbank/recept/${recipe.slug}`}
              className="flex-shrink-0 group"
            >
              <motion.div
                className="w-[300px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                {/* Bild */}
                <div className="relative h-[200px] overflow-hidden bg-gray-100">
                  {recipe.imageUrl ? (
                    <Image
                      src={recipe.imageUrl}
                      alt={recipe.imageAlt || recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-background">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  
                  {/* Kategori badge */}
                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                        {recipe.categories[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Innehåll */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {recipe.title}
                  </h3>
                  
                  {recipe.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {recipe.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    {recipe.prepTime && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiClock className="w-4 h-4" />
                        <span>{recipe.prepTime}</span>
                      </div>
                    )}
                    
                    <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Läs mer
                      <FiArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 