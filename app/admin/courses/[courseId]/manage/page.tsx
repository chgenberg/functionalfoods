'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, BookOpen, ShoppingCart, FileText, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string;
  categories?: string[];
  tags?: string[];
}

interface MealPlanWeek {
  id?: string;
  course: string;
  weekNumber: number;
  title?: string;
  days: any;
}

interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

interface KnowledgeDoc {
  id: string;
  title: string;
  slug: string;
  course: string;
  weekNumber?: number;
  order: number;
}

export default function UnifiedCourseManagePage({ params }: { params: { courseId: string } }) {
  const [activeTab, setActiveTab] = useState<'meals' | 'recipes' | 'shopping' | 'knowledge'>('meals');
  const [loading, setLoading] = useState(false);
  
  // Course mapping
  const courseMap: Record<string, string> = {
    'functional-basics': 'basic',
    'functional-flow': 'flow',
    'functional-energy': 'energy',
    'hormonell-balans': 'hormone'
  };
  const apiCourse = courseMap[params.courseId] || 'basic';
  const courseName = params.courseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Meal Plans State
  const [mealPlans, setMealPlans] = useState<MealPlanWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Recipes State
  const [courseRecipes, setCourseRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Shopping Lists State
  const [selectedShoppingWeek, setSelectedShoppingWeek] = useState(1);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  // Knowledge Docs State
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);

  useEffect(() => {
    if (activeTab === 'meals') fetchMealPlans();
    if (activeTab === 'recipes') fetchRecipes();
    if (activeTab === 'shopping') fetchShoppingList();
    if (activeTab === 'knowledge') fetchKnowledgeDocs();
  }, [activeTab, selectedWeek, selectedShoppingWeek]);

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/meal-plans?course=${apiCourse}`);
      const data = await res.json();
      setMealPlans(data.weeks || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const [courseRes, allRes] = await Promise.all([
        fetch(`/api/admin/courses/${params.courseId}/recipes`),
        fetch('/api/admin/recipes?adminFilter=all&limit=500')
      ]);
      const courseData = await courseRes.json();
      const allData = await allRes.json();
      setCourseRecipes(courseData.recipes || []);
      setAllRecipes(allData.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShoppingList = async () => {
    setLoading(true);
    try {
      const courseTypeMap: Record<string, string> = {
        'basic': 'basics',
        'flow': 'flow',
        'energy': 'energy',
        'hormone': 'hormone'
      };
      const courseType = courseTypeMap[apiCourse] || 'basics';
      const res = await fetch(`/api/admin/shopping-lists/${courseType}/${selectedShoppingWeek}`);
      const data = await res.json();
      setShoppingList(data.items || []);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      setShoppingList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/knowledge?course=${apiCourse}`);
      const data = await res.json();
      setKnowledgeDocs(data.documents || []);
    } catch (error) {
      console.error('Error fetching knowledge docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMealPlan = mealPlans.find(mp => mp.weekNumber === selectedWeek);

  const tabs = [
    { id: 'meals', label: 'Kostscheman', icon: Calendar },
    { id: 'recipes', label: 'Recept', icon: BookOpen },
    { id: 'shopping', label: 'Inköpslistor', icon: ShoppingCart },
    { id: 'knowledge', label: 'Kunskapsdokument', icon: FileText }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka till kurser</span>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Hantera {courseName}</h1>
            <p className="text-[var(--text-secondary)]">Redigera allt kursinnehåll på ett ställe</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[var(--primary-green)] text-[var(--primary-green)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--primary-green)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-[var(--border-light)] p-6">
        {activeTab === 'meals' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-[var(--primary-green)]">Kostscheman</h2>
              <Link
                href={`/admin/courses/${params.courseId}/meal-plans`}
                className="admin-btn admin-btn-primary"
              >
                <Edit2 className="w-4 h-4" />
                Avancerad redigering
              </Link>
            </div>

            {/* Week selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map(week => (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedWeek === week
                      ? 'bg-[var(--primary-green)] text-white'
                      : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  Vecka {week}
                </button>
              ))}
            </div>

            {currentMealPlan ? (
              <div className="space-y-4">
                {Object.entries(currentMealPlan.days || {}).map(([day, meals]: [string, any]) => (
                  <div key={day} className="border border-[var(--border-light)] rounded-lg p-4">
                    <h3 className="font-medium text-[var(--primary-green)] mb-3">{day}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map(mealType => (
                        <div key={mealType} className="bg-gray-50 p-2 rounded">
                          <div className="text-xs text-gray-500 mb-1 capitalize">
                            {mealType === 'breakfast' ? 'Frukost' : mealType === 'lunch' ? 'Lunch' : mealType === 'dinner' ? 'Middag' : mealType === 'snack' ? 'Mellanmål' : 'Efterrätt'}
                          </div>
                          <div className="text-xs">
                            {meals?.[mealType]?.name || <span className="text-gray-400">-</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Ingen data för vecka {selectedWeek}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-[var(--primary-green)]">
                Recept ({courseRecipes.length} kopplade)
              </h2>
              <Link
                href={`/admin/courses/${params.courseId}/manage-recipes`}
                className="admin-btn admin-btn-primary"
              >
                <Plus className="w-4 h-4" />
                Hantera recept
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseRecipes.slice(0, 12).map(recipe => (
                <div key={recipe.id} className="border border-[var(--border-light)] rounded-lg p-4 hover:border-[var(--primary-light-green)] transition-all">
                  <h3 className="font-medium text-[var(--text-primary)] mb-2 line-clamp-2">{recipe.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    {recipe.categories?.slice(0, 2).map(cat => (
                      <span key={cat} className="text-xs bg-[var(--primary-beige)] text-[var(--text-secondary)] px-2 py-1 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {courseRecipes.length > 12 && (
              <div className="text-center mt-6">
                <Link
                  href={`/admin/courses/${params.courseId}/manage-recipes`}
                  className="text-[var(--primary-light-green)] hover:text-[var(--primary-green)]"
                >
                  Visa alla {courseRecipes.length} recept →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shopping' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-[var(--primary-green)]">Inköpslistor</h2>
              <Link
                href={`/admin/shopping-lists?course=${params.courseId}`}
                className="admin-btn admin-btn-primary"
              >
                <Edit2 className="w-4 h-4" />
                Redigera
              </Link>
            </div>

            {/* Week selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map(week => (
                <button
                  key={week}
                  onClick={() => setSelectedShoppingWeek(week)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedShoppingWeek === week
                      ? 'bg-[var(--primary-green)] text-white'
                      : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  Vecka {week}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {shoppingList.length > 0 ? (
                shoppingList.slice(0, 20).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.amount} {item.unit}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Ingen inköpslista för vecka {selectedShoppingWeek}
                </div>
              )}

              {shoppingList.length > 20 && (
                <div className="text-center mt-4">
                  <Link
                    href={`/admin/shopping-lists?course=${params.courseId}`}
                    className="text-[var(--primary-light-green)] hover:text-[var(--primary-green)]"
                  >
                    Visa alla {shoppingList.length} rader →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-[var(--primary-green)]">
                Kunskapsdokument ({knowledgeDocs.length})
              </h2>
              <Link
                href={`/admin/knowledge?course=${apiCourse}`}
                className="admin-btn admin-btn-primary"
              >
                <Plus className="w-4 h-4" />
                Skapa nytt
              </Link>
            </div>

            <div className="space-y-3">
              {knowledgeDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-light-green)] transition-all">
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--text-primary)]">{doc.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {doc.weekNumber ? `Vecka ${doc.weekNumber}` : 'Allmän'} • Ordning: {doc.order}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/knowledge/edit?course=${doc.course}&slug=${doc.slug}`}
                      className="admin-btn admin-btn-secondary"
                    >
                      <Edit2 className="w-4 h-4" />
                      Redigera
                    </Link>
                  </div>
                </div>
              ))}

              {knowledgeDocs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Inga kunskapsdokument hittades
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

