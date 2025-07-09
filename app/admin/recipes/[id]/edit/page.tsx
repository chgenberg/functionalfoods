"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiTrash2, FiEye, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Recipe {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'publish' | 'draft';
  isPremium: boolean;
  date: string;
  author: {
    name: string;
    username: string;
  };
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  instructions?: string[];
  nutrition?: any;
  tips?: string;
  tags?: string[];
}

interface EditRecipeForm {
  title: string;
  excerpt: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips: string;
  tags: string[];
  status: 'publish' | 'draft';
  isPremium: boolean;
  imageUrl: string;
}

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  
  const [formData, setFormData] = useState<EditRecipeForm>({
    title: '',
    excerpt: '',
    category: 'Middag',
    difficulty: 'Medel',
    prepTime: '',
    cookTime: '',
    servings: 4,
    ingredients: [],
    instructions: [],
    tips: '',
    tags: [],
    status: 'publish',
    isPremium: false,
    imageUrl: ''
  });

  useEffect(() => {
    fetchRecipe();
  }, [params.id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      // Hämta alla recept och hitta det specifika
      const response = await fetch('/api/recipes?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      const foundRecipe = data.recipes.find((r: Recipe) => r.id === params.id);
      
      if (!foundRecipe) {
        throw new Error('Recipe not found');
      }

      setRecipe(foundRecipe);
      
      // Populera formuläret med befintlig data
      setFormData({
        title: foundRecipe.title,
        excerpt: foundRecipe.excerpt,
        category: foundRecipe.categories[0] || 'Middag',
        difficulty: foundRecipe.difficulty || 'Medel',
        prepTime: foundRecipe.prepTime || '',
        cookTime: foundRecipe.cookTime || '',
        servings: foundRecipe.servings || 4,
        ingredients: foundRecipe.ingredients || [],
        instructions: foundRecipe.instructions || [],
        tips: foundRecipe.tips || '',
        tags: foundRecipe.tags || [],
        status: foundRecipe.status,
        isPremium: foundRecipe.isPremium,
        imageUrl: foundRecipe.imageUrl || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('saving');
      
      // Skicka uppdateringsdata till API
      const updateData = {
        title: formData.title,
        excerpt: formData.excerpt,
        category: formData.category,
        difficulty: formData.difficulty,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.trim() !== ''),
        tips: formData.tips,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        status: formData.status,
        isPremium: formData.isPremium,
        imageUrl: formData.imageUrl
      };

      const response = await fetch(`/api/recipes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      const result = await response.json();
      console.log('Recipe saved successfully:', result);
      
      setSaveStatus('saved');
      
      // Återgå till listan efter 2 sekunder
      setTimeout(() => {
        router.push('/admin/recipes');
      }, 2000);
      
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving recipe:', error);
      alert('Fel vid sparning av recept: ' + (error instanceof Error ? error.message : 'Okänt fel'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Är du säker på att du vill ta bort detta recept? Denna åtgärd går inte att ångra.')) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`/api/recipes/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      const result = await response.json();
      console.log('Recipe deleted successfully:', result);
      
      alert(`Receptet "${result.deletedRecipe}" har tagits bort. Backup sparad som: ${result.backupFile}`);
      router.push('/admin/recipes');
      
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Fel vid borttagning av recept: ' + (error instanceof Error ? error.message : 'Okänt fel'));
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar recept...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Fel vid laddning</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/admin/recipes"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Tillbaka till receptlistan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/recipes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                Tillbaka
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Redigera recept</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <FiCheck className="w-4 h-4" />
                  <span className="text-sm">Sparat!</span>
                </div>
              )}
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-orange-600">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Sparar...</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <FiAlertCircle className="w-4 h-4" />
                  <span className="text-sm">Fel vid sparning</span>
                </div>
              )}
              
              <Link
                href={`/kunskapsbank/recept/${recipe?.slug}`}
                target="_blank"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FiEye className="w-4 h-4" />
                Förhandsgranska
              </Link>
              
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" />
                Ta bort
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" />
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Grundläggande information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recepttitel
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Namn på receptet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Frukost">Frukost</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Middag">Middag</option>
                    <option value="Mellanmål">Mellanmål</option>
                    <option value="Efterrätt">Efterrätt</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="En kort, lockande beskrivning av receptet"
                  />
                </div>
              </div>
            </div>

            {/* Recipe Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Receptdetaljer</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Svårighetsgrad
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Lätt">Lätt</option>
                    <option value="Medel">Medel</option>
                    <option value="Svår">Svår</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förberedelsetid
                  </label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="t.ex. 15 min"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillagningstid
                  </label>
                  <input
                    type="text"
                    value={formData.cookTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="t.ex. 30 min"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portioner
                  </label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingredienser</h2>
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={`Ingrediens ${index + 1}`}
                    />
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIngredient}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  + Lägg till ingrediens
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Instruktioner</h2>
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      {index + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={`Steg ${index + 1}`}
                    />
                    <button
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addInstruction}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  + Lägg till instruktion
                </button>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips från kocken</h2>
              <textarea
                value={formData.tips}
                onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Extra tips för att lyckas med receptet..."
              />
            </div>

            {/* Status and Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Inställningar</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="publish"
                      checked={formData.status === 'publish'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'publish' | 'draft' }))}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Publicerad</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'publish' | 'draft' }))}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Utkast</span>
                  </label>
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Premium-recept (kräver köpt kurs)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 