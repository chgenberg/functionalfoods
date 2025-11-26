'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Recipe {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  isFree: boolean;
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  date: string;
  tags?: string[];
}

interface RecipeStats {
  total: number;
  free: number;
  premium: number;
  visible: number;
  byCourse?: {
    Basic: number;
    Flow: number;
    Energy: number;
    Hormone: number;
  };
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<RecipeStats>({ total: 0, free: 0, premium: 0, visible: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [courseFilter, setCourseFilter] = useState<'all' | 'functional-basics' | 'functional-flow' | 'functional-energy' | 'functional-hormone'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRecipes();
  }, [filter, courseFilter]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter === 'free') {
        params.append('adminFilter', 'free');
      } else if (filter === 'premium') {
        params.append('adminFilter', 'premium');
      } else {
        params.append('adminFilter', 'all');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (courseFilter !== 'all') {
        const courseTagMap: Record<string, string> = {
          'functional-basics': 'Basic',
          'functional-flow': 'Flow',
          'functional-energy': 'Energy',
          'functional-hormone': 'hormonell-balans'
        };
        params.append('courseFilter', courseTagMap[courseFilter] || courseFilter);
      }
      
      params.append('limit', '200');
      params.append('adminMode', 'true');

      const response = await fetch(`/api/admin/recipes?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecipes(data.recipes || []);
        setStats(data.statistics || { total: 0, free: 0, premium: 0, visible: 0 });
      } else {
        setError(data.error || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (slug: string, title: string) => {
    if (!confirm(`Är du säker på att du vill ta bort receptet "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${slug}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecipes(recipes.filter(recipe => recipe.slug !== slug));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          free: recipes.find(r => r.slug === slug)?.isFree ? prev.free - 1 : prev.free,
          premium: recipes.find(r => r.slug === slug)?.isPremium ? prev.premium - 1 : prev.premium
        }));
        alert('Receptet har tagits bort');
      } else {
        const data = await response.json();
        alert(`Fel vid borttagning: ${data.error}`);
      }
    } catch (err) {
      alert('Fel vid borttagning av recept');
      console.error('Error deleting recipe:', err);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (filter === 'free') return recipe.isFree && !recipe.isPremium;
    if (filter === 'premium') return recipe.isPremium;
    return true;
  });

  const normalizeImageUrl = (url: string | undefined | null): string => {
    if (!url) return '/images/recipe-placeholder.svg';
    
    let normalized = url;
    
    if (normalized.startsWith('/public/')) {
      normalized = normalized.replace('/public', '');
    }
    if (normalized.startsWith('public/')) {
      normalized = '/' + normalized.substring(7);
    }
    
    if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
      normalized = '/' + normalized;
    }
    
    return normalized;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar recept...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Recept</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera alla recept</p>
        </div>
        <Link 
          href="/admin/recipes/new"
          className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors text-sm"
        >
          Skapa recept
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Totalt</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Gratis</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats.free}</p>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Premium</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats.premium}</p>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Publicerade</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stats.visible}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'free', 'premium'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === f 
                    ? 'bg-[var(--primary-green)] text-white' 
                    : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Alla' : f === 'free' ? 'Gratis' : 'Premium'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRecipes()}
              className="flex-1 px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
            />
            <button
              onClick={fetchRecipes}
              className="px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors"
            >
              Sök
            </button>
          </div>
        </div>

        {/* Course filter */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          <p className="text-xs text-[var(--text-secondary)] w-full mb-1">Kurs:</p>
          {[
            { key: 'all', label: 'Alla' },
            { key: 'functional-basics', label: `Basics (${stats.byCourse?.Basic || 0})` },
            { key: 'functional-flow', label: `Flow (${stats.byCourse?.Flow || 0})` },
            { key: 'functional-energy', label: `Energy (${stats.byCourse?.Energy || 0})` },
            { key: 'functional-hormone', label: `Hormone (${stats.byCourse?.Hormone || 0})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCourseFilter(key as any)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                courseFilter === key 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Recipes list */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--border-light)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Recept</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Kategori</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                  {searchTerm ? 'Inga recept matchar sökningen' : 'Inga recept'}
                </td>
              </tr>
            ) : (
              filteredRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {recipe.imageUrl && !imageError[recipe.id] ? (
                          <Image
                            src={normalizeImageUrl(recipe.imageUrl)}
                            alt={recipe.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            onError={() => setImageError(prev => ({ ...prev, [recipe.id]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] text-xs">
                            -
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{recipe.title}</p>
                        <p className="text-xs text-[var(--text-secondary)]">/{recipe.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {recipe.isPremium && (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">Premium</span>
                      )}
                      {recipe.isFree && !recipe.isPremium && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Gratis</span>
                      )}
                      {recipe.status === 'DRAFT' && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Utkast</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-[var(--primary-beige)] text-[var(--text-secondary)] rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/recipes/${recipe.slug}/edit`}
                        className="px-3 py-1.5 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 transition-colors"
                      >
                        Redigera
                      </Link>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.slug, recipe.title)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
