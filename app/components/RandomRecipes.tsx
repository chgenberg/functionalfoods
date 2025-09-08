'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import { optimizeImageUrl } from '@/app/lib/imageOptimization';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  isPremium?: boolean;
  categories?: string[];
}

interface RandomRecipesProps {
  excludeId?: string;
  count?: number;
  title?: string;
}

export default function RandomRecipes({ excludeId, count = 3, title = "Fler recept" }: RandomRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRandomRecipes();
  }, [excludeId, count]);

  const fetchRandomRecipes = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('count', count.toString());
      if (excludeId) {
        params.append('excludeId', excludeId);
      }

      const response = await fetch(`/api/recipes/random?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        let fetchedRecipes = data.recipes || [];

        // Batch-map images using filesystem fuzzy matching
        if (fetchedRecipes.length > 0) {
          try {
            const names = fetchedRecipes.map((r: Recipe) => r.title);
            const slugs = fetchedRecipes.map((r: Recipe) => r.slug);
            const mapRes = await fetch(`/api/recipes/batch-images?v=${Date.now()}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
              cache: 'no-store',
              body: JSON.stringify({ 
                recipeNames: names, 
                recipeSlugs: slugs, 
                size: 'medium',
                usage: 'card'
              })
            });
            if (mapRes.ok) {
              const { images } = await mapRes.json();
              fetchedRecipes = fetchedRecipes.map((r: Recipe) => ({
                ...r,
                imageUrl: images && images[r.title] ? images[r.title] : r.imageUrl
              }));
              console.log('🎲 RandomRecipes: Mapped', Object.keys(images || {}).length, 'recipe images via fuzzy matching');
            }
          } catch (e) {
            console.warn('RandomRecipes batch-images mapping failed, using original imageUrl', e);
          }
        }

        setRecipes(fetchedRecipes);
      }
    } catch (error) {
      console.error('Error fetching random recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Laddar recept...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      {recipes.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={`/kunskapsbank/recept/${recipe.slug}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 block"
              >
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
                  {recipe.imageUrl ? (
                    <Image
                      src={optimizeImageUrl(recipe.imageUrl, 'medium', 'landscape')}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 recipe-image"
                      style={{ 
                        objectFit: 'cover', 
                        objectPosition: 'center',
                        imageOrientation: 'from-image'
                      }}
                      unoptimized={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-50">🍽️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badge */}
                  {recipe.isPremium && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {recipe.excerpt || 'Upptäck detta läckra recept'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {recipe.prepTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime}
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {recipe.servings} port
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-50">🍽️</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Kommer snart...
                </h3>
                <p className="text-sm text-gray-600">
                  Fler läckra recept på väg
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-8">
        <Link
          href="/kunskapsbank/recept"
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition-colors"
        >
          Se alla recept
        </Link>
      </div>
    </motion.div>
  );
} 