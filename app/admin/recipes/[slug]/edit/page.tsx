"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle, ArrowLeft, Check, Eye, FileText, Image as ImageIcon, Lightbulb, Loader, Save, Trash2, Upload, X } from "lucide-react";;

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

export default function EditRecipePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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
  }, [params.slug]);

  useEffect(() => {
    // Set image preview when recipe loads
    if (recipe?.imageUrl) {
      setImagePreview(recipe.imageUrl);
    }
  }, [recipe]);

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
      const foundRecipe = data.recipes.find((r: Recipe) => r.slug === params.slug);
      
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
        ingredients: Array.isArray(foundRecipe.ingredients) ? foundRecipe.ingredients : 
                    (foundRecipe.ingredients ? [foundRecipe.ingredients] : []),
        instructions: Array.isArray(foundRecipe.instructions) ? foundRecipe.instructions : 
                     (foundRecipe.instructions ? 
                       (typeof foundRecipe.instructions === 'string' ? 
                         foundRecipe.instructions.split('\n').filter((line: string) => line.trim()) : 
                         [foundRecipe.instructions.toString()]) : 
                       []),
        tips: foundRecipe.tips || '',
        tags: Array.isArray(foundRecipe.tags) ? foundRecipe.tags : 
              (foundRecipe.tags ? [foundRecipe.tags] : []),
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

      const response = await fetch(`/api/recipes/${params.slug}`, {
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
      
      const response = await fetch(`/api/recipes/${params.slug}`, {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Bilden är för stor. Max 5MB tillåten.');
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setImagePreview(data.url);
      setSaveStatus(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fel vid uppladdning av bild');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
    setSaveStatus(null);
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
      <div className="min-h-screen bg-[#F7F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#93C560] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar recept...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-[#014421] mb-2">Fel vid laddning</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/admin/recipes"
            className="bg-gradient-to-r from-[#FF7E70] to-[#ff6b5a] text-white px-6 py-3 rounded-xl hover:from-[#ff6b5a] hover:to-[#FF7E70] transition-all shadow-md hover:shadow-lg"
          >
            Tillbaka till receptlistan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#F3EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/recipes"
                className="flex items-center gap-2 text-gray-600 hover:text-[#014421] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Tillbaka
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-[#014421] flex items-center gap-2">
                <span className="text-xl">✏️</span> Redigera recept
              </h1>
            </div>
            
            {/* Save Status */}
            {saveStatus && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                saveStatus === 'saved' ? 'bg-[#93C560]/20 text-[#014421]' : 
                saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {saveStatus === 'saved' && <><Check className="w-4 h-4" /> Sparad!</>}
                {saveStatus === 'saving' && <><Loader className="w-4 h-4 animate-spin" /> Sparar...</>}
                {saveStatus === 'error' && <><AlertCircle className="w-4 h-4" /> Fel vid sparning</>}
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {recipe && recipe.status === 'publish' && (
                <Link
                  href={`/kunskapsbank/recept/${recipe.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#014421] hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Visa recept</span>
                </Link>
              )}
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Ta bort</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#93C560] to-[#84b351] text-white rounded-xl hover:from-[#84b351] hover:to-[#93C560] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[#F3EFE3] overflow-hidden">
          <div className="p-6 space-y-8">
            {/* Image Upload Section */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <span className="text-lg">🖼️</span> Receptbild
              </h2>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Receptbild"
                      className="w-full h-64 object-cover rounded-xl border border-[#F3EFE3]"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all"
                      title="Ta bort bild"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Ingen bild uppladdad</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#F3EFE3] hover:bg-[#F7F1E8] text-[#014421] rounded-xl transition-all">
                      {uploadingImage ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Laddar upp...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {imagePreview ? 'Byt bild' : 'Ladda upp bild'}
                        </>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max 5MB. JPG, PNG eller WebP.</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 inline text-accent" /> Grundläggande information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recepttitel
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                    placeholder="Namn på receptet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                    >
                      <option value="Frukost">Frukost</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Middag">Middag</option>
                      <option value="Mellanmål">Mellanmål</option>
                      <option value="Efterrätt">Efterrätt</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                    placeholder="En kort, lockande beskrivning av receptet"
                  />
                </div>
              </div>
            </div>

            {/* Recipe Details */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <span className="text-lg">⚙️</span> Receptdetaljer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Svårighetsgrad
                  </label>
                  <div className="relative">
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                    >
                      <option value="Lätt">Lätt</option>
                      <option value="Medel">Medel</option>
                      <option value="Svår">Svår</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förberedelsetid
                  </label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <span className="text-lg">🧂</span> Ingredienser
              </h2>
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                      placeholder={`Ingrediens ${index + 1}`}
                    />
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIngredient}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#93C560] hover:text-[#93C560] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">➕</span> Lägg till ingrediens
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 inline text-accent" /> Instruktioner
              </h2>
              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#93C560]/20 text-[#014421] rounded-full flex items-center justify-center text-sm font-medium mt-1">
                      {index + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                      placeholder={`Steg ${index + 1}`}
                    />
                    <button
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addInstruction}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#93C560] hover:text-[#93C560] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">➕</span> Lägg till instruktion
                </button>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 inline text-accent" /> Tips från kocken
              </h2>
              <textarea
                value={formData.tips}
                onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
                placeholder="Extra tips för att lyckas med receptet..."
              />
            </div>

            {/* Status and Settings */}
            <div>
              <h2 className="text-lg font-semibold text-[#014421] mb-4 flex items-center gap-2">
                <span className="text-lg">⚙️</span> Inställningar
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value="publish"
                      checked={formData.status === 'publish'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'publish' | 'draft' }))}
                      className="text-[#93C560] focus:ring-[#93C560] rounded transition-all"
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
                      className="text-[#93C560] focus:ring-[#93C560] rounded transition-all"
                    />
                    <span className="text-sm text-gray-700">Utkast</span>
                  </label>
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    className="text-[#93C560] focus:ring-[#93C560] rounded transition-all"
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