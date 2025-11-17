"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Clock, Users } from 'lucide-react';
import ImageUpload from '@/app/components/admin/ImageUpload';

interface RecipeData {
  title: string;
  description: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  image: string;
  ingredients: string;
  instructions: string;
  nutritionInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
}

const categories = [
  '',
  'Frukost',
  'Lunch', 
  'Middag',
  'Mellanmål',
  'Efterrätt',
  'Dryck',
  'Sallad',
  'Soppa'
];

export default function NewRecipePage() {
  const [recipeData, setRecipeData] = useState<RecipeData>({
    title: '',
    description: '',
    category: '',
    prepTime: '',
    cookTime: '',
    servings: 4,
    image: '',
    ingredients: '',
    instructions: '',
    nutritionInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateRecipeData = (field: keyof RecipeData, value: any) => {
    setRecipeData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!recipeData.title || !recipeData.description) {
      alert('Titel och beskrivning är obligatoriska fält');
      return;
    }

    setSaving(true);
    try {
      // Format ingredients into array
      const ingredientsArray = recipeData.ingredients
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Format instructions into array  
      const instructionsArray = recipeData.instructions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Create the recipe object
      const recipePayload = {
        title: recipeData.title,
        description: recipeData.description,
        category: recipeData.category,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        imageUrl: recipeData.image || null,
        ingredients: ingredientsArray,
        instructions: instructionsArray.join('\n'),
        nutrition: {
          perServing: {
            energy: recipeData.nutritionInfo.calories ? parseInt(recipeData.nutritionInfo.calories) : null,
            protein: recipeData.nutritionInfo.protein ? parseFloat(recipeData.nutritionInfo.protein) : null,
            carbohydrates: recipeData.nutritionInfo.carbs ? parseFloat(recipeData.nutritionInfo.carbs) : null,
            fat: recipeData.nutritionInfo.fat ? parseFloat(recipeData.nutritionInfo.fat) : null,
            fiber: recipeData.nutritionInfo.fiber ? parseFloat(recipeData.nutritionInfo.fiber) : null
          }
        },
        status: 'PUBLISHED'
      };

      const response = await fetch('/api/admin/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save recipe');
      }

      const savedRecipe = await response.json();
      router.push('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(`Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/recipes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till receptlistan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Skapa nytt recept</h1>
          <p className="text-gray-600 mt-2">Fyll i receptets grundläggande information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="space-y-8">
            {/* Grundläggande information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Grundläggande information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recepttitel *
                </label>
                <input
                  type="text"
                  value={recipeData.title}
                  onChange={(e) => updateRecipeData('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                  placeholder="t.ex. Lax med fetaost och spenat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning *
                </label>
                <textarea
                  value={recipeData.description}
                  onChange={(e) => updateRecipeData('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all resize-none"
                  placeholder="Beskriv receptet och dess functional food-fördelar..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={recipeData.category}
                    onChange={(e) => updateRecipeData('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat || 'Välj kategori'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antal portioner
                  </label>
                  <input
                    type="number"
                    value={recipeData.servings}
                    onChange={(e) => updateRecipeData('servings', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Förberedelsetid
                  </label>
                  <input
                    type="text"
                    value={recipeData.prepTime}
                    onChange={(e) => updateRecipeData('prepTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="t.ex. 15 min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tillagningstid
                  </label>
                  <input
                    type="text"
                    value={recipeData.cookTime}
                    onChange={(e) => updateRecipeData('cookTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="t.ex. 25 min"
                  />
                </div>
              </div>

              <ImageUpload
                value={recipeData.image}
                onChange={(url) => updateRecipeData('image', url)}
                label="Receptbild"
              />
            </div>

            {/* Ingredienser */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Ingredienser</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredienser (en per rad)
                </label>
                <textarea
                  value={recipeData.ingredients}
                  onChange={(e) => updateRecipeData('ingredients', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all resize-none font-mono text-sm"
                  placeholder={`400 g laxfilé
200 g fetaost
100 g spenat
2 msk olivolja
1 tsk salt
1/2 tsk svartpeppar`}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Skriv varje ingrediens på en ny rad. Inkludera mängd och enhet om möjligt.
                </p>
              </div>
            </div>

            {/* Instruktioner */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Instruktioner</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tillagningsinstruktioner
                </label>
                <textarea
                  value={recipeData.instructions}
                  onChange={(e) => updateRecipeData('instructions', e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all resize-none"
                  placeholder={`1. Förvärm ugnen till 200°C.
2. Rensa och skölj laxfilén.
3. Smörj in laxen med olivolja och krydda med salt och peppar.
4. Lägg laxen i en ugnsform och baka i 15-20 minuter.
5. Servera med spenat och fetaost.`}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Skriv steg-för-steg instruktioner. Numrera gärna stegen.
                </p>
              </div>
            </div>

            {/* Näringsvärden */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Näringsvärden (per portion)</h2>
              
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kalorier
                  </label>
                  <input
                    type="text"
                    value={recipeData.nutritionInfo.calories}
                    onChange={(e) => updateRecipeData('nutritionInfo', { ...recipeData.nutritionInfo, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="kcal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protein
                  </label>
                  <input
                    type="text"
                    value={recipeData.nutritionInfo.protein}
                    onChange={(e) => updateRecipeData('nutritionInfo', { ...recipeData.nutritionInfo, protein: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kolhydrater
                  </label>
                  <input
                    type="text"
                    value={recipeData.nutritionInfo.carbs}
                    onChange={(e) => updateRecipeData('nutritionInfo', { ...recipeData.nutritionInfo, carbs: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fett
                  </label>
                  <input
                    type="text"
                    value={recipeData.nutritionInfo.fat}
                    onChange={(e) => updateRecipeData('nutritionInfo', { ...recipeData.nutritionInfo, fat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="g"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiber
                  </label>
                  <input
                    type="text"
                    value={recipeData.nutritionInfo.fiber}
                    onChange={(e) => updateRecipeData('nutritionInfo', { ...recipeData.nutritionInfo, fiber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all"
                    placeholder="g"
                  />
                </div>
              </div>
            </div>

            {/* Sammanfattning */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Receptöversikt</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <div><strong>Titel:</strong> {recipeData.title || 'Inte ifylld'}</div>
                  <div><strong>Kategori:</strong> {recipeData.category || 'Inte vald'}</div>
                  <div><strong>Portioner:</strong> {recipeData.servings}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Förberedelsetid:</strong> {recipeData.prepTime || 'Inte ifylld'}</div>
                  <div><strong>Tillagningstid:</strong> {recipeData.cookTime || 'Inte ifylld'}</div>
                  <div><strong>Har bild:</strong> {recipeData.image ? 'Ja' : 'Nej'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#014421] text-white rounded-lg font-medium hover:bg-[#1a5f3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Skapa recept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}