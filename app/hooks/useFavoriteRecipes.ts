import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface FavoriteRecipe {
  name: string;
  recipeLink?: string;
  courseType: 'basics' | 'flow' | 'energy' | 'hormone';
  weekNumber: number;
  dayName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  addedAt: string;
}

export function useFavoriteRecipes() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { token } = useAuth();

  // Load favorites: from server if logged in, otherwise from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const load = async () => {
      try {
        if (token) {
          const res = await fetch('/api/user/favorites', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const serverFavs = (data.favorites || []).map((f: any) => ({
              name: f.name,
              recipeLink: f.recipeLink ?? undefined,
              courseType: f.courseType as FavoriteRecipe['courseType'],
              weekNumber: f.weekNumber,
              dayName: f.dayName,
              mealType: f.mealType as FavoriteRecipe['mealType'],
              addedAt: f.addedAt,
            }));
            setFavorites(serverFavs);
            // Also cache locally for quick access
            localStorage.setItem('favoriteRecipes', JSON.stringify(serverFavs));
            return;
          }
        }
        // Fallback to localStorage
        const saved = localStorage.getItem('favoriteRecipes');
        const parsed = saved ? JSON.parse(saved) : [];
        setFavorites(parsed);
      } catch (error) {
        console.error('❌ Error loading favorite recipes:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, [token]);

  // Persist: server if logged in, otherwise localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLoaded) {
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
      if (token) {
        // Sync last mutation is handled in toggleFavorite to avoid bulk posting here
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = async (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
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

    // Server sync
    try {
      if (token) {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(recipe)
        });
      }
    } catch (e) {
      console.warn('Failed to sync favorite to server, will retry on next action');
    }
  };

  const removeFavorite = async (recipe: Omit<FavoriteRecipe, 'addedAt'>) => {
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

    // Server sync
    try {
      if (token) {
        const params = new URLSearchParams({
          name: recipe.name,
          courseType: recipe.courseType,
          weekNumber: String(recipe.weekNumber),
          dayName: recipe.dayName,
          mealType: recipe.mealType,
        });
        await fetch(`/api/user/favorites?${params.toString()}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn('Failed to sync favorite removal to server');
    }
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

  const getFavoritesByCoursetype = (courseType: 'basics' | 'flow' | 'energy' | 'hormone') => {
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