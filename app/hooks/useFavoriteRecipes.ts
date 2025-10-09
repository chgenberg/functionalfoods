import { useState, useEffect } from 'react';

export interface FavoriteRecipe {
  name: string;
  recipeLink?: string;
  courseType: 'basics' | 'flow' | 'energy';
  weekNumber: number;
  dayName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  addedAt: string;
}

export function useFavoriteRecipes() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('favoriteRecipes');
      console.log('📚 Loading favorite recipes from localStorage:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFavorites(parsed);
        console.log('✅ Loaded favorites:', parsed.length, 'recipes');
      } else {
        console.log('ℹ️ No saved favorites found');
      }
    } catch (error) {
      console.error('❌ Error loading favorite recipes:', error);
    } finally {
      setIsLoaded(true);
      console.log('✅ Favorites loaded, isLoaded = true');
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
      console.log('💾 Saved favorites to localStorage:', favorites.length, 'recipes');
    }
  }, [favorites, isLoaded]);

  const addFavorite = (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
    const newFavorite: FavoriteRecipe = {
      ...recipe,
      addedAt: new Date().toISOString()
    };
    
    console.log('➕ addFavorite: Adding recipe:', newFavorite);
    
    setFavorites(prev => {
      // Check if already exists
      const exists = prev.some(fav => 
        fav.name === recipe.name && 
        fav.courseType === recipe.courseType &&
        fav.weekNumber === recipe.weekNumber &&
        fav.dayName === recipe.dayName &&
        fav.mealType === recipe.mealType
      );
      
      if (exists) {
        console.log('⚠️ Recipe already exists in favorites, skipping');
        return prev; // Don't add duplicates
      }
      
      const newFavorites = [...prev, newFavorite];
      console.log('✅ Added to favorites. New total:', newFavorites.length);
      return newFavorites;
    });
  };

  const removeFavorite = (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
    console.log('➖ removeFavorite: Removing recipe:', recipe);
    
    setFavorites(prev => {
      const filtered = prev.filter(fav => 
        !(fav.name === recipe.name && 
          fav.courseType === recipe.courseType &&
          fav.weekNumber === recipe.weekNumber &&
          fav.dayName === recipe.dayName &&
          fav.mealType === recipe.mealType)
      );
      console.log('✅ Removed from favorites. New total:', filtered.length);
      return filtered;
    });
  };

  const isFavorite = (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
    return favorites.some(fav => 
      fav.name === recipe.name && 
      fav.courseType === recipe.courseType &&
      fav.weekNumber === recipe.weekNumber &&
      fav.dayName === recipe.dayName &&
      fav.mealType === recipe.mealType
    );
  };

  const toggleFavorite = (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
    console.log('⭐ toggleFavorite called with:', recipe);
    const isCurrentlyFavorite = isFavorite(recipe);
    console.log('📍 Current favorite status:', isCurrentlyFavorite);
    
    if (isCurrentlyFavorite) {
      console.log('➖ Removing from favorites');
      removeFavorite(recipe);
    } else {
      console.log('➕ Adding to favorites');
      addFavorite(recipe);
    }
  };

  const getFavoritesByCoursetype = (courseType: 'basics' | 'flow' | 'energy') => {
    const filtered = favorites.filter(fav => fav.courseType === courseType);
    console.log(`📋 getFavoritesByCoursetype(${courseType}): Found ${filtered.length} favorites`);
    return filtered;
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoritesByCoursetype,
    clearAllFavorites,
    isLoaded
  };
} 