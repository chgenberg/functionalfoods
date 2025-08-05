'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Recipe {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  isPremium: boolean;
  isFree: boolean;
  date: string;
  author: {
    name: string;
    username: string;
  };
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  userAccess: {
    hasAccess: boolean;
    userId: string | null;
  };
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, userAccess }) => {
  const canAccess = recipe.isFree || !recipe.isPremium || userAccess.hasAccess;
  const imageUrl = recipe.imageUrl || '/images/recipe-placeholder.svg';

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 h-[520px] flex flex-col">
      {/* Image Container - Fixed height */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {recipe.imageUrl ? (
          <Image
            src={imageUrl}
            alt={recipe.imageAlt || recipe.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 recipe-image"
            style={{ 
              objectFit: 'cover', 
              objectPosition: 'center',
              imageOrientation: 'from-image'
            }}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-background flex items-center justify-center">
            <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        )}

        {/* Premium Badge */}
        {recipe.isPremium && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Premium</span>
            </div>
          </div>
        )}

        {/* Free Badge */}
        {recipe.isFree && !recipe.isPremium && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gratis</span>
            </div>
          </div>
        )}

        {/* Categories on hover */}
        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-wrap gap-2">
            {recipe.categories?.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-full font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Flexible height with fixed structure */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title - Fixed height with line clamp */}
        <div className="h-14 mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {recipe.title}
          </h3>
        </div>
        
        {/* Excerpt - Fixed height with line clamp */}
        <div className="h-16 mb-4">
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {recipe.excerpt || 'Upptäck detta läckra recept med funktionella livsmedel.'}
          </p>
        </div>

        {/* Recipe meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            {recipe.difficulty && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {recipe.difficulty}
              </span>
            )}
            {recipe.prepTime && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.prepTime}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {recipe.servings} port.
              </span>
            )}
          </div>
        </div>

        {/* Author and ingredient count */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 h-4">
          <span className="flex items-center truncate">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">{recipe.author?.name || 'Functional Foods'}</span>
          </span>
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <span className="flex items-center flex-shrink-0 ml-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {recipe.ingredients.length} ingredienser
            </span>
          )}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Action button - Fixed at bottom */}
        <div className="mt-auto">
          {canAccess ? (
            <a
              href={`/kunskapsbank/recept/${recipe.slug}`}
              className="block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-secondary transition-all transform hover:scale-105 font-medium shadow-md"
            >
              Visa recept
            </a>
          ) : (
            <div>
              <button
                disabled
                className="block w-full text-center bg-gray-100 text-gray-400 py-3 rounded-lg font-medium cursor-not-allowed mb-2"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Premium recept
                </div>
              </button>
              <a
                href="/utbildning"
                className="block text-center text-primary hover:text-secondary text-sm font-medium"
              >
                Köp kurs för tillgång →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default RecipeCard; 