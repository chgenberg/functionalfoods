'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Loader2,
  Search,
  X,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Cookie,
  BookOpen,
  FileText,
  Trash2
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

interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  headerImage?: string;
  course: string;
  courses: string[];
  weekNumber?: number;
  readTime: number;
}

interface LinkedDocument {
  id: string;
  title: string;
  slug: string;
  type: 'knowledge';
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
      knowledgeDocuments: [],
      days: DAYS.map(dayName => ({
        dayName,
        meals: {}
      }))
    }));
  });

  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'meals' | 'documents'>('meals');
  
  // Recipe search state
  const [editingMeal, setEditingMeal] = useState<{
    weekNumber: number;
    dayName: string;
    mealType: string;
  } | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searching, setSearching] = useState(false);

  // Knowledge document search state
  const [documentSearch, setDocumentSearch] = useState('');
  const [documentResults, setDocumentResults] = useState<KnowledgeDocument[]>([]);
  const [searchingDocuments, setSearchingDocuments] = useState(false);
  const [showDocumentSearch, setShowDocumentSearch] = useState<number | null>(null);

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
            knowledgeDocuments: [],
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

  // Recipe search
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

  // Knowledge document search
  const searchDocuments = async (query: string) => {
    try {
      setSearchingDocuments(true);
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set('q', query);
      }
      params.set('limit', '20');
      
      const response = await fetch(`/api/admin/knowledge-documents/search?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentResults(data.documents || []);
      }
    } catch (error) {
      console.error('Error searching knowledge documents:', error);
    } finally {
      setSearchingDocuments(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchRecipes(recipeSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [recipeSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showDocumentSearch !== null) {
        searchDocuments(documentSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [documentSearch, showDocumentSearch]);

  // Load all documents when search is opened
  useEffect(() => {
    if (showDocumentSearch !== null) {
      searchDocuments('');
    }
  }, [showDocumentSearch]);

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

  const addDocumentToWeek = (weekNumber: number, doc: KnowledgeDocument) => {
    setWeeks(prev => prev.map(w => {
      if (w.weekNumber !== weekNumber) return w;
      
      const existing = w.knowledgeDocuments || [];
      // Don't add duplicate
      if (existing.some(d => d.id === doc.id)) return w;
      
      return {
        ...w,
        knowledgeDocuments: [...existing, {
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          type: 'knowledge' as const
        }]
      };
    }));
    
    setShowDocumentSearch(null);
    setDocumentSearch('');
  };

  const removeDocumentFromWeek = (weekNumber: number, docId: string) => {
    setWeeks(prev => prev.map(w => {
      if (w.weekNumber !== weekNumber) return w;
      
      return {
        ...w,
        knowledgeDocuments: (w.knowledgeDocuments || []).filter(d => d.id !== docId)
      };
    }));
  };

  const handleSave = async () => {
    await onSave({ weeks });
  };

  const getMealCount = (week: WeekData) => {
    return week.days.reduce((count, day) => {
      return count + Object.keys(day.meals).length;
    }, 0);
  };

  const getDocumentCount = (week: WeekData) => {
    return (week.knowledgeDocuments || []).length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Veckostruktur, kostscheman & kunskapsdokument
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Bygg upp kursen vecka för vecka med måltidsscheman och kunskapsinnehåll
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>
          <strong>Tips:</strong> Klicka på en vecka för att expandera. Använd flikarna för att växla mellan 
          måltidsscheman och kunskapsdokument. Du kan söka efter befintliga recept och dokument.
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
                <span className="text-xs text-[var(--text-secondary)] bg-white px-2 py-1 rounded">
                  {getDocumentCount(week)} dokument
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

                {/* Tabs */}
                <div className="flex gap-2 border-b border-[var(--border-light)]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('meals')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'meals'
                        ? 'border-[var(--primary-green)] text-[var(--primary-green)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" />
                      Måltider ({getMealCount(week)})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'documents'
                        ? 'border-[var(--primary-green)] text-[var(--primary-green)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Kunskapsdokument ({getDocumentCount(week)})
                    </span>
                  </button>
                </div>

                {/* Meals tab content */}
                {activeTab === 'meals' && (
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
                                        Använd: &quot;{recipeSearch}&quot;
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
                )}

                {/* Documents tab content */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    {/* Linked documents list */}
                    <div className="space-y-2">
                      {(week.knowledgeDocuments || []).length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">
                          Inga kunskapsdokument tillagda för denna vecka
                        </p>
                      ) : (
                        (week.knowledgeDocuments || []).map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white border border-[var(--border-light)] rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-[var(--primary-green)]" />
                              <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                  {doc.title}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                  /kunskapsbank/{doc.slug}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocumentFromWeek(week.weekNumber, doc.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Ta bort"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add document button/search */}
                    {showDocumentSearch === week.weekNumber ? (
                      <div className="bg-white border-2 border-[var(--primary-green)] rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Search className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={documentSearch}
                            onChange={(e) => setDocumentSearch(e.target.value)}
                            placeholder="Sök kunskapsdokument..."
                            autoFocus
                            className="flex-1 text-sm border-none focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              setShowDocumentSearch(null);
                              setDocumentSearch('');
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {searchingDocuments && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          </div>
                        )}
                        
                        {!searchingDocuments && documentResults.length > 0 && (
                          <div className="max-h-64 overflow-y-auto space-y-1 border-t border-gray-100 pt-2">
                            {documentResults.map((doc) => {
                              const isLinked = (week.knowledgeDocuments || []).some(d => d.id === doc.id);
                              
                              return (
                                <button
                                  key={doc.id}
                                  onClick={() => !isLinked && addDocumentToWeek(week.weekNumber, doc)}
                                  disabled={isLinked}
                                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                                    isLinked
                                      ? 'bg-green-50 text-green-700 cursor-default'
                                      : 'hover:bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">{doc.title}</p>
                                      <p className="text-xs text-gray-500">
                                        Kurs: {doc.course || doc.courses?.join(', ') || 'Okänd'} 
                                        {doc.weekNumber && ` • Vecka ${doc.weekNumber}`}
                                        {` • ${doc.readTime} min läsning`}
                                      </p>
                                    </div>
                                    {isLinked && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        Tillagd
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {!searchingDocuments && documentSearch && documentResults.length === 0 && (
                          <p className="text-sm text-gray-500 py-4 text-center">
                            Inga kunskapsdokument hittades för &quot;{documentSearch}&quot;
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowDocumentSearch(week.weekNumber)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[var(--primary-green)] hover:text-[var(--primary-green)] transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Lägg till kunskapsdokument
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)]">
          {weeks.length} veckor, {weeks.reduce((sum, w) => sum + getMealCount(w), 0)} måltider, {weeks.reduce((sum, w) => sum + getDocumentCount(w), 0)} dokument
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
