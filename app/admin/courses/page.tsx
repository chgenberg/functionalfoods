'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  enrollments: number;
  weeks: CourseWeek[];
}

interface CourseWeek {
  weekNumber: number;
  title: string;
  subtitle?: string;
}

interface MealPlanWeek {
  course: string;
  weekNumber: number;
  title?: string;
  days: any;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  course: string;
  weekNumber?: number;
  order: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlanWeek[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'knowledge'>('overview');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && activeTab === 'meals') fetchMealPlans();
    if (selectedCourse && activeTab === 'knowledge') fetchKnowledgeDocs();
  }, [selectedCourse, activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/functional-courses', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      const list: Course[] = Array.isArray(data) ? data : data?.courses || [];
      setCourses(list);
      if (list.length > 0 && !selectedCourse) setSelectedCourse(list[0].id);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    if (!selectedCourse) return;
    try {
      const courseMap: Record<string, string> = {
        'functional-basics': 'basic', 'functional-flow': 'flow',
        'functional-energy': 'energy', 'hormonell-balans': 'hormone', 'functional-hormone': 'hormone'
      };
      const courseType = courseMap[selectedCourse] || 'basic';
      const response = await fetch(`/api/admin/meal-plans?course=${courseType}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMealPlans(data.weeks || []);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const fetchKnowledgeDocs = async () => {
    if (!selectedCourse) return;
    try {
      const courseMap: Record<string, string> = {
        'functional-basics': 'basic', 'functional-flow': 'flow',
        'functional-energy': 'energy', 'hormonell-balans': 'hormone', 'functional-hormone': 'hormone'
      };
      const courseType = courseMap[selectedCourse] || 'basic';
      const response = await fetch(`/api/admin/knowledge?course=${courseType}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setKnowledgeDocs(data.documents || data || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge docs:', error);
      setKnowledgeDocs([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar kurser...</p>
        </div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Kurser</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera kursinnehåll</p>
        </div>
        <div className="flex gap-2">
          {selectedCourse && (
            <Link
              href={`/admin/courses/${selectedCourse}/edit`}
              className="px-4 py-2 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
            >
              Redigera kurs
            </Link>
          )}
          <Link
            href="/admin/courses/new"
            className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors text-sm"
          >
            Skapa kurs
          </Link>
        </div>
      </div>

      {/* Course Selector */}
      <div className="flex flex-wrap gap-2">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedCourse === course.id
                ? 'bg-[var(--primary-green)] text-white'
                : 'bg-white border border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--primary-green)]'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      {selectedCourse && (
        <div className="border-b border-[var(--border-light)]">
          <div className="flex gap-4">
            {['overview', 'meals', 'knowledge'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-2 text-sm transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-[var(--primary-green)] text-[var(--primary-green)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'overview' ? 'Översikt' : tab === 'meals' ? 'Kostscheman' : 'Kunskapsdokument'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {selectedCourse && (
        <div className="bg-white border border-[var(--border-light)] rounded-lg">
          {activeTab === 'overview' && (
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Pris</p>
                  <p className="text-xl font-semibold mt-1">{selectedCourseData?.price.toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Deltagare</p>
                  <p className="text-xl font-semibold mt-1">{selectedCourseData?.enrollments}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Veckor</p>
                  <p className="text-xl font-semibold mt-1">{selectedCourseData?.weeks.length}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-2">Beskrivning</p>
                <p className="text-sm text-[var(--text-primary)]">{selectedCourseData?.description || 'Ingen beskrivning'}</p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">Snabbåtgärder</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/admin/courses/${selectedCourse}/meal-plans`} className="p-3 border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] text-sm">
                    <p className="font-medium">Kostscheman</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Planera måltider</p>
                  </Link>
                  <Link href={`/admin/courses/${selectedCourse}/manage-recipes`} className="p-3 border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] text-sm">
                    <p className="font-medium">Recept</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Hantera recept</p>
                  </Link>
                  <Link href={`/admin/shopping-lists?course=${selectedCourse}`} className="p-3 border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] text-sm">
                    <p className="font-medium">Inköpslistor</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Veckolistor</p>
                  </Link>
                  <button onClick={() => setActiveTab('knowledge')} className="p-3 border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] text-sm text-left">
                    <p className="font-medium">Kunskapsdokument</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Redigera material</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meals' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">Kostscheman: {selectedCourseData?.name}</p>
                <button onClick={fetchMealPlans} className="text-xs text-[var(--primary-green)] hover:underline">
                  Uppdatera
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(week => {
                  const mealPlan = mealPlans.find(mp => mp.weekNumber === week);
                  return (
                    <div key={week} className={`p-4 rounded-lg border ${mealPlan ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <p className="text-sm font-medium">Vecka {week}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {mealPlan ? `${Object.keys(mealPlan.days || {}).length} dagar` : 'Saknas'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">Kunskapsdokument: {selectedCourseData?.name}</p>
                <button onClick={fetchKnowledgeDocs} className="text-xs text-[var(--primary-green)] hover:underline">
                  Uppdatera
                </button>
              </div>
              {knowledgeDocs.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">Inga dokument</p>
              ) : (
                <div className="space-y-2">
                  {knowledgeDocs.map(doc => (
                    <div key={doc.id} className="p-3 border border-[var(--border-light)] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{doc.title}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {doc.weekNumber ? `Vecka ${doc.weekNumber}` : 'Allmän'}
                        </p>
                      </div>
                      <Link
                        href={`/admin/knowledge/edit?course=${doc.course}&slug=${doc.slug}`}
                        className="px-3 py-1.5 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Redigera
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Global Actions */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">Snabblänkar</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/recipes" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)]">
            Alla recept
          </Link>
          <Link href="/admin/shopping-lists" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)]">
            Inköpslistor
          </Link>
          <Link href="/admin/users" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)]">
            Användare
          </Link>
          <Link href="/admin/settings" className="px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)]">
            Inställningar
          </Link>
        </div>
      </div>
    </div>
  );
}
