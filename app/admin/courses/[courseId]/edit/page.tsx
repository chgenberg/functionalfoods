'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, AlertCircle, Calendar, BookOpen, ShoppingCart, FileText } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  level: string;
  enrollments?: number;
}

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Mock course data
      const courseData: Course = {
        id: params.courseId,
        name: getCourseInfo(params.courseId).name,
        description: getCourseInfo(params.courseId).description,
        price: 1497,
        duration: '6 veckor',
        level: getCourseInfo(params.courseId).level,
        enrollments: getCourseInfo(params.courseId).enrollments,
      };

      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseInfo = (courseId: string) => {
    const courses = {
      'functional-basics': {
        name: 'Functional Basics',
        description: 'Grundkursen för en hälsosam livsstil',
        level: 'Nybörjare',
        enrollments: 1245
      },
      'functional-flow': {
        name: 'Functional Flow',
        description: 'Fördjupningskurs för optimal matsmältning',
        level: 'Medel',
        enrollments: 892
      },
      'functional-energy': {
        name: 'Functional Insulin balance/Energy',
        description: 'Avancerad kurs för energioptimering',
        level: 'Avancerad',
        enrollments: 634
      }
    };
    return courses[courseId as keyof typeof courses] || courses['functional-basics'];
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Kursen har sparats!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4">Laddar kursdata...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-[var(--coral-accent)] mx-auto mb-4" />
        <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">Kurs hittades inte</h2>
        <Link href="/admin/courses" className="text-[var(--primary-light-green)] hover:text-[var(--primary-green)] transition-colors">
          ← Tillbaka till kurser
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/courses" 
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka till kurser</span>
        </Link>

        <div className="admin-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">{course.name}</h1>
              <p className="text-[var(--text-secondary)] text-lg">{course.description}</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/dashboard/courses/${params.courseId}/oversikt`}
                className="admin-btn admin-btn-secondary"
              >
                <Eye className="w-4 h-4" />
                Förhandsgranska
              </Link>
              <button
                onClick={saveCourse}
                disabled={saving}
                className="admin-btn admin-btn-primary"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Spara ändringar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 admin-alert admin-alert-success">
              {successMessage}
            </div>
          )}

          {/* Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-[var(--primary-beige)] rounded-lg p-4">
              <span className="text-[var(--text-secondary)] block">Pris</span>
              <span className="font-semibold text-lg text-[var(--text-primary)]">{course.price} kr</span>
            </div>
            <div className="bg-[var(--primary-beige)] rounded-lg p-4">
              <span className="text-[var(--text-secondary)] block">Längd</span>
              <span className="font-semibold text-lg text-[var(--text-primary)]">{course.duration}</span>
            </div>
            <div className="bg-[var(--primary-beige)] rounded-lg p-4">
              <span className="text-[var(--text-secondary)] block">Nivå</span>
              <span className="font-semibold text-lg text-[var(--text-primary)]">{course.level}</span>
            </div>
            <div className="bg-[var(--primary-beige)] rounded-lg p-4">
              <span className="text-[var(--text-secondary)] block">Deltagare</span>
              <span className="font-semibold text-lg text-[var(--text-primary)]">{course.enrollments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Course Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card">
            <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">Grundinställningar</h2>
            
            <div className="space-y-6">
              <div>
                <label className="admin-label">Kursnamn</label>
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="admin-input"
                />
              </div>
              
              <div>
                <label className="admin-label">Beskrivning</label>
                <textarea
                  value={course.description || ''}
                  onChange={(e) => setCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="admin-textarea"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="admin-label">Pris (kr)</label>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, price: parseInt(e.target.value) } : null)}
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="admin-label">Längd</label>
                  <input
                    type="text"
                    value={course.duration}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, duration: e.target.value } : null)}
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="admin-label">Nivå</label>
                  <select
                    value={course.level}
                    onChange={(e) => setCourse(prev => prev ? { ...prev, level: e.target.value } : null)}
                    className="admin-select"
                  >
                    <option value="Nybörjare">Nybörjare</option>
                    <option value="Medel">Medel</option>
                    <option value="Avancerad">Avancerad</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content Management */}
          <div className="admin-card">
            <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">Kursinnehåll</h2>
            
            <div className="space-y-4">
              <Link
                href={`/admin/courses/${params.courseId}/weeks`}
                className="flex items-center justify-between p-4 bg-[var(--primary-beige)] rounded-lg hover:bg-[var(--primary-beige)]/80 transition-colors group"
              >
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Veckoplanering</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Redigera varje veckas innehåll, texter och videos</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-[var(--primary-green)] rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/admin/meal-plans?course=${params.courseId}`}
                className="flex items-center justify-between p-4 bg-[var(--primary-beige)] rounded-lg hover:bg-[var(--primary-beige)]/80 transition-colors group"
              >
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Måltidsplaner</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera veckans recept och måltider</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-[var(--primary-green)] rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/admin/shopping-lists?course=${params.courseId}`}
                className="flex items-center justify-between p-4 bg-[var(--primary-beige)] rounded-lg hover:bg-[var(--primary-beige)]/80 transition-colors group"
              >
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Inköpslistor</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Redigera veckans inköpslistor</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-[var(--primary-green)] rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/admin/knowledge?course=${params.courseId}`}
                className="flex items-center justify-between p-4 bg-[var(--primary-beige)] rounded-lg hover:bg-[var(--primary-beige)]/80 transition-colors group"
              >
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Kunskapsdokument</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera kursmaterial och artiklar</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-[var(--primary-green)] rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Statistik</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Aktiva deltagare</span>
                <span className="font-medium text-[var(--text-primary)]">{course.enrollments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Veckor</span>
                <span className="font-medium text-[var(--text-primary)]">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Recept</span>
                <span className="font-medium text-[var(--text-primary)]">84</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Kunskapsdokument</span>
                <span className="font-medium text-[var(--text-primary)]">18</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Snabbåtgärder</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/courses/${params.courseId}/oversikt`}
                className="admin-btn admin-btn-secondary w-full justify-center"
              >
                <Eye className="w-4 h-4" />
                Visa kursöversikt
              </Link>
              
              <Link
                href={`/admin/courses/${params.courseId}/students`}
                className="admin-btn admin-btn-secondary w-full justify-center"
              >
                Hantera deltagare
              </Link>
              
              <Link
                href={`/admin/reviews?course=${params.courseId}`}
                className="admin-btn admin-btn-secondary w-full justify-center"
              >
                Visa recensioner
              </Link>
            </div>
          </div>

          {/* Course Status */}
          <div className="admin-card">
            <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Kursstatus</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[var(--text-primary)]">Aktiv</span>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {}}
                  className="sr-only"
                />
                <div className="relative">
                  <div className="block w-10 h-6 bg-[var(--primary-green)] rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[var(--text-primary)]">Synlig i katalog</span>
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {}}
                  className="sr-only"
                />
                <div className="relative">
                  <div className="block w-10 h-6 bg-[var(--primary-green)] rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}