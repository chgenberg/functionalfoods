'use client';

import { useState, useEffect } from 'react';
import { Calendar, ShoppingCart, ChefHat, Save, Plus, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recipe {
  id: string;
  title: string;
  slug: string;
}

interface MealPlanWeek {
  id?: string;
  course: string;
  weekNumber: number;
  days: Record<string, any>;
}

interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

interface WeekMeta {
  course: string;
  weekNumber: number;
  weekTitle?: string;
  weekSubtitle?: string;
  heroImage?: string;
  videoUrl?: string;
  welcomeMessage?: string;
}

interface KnowledgeDoc {
  id?: string;
  title: string;
  slug: string;
  content: string;
  course: string;
  weekNumber?: number;
  order: number;
}

export default function HormoneManagementPage() {
  const [activeView, setActiveView] = useState<'meals' | 'shopping' | 'weeks' | 'knowledge'>('meals');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [mealPlans, setMealPlans] = useState<MealPlanWeek[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [weekMetas, setWeekMetas] = useState<WeekMeta[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ day: string; mealType: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const mealTypes = [
    { key: 'breakfast', label: 'Frukost', emoji: '🌅' },
    { key: 'lunch', label: 'Lunch', emoji: '🍽️' },
    { key: 'dinner', label: 'Middag', emoji: '🌙' },
    { key: 'snack', label: 'Mellanmål', emoji: '🍎' },
    { key: 'dessert', label: 'Efterrätt', emoji: '🍰' }
  ];

  useEffect(() => {
    if (activeView === 'meals') {
      fetchMealPlans();
      fetchRecipes();
    } else if (activeView === 'shopping') {
      fetchShoppingList();
    } else if (activeView === 'weeks') {
      fetchWeekMetas();
    } else if (activeView === 'knowledge') {
      fetchKnowledgeDocs();
    }
  }, [activeView, selectedWeek]);

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/meal-plans?course=hormone');
      const data = await res.json();
      setMealPlans(data.weeks || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/admin/courses/hormonell-balans/recipes');
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchShoppingList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shopping-lists/hormone/${selectedWeek}`);
      const data = await res.json();
      setShoppingList(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async () => {
    const currentPlan = mealPlans.find(mp => mp.weekNumber === selectedWeek);
    if (!currentPlan) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/meal-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentPlan.id,
          course: 'hormone',
          weekNumber: selectedWeek,
          days: currentPlan.days
        })
      });
      if (res.ok) {
        alert('✅ Kostschema sparat!');
      }
    } finally {
      setSaving(false);
    }
  };

  const saveShoppingList = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/shopping-lists/hormone/${selectedWeek}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: shoppingList })
      });
      if (res.ok) {
        alert('✅ Inköpslista sparad!');
      }
    } finally {
      setSaving(false);
    }
  };

  const updateMeal = (day: string, mealType: string, recipe: Recipe | null) => {
    const updatedPlans = mealPlans.map(mp => {
      if (mp.weekNumber !== selectedWeek) return mp;
      
      const updatedDays = { ...mp.days };
      if (!updatedDays[day]) updatedDays[day] = {};
      
      updatedDays[day] = {
        ...updatedDays[day],
        [mealType]: recipe ? {
          name: recipe.title,
          recipeLink: `/kunskapsbank/recept/${recipe.slug}`
        } : null
      };
      
      return { ...mp, days: updatedDays };
    });
    
    setMealPlans(updatedPlans);
    setEditingMeal(null);
    setSearchTerm('');
  };

  const addShoppingItem = () => {
    setShoppingList([...shoppingList, { name: 'Ny ingrediens', amount: '1', unit: 'st', category: 'Övrigt' }]);
  };

  const updateShoppingItem = (index: number, field: keyof ShoppingListItem, value: string) => {
    const updated = [...shoppingList];
    updated[index] = { ...updated[index], [field]: value };
    setShoppingList(updated);
  };

  const deleteShoppingItem = (index: number) => {
    setShoppingList(shoppingList.filter((_, i) => i !== index));
  };

  const fetchWeekMetas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/course-weeks?course=hormone');
      const data = await res.json();
      setWeekMetas(data.weeks || []);
    } finally {
      setLoading(false);
    }
  };

  const saveWeekMeta = async (meta: WeekMeta) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/course-weeks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      });
      if (res.ok) {
        alert('✅ Veckoinställningar sparade!');
        fetchWeekMetas();
      }
    } finally {
      setSaving(false);
    }
  };

  const updateWeekMeta = (weekNumber: number, field: keyof WeekMeta, value: string) => {
    setWeekMetas(prev => {
      const existing = prev.find(w => w.weekNumber === weekNumber);
      if (existing) {
        return prev.map(w => w.weekNumber === weekNumber ? { ...w, [field]: value } : w);
      } else {
        return [...prev, { course: 'hormone', weekNumber, [field]: value } as WeekMeta];
      }
    });
  };

  const fetchKnowledgeDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge?course=hormone');
      const data = await res.json();
      setKnowledgeDocs(data.documents || []);
    } finally {
      setLoading(false);
    }
  };

  const saveKnowledgeDoc = async () => {
    if (!editingDoc) return;
    setSaving(true);
    try {
      const method = editingDoc.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/knowledge', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingDoc, courses: ['hormone'] })
      });
      if (res.ok) {
        alert('✅ Kunskapsdokument sparat!');
        setEditingDoc(null);
        fetchKnowledgeDocs();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteKnowledgeDoc = async (id: string) => {
    if (!confirm('Ta bort detta dokument?')) return;
    try {
      await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' });
      fetchKnowledgeDocs();
    } catch (e) {
      alert('Fel vid borttagning');
    }
  };

  const currentPlan = mealPlans.find(mp => mp.weekNumber === selectedWeek);
  const filteredRecipes = recipes.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[var(--primary-beige)]/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[var(--primary-green)] mb-3">
            💚 Hormonell Balans
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Hantera allt kursinnehåll enkelt på ett ställe
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveView('meals')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'meals'
                ? 'bg-[var(--primary-green)] text-white shadow-lg'
                : 'bg-white text-[var(--text-secondary)] hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Kostscheman
          </button>
          <button
            onClick={() => setActiveView('shopping')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'shopping'
                ? 'bg-[var(--primary-green)] text-white shadow-lg'
                : 'bg-white text-[var(--text-secondary)] hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Inköpslistor
          </button>
          <button
            onClick={() => setActiveView('weeks')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'weeks'
                ? 'bg-[var(--primary-green)] text-white shadow-lg'
                : 'bg-white text-[var(--text-secondary)] hover:bg-gray-50'
            }`}
          >
            <Edit2 className="w-5 h-5" />
            Veckoinställningar
          </button>
          <button
            onClick={() => setActiveView('knowledge')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'knowledge'
                ? 'bg-[var(--primary-green)] text-white shadow-lg'
                : 'bg-white text-[var(--text-secondary)] hover:bg-gray-50'
            }`}
          >
            <ChefHat className="w-5 h-5" />
            Kunskapsdokument
          </button>
        </div>

        {/* Week Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map(week => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedWeek === week
                  ? 'bg-gradient-to-r from-[var(--primary-green)] to-[var(--primary-light-green)] text-white shadow-lg scale-105'
                  : 'bg-white text-[var(--text-secondary)] hover:shadow-md'
              }`}
            >
              Vecka {week}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 min-h-[600px]">
          {activeView === 'meals' && currentPlan && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-[var(--primary-green)]">
                  Kostschema Vecka {selectedWeek}
                </h2>
                <button
                  onClick={saveMealPlan}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-green)] text-white rounded-xl hover:bg-[var(--primary-green)]/90 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Sparar...' : 'Spara ändringar'}
                </button>
              </div>

              <div className="space-y-4">
                {days.map(day => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-[var(--border-light)] rounded-xl p-5 hover:border-[var(--primary-light-green)] transition-all"
                  >
                    <h3 className="text-lg font-semibold text-[var(--primary-green)] mb-4">{day}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {mealTypes.map(({ key, label, emoji }) => {
                        const meal = currentPlan.days[day]?.[key];
                        const isEditing = editingMeal?.day === day && editingMeal?.mealType === key;

                        return (
                          <div key={key} className="relative">
                            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                              <span>{emoji}</span>
                              <span>{label}</span>
                            </div>
                            
                            {meal?.name && !isEditing ? (
                              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 group hover:border-green-400 transition-all">
                                <p className="text-sm font-medium text-green-900 mb-2 line-clamp-2">
                                  {meal.name}
                                </p>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingMeal({ day, mealType: key })}
                                    className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                  >
                                    <Edit2 className="w-3 h-3 mx-auto" />
                                  </button>
                                  <button
                                    onClick={() => updateMeal(day, key, null)}
                                    className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                  >
                                    <Trash2 className="w-3 h-3 mx-auto" />
                                  </button>
                                </div>
                              </div>
                            ) : isEditing ? (
                              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                                <input
                                  type="text"
                                  placeholder="Sök recept..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border rounded mb-2"
                                  autoFocus
                                />
                                <div className="max-h-40 overflow-y-auto space-y-1 mb-2">
                                  {filteredRecipes.slice(0, 5).map(recipe => (
                                    <button
                                      key={recipe.id}
                                      onClick={() => updateMeal(day, key, recipe)}
                                      className="w-full text-left px-2 py-1 text-xs bg-white hover:bg-blue-100 rounded"
                                    >
                                      {recipe.title}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => setEditingMeal(null)}
                                  className="w-full bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400"
                                >
                                  Avbryt
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingMeal({ day, mealType: key })}
                                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[var(--primary-light-green)] hover:bg-green-50 transition-all"
                              >
                                <Plus className="w-5 h-5 mx-auto text-gray-400" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'shopping' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-[var(--primary-green)]">
                  Inköpslista Vecka {selectedWeek}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={addShoppingItem}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                    Lägg till
                  </button>
                  <button
                    onClick={saveShoppingList}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-green)] text-white rounded-xl hover:bg-[var(--primary-green)]/90 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Sparar...' : 'Spara'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {shoppingList.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateShoppingItem(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Ingrediens"
                    />
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => updateShoppingItem(idx, 'amount', e.target.value)}
                      className="w-20 px-3 py-2 border rounded-lg"
                      placeholder="Mängd"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateShoppingItem(idx, 'unit', e.target.value)}
                      className="w-16 px-3 py-2 border rounded-lg"
                      placeholder="Enhet"
                    />
                    <button
                      onClick={() => deleteShoppingItem(idx)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'weeks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-[var(--primary-green)]">
                  Veckoinställningar
                </h2>
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(weekNum => {
                  const meta = weekMetas.find(w => w.weekNumber === weekNum) || { course: 'hormone', weekNumber: weekNum } as WeekMeta;
                  return (
                    <div key={weekNum} className="border-2 border-[var(--border-light)] rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-[var(--primary-green)] mb-4">Vecka {weekNum}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Veckotitel</label>
                          <input
                            type="text"
                            value={meta.weekTitle || ''}
                            onChange={(e) => updateWeekMeta(weekNum, 'weekTitle', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Vecka 1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Undertitel</label>
                          <input
                            type="text"
                            value={meta.weekSubtitle || ''}
                            onChange={(e) => updateWeekMeta(weekNum, 'weekSubtitle', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Introduktion till hormonell balans"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hero-bild URL</label>
                          <input
                            type="text"
                            value={meta.heroImage || ''}
                            onChange={(e) => updateWeekMeta(weekNum, 'heroImage', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="/images/hero.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                          <input
                            type="text"
                            value={meta.videoUrl || ''}
                            onChange={(e) => updateWeekMeta(weekNum, 'videoUrl', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Välkomstmeddelande</label>
                          <textarea
                            value={meta.welcomeMessage || ''}
                            onChange={(e) => updateWeekMeta(weekNum, 'welcomeMessage', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                            placeholder="Välkommen till vecka..."
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => saveWeekMeta(meta)}
                        disabled={saving}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green)]/90 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sparar...' : 'Spara vecka ' + weekNum}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === 'knowledge' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-[var(--primary-green)]">
                  Kunskapsdokument ({knowledgeDocs.length})
                </h2>
                <button
                  onClick={() => setEditingDoc({ title: '', slug: '', content: '', course: 'hormone', order: knowledgeDocs.length })}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-green)] text-white rounded-xl hover:bg-[var(--primary-green)]/90"
                >
                  <Plus className="w-4 h-4" />
                  Nytt dokument
                </button>
              </div>

              {editingDoc ? (
                <div className="border-2 border-[var(--primary-green)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">{editingDoc.id ? 'Redigera' : 'Skapa nytt'} dokument</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titel</label>
                        <input
                          type="text"
                          value={editingDoc.title}
                          onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Slug (URL-vänlig)</label>
                        <input
                          type="text"
                          value={editingDoc.slug}
                          onChange={(e) => setEditingDoc({ ...editingDoc, slug: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="min-artikel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Vecka (valfritt)</label>
                        <input
                          type="number"
                          value={editingDoc.weekNumber || ''}
                          onChange={(e) => setEditingDoc({ ...editingDoc, weekNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="1-6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Ordning</label>
                        <input
                          type="number"
                          value={editingDoc.order}
                          onChange={(e) => setEditingDoc({ ...editingDoc, order: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Innehåll (Markdown)</label>
                      <textarea
                        value={editingDoc.content}
                        onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                        rows={12}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveKnowledgeDoc}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green)]/90 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sparar...' : 'Spara'}
                      </button>
                      <button
                        onClick={() => setEditingDoc(null)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {knowledgeDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border-2 border-[var(--border-light)] rounded-xl hover:border-[var(--primary-light-green)]">
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{doc.title}</h3>
                        <p className="text-sm text-gray-600">
                          {doc.weekNumber ? `Vecka ${doc.weekNumber}` : 'Allmän'} • Ordning: {doc.order}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingDoc(doc)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => doc.id && deleteKnowledgeDoc(doc.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

