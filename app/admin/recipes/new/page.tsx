"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiSave, FiX, FiPlus, FiCheck, FiClock, FiUsers, FiStar } from 'react-icons/fi';
import Link from 'next/link';

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
}

const steps = [
  { id: 1, title: 'Grundläggande info', description: 'Titel, beskrivning och kategori' },
  { id: 2, title: 'Tidsuppgifter', description: 'Tid, svårighetsgrad och portioner' },
  { id: 3, title: 'Ingredienser', description: 'Lägg till alla ingredienser' },
  { id: 4, title: 'Instruktioner', description: 'Steg-för-steg tillagning' },
  { id: 5, title: 'Näring & Tips', description: 'Näringsvärden och tips' },
  { id: 6, title: 'Granska & Spara', description: 'Kontrollera och publicera' }
];

const categories = [
  'Frukost',
  'Lunch', 
  'Middag',
  'Mellanmål',
  'Efterrätt',
  'Drycker',
  'Smoothies',
  'Sallader',
  'Soppa'
];

const units = [
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
    functionalBenefits: []
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateRecipeData = (field: keyof RecipeData, value: any) => {
    setRecipeData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setRecipeData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: 'st' }]
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
      // Här skulle vi skicka data till API
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/admin/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Detaljerad beskrivning av receptet, dess ursprung, functional food-fördelar..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={recipeData.category}
                onChange={(e) => updateRecipeData('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Välj kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receptbild URL
              </label>
              <input
                type="url"
                value={recipeData.image}
                onChange={(e) => updateRecipeData('image', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/recipe-image.jpg"
              />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Svårighetsgrad *
                </label>
                <select
                  value={recipeData.difficulty}
                  onChange={(e) => updateRecipeData('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="easy">Lätt</option>
                  <option value="medium">Medel</option>
                  <option value="hard">Svår</option>
                </select>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-800 mb-2">Tidsuppgifter</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-orange-600" />
                  <span>Prep: {recipeData.prepTime || '0 min'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-orange-600" />
                  <span>Cook: {recipeData.cookTime || '0 min'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-orange-600" />
                  <span>{recipeData.servings} portioner</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Ingredienser</h3>
              <button
                onClick={addIngredient}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Lägg till ingrediens
              </button>
            </div>

            {recipeData.ingredients.map((ingredient, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingrediens
                    </label>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="t.ex. Laxfilé"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mängd
                    </label>
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enhet
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4" />
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Tillagningsinstruktioner</h3>
              <button
                onClick={addInstruction}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Lägg till steg
              </button>
            </div>

            {recipeData.instructions.map((instruction, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
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
                    <FiX className="w-4 h-4" />
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
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTag}
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
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
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFunctionalBenefit}
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
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
                <FiCheck className="w-5 h-5" />
                <span className="font-medium">Redo att publicera</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Receptet kommer att vara synligt för användare direkt efter publicering.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/recipes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Tillbaka till recept
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Skapa nytt recept</h1>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep 
                      ? 'bg-orange-600 text-white' 
                      : step.id < currentStep 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? <FiCheck className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiArrowLeft className="w-4 h-4" />
            Föregående
          </button>

          {currentStep === steps.length ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sparar...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Publicera recept
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Nästa
              <FiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 