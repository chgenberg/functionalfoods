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
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorite recipes:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addFavorite = (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
    const newFavorite: FavoriteRecipe = {
      ...recipe,
      addedAt: new Date().toISOString()
    };
    
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
        return prev; // Don't add duplicates
      }
      
      return [...prev, newFavorite];
    });
  };

  const removeFavorite = (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
    setFavorites(prev => prev.filter(fav => 
      !(fav.name === recipe.name && 
        fav.courseType === recipe.courseType &&
        fav.weekNumber === recipe.weekNumber &&
        fav.dayName === recipe.dayName &&
        fav.mealType === recipe.mealType)
    ));
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
    if (isFavorite(recipe)) {
      removeFavorite(recipe);
    } else {
      addFavorite(recipe);
    }
  };

  const getFavoritesByCoursetype = (courseType: 'basics' | 'flow') => {
    return favorites.filter(fav => fav.courseType === courseType);
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