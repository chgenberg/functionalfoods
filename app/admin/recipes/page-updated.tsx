'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Search, Filter, Clock, Users, BookOpen, Tag } from 'lucide-react';

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
  courseTags?: string[]; // Kurskopplingar
}

interface RecipeStats {
  total: number;
  free: number;
  premium: number;
  visible: number;
  byCourse: {
    'functional-basics': number;
    'functional-flow': number;
    'functional-energy': number;
  };
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<RecipeStats>({ 
    total: 0, 
    free: 0, 
    premium: 0, 
    visible: 0,
    byCourse: {
      'functional-basics': 0,
      'functional-flow': 0,
      'functional-energy': 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'basics' | 'flow' | 'energy'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const courseInfo = {
    'functional-basics': { name: 'Functional Basics', color: 'bg-blue-100 text-blue-800', icon: '🌱' },
    'functional-flow': { name: 'Functional Flow', color: 'bg-green-100 text-green-800', icon: '🌊' },
    'functional-energy': { name: 'Functional Energy', color: 'bg-orange-100 text-orange-800', icon: '⚡' }
  };

  useEffect(() => {
    fetchRecipes();
  }, [filter, searchTerm]);

  // Fetch optimized images after recipes are loaded
  useEffect(() => {
    if (recipes.length > 0) {
      fetchRecipeImages();
    }
  }, [recipes]);

  const fetchRecipeImages = async () => {
    try {
      const recipeNames = recipes.map(recipe => recipe.title);
      const response = await fetch('/api/recipes/batch-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeNames,
          size: 'small',
          usage: 'thumb'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update recipes with optimized image URLs
        setRecipes(prevRecipes => 
          prevRecipes.map(recipe => ({
            ...recipe,
            imageUrl: data.images[recipe.title] || recipe.imageUrl
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching recipe images:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter === 'free') {
        params.append('adminFilter', 'free');
      } else if (filter === 'premium') {
        params.append('adminFilter', 'premium');
      } else if (['basics', 'flow', 'energy'].includes(filter)) {
        params.append('courseFilter', `functional-${filter}`);
      } else {
        params.append('adminFilter', 'all');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      params.append('limit', '200');
      params.append('adminMode', 'true');

      const response = await fetch(`/api/admin/recipes?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        // Lägg till kurskopplingar från tags
        const recipesWithCourses = (data.recipes || []).map((recipe: Recipe) => ({
          ...recipe,
          courseTags: recipe.tags?.filter(tag => 
            ['functional-basics', 'functional-flow', 'functional-energy'].includes(tag)
          ) || []
        }));
        
        setRecipes(recipesWithCourses);
        
        // Beräkna stats inklusive kursstats
        const courseStats = {
          'functional-basics': recipesWithCourses.filter((r: Recipe) => 
            r.courseTags?.includes('functional-basics')).length,
          'functional-flow': recipesWithCourses.filter((r: Recipe) => 
            r.courseTags?.includes('functional-flow')).length,
          'functional-energy': recipesWithCourses.filter((r: Recipe) => 
            r.courseTags?.includes('functional-energy')).length
        };
        
        setStats({
          ...data.statistics,
          byCourse: courseStats
        });
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
        alert('Receptet har tagits bort');
        fetchRecipes(); // Refresh stats
      } else {
        const data = await response.json();
        alert(`Fel vid borttagning: ${data.error}`);
      }
    } catch (err) {
      alert('Fel vid borttagning av recept');
      console.error('Error deleting recipe:', err);
    }
  };

  const toggleRecipeCourse = async (recipeSlug: string, courseId: string) => {
    try {
      const recipe = recipes.find(r => r.slug === recipeSlug);
      if (!recipe) return;

      const currentCourseTags = recipe.courseTags || [];
      const newCourseTags = currentCourseTags.includes(courseId)
        ? currentCourseTags.filter(tag => tag !== courseId)
        : [...currentCourseTags, courseId];

      // Uppdatera lokalt först för snabb feedback
      setRecipes(prev => prev.map(r => 
        r.slug === recipeSlug 
          ? { ...r, courseTags: newCourseTags }
          : r
      ));

      // Skicka till API
      const response = await fetch(`/api/recipes/${recipeSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tags: [...(recipe.tags?.filter(tag => 
            !['functional-basics', 'functional-flow', 'functional-energy'].includes(tag)
          ) || []), ...newCourseTags]
        })
      });

      if (!response.ok) {
        // Återställ vid fel
        setRecipes(prev => prev.map(r => 
          r.slug === recipeSlug 
            ? { ...r, courseTags: currentCourseTags }
            : r
        ));
        alert('Fel vid uppdatering av kurskoppling');
      }
    } catch (error) {
      console.error('Error toggling course:', error);
      alert('Tekniskt fel vid kurskoppling');
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (filter === 'free') return recipe.isFree && !recipe.isPremium;
    if (filter === 'premium') return recipe.isPremium;
    if (filter === 'basics') return recipe.courseTags?.includes('functional-basics');
    if (filter === 'flow') return recipe.courseTags?.includes('functional-flow');
    if (filter === 'energy') return recipe.courseTags?.includes('functional-energy');
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar recept...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Recepthantering</h1>
          <p className="text-[var(--text-secondary)]">Hantera alla recept och kurskopplingar</p>
        </div>
        <Link 
          href="/admin/recipes/new"
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Skapa nytt recept
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-label">Totalt</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.free}</div>
          <div className="admin-stat-label">Gratis</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.premium}</div>
          <div className="admin-stat-label">Premium</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.byCourse?.['functional-basics'] || 0}</div>
          <div className="admin-stat-label">Basics</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.byCourse?.['functional-flow'] || 0}</div>
          <div className="admin-stat-label">Flow</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.byCourse?.['functional-energy'] || 0}</div>
          <div className="admin-stat-label">Energy</div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Alla recept' },
              { key: 'free', label: 'Gratis' },
              { key: 'premium', label: 'Premium' },
              { key: 'basics', label: '🌱 Basics' },
              { key: 'flow', label: '🌊 Flow' },
              { key: 'energy', label: '⚡ Energy' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === filterOption.key
                    ? 'bg-[var(--primary-green)] text-white'
                    : 'bg-[var(--primary-beige)] text-[var(--text-primary)] hover:bg-[var(--primary-light-green)] hover:text-white'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Sök recept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Recipes Table */}
      <div className="admin-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Recept</th>
              <th>Kurser</th>
              <th>Status</th>
              <th>Typ</th>
              <th>Portioner</th>
              <th>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--primary-beige)]">
                      <Image
                        src={recipe.imageUrl || '/images/recipe-placeholder.svg'}
                        alt={recipe.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(prev => ({ ...prev, [recipe.id]: true }))}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">{recipe.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                        {recipe.excerpt || 'Ingen beskrivning'}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(courseInfo).map(([courseId, info]) => (
                      <button
                        key={courseId}
                        onClick={() => toggleRecipeCourse(recipe.slug, courseId)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                          recipe.courseTags?.includes(courseId)
                            ? info.color
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={`Koppla till ${info.name}`}
                      >
                        {info.icon} {info.name.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </td>

                <td>
                  <span className={`admin-badge ${
                    recipe.status === 'PUBLISHED' ? 'admin-badge-success' :
                    recipe.status === 'DRAFT' ? 'admin-badge-warning' :
                    'admin-badge-info'
                  }`}>
                    {recipe.status === 'PUBLISHED' ? 'Publicerad' :
                     recipe.status === 'DRAFT' ? 'Utkast' : 'Arkiverad'}
                  </span>
                </td>

                <td>
                  <div className="flex gap-1">
                    {recipe.isPremium && (
                      <span className="admin-badge admin-badge-warning">Premium</span>
                    )}
                    {recipe.isFree && (
                      <span className="admin-badge admin-badge-success">Gratis</span>
                    )}
                  </div>
                </td>

                <td>
                  <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <Users className="w-4 h-4" />
                    {recipe.servings || '-'}
                  </div>
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/recipes/${recipe.slug}/edit`}
                      className="admin-btn admin-btn-secondary text-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      Redigera
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteRecipe(recipe.slug, recipe.title)}
                      className="admin-btn admin-btn-danger text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Inga recept hittades</h3>
          <p className="text-[var(--text-secondary)] mb-4">
            {searchTerm ? 'Prova att ändra sökterm eller filter' : 'Skapa ditt första recept'}
          </p>
          <Link 
            href="/admin/recipes/new"
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Skapa recept
          </Link>
        </div>
      )}
    </div>
  );
}
