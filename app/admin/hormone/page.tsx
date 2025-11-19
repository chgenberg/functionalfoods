'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../admin-ulrika-design.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function HormonePage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'overview' | 'meals' | 'shopping' | 'weeks' | 'knowledge' | 'settings'>('overview');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<any>(null);
  const [weekMetas, setWeekMetas] = useState<any[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Course settings state
  const [courseSettings, setCourseSettings] = useState({
    name: 'Hormonell Balans',
    welcomeText: '',
    overviewVideoUrl: 'https://player.vimeo.com/video/1058943393',
    description: ''
  });

  // Fetcha all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load course settings
      const settingsRes = await fetch('/api/admin/hormone/course-settings', { credentials: 'include' });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCourseSettings(settingsData);
      }

      const [recipesRes, mealsRes, weekMetasRes, knowledgeRes] = await Promise.all([
        fetch('/api/recipes/search?tags=hormonell-balans', { credentials: 'include' }),
        fetch('/api/admin/meal-plans?course=hormone', { credentials: 'include' }),
        fetch('/api/admin/course-weeks?course=hormone', { credentials: 'include' }),
        fetch('/api/admin/knowledge/course-documents?course=hormone', { credentials: 'include' })
      ]);

      if (recipesRes.ok) {
        const recipesData = await recipesRes.json();
        setRecipes(recipesData.recipes || []);
      }

      if (mealsRes.ok) {
        const mealsData = await mealsRes.json();
        setMealPlans(mealsData.weeks || []);
      }

      if (weekMetasRes.ok) {
        const weekMetasData = await weekMetasRes.json();
        setWeekMetas(weekMetasData.weeks || []);
      }

      if (knowledgeRes.ok) {
        const knowledgeData = await knowledgeRes.json();
        setKnowledgeDocs(knowledgeData.documents || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('error', 'Kunde inte ladda data');
    } finally {
      setIsLoading(false);
    }
  };

  // Ladda shopping list för vald vecka
  useEffect(() => {
    if (activeView === 'shopping' && selectedWeek) {
      loadShoppingList(selectedWeek);
    }
  }, [selectedWeek, activeView]);

  const loadShoppingList = async (week: number) => {
    try {
      const res = await fetch(`/api/admin/shopping-lists?course=hormone&week=${week}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setShoppingList(data.lists?.[0] || null);
      }
    } catch (error) {
      console.error('Failed to load shopping list:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Spara kostschema
  const saveMealPlan = async (weekNumber: number, days: any) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/meal-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          course: 'hormone',
          weekNumber,
          days
        })
      });

      if (res.ok) {
        showNotification('success', `Vecka ${weekNumber} sparad`);
        await loadData();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showNotification('error', 'Kunde inte spara kostschema');
    } finally {
      setIsSaving(false);
    }
  };

  const stripResterSuffix = (value?: string) => {
    if (!value) return '';
    return value.replace(/\s*\(rester(?:\s+från\s+frysen)?\)\s*$/i, '').trim();
  };

  // Uppdatera ett recept i kostschemat
  const updateMealRecipe = (weekPlan: any, dayKey: string, mealType: string, recipeSlug: string) => {
    const updatedDays = { ...weekPlan.days };
    const dayEntry = { ...(updatedDays[dayKey] || {}) };
    const existingMeal = dayEntry[mealType] || {};
    const recipe = recipes.find(r => r.slug === recipeSlug);
    const fallbackName =
      recipe?.title ||
      stripResterSuffix(existingMeal.name) ||
      recipeSlug.replace(/-/g, ' ');

    dayEntry[mealType] = {
      ...existingMeal,
      recipeLink: `/kunskapsbank/recept/${recipeSlug}`,
      name: stripResterSuffix(fallbackName) || fallbackName,
      portions: existingMeal.portions || 1
    };

    updatedDays[dayKey] = dayEntry;
    saveMealPlan(weekPlan.weekNumber, updatedDays);
  };

  const updateMealLeftovers = (
    weekPlan: any,
    dayKey: string,
    mealType: string,
    leftoverType: 'rester' | 'rester_freezer' | null
  ) => {
    const updatedDays = { ...weekPlan.days };
    const dayEntry = { ...(updatedDays[dayKey] || {}) };
    const existingMeal = dayEntry[mealType];
    if (!existingMeal) return;

    const nextMeal = {
      ...existingMeal,
      name: stripResterSuffix(existingMeal.name) || existingMeal.name
    };

    if (leftoverType) {
      nextMeal.leftovers = leftoverType;
    } else {
      delete nextMeal.leftovers;
    }

    dayEntry[mealType] = nextMeal;
    updatedDays[dayKey] = dayEntry;
    saveMealPlan(weekPlan.weekNumber, updatedDays);
  };

  // Ta bort recept från kostschema
  const removeMealRecipe = (weekPlan: any, dayKey: string, mealType: string) => {
    const updatedDays = { ...weekPlan.days };
    delete updatedDays[dayKey][mealType];
    saveMealPlan(weekPlan.weekNumber, updatedDays);
  };

  // Renderera kostschema-vyn
  const renderMealPlansView = () => {
    const weekPlan = mealPlans.find(p => p.weekNumber === selectedWeek);
    if (!weekPlan) return <div className="text-center py-8 text-gray-500">Inga kostscheman för vecka {selectedWeek}</div>;

    const days = weekPlan.days as any;
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner', 'evening'];
    const mealLabels = {
      breakfast: 'Frukost',
      snack1: 'Mellanmål FM',
      lunch: 'Lunch',
      snack2: 'Mellanmål EM',
      dinner: 'Middag',
      evening: 'Kvällsmål'
    };

    return (
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Måltid</th>
                {dayNames.map(day => (
                  <th key={day} className="text-left py-3 px-4 font-medium text-gray-700 min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTypes.map(mealType => (
                <tr key={mealType} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-700">
                    {mealLabels[mealType as keyof typeof mealLabels]}
                  </td>
                  {dayKeys.map(dayKey => {
                    const meal = days[dayKey]?.[mealType];
                    const recipeSlug = meal?.recipeLink?.split('/').pop();
                    const recipe = recipes.find(r => r.slug === recipeSlug);
                    const leftovers = meal?.leftovers || null;

                    return (
                      <td key={dayKey} className="py-3 px-4">
                        {recipe ? (
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-900">{recipe.title}</span>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5"
                                  checked={leftovers === 'rester'}
                                  onChange={() =>
                                    updateMealLeftovers(
                                      weekPlan,
                                      dayKey,
                                      mealType,
                                      leftovers === 'rester' ? null : 'rester'
                                    )
                                  }
                                />
                                Rester
                              </label>
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5"
                                  checked={leftovers === 'rester_freezer'}
                                  onChange={() =>
                                    updateMealLeftovers(
                                      weekPlan,
                                      dayKey,
                                      mealType,
                                      leftovers === 'rester_freezer' ? null : 'rester_freezer'
                                    )
                                  }
                                />
                                Rester från frysen
                              </label>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => removeMealRecipe(weekPlan, dayKey, mealType)}
                                className="text-xs text-red-600 hover:text-red-700 transition-colors"
                              >
                                Ta bort
                              </button>
                            </div>
                          </div>
                        ) : (
                          <select
                            className="admin-select text-sm"
                            onChange={(e) => {
                              if (e.target.value) {
                                updateMealRecipe(weekPlan, dayKey, mealType, e.target.value);
                              }
                            }}
                            value=""
                          >
                            <option value="">+ Lägg till</option>
                            {recipes.map(r => (
                              <option key={r.id} value={r.slug}>{r.title}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Renderera inköpslista-vyn
  const renderShoppingListView = () => {
    if (!shoppingList) {
      return <div className="text-center py-8 text-gray-500">Ingen inköpslista för vecka {selectedWeek}</div>;
    }

    const updateShoppingItem = (index: number, field: 'name' | 'quantity', value: string) => {
      const updatedItems = [...shoppingList.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setShoppingList({ ...shoppingList, items: updatedItems });
    };

    const removeShoppingItem = (index: number) => {
      const updatedItems = shoppingList.items.filter((_: any, i: number) => i !== index);
      setShoppingList({ ...shoppingList, items: updatedItems });
    };

    const addShoppingItem = () => {
      const newItem = { name: '', quantity: '', category: 'Övrigt' };
      setShoppingList({ ...shoppingList, items: [...shoppingList.items, newItem] });
    };

    const saveShoppingList = async () => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/admin/shopping-lists/${shoppingList.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            items: shoppingList.items
          })
        });

        if (res.ok) {
          showNotification('success', 'Inköpslista sparad');
        } else {
          throw new Error('Failed to save');
        }
      } catch (error) {
        showNotification('error', 'Kunde inte spara inköpslista');
      } finally {
        setIsSaving(false);
      }
    };

    const categories = ['Frukt & Grönt', 'Mejeri', 'Kött & Fisk', 'Skafferi', 'Frys', 'Övrigt'];
    const groupedItems = categories.reduce((acc, category) => {
      acc[category] = shoppingList.items.filter((item: any) => item.category === category);
      return acc;
    }, {} as any);

    return (
      <div className="space-y-6">
        {categories.map(category => {
          const items = groupedItems[category];
          if (items.length === 0 && category !== 'Övrigt') return null;

          return (
            <div key={category} className="admin-card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
              <div className="space-y-2">
                {items.map((item: any, index: number) => {
                  const originalIndex = shoppingList.items.indexOf(item);
                  return (
                    <div key={originalIndex} className="flex gap-2 items-center group">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateShoppingItem(originalIndex, 'name', e.target.value)}
                        placeholder="Vara"
                        className="admin-input flex-1"
                      />
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateShoppingItem(originalIndex, 'quantity', e.target.value)}
                        placeholder="Mängd"
                        className="admin-input w-32"
                      />
                      <button
                        onClick={() => removeShoppingItem(originalIndex)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity admin-btn admin-btn-danger text-sm"
                      >
                        Ta bort
                      </button>
                    </div>
                  );
                })}
                {category === 'Övrigt' && (
                  <button
                    onClick={addShoppingItem}
                    className="admin-btn admin-btn-secondary text-sm w-full"
                  >
                    + Lägg till vara
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={saveShoppingList}
            disabled={isSaving}
            className="admin-btn admin-btn-primary"
          >
            {isSaving ? 'Sparar...' : 'Spara inköpslista'}
          </button>
        </div>
      </div>
    );
  };

  // Renderera veckoinställningar
  const renderWeekSettingsView = () => {
    const weekMeta = weekMetas.find(w => w.weekNumber === selectedWeek) || {
      weekNumber: selectedWeek,
      weekTitle: '',
      weekSubtitle: '',
      heroImage: '',
      videoUrl: '',
      welcomeMessage: ''
    };

    const saveWeekMeta = async (data: any) => {
      setIsSaving(true);
      try {
        const res = await fetch('/api/admin/course-weeks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            course: 'hormone',
            weekNumber: selectedWeek,
            ...data
          })
        });

        if (res.ok) {
          showNotification('success', 'Veckoinställningar sparade');
          await loadData();
        } else {
          throw new Error('Failed to save');
        }
      } catch (error) {
        showNotification('error', 'Kunde inte spara veckoinställningar');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="admin-card max-w-2xl">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Vecka {selectedWeek} - Inställningar</h3>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          saveWeekMeta({
            weekTitle: formData.get('weekTitle'),
            weekSubtitle: formData.get('weekSubtitle'),
            heroImage: formData.get('heroImage'),
            videoUrl: formData.get('videoUrl'),
            welcomeMessage: formData.get('welcomeMessage')
          });
        }} className="space-y-4">
          <div>
            <label className="admin-label">Veckotitel</label>
            <input
              name="weekTitle"
              defaultValue={weekMeta.weekTitle}
              placeholder="T.ex. Balansera dina hormoner"
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Undertitel</label>
            <input
              name="weekSubtitle"
              defaultValue={weekMeta.weekSubtitle}
              placeholder="T.ex. Grundläggande hormonbalans"
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Hero-bild URL</label>
            <input
              name="heroImage"
              defaultValue={weekMeta.heroImage}
              placeholder="https://..."
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Video URL</label>
            <input
              name="videoUrl"
              defaultValue={weekMeta.videoUrl}
              placeholder="https://vimeo.com/..."
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Välkomstmeddelande</label>
            <textarea
              name="welcomeMessage"
              defaultValue={weekMeta.welcomeMessage}
              placeholder="Välkommen till vecka..."
              rows={4}
              className="admin-textarea"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="admin-btn admin-btn-primary"
            >
              {isSaving ? 'Sparar...' : 'Spara inställningar'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Renderera kunskapsdokument
  const renderKnowledgeView = () => {
    const weekDocs = knowledgeDocs.filter(doc => doc.weekNumber === selectedWeek);

    const saveKnowledgeDoc = async (doc: any) => {
      setIsSaving(true);
      try {
        const method = doc.id ? 'PUT' : 'POST';
        const url = doc.id 
          ? `/api/admin/knowledge/documents/${doc.id}`
          : '/api/admin/knowledge/documents';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...doc,
            course: 'hormone',
            weekNumber: selectedWeek
          })
        });

        if (res.ok) {
          showNotification('success', 'Kunskapsdokument sparat');
          await loadData();
        } else {
          throw new Error('Failed to save');
        }
      } catch (error) {
        showNotification('error', 'Kunde inte spara kunskapsdokument');
      } finally {
        setIsSaving(false);
      }
    };

    const deleteKnowledgeDoc = async (id: string) => {
      if (!confirm('Är du säker på att du vill ta bort detta dokument?')) return;
      
      try {
        const res = await fetch(`/api/admin/knowledge/documents/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (res.ok) {
          showNotification('success', 'Dokument borttaget');
          await loadData();
        }
      } catch (error) {
        showNotification('error', 'Kunde inte ta bort dokument');
      }
    };

    return (
      <div className="space-y-6">
        {weekDocs.map((doc, index) => (
          <div key={doc.id} className="admin-card">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-gray-900">Dokument {index + 1}</h4>
              <button
                onClick={() => deleteKnowledgeDoc(doc.id)}
                className="admin-btn admin-btn-danger text-sm"
              >
                Ta bort
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveKnowledgeDoc({
                id: doc.id,
                title: formData.get('title'),
                content: formData.get('content'),
                order: parseInt(formData.get('order') as string) || 0
              });
            }} className="space-y-4">
              <div>
                <label className="admin-label">Titel</label>
                <input
                  name="title"
                  defaultValue={doc.title}
                  className="admin-input"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Innehåll</label>
                <textarea
                  name="content"
                  defaultValue={doc.content}
                  rows={8}
                  className="admin-textarea"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Ordning</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={doc.order}
                  className="admin-input w-24"
                />
              </div>

              <button type="submit" className="admin-btn admin-btn-primary">
                Spara ändringar
              </button>
            </form>
          </div>
        ))}

        <button
          onClick={() => saveKnowledgeDoc({ title: 'Nytt dokument', content: '', order: weekDocs.length })}
          className="admin-btn admin-btn-secondary w-full"
        >
          + Lägg till kunskapsdokument
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F3EFE3] to-[#FEFDF9] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="admin-skeleton h-12 w-64 mb-8"></div>
          <div className="admin-skeleton h-96 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3EFE3] to-[#FEFDF9]">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 admin-alert ${
          notification.type === 'success' ? 'admin-alert-success' : 'admin-alert-error'
        } admin-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Hormonell Balans</h1>
              <p className="text-sm text-gray-600 mt-1">Hantera kursinnehåll</p>
            </div>
            <Link href="/admin/courses" className="admin-btn admin-btn-secondary">
              Tillbaka till kurser
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex">
            {[
              { id: 'overview', label: 'Kursinställningar', icon: '⚙️' },
              { id: 'meals', label: 'Kostscheman', icon: '🍽️' },
              { id: 'shopping', label: 'Inköpslistor', icon: '🛒' },
              { id: 'weeks', label: 'Veckoinställningar', icon: '📅' },
              { id: 'knowledge', label: 'Kunskapsdokument', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                  activeView === tab.id
                    ? 'text-[#014421] bg-[#F3EFE3]/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {tab.label}
                </span>
                {activeView === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014421]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Välj vecka:</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(week => (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedWeek === week
                      ? 'bg-[#014421] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vecka {week}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeView === 'overview' && (
            <div className="admin-card max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Kursinställningar</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  const formData = new FormData(e.currentTarget);
                  const response = await fetch('/api/admin/hormone/course-settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      name: formData.get('name'),
                      welcomeText: formData.get('welcomeText'),
                      overviewVideoUrl: formData.get('overviewVideoUrl'),
                      description: formData.get('description')
                    })
                  });

                  if (response.ok) {
                    setCourseSettings({
                      name: formData.get('name') as string,
                      welcomeText: formData.get('welcomeText') as string,
                      overviewVideoUrl: formData.get('overviewVideoUrl') as string,
                      description: formData.get('description') as string
                    });
                    showNotification('success', '✅ Kursinställningar sparade!');
                  } else {
                    showNotification('error', '❌ Fel vid sparande av inställningar');
                  }
                } catch (error) {
                  console.error('Error saving settings:', error);
                  showNotification('error', '❌ Något gick fel');
                } finally {
                  setIsSaving(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="admin-label">Kursnamn</label>
                  <input
                    name="name"
                    defaultValue={courseSettings.name}
                    className="admin-input"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Välkomstmeddelande från Ulrika</label>
                  <textarea
                    name="welcomeText"
                    defaultValue={courseSettings.welcomeText}
                    rows={4}
                    className="admin-input"
                    placeholder="Välkommen till kursen..."
                  />
                </div>
                <div>
                  <label className="admin-label">Översiktsvideo URL (Vimeo/YouTube)</label>
                  <input
                    name="overviewVideoUrl"
                    defaultValue={courseSettings.overviewVideoUrl}
                    className="admin-input"
                    placeholder="https://player.vimeo.com/video/..."
                  />
                </div>
                <div>
                  <label className="admin-label">Kursbeskrivning</label>
                  <textarea
                    name="description"
                    defaultValue={courseSettings.description}
                    rows={6}
                    className="admin-input"
                    placeholder="Beskriv kursens syfte och innehåll..."
                  />
                </div>
                <button type="submit" disabled={isSaving} className="admin-btn admin-btn-primary">
                  {isSaving ? '⏳ Sparar...' : '💾 Spara inställningar'}
                </button>
              </form>
            </div>
          )}
          {activeView === 'meals' && renderMealPlansView()}
          {activeView === 'shopping' && renderShoppingListView()}
          {activeView === 'weeks' && renderWeekSettingsView()}
          {activeView === 'knowledge' && renderKnowledgeView()}
        </div>
      </div>
    </div>
  );
}