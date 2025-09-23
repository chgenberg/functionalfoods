"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Save, X, Plus, Check, Clock, Users, Star, Eye } from 'lucide-react';
import ImageUpload from '@/app/components/admin/ImageUpload';
import CategorySelector from '@/app/components/admin/CategorySelector';

interface RecipeData {
  title: string;
  description: string;
  excerpt: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: string;
  cookTime: string;
  servings: number;
  image: string;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
  nutritionInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  tips: string;
  tags: string[];
  functionalBenefits: string[];
  courseTags: string[];
}

const steps = [
  { id: 1, title: 'Grundinfo', description: 'Titel, beskrivning och kategori' },
  { id: 2, title: 'Tid & Portioner', description: 'Tid, svårighetsgrad och portioner' },
  { id: 3, title: 'Ingredienser', description: 'Lägg till alla ingredienser' },
  { id: 4, title: 'Instruktioner', description: 'Steg-för-steg tillagning' },
  { id: 5, title: 'Näring & Tips', description: 'Näringsvärden och tips' },
  { id: 6, title: 'Granska', description: 'Kontrollera och publicera' }
];


const units = [
  '',
  'st',
  'dl',
  'l',
  'ml',
  'g',
  'kg',
  'msk',
  'tsk',
  'krm',
  'klyfta',
  'burk',
  'påse'
];

export default function NewRecipePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [recipeData, setRecipeData] = useState<RecipeData>({
    title: '',
    description: '',
    excerpt: '',
    category: '',
    difficulty: 'easy',
    prepTime: '',
    cookTime: '',
    servings: 4,
    image: '',
    ingredients: [],
    instructions: [],
    nutritionInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    },
    tips: '',
    tags: [],
    functionalBenefits: [],
    courseTags: []
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateRecipeData = (field: keyof RecipeData, value: any) => {
    setRecipeData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setRecipeData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipeData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    setRecipeData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setRecipeData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setRecipeData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addFunctionalBenefit = () => {
    setRecipeData(prev => ({
      ...prev,
      functionalBenefits: [...prev.functionalBenefits, '']
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Format ingredients for the database
      const formattedIngredients = recipeData.ingredients.map(ing => {
        if (!ing.amount && !ing.unit) {
          return ing.name;
        }
        return `${ing.amount} ${ing.unit} ${ing.name}`.trim();
      });

      // Create the recipe object
      const recipePayload = {
        title: recipeData.title,
        description: recipeData.description,
        excerpt: recipeData.excerpt,
        category: recipeData.category,
        difficulty: recipeData.difficulty,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        image: recipeData.image || '/images/recipe-placeholder.svg',
        ingredients: formattedIngredients,
        instructions: recipeData.instructions,
        nutritionInfo: recipeData.nutritionInfo,
        tips: recipeData.tips,
        tags: [...recipeData.tags.filter(tag => tag.trim() !== ''), ...recipeData.courseTags],
        functionalBenefits: recipeData.functionalBenefits.filter(benefit => benefit.trim() !== ''),
        published: true
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      const savedRecipe = await response.json();
      
      // Show success message or redirect
      router.push('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Ett fel uppstod när receptet skulle sparas. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recepttitel *
              </label>
              <input
                type="text"
                value={recipeData.title}
                onChange={(e) => updateRecipeData('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="t.ex. Lax med fetaost och spenat"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kort beskrivning *
              </label>
              <textarea
                value={recipeData.excerpt}
                onChange={(e) => updateRecipeData('excerpt', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                placeholder="En kort beskrivning som visas i receptöversikten..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detaljerad beskrivning *
              </label>
              <textarea
                value={recipeData.description}
                onChange={(e) => updateRecipeData('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                placeholder="Detaljerad beskrivning av receptet, dess ursprung, functional food-fördelar..."
              />
            </div>

            <CategorySelector
              value={recipeData.category}
              onChange={(value) => updateRecipeData('category', value)}
            />

            <ImageUpload
              value={recipeData.image}
              onChange={(url) => updateRecipeData('image', url)}
              label="Receptbild"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurskoppling
              </label>
              <div className="space-y-2">
                {[
                  { id: 'functional-basics', name: 'Functional Basics' },
                  { id: 'functional-flow', name: 'Functional Flow' },
                  { id: 'functional-energy', name: 'Functional Energy' }
                ].map(course => (
                  <label key={course.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recipeData.courseTags.includes(course.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateRecipeData('courseTags', [...recipeData.courseTags, course.id]);
                        } else {
                          updateRecipeData('courseTags', recipeData.courseTags.filter(tag => tag !== course.id));
                        }
                      }}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{course.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Förberedelsetid *
                </label>
                <input
                  type="text"
                  value={recipeData.prepTime}
                  onChange={(e) => updateRecipeData('prepTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="t.ex. 15 min"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tillagningstid *
                </label>
                <input
                  type="text"
                  value={recipeData.cookTime}
                  onChange={(e) => updateRecipeData('cookTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  placeholder="t.ex. 25 min"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antal portioner *
                </label>
                <input
                  type="number"
                  value={recipeData.servings}
                  onChange={(e) => updateRecipeData('servings', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Svårighetsgrad *
                </label>
                <div className="relative">
                  <select
                    value={recipeData.difficulty}
                    onChange={(e) => updateRecipeData('difficulty', e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                  >
                    <option value="easy">Lätt</option>
                    <option value="medium">Medel</option>
                    <option value="hard">Svår</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-800 mb-2">Tidsuppgifter</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Prep: {recipeData.prepTime || '0 min'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Cook: {recipeData.cookTime || '0 min'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span>{recipeData.servings} portioner</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-medium text-gray-900">Ingredienser</h3>
              <button
                onClick={addIngredient}
                className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Lägg till ingrediens
              </button>
            </div>

            {recipeData.ingredients.map((ingredient, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingrediens
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="t.ex. Laxfilé"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mängd <span className="text-gray-400 text-xs">(valfritt)</span>
                    </label>
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="400 eller lämna tomt"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enhet <span className="text-gray-400 text-xs">(valfritt)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer"
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {recipeData.ingredients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Inga ingredienser tillagda än.</p>
                <p className="text-sm">Klicka på "Lägg till ingrediens" för att börja.</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-medium text-gray-900">Tillagningsinstruktioner</h3>
              <button
                onClick={addInstruction}
                className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Lägg till steg
              </button>
            </div>

            {recipeData.instructions.map((instruction, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Beskriv detta steg i tillagningen..."
                    />
                  </div>
                  <button
                    onClick={() => removeInstruction(index)}
                    className="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {recipeData.instructions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Inga instruktioner tillagda än.</p>
                <p className="text-sm">Klicka på "Lägg till steg" för att börja.</p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Näringsvärden (per portion)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kalorier
                  </label>
                  <input
                    type="text"
                    value={recipeData.nutritionInfo.calories}
                    onChange={(e) => updateRecipeData('nutritionInfo', { ...recipeData.nutritionInfo, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="g"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tips & Variationer
              </label>
              <textarea
                value={recipeData.tips}
                onChange={(e) => updateRecipeData('tips', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Användbara tips, variationer eller förslag för att anpassa receptet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taggar
              </label>
              <div className="space-y-3">
                {recipeData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="t.ex. Glutenfri, Vegansk, Proteinrik"
                    />
                    <button
                      onClick={() => removeTag(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTag}
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till tagg
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Functional Food-fördelar
              </label>
              <div className="space-y-3">
                {recipeData.functionalBenefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => {
                        const newBenefits = [...recipeData.functionalBenefits];
                        newBenefits[index] = e.target.value;
                        updateRecipeData('functionalBenefits', newBenefits);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="t.ex. Hög halt av omega-3 från lax"
                    />
                    <button
                      onClick={() => {
                        const newBenefits = recipeData.functionalBenefits.filter((_, i) => i !== index);
                        updateRecipeData('functionalBenefits', newBenefits);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFunctionalBenefit}
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till functional food-fördel
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Receptöversikt</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div><strong>Titel:</strong> {recipeData.title}</div>
                  <div><strong>Kategori:</strong> {recipeData.category}</div>
                  <div><strong>Svårighetsgrad:</strong> {recipeData.difficulty}</div>
                  <div><strong>Portioner:</strong> {recipeData.servings}</div>
                </div>
                <div className="space-y-3">
                  <div><strong>Förberedelsetid:</strong> {recipeData.prepTime}</div>
                  <div><strong>Tillagningstid:</strong> {recipeData.cookTime}</div>
                  <div><strong>Ingredienser:</strong> {recipeData.ingredients.length} st</div>
                  <div><strong>Instruktioner:</strong> {recipeData.instructions.length} steg</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <Check className="w-5 h-5" />
                <span className="font-medium">Redo att publicera</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Receptet kommer att vara synligt för användare direkt efter publicering.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  // Format data for preview
                  const previewData = {
                    title: recipeData.title,
                    excerpt: recipeData.excerpt,
                    content: recipeData.description,
                    imageUrl: recipeData.image,
                    category: recipeData.category,
                    ingredients: recipeData.ingredients.map(ing => {
                      if (!ing.amount && !ing.unit) return ing.name;
                      return `${ing.amount} ${ing.unit} ${ing.name}`.trim();
                    }),
                    instructions: recipeData.instructions.join('\n'),
                    difficulty: recipeData.difficulty,
                    prepTime: recipeData.prepTime,
                    cookTime: recipeData.cookTime,
                    servings: recipeData.servings,
                    nutrition: {
                      perServing: {
                        energy: parseInt(recipeData.nutritionInfo.calories) || 0,
                        protein: parseInt(recipeData.nutritionInfo.protein) || 0,
                        carbohydrates: parseInt(recipeData.nutritionInfo.carbs) || 0,
                        fat: parseInt(recipeData.nutritionInfo.fat) || 0,
                        fiber: parseInt(recipeData.nutritionInfo.fiber) || 0
                      }
                    },
                    tips: recipeData.tips,
                    tags: [...recipeData.tags, ...recipeData.courseTags]
                  };
                  
                  // Store in sessionStorage for preview
                  sessionStorage.setItem('recipePreview', JSON.stringify(previewData));
                  
                  // Generate preview URL
                  const previewSlug = recipeData.title.toLowerCase()
                    .replace(/[åä]/g, 'a')
                    .replace(/ö/g, 'o')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  
                  window.open(`/kunskapsbank/recept/${previewSlug}?preview=true`, '_blank');
                }}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Förhandsgranska
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/recipes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft />
            Tillbaka till receptlistan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Skapa nytt recept</h1>
          <p className="text-gray-600 mt-2">Följ stegen för att publicera ett nytt recept</p>
        </div>

        {/* Progress Steps - Improved layout */}
        <div className="mb-8">
          <div className="grid grid-cols-6 gap-2 overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center relative">
                {/* Connecting line before circle (except first) */}
                {index > 0 && (
                  <div className="absolute top-5 sm:top-6 -left-1/2 w-full">
                    <div
                      className={`h-1 transition-all ${
                        currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: currentStep >= step.id ? 1 : 0.8 }}
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all mb-2 relative z-10 ${
                    currentStep >= step.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="text-sm sm:text-base font-medium">{step.id}</span>
                  )}
                </motion.div>
                
                {/* Step text under the circle */}
                <div className={`text-center ${
                  currentStep >= step.id ? 'text-orange-600 font-medium' : 'text-gray-500'
                }`}>
                  <div className="text-xs font-medium leading-tight">{step.title}</div>
                  <div className="text-xs mt-1 leading-tight hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons - Improved */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
            }`}
          >
            <ArrowLeft />
            Föregående
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Nästa steg
              <ArrowRight />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save />
                  Publicera recept
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 