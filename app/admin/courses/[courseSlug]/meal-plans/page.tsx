'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, X, Search, Calendar, Loader2, Info, ChefHat } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
}

interface MealPlan {
  id?: string;
  course: string;
  weekNumber: number;
  days: {
    [day: string]: {
      breakfast?: { name: string; recipeLink?: string } | null;
      lunch?: { name: string; recipeLink?: string } | null;
      dinner?: { name: string; recipeLink?: string } | null;
      snack?: { name: string; recipeLink?: string } | null;
      dessert?: { name: string; recipeLink?: string } | null;
    };
  };
}

export default function CourseMealPlansPage({ params }: { params: { courseSlug: string } }) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [courseRecipes, setCourseRecipes] = useState<Recipe[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRecipeSelector, setShowRecipeSelector] = useState<{
    day: string;
    mealType: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const mealTypes = [
    { key: 'breakfast', label: 'Frukost' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Middag' },
    { key: 'snack', label: 'Mellanmål' },
    { key: 'dessert', label: 'Efterrätt' }
  ];

  useEffect(() => {
    fetchMealPlans();
    fetchCourseRecipes();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const response = await fetch(`/api/admin/meal-plans?course=${params.courseSlug}`);
      if (response.ok) {
        const data = await response.json();
        setMealPlans(data.mealPlans || []);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseRecipes = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.courseSlug}/recipes`);
      if (response.ok) {
        const data = await response.json();
        setCourseRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching course recipes:', error);
    }
  };

  const getCurrentWeekPlan = () => {
    return mealPlans.find(mp => mp.weekNumber === selectedWeek);
  };

  const handleAddMeal = (recipe: Recipe, day: string, mealType: string) => {
    const currentPlan = getCurrentWeekPlan();
    if (!currentPlan) return;

    const updatedDays = { ...currentPlan.days };
    if (!updatedDays[day]) {
      updatedDays[day] = {};
    }

    updatedDays[day] = {
      ...updatedDays[day],
      [mealType]: {
        name: recipe.title,
        recipeLink: `/kunskapsbank/recept/${recipe.slug}?from=${params.courseSlug}&week=${selectedWeek}`
      }
    };

    const updatedPlans = mealPlans.map(mp =>
      mp.weekNumber === selectedWeek
        ? { ...mp, days: updatedDays }
        : mp
    );

    setMealPlans(updatedPlans);
    setShowRecipeSelector(null);
  };

  const handleRemoveMeal = (day: string, mealType: string) => {
    const currentPlan = getCurrentWeekPlan();
    if (!currentPlan) return;

    const updatedDays = { ...currentPlan.days };
    if (updatedDays[day]) {
      updatedDays[day] = {
        ...updatedDays[day],
        [mealType]: null
      };
    }

    const updatedPlans = mealPlans.map(mp =>
      mp.weekNumber === selectedWeek
        ? { ...mp, days: updatedDays }
        : mp
    );

    setMealPlans(updatedPlans);
  };

  const handleSave = async () => {
    const currentPlan = getCurrentWeekPlan();
    if (!currentPlan) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/meal-plans`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentPlan.id,
          course: params.courseSlug,
          weekNumber: selectedWeek,
          days: currentPlan.days
        })
      });

      if (response.ok) {
        alert('✅ Kostschema sparat!');
      } else {
        alert('❌ Fel vid sparning');
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('❌ Fel vid sparning');
    } finally {
      setSaving(false);
    }
  };

  const filteredRecipes = courseRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseName = params.courseSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-green)]" />
      </div>
    );
  }

  const currentPlan = getCurrentWeekPlan();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till kurser
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
              Kostscheman för {courseName}
            </h1>
            <p className="text-[var(--text-secondary)] font-light">
              Planera måltider för varje vecka
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Spara vecka {selectedWeek}
              </>
            )}
          </button>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Klicka på "+" för att lägga till ett recept från kursen</li>
                <li>Endast recept som är taggade med kursen visas</li>
                <li>Ändringar sparas per vecka</li>
                <li>Inköpslistor genereras automatiskt från kostscheman</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Week selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map(week => (
            <button
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedWeek === week
                  ? 'bg-[var(--primary-green)] text-white shadow-md'
                  : 'bg-white text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-[var(--primary-light-green)]'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Vecka {week}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Plan Grid */}
      {currentPlan ? (
        <div className="bg-white rounded-2xl border border-[var(--border-light)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--primary-beige)]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--text-primary)]">
                    Dag
                  </th>
                  {mealTypes.map(meal => (
                    <th key={meal.key} className="px-4 py-3 text-left font-medium text-[var(--text-primary)]">
                      {meal.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day, dayIndex) => (
                  <tr key={day} className={dayIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {day}
                    </td>
                    {mealTypes.map(meal => {
                      const mealData = currentPlan.days[day]?.[meal.key as keyof typeof currentPlan.days[typeof day]];
                      return (
                        <td key={meal.key} className="px-4 py-3">
                          {mealData && typeof mealData === 'object' && 'name' in mealData ? (
                            <div className="flex items-center justify-between gap-2 bg-green-50 p-2 rounded-lg border border-green-200">
                              <span className="text-sm text-green-800 flex-1">
                                {mealData.name}
                              </span>
                              <button
                                onClick={() => handleRemoveMeal(day, meal.key)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowRecipeSelector({ day, mealType: meal.key })}
                              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--primary-light-green)] hover:bg-green-50 transition-all"
                            >
                              <Plus className="w-4 h-4 mx-auto text-gray-400" />
                            </button>
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
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border-light)]">
          <p className="text-[var(--text-secondary)]">Ingen data för vecka {selectedWeek}</p>
        </div>
      )}

      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border-light)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-[var(--primary-green)]">
                  Välj recept för {showRecipeSelector.day} - {mealTypes.find(m => m.key === showRecipeSelector.mealType)?.label}
                </h3>
                <button
                  onClick={() => setShowRecipeSelector(null)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Sök recept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-input pl-10 w-full"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                  <p className="text-[var(--text-secondary)] mb-4">
                    {courseRecipes.length === 0
                      ? 'Inga recept är kopplade till kursen ännu'
                      : 'Inga recept hittades'}
                  </p>
                  {courseRecipes.length === 0 && (
                    <Link
                      href={`/admin/courses/${params.courseSlug}/manage-recipes`}
                      className="admin-btn admin-btn-primary"
                    >
                      Lägg till recept till kursen
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddMeal(recipe, showRecipeSelector.day, showRecipeSelector.mealType)}
                      className="text-left p-4 border border-[var(--border-light)] rounded-xl hover:border-[var(--primary-light-green)] hover:shadow-md transition-all"
                    >
                      <h4 className="font-medium text-[var(--text-primary)] line-clamp-2">
                        {recipe.title}
                      </h4>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
