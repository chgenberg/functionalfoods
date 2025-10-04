"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle, ArrowLeft, Check, Eye, FileText, Image as ImageIcon, Lightbulb, Loader, Save, Trash2, Upload, X, BookOpen, Edit3, BarChart3 } from "lucide-react";
import ImageUpload from '@/app/components/admin/ImageUpload';

interface Recipe {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  categories: string[];
  ingredients: string[];
  slug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  date: string;
  difficulty?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  instructions?: string;
  nutrition?: {
    perServing?: {
      energy?: number;
      protein?: number;
      carbohydrates?: number;
      fat?: number;
      fiber?: number;
      sugar?: number;
      salt?: number;
    }
  };
  tips?: string;
  tags?: string[];
}

interface EditRecipeForm {
  title: string;
  excerpt: string;
  content: string;
  imageAlt: string;
  category: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  tips: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isPremium: boolean;
  imageUrl: string;
  courseTags: string[]; // Ny: Kurskoppling
  nutrition: {
    energy: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    salt: number;
  };
}

export default function EditRecipePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showNutritionEdit, setShowNutritionEdit] = useState(false);
  
  const [formData, setFormData] = useState<EditRecipeForm>({
    title: '',
    excerpt: '',
    content: '',
    imageAlt: '',
    category: 'Middag',
    difficulty: 'Medel',
    prepTime: '',
    cookTime: '',
    servings: 4,
    ingredients: [],
    instructions: [],
    tips: '',
    tags: [],
    status: 'PUBLISHED',
    isPremium: false,
    imageUrl: '',
    courseTags: [],
    nutrition: {
      energy: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      salt: 0
    }
  });

  // Tillgängliga kurser
  const availableCourses = [
    { id: 'functional-basics', name: 'Functional Basics', color: 'bg-blue-100 text-blue-800' },
    { id: 'functional-flow', name: 'Functional Flow', color: 'bg-green-100 text-green-800' },
    { id: 'functional-energy', name: 'Functional Energy', color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    fetchRecipe();
  }, [params.slug]);

  useEffect(() => {
    if (recipe?.imageUrl) {
      setImagePreview(recipe.imageUrl);
    }
  }, [recipe]);


  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recipes/${params.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const foundRecipe = await response.json();
      setRecipe(foundRecipe);
      
      // Populera formuläret med befintlig data
      setFormData({
        title: foundRecipe.title,
        excerpt: foundRecipe.excerpt || '',
        content: foundRecipe.content || '',
        imageAlt: foundRecipe.imageAlt || '',
        category: foundRecipe.categories?.[0] || 'Middag',
        difficulty: foundRecipe.difficulty || 'Medel',
        prepTime: foundRecipe.prepTime || '',
        cookTime: foundRecipe.cookTime || '',
        servings: foundRecipe.servings || 4,
        ingredients: Array.isArray(foundRecipe.ingredients) ? foundRecipe.ingredients : [],
        instructions: foundRecipe.instructions ? 
          (typeof foundRecipe.instructions === 'string' ? 
            foundRecipe.instructions.split('\n').filter((line: string) => line.trim()) : 
            Array.isArray(foundRecipe.instructions) ? foundRecipe.instructions : []) : [],
        tips: foundRecipe.tips || '',
        tags: Array.isArray(foundRecipe.tags) ? foundRecipe.tags : [],
        status: foundRecipe.status || 'PUBLISHED',
        isPremium: foundRecipe.isPremium || false,
        imageUrl: foundRecipe.imageUrl || '',
        courseTags: foundRecipe.tags?.filter((tag: string) => 
          ['functional-basics', 'functional-flow', 'functional-energy'].includes(tag)
        ) || [],
        nutrition: {
          energy: foundRecipe.nutrition?.perServing?.energy || 0,
          protein: foundRecipe.nutrition?.perServing?.protein || 0,
          carbohydrates: foundRecipe.nutrition?.perServing?.carbohydrates || 0,
          fat: foundRecipe.nutrition?.perServing?.fat || 0,
          fiber: foundRecipe.nutrition?.perServing?.fiber || 0,
          sugar: foundRecipe.nutrition?.perServing?.sugar || 0,
          salt: foundRecipe.nutrition?.perServing?.salt || 0
        }
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
      
      // Kombinera vanliga tags med kurskopplingar
      const allTags = [...new Set([
        ...formData.tags.filter(tag => tag.trim() !== ''),
        ...formData.courseTags
      ])];

      // Skicka uppdateringsdata till API
      const updateData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        imageAlt: formData.imageAlt,
        categories: [formData.category],
        difficulty: formData.difficulty,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.trim() !== '').join('\n'),
        tips: formData.tips,
        tags: allTags,
        status: formData.status,
        isPremium: formData.isPremium,
        imageUrl: formData.imageUrl,
        nutrition: {
          perServing: {
            energy: Number(formData.nutrition.energy),
            protein: Number(formData.nutrition.protein),
            carbohydrates: Number(formData.nutrition.carbohydrates),
            fat: Number(formData.nutrition.fat),
            fiber: Number(formData.nutrition.fiber),
            sugar: Number(formData.nutrition.sugar),
            salt: Number(formData.nutrition.salt)
          }
        }
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
      const response = await fetch(`/api/recipes/${params.slug}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      router.push('/admin/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Fel vid borttagning av recept');
    }
  };


  const toggleCourseTag = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courseTags: prev.courseTags.includes(courseId)
        ? prev.courseTags.filter(id => id !== courseId)
        : [...prev.courseTags, courseId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-[var(--primary-green)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="admin-alert admin-alert-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/recipes" 
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka till recept</span>
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-light text-[var(--primary-green)]">Redigera recept</h1>
          
          <div className="flex items-center gap-4">
            {saveStatus === 'saved' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-[var(--primary-light-green)]"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm">Sparat!</span>
              </motion.div>
            )}
            
            <button
              onClick={handleDelete}
              className="admin-btn admin-btn-danger"
            >
              <Trash2 className="w-4 h-4" />
              Ta bort
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Spara ändringar
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="admin-card">
            <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Grundläggande information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="admin-input"
                  placeholder="Receptets namn"
                />
              </div>

              <div>
                <label className="admin-label">Kort beskrivning (excerpt)</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="admin-textarea"
                  rows={3}
                  placeholder="En kort beskrivning som visas i receptlistor"
                />
              </div>

              <div>
                <label className="admin-label">Detaljerad beskrivning (content)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="admin-textarea"
                  rows={4}
                  placeholder="Längre beskrivning som visas på receptsidan (valfritt)"
                />
              </div>

              <div>
                <label className="admin-label">Bild Alt-text</label>
                <input
                  type="text"
                  value={formData.imageAlt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                  className="admin-input"
                  placeholder="Beskrivning av bilden för tillgänglighet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="Frukost">Frukost</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Middag">Middag</option>
                    <option value="Mellanmål">Mellanmål</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">Svårighetsgrad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="Lätt">Lätt</option>
                    <option value="Medel">Medel</option>
                    <option value="Svår">Svår</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="admin-label">Förberedelse</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="admin-input"
                    placeholder="15 min"
                  />
                </div>

                <div>
                  <label className="admin-label">Tillagningstid</label>
                  <input
                    type="text"
                    value={formData.cookTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    className="admin-input"
                    placeholder="30 min"
                  />
                </div>

                <div>
                  <label className="admin-label">Portioner</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
                    className="admin-input"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kurskoppling */}
          <div className="admin-card">
            <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Kurskoppling
            </h2>
            
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              📚 Välj vilka kurser detta recept ska vara tillgängligt för. Receptet kommer att visas i kostscheman för de valda kurserna.
            </p>

            <div className="space-y-2">
              {availableCourses.map(course => (
                <label 
                  key={course.id}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: formData.courseTags.includes(course.id) ? 'var(--primary-light-green)' : 'var(--border-light)',
                    backgroundColor: formData.courseTags.includes(course.id) ? 'rgba(147, 197, 96, 0.05)' : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.courseTags.includes(course.id)}
                    onChange={() => toggleCourseTag(course.id)}
                    className="w-4 h-4 text-[var(--primary-green)] rounded"
                  />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.color}`}>
                    {course.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Näringsvärden */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[var(--primary-green)] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Näringsvärden
              </h2>
              <button
                onClick={() => setShowNutritionEdit(!showNutritionEdit)}
                className="admin-btn admin-btn-secondary text-sm"
              >
                <Edit3 className="w-4 h-4" />
                {showNutritionEdit ? 'Dölj' : 'Redigera'}
              </button>
            </div>
            
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>Ange näringsvärden <strong>per portion</strong>. Dessa värden visas för användarna på receptsidan.</span>
              </span>
            </p>

            {showNutritionEdit ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Energi (kcal)</label>
                  <input
                    type="number"
                    value={formData.nutrition.energy}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, energy: parseInt(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                  />
                </div>

                <div>
                  <label className="admin-label">Protein (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.protein}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, protein: parseFloat(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="admin-label">Kolhydrater (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.carbohydrates}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, carbohydrates: parseFloat(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="admin-label">Fett (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.fat}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, fat: parseFloat(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="admin-label">Fiber (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.fiber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, fiber: parseFloat(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="admin-label">Socker (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.sugar}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, sugar: parseFloat(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="admin-label">Salt (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.salt}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      nutrition: { ...prev.nutrition, salt: parseFloat(e.target.value) || 0 }
                    }))}
                    className="admin-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[var(--primary-beige)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-[var(--primary-green)]">
                    {formData.nutrition.energy || 0}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Kalorier</div>
                </div>
                <div className="bg-[var(--primary-beige)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-[var(--primary-green)]">
                    {formData.nutrition.protein || 0}g
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Protein</div>
                </div>
                <div className="bg-[var(--primary-beige)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-[var(--primary-green)]">
                    {formData.nutrition.carbohydrates || 0}g
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Kolhydrater</div>
                </div>
                <div className="bg-[var(--primary-beige)] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-[var(--primary-green)]">
                    {formData.nutrition.fat || 0}g
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Fett</div>
                </div>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="admin-card">
            <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Ingredienser</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              🥗 Lista alla ingredienser med mängd. T.ex. "2 dl mjölk", "200 g lax", "1 msk olivolja"
            </p>
            
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => {
                      const newIngredients = [...formData.ingredients];
                      newIngredients[index] = e.target.value;
                      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                    className="admin-input"
                    placeholder="T.ex. 2 dl mjölk"
                  />
                  <button
                    onClick={() => {
                      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                    className="admin-btn admin-btn-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }))}
                className="admin-btn admin-btn-secondary"
              >
                Lägg till ingrediens
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="admin-card">
            <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Instruktioner</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              👨‍🍳 Beskriv varje steg i tillagningen. Var tydlig och detaljerad så att även nybörjare kan följa receptet.
            </p>
            
            <div className="space-y-2">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-sm text-[var(--text-secondary)] pt-3">{index + 1}.</span>
                  <textarea
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...formData.instructions];
                      newInstructions[index] = e.target.value;
                      setFormData(prev => ({ ...prev, instructions: newInstructions }));
                    }}
                    className="admin-textarea"
                    rows={2}
                    placeholder="Beskriv steget..."
                  />
                  <button
                    onClick={() => {
                      const newInstructions = formData.instructions.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...prev, instructions: newInstructions }));
                    }}
                    className="admin-btn admin-btn-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setFormData(prev => ({ ...prev, instructions: [...prev.instructions, ''] }))}
                className="admin-btn admin-btn-secondary"
              >
                Lägg till steg
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Bild</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              📸 Ladda upp en aptitretande bild av den färdiga rätten. Rekommenderad storlek: minst 800x600px
            </p>
            
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, imageUrl: url }));
                setImagePreview(url);
              }}
              label=""
            />
          </div>

          {/* Status */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Publiceringsstatus</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="admin-select"
                >
                  <option value="PUBLISHED">Publicerad</option>
                  <option value="DRAFT">Utkast</option>
                  <option value="ARCHIVED">Arkiverad</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                  className="w-4 h-4 text-[var(--primary-green)] rounded"
                />
                <span className="text-sm text-[var(--text-primary)]">Premium-recept</span>
              </label>
            </div>
          </div>

          {/* Tips */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Tips och råd</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tips visas som en grön informationsruta på receptsidan och hjälper användare med extra råd.
            </p>
            
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
              className="admin-textarea"
              rows={4}
              placeholder="T.ex. 'Låt smetana vara rumstempererad för bästa konsistens' eller 'Kan förvaras i kylskåp i 3 dagar'"
            />
          </div>

          {/* Tags */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Taggar</h3>
            
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
              }))}
              className="admin-input"
              placeholder="vegetarisk, glutenfri, snabb"
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Separera taggar med kommatecken
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
