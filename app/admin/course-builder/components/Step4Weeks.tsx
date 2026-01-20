'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit, 
  Loader2,
  Search,
  X,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import type { CourseDraftData, WeekData, DayData, MealData } from '../[id]/step/[stepNumber]/page';

interface Step4Props {
  draft: CourseDraftData;
  onUpdate: (updates: Partial<CourseDraftData>) => void;
  onSave: (updates: Partial<CourseDraftData>) => Promise<boolean>;
  saving: boolean;
}

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Frukost', icon: Coffee },
  { key: 'lunch', label: 'Lunch', icon: Sun },
  { key: 'dinner', label: 'Middag', icon: Moon },
  { key: 'snack', label: 'Mellanmål', icon: Cookie },
  { key: 'dessert', label: 'Dessert', icon: UtensilsCrossed },
];

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
}

export default function Step4Weeks({ draft, onUpdate, onSave, saving }: Step4Props) {
  const [weeks, setWeeks] = useState<WeekData[]>(() => {
    // Initialize weeks based on weeksCount
    if (draft.weeks?.length > 0) {
      return draft.weeks;
    }
    
    // Create empty weeks
    return Array.from({ length: draft.weeksCount || 1 }, (_, i) => ({
      weekNumber: i + 1,
      title: `Vecka ${i + 1}`,
      subtitle: '',
      videoUrl: '',
      welcomeMessage: '',
      keyTakeaways: [],
      days: DAYS.map(dayName => ({
        dayName,
        meals: {}
      }))
    }));
  });

  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [editingMeal, setEditingMeal] = useState<{
    weekNumber: number;
    dayName: string;
    mealType: string;
  } | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Update weeks count if draft.weeksCount changes
    if (draft.weeksCount && draft.weeksCount !== weeks.length) {
      if (draft.weeksCount > weeks.length) {
        // Add new weeks
        const newWeeks = Array.from(
          { length: draft.weeksCount - weeks.length },
          (_, i) => ({
            weekNumber: weeks.length + i + 1,
            title: `Vecka ${weeks.length + i + 1}`,
            subtitle: '',
            videoUrl: '',
            welcomeMessage: '',
            keyTakeaways: [],
            days: DAYS.map(dayName => ({
              dayName,
              meals: {}
            }))
          })
        );
        setWeeks([...weeks, ...newWeeks]);
      } else {
        // Remove weeks
        setWeeks(weeks.slice(0, draft.weeksCount));
      }
    }
  }, [draft.weeksCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate({ weeks });
    }, 1000);

    return () => clearTimeout(timer);
  }, [weeks]);

  const searchRecipes = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/admin/recipes/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.recipes || []);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchRecipes(recipeSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [recipeSearch]);

  const updateWeek = (weekNumber: number, updates: Partial<WeekData>) => {
    setWeeks(prev => prev.map(w => 
      w.weekNumber === weekNumber ? { ...w, ...updates } : w
    ));
  };

  const updateMeal = (weekNumber: number, dayName: string, mealType: string, meal: MealData | null) => {
    setWeeks(prev => prev.map(w => {
      if (w.weekNumber !== weekNumber) return w;
      
      return {
        ...w,
        days: w.days.map(d => {
          if (d.dayName !== dayName) return d;
          
          const newMeals = { ...d.meals };
          if (meal) {
            newMeals[mealType as keyof typeof d.meals] = meal;
          } else {
            delete newMeals[mealType as keyof typeof d.meals];
          }
          
          return { ...d, meals: newMeals };
        })
      };
    }));
  };

  const selectRecipeForMeal = (recipe: Recipe) => {
    if (!editingMeal) return;

    updateMeal(editingMeal.weekNumber, editingMeal.dayName, editingMeal.mealType, {
      name: recipe.title,
      recipeId: recipe.id,
      recipeLink: `/kunskapsbank/recept/${recipe.slug}`
    });

    setEditingMeal(null);
    setRecipeSearch('');
    setSearchResults([]);
  };

  const setCustomMeal = (name: string) => {
    if (!editingMeal || !name.trim()) return;

    updateMeal(editingMeal.weekNumber, editingMeal.dayName, editingMeal.mealType, {
      name: name.trim()
    });

    setEditingMeal(null);
    setRecipeSearch('');
    setSearchResults([]);
  };

  const handleSave = async () => {
    await onSave({ weeks });
  };

  const getMealCount = (week: WeekData) => {
    return week.days.reduce((count, day) => {
      return count + Object.keys(day.meals).length;
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Veckostruktur & kostscheman
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Bygg upp kursen vecka för vecka med måltidsscheman
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>
          <strong>Tips:</strong> Klicka på en vecka för att expandera och lägga till måltider. 
          Du kan söka efter befintliga recept eller skriva in egna måltider.
        </p>
      </div>

      {/* Weeks list */}
      <div className="space-y-3">
        {weeks.map((week) => (
          <div
            key={week.weekNumber}
            className="border border-[var(--border-light)] rounded-xl overflow-hidden"
          >
            {/* Week header */}
            <button
              type="button"
              onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[var(--primary-green)]" />
                <div className="text-left">
                  <span className="font-medium text-[var(--text-primary)]">
                    {week.title}
                  </span>
                  {week.subtitle && (
                    <span className="text-sm text-[var(--text-secondary)] ml-2">
                      - {week.subtitle}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-secondary)] bg-white px-2 py-1 rounded">
                  {getMealCount(week)} måltider
                </span>
                {expandedWeek === week.weekNumber ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Week content */}
            {expandedWeek === week.weekNumber && (
              <div className="p-4 space-y-4">
                {/* Week metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[var(--border-light)]">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Veckotitel
                    </label>
                    <input
                      type="text"
                      value={week.title}
                      onChange={(e) => updateWeek(week.weekNumber, { title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Undertitel (valfritt)
                    </label>
                    <input
                      type="text"
                      value={week.subtitle || ''}
                      onChange={(e) => updateWeek(week.weekNumber, { subtitle: e.target.value })}
                      placeholder="t.ex. Fokus på frukost"
                      className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)]"
                    />
                  </div>
                </div>

                {/* Days grid */}
                <div className="space-y-3">
                  {week.days.map((day) => (
                    <div
                      key={day.dayName}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="font-medium text-sm text-[var(--text-primary)] mb-2">
                        {day.dayName}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {MEAL_TYPES.map(({ key, label, icon: Icon }) => {
                          const meal = day.meals[key as keyof typeof day.meals];
                          const isEditing = editingMeal?.weekNumber === week.weekNumber && 
                                           editingMeal?.dayName === day.dayName && 
                                           editingMeal?.mealType === key;

                          return (
                            <div key={key} className="relative">
                              {isEditing ? (
                                <div className="absolute inset-0 z-10 bg-white border-2 border-[var(--primary-green)] rounded-lg p-2 shadow-lg -m-1">
                                  <div className="flex items-center gap-1 mb-2">
                                    <Search className="w-3 h-3 text-gray-400" />
                                    <input
                                      type="text"
                                      value={recipeSearch}
                                      onChange={(e) => setRecipeSearch(e.target.value)}
                                      placeholder="Sök recept..."
                                      autoFocus
                                      className="flex-1 text-xs border-none focus:outline-none"
                                    />
                                    <button
                                      onClick={() => {
                                        setEditingMeal(null);
                                        setRecipeSearch('');
                                      }}
                                      className="p-0.5 hover:bg-gray-100 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  {searching && (
                                    <div className="text-xs text-gray-400 py-2">Söker...</div>
                                  )}
                                  
                                  {searchResults.length > 0 && (
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                      {searchResults.slice(0, 5).map((recipe) => (
                                        <button
                                          key={recipe.id}
                                          onClick={() => selectRecipeForMeal(recipe)}
                                          className="w-full text-left text-xs p-1.5 hover:bg-gray-100 rounded truncate"
                                        >
                                          {recipe.title}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {recipeSearch && !searching && searchResults.length === 0 && (
                                    <button
                                      onClick={() => setCustomMeal(recipeSearch)}
                                      className="w-full text-left text-xs p-1.5 bg-gray-100 hover:bg-gray-200 rounded"
                                    >
                                      Använd: "{recipeSearch}"
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEditingMeal({
                                    weekNumber: week.weekNumber,
                                    dayName: day.dayName,
                                    mealType: key
                                  })}
                                  className={`w-full p-2 rounded-lg border text-left transition-all ${
                                    meal
                                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                                      : 'border-dashed border-gray-300 hover:border-[var(--primary-green)] hover:bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <Icon className={`w-3 h-3 ${meal ? 'text-green-600' : 'text-gray-400'}`} />
                                    <span className={`text-xs ${meal ? 'text-green-700' : 'text-gray-500'}`}>
                                      {label}
                                    </span>
                                  </div>
                                  {meal ? (
                                    <p className="text-xs text-[var(--text-primary)] truncate">
                                      {meal.name}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-gray-400">
                                      + Lägg till
                                    </p>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)]">
          {weeks.length} veckor, {weeks.reduce((sum, w) => sum + getMealCount(w), 0)} måltider totalt
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sparar...
            </>
          ) : (
            'Spara och fortsätt'
          )}
        </button>
      </div>
    </div>
  );
}
