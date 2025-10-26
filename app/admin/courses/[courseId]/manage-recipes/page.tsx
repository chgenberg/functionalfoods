'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Search, Check, Coffee, Loader2, Edit2 } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  excerpt?: string;
  categories: string[];
  tags?: string[];
  status: string;
  isPremium: boolean;
  isFree: boolean;
  servings?: number;
  prepTime?: string;
}

export default function ManageRecipesPage({ params }: { params: { courseId: string } }) {
  const [courseRecipes, setCourseRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourseRecipes();
    fetchAllRecipes();
  }, []);

  const fetchCourseRecipes = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.courseId}/recipes`);
      if (response.ok) {
        const data = await response.json();
        setCourseRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching course recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecipes = async () => {
    try {
      const response = await fetch('/api/admin/recipes?adminFilter=all&limit=500');
      if (response.ok) {
        const data = await response.json();
        setAllRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching all recipes:', error);
    }
  };

  const handleAddRecipes = async () => {
    if (selectedRecipes.size === 0) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/courses/${params.courseId}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeIds: Array.from(selectedRecipes) })
      });

      if (response.ok) {
        await fetchCourseRecipes();
        setShowAddModal(false);
        setSelectedRecipes(new Set());
        alert(`✅ ${selectedRecipes.size} recept tillagda till kursen!`);
      }
    } catch (error) {
      console.error('Error adding recipes:', error);
      alert('❌ Fel vid tillägg av recept');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: string, title: string) => {
    if (!confirm(`Ta bort "${title}" från kursen?`)) return;

    try {
      const response = await fetch(
        `/api/admin/courses/${params.courseId}/recipes?recipeId=${recipeId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchCourseRecipes();
        alert('✅ Recept borttaget från kursen');
      }
    } catch (error) {
      console.error('Error removing recipe:', error);
      alert('❌ Fel vid borttagning');
    }
  };

  const toggleRecipeSelection = (recipeId: string) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipes(newSelection);
  };

  const availableRecipes = allRecipes.filter(recipe => 
    !courseRecipes.some(cr => cr.id === recipe.id) &&
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseName = params.courseId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-green)]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till kurser
        </Link>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
              Hantera recept för {courseName}
            </h1>
            <p className="text-[var(--text-secondary)] font-light">
              {courseRecipes.length} recept i kursen • Klicka på ett recept för att redigera
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Lägg till recept
          </button>
        </div>
      </div>

      {/* Course Recipes Grid */}
      {courseRecipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border-light)]">
          <Coffee className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
            Inga recept ännu
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Börja med att lägga till recept till kursen
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Lägg till första receptet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courseRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden border border-[var(--border-light)] hover:shadow-lg transition-all cursor-pointer"
              onClick={() => window.location.href = `/admin/courses/${params.courseId}/recipes/${recipe.id}`}
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 relative">
                {recipe.imageUrl ? (
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                    <Coffee className="w-16 h-16 text-gray-300" />
                    <span className="text-sm text-gray-400">Ingen bild</span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRecipe(recipe.id, recipe.title);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="Ta bort från kurs"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/admin/courses/${params.courseId}/recipes/${recipe.id}`;
                  }}
                  className="absolute bottom-2 right-2 bg-[var(--primary-green)] text-white p-2 rounded-full hover:bg-[#012a14] transition-colors"
                  title="Redigera recept"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-[var(--text-primary)] mb-2 line-clamp-2">
                  {recipe.title}
                </h3>
                {recipe.excerpt && (
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                    {recipe.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {recipe.categories.slice(0, 2).map((cat, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[var(--primary-beige)] text-[var(--text-primary)] px-2 py-1 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Recipes Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border-light)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-light text-[var(--primary-green)]">
                  Lägg till recept
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök recept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input pl-10 w-full"
                />
              </div>

              {selectedRecipes.size > 0 && (
                <div className="mt-4 flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm text-blue-800">
                    {selectedRecipes.size} recept valda
                  </span>
                  <button
                    onClick={handleAddRecipes}
                    disabled={saving}
                    className="admin-btn admin-btn-primary"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Lägger till...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Lägg till valda
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => toggleRecipeSelection(recipe.id)}
                    className={`cursor-pointer rounded-xl border-2 transition-all ${
                      selectedRecipes.has(recipe.id)
                        ? 'border-[var(--primary-green)] bg-green-50'
                        : 'border-[var(--border-light)] hover:border-[var(--primary-light-green)]'
                    }`}
                  >
                    <div className="h-32 bg-gray-100 relative rounded-t-xl overflow-hidden">
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Coffee className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {selectedRecipes.has(recipe.id) && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-green-500 rounded-full p-2">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {recipe.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              {availableRecipes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)]">
                    {searchTerm ? 'Inga recept hittades' : 'Alla recept är redan tillagda'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
