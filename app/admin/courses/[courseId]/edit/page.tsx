'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, AlertCircle, Calendar, BookOpen, ShoppingCart, FileText, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  level: string;
  enrollments?: number;
  basePrice?: number | null;
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
}

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Helpers for momsvisning (25%) must be defined before any hooks that use them
  const toIncl = (ex?: number | null) => ex != null ? Math.round(ex * 1.25) : '';
  const fromIncl = (incl: number) => Math.round(incl / 1.25);

  // IMPORTANT: Hooks must not be called after conditional returns.
  // Compute memoized price BEFORE any early returns to keep hooks order stable.
  const activeInclPrice = useMemo(() => {
    const ex = ((course?.salePrice ?? course?.basePrice ?? course?.price) as number) || 0;
    return toIncl(ex);
  }, [course]);

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Hämta verklig kursdata från API
      const response = await fetch('/api/admin/functional-courses', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const courses = await response.json();
      const courseData = courses.find((c: Course) => c.id === params.courseId);
      
      if (courseData) {
        setCourse(courseData);
      } else {
        // Fallback om kursen inte hittas
        setCourse(null);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setCourse(null);
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
      },
      'hormonell-balans': {
        name: 'Hormonell Balans',
        description: 'Kurs för hormonell balans',
        level: 'Medel',
        enrollments: 0
      },
      'functional-hormone': {
        name: 'Hormonell Balans',
        description: 'Kurs för hormonell balans',
        level: 'Medel',
        enrollments: 0
      }
    };
    return courses[courseId as keyof typeof courses] || courses['functional-basics'];
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      // Spara verklig data via API
      // For admin display/save, prefer salePrice if present; otherwise basePrice, otherwise existing price
      const activeExPrice = ((course?.salePrice ?? course?.basePrice ?? course?.price) as number) || 0;
      const response = await fetch('/api/admin/functional-courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: params.courseId,
          price: activeExPrice,
          // Preserve explicit nulls so admin can clear campaign fields.
          basePrice: course?.basePrice === null ? null : course?.basePrice,
          salePrice: course?.salePrice === null ? null : course?.salePrice,
          saleStartsAt: course?.saleStartsAt === null || course?.saleStartsAt === '' ? null : course?.saleStartsAt,
          saleEndsAt: course?.saleEndsAt === null || course?.saleEndsAt === '' ? null : course?.saleEndsAt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      setSuccessMessage('Kursen har sparats!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
      setSuccessMessage('Ett fel uppstod vid sparning');
      setTimeout(() => setSuccessMessage(''), 3000);
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

  // (helpers moved above to ensure hooks run before returns)

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-[var(--primary-beige)] rounded-lg p-4">
              <span className="text-[var(--text-secondary)] block">Aktuellt pris (inkl. moms)</span>
              <span className="font-semibold text-lg text-[var(--text-primary)]">{activeInclPrice} kr</span>
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
            <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">Prissättning</h2>
            
            <div className="space-y-6">
              {/* Campaign pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="admin-label">Ordinarie pris (exkl. moms)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={(course as any).basePrice ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.trim() === '' ? null : parseFloat(e.target.value);
                      setCourse(prev => prev ? ({ ...prev, basePrice: (v === null || isNaN(v)) ? null : v } as any) : null);
                    }}
                    className="admin-input"
                    placeholder="1836"
                  />
                  <p className="text-xs text-gray-500 mt-1">Inkl. moms: {toIncl((course as any).basePrice ?? null) || '—'} kr</p>
                </div>
                <div>
                  <label className="admin-label">Kampanjpris (exkl. moms)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={(course as any).salePrice ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.trim() === '' ? null : parseFloat(e.target.value);
                      setCourse(prev => prev ? ({ ...prev, salePrice: (v === null || isNaN(v)) ? null : v } as any) : null);
                    }}
                    className="admin-input"
                    placeholder="1468"
                  />
                  <p className="text-xs text-gray-500 mt-1">Inkl. moms: {toIncl((course as any).salePrice ?? null) || '—'} kr</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-1">
                  <div>
                    <label className="admin-label">Kampanj start</label>
                    <input
                      type="datetime-local"
                      value={(course as any).saleStartsAt ?? ''}
                      onChange={(e) => setCourse(prev => prev ? ({ ...prev, saleStartsAt: e.target.value } as any) : null)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Kampanj slut</label>
                    <input
                      type="datetime-local"
                      value={(course as any).saleEndsAt ?? ''}
                      onChange={(e) => setCourse(prev => prev ? ({ ...prev, saleEndsAt: e.target.value } as any) : null)}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content Management */}
          <div className="admin-card">
            <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">Kursinnehåll</h2>
            
            <div className="space-y-4">
              {params.courseId === 'hormonell-balans' && (
                <Link
                  href="/admin/hormone"
                  className="group relative flex items-center justify-between p-6 bg-white rounded-xl border-2 border-[#93C560] hover:border-[#014421] hover:shadow-lg transition-all overflow-hidden"
                  style={{background: 'linear-gradient(135deg, #F3EFE3 0%, #FEFDF9 100%)'}}
                >
                  <div className="relative z-10">
                    <h3 className="font-semibold text-[#014421] text-xl mb-2">Förenklad kurshantering</h3>
                    <p className="text-sm text-gray-600">Hantera allt innehåll för Hormonell Balans på ett ställe - minimalistisk och effektiv</p>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#014421]/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-[#014421]/20 transition-all">
                    <ChevronRight className="w-7 h-7 text-[#014421]" />
                  </div>
                </Link>
              )}
              
              <Link
                href={`/admin/courses/${params.courseId}/manage`}
                className="group relative flex items-center justify-between p-6 bg-gradient-to-br from-white to-[var(--primary-beige)]/50 rounded-xl border-2 border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="font-semibold text-[var(--primary-green)] text-lg mb-1">📋 Översikt kursinnehåll</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Visa kostscheman, recept, inköpslistor och kunskapsdokument</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
                  <ChevronRight className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                </div>
              </Link>

              <Link
                href={`/admin/courses/${params.courseId}/manage-recipes`}
                className="group relative flex items-center justify-between p-5 bg-gradient-to-br from-white to-[var(--primary-beige)]/30 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-[var(--primary-green)] mb-1">Hantera recept för kursen</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Tagga/avtagga recept som ska ingå i kostscheman</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
                  <BookOpen className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                </div>
              </Link>
              <Link
                href={`/admin/courses/${params.courseId}/weeks`}
                className="group relative flex items-center justify-between p-5 bg-gradient-to-br from-white to-[var(--primary-beige)]/30 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="font-semibold text-[var(--primary-green)] text-lg mb-1">Veckoplanering</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Redigera varje veckas innehåll, texter och videos</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
                  <Calendar className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                </div>
              </Link>

              <Link
                href={`/admin/meal-plans?course=${params.courseId}`}
                className="group relative flex items-center justify-between p-5 bg-gradient-to-br from-white to-[var(--primary-beige)]/30 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="font-semibold text-[var(--primary-green)] text-lg mb-1">Måltidsplaner</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Hantera veckans recept och måltider</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
                  <ShoppingCart className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                </div>
              </Link>

              <Link
                href={`/admin/shopping-lists?course=${params.courseId}`}
                className="group relative flex items-center justify-between p-5 bg-gradient-to-br from-white to-[var(--primary-beige)]/30 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="font-semibold text-[var(--primary-green)] text-lg mb-1">Inköpslistor</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Redigera veckans inköpslistor</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
                  <FileText className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                </div>
              </Link>

              <Link
                href={`/admin/knowledge?course=${
                  {
                    'functional-basics': 'basic',
                    'functional-flow': 'flow',
                    'functional-energy': 'energy',
                    'hormonell-balans': 'hormone'
                  }[params.courseId] || 'basic'
                }`}
                className="group relative flex items-center justify-between p-5 bg-gradient-to-br from-white to-[var(--primary-beige)]/30 rounded-xl border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="font-semibold text-[var(--primary-green)] text-lg mb-1">Kunskapsdokument</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Hantera kursmaterial och artiklar</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
                  <BookOpen className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
                </div>
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

          {/* Removed decorative Course Status toggles to reduce clutter */}
        </div>
      </div>
    </div>
  );
}
