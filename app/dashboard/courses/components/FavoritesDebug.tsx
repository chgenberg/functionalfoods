'use client';

import { useEffect, useState } from 'react';
import { useFavoriteRecipes } from '@/app/hooks/useFavoriteRecipes';

export default function FavoritesDebug({ courseType }: { courseType: 'basics' | 'flow' | 'energy' }) {
  const { favorites, getFavoritesByCoursetype, isLoaded } = useFavoriteRecipes();
  const [localStorageRaw, setLocalStorageRaw] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('favoriteRecipes') || '[]';
      setLocalStorageRaw(raw);
    }
  }, [favorites]);

  const courseFavorites = getFavoritesByCoursetype(courseType);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-4 max-w-md z-50 text-xs">
      <h3 className="font-bold text-blue-600 mb-2">🐛 Favorites Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong>isLoaded:</strong> {isLoaded ? '✅ YES' : '❌ NO'}
        </div>
        
        <div>
          <strong>Course:</strong> {courseType}
        </div>
        
        <div>
          <strong>Total favorites:</strong> {favorites.length}
        </div>
        
        <div>
          <strong>This course favorites:</strong> {courseFavorites.length}
        </div>
        
        <div className="border-t pt-2 mt-2">
          <strong>localStorage raw:</strong>
          <pre className="text-[10px] bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
            {localStorageRaw}
          </pre>
        </div>
        
        {courseFavorites.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <strong>Course favorites:</strong>
            <ul className="list-disc pl-4 mt-1">
              {courseFavorites.slice(0, 3).map((fav, idx) => (
                <li key={idx}>{fav.name}</li>
              ))}
              {courseFavorites.length > 3 && <li>...and {courseFavorites.length - 3} more</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

