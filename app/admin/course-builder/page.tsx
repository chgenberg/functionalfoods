'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Clock, 
  ChevronRight,
  FileText,
  Trash2,
  Edit,
  Eye,
  Check,
  Users,
  Calendar
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  duration: string;
  price: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  weeksCount: number;
  hasBuilderData: boolean;
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/course-builder/drafts?includePublished=true', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.drafts || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/admin/course-builder/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Ny kurs (utkast)',
          duration: '6 veckor'
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/course-builder/${data.id}/step/1`);
      }
    } catch (error) {
      console.error('Error creating draft:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteDraft = async (id: string, status: string) => {
    if (status === 'published') {
      alert('Publicerade kurser kan inte tas bort. Kontakta support om du behöver arkivera en kurs.');
      return;
    }
    
    if (!confirm('Är du säker på att du vill ta bort detta utkast?')) return;
    
    try {
      const response = await fetch(`/api/admin/course-builder/drafts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const getStepLabel = (step: number) => {
    const steps = ['Grundinfo', 'Kursmål', 'Media', 'Veckostruktur', 'Publicera'];
    return steps[step - 1] || 'Okänt steg';
  };

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return course.status === 'published';
    if (activeTab === 'drafts') return course.status === 'draft';
    return true;
  });

  const publishedCount = courses.filter(c => c.status === 'published').length;
  const draftCount = courses.filter(c => c.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Kurshantering
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Redigera och skapa kurser steg för steg
          </p>
        </div>
        <button
          onClick={createNewDraft}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors disabled:opacity-50"
        >
          {creating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Skapar...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Skapa ny kurs
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{publishedCount}</p>
              <p className="text-xs text-[var(--text-secondary)]">Publicerade</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{draftCount}</p>
              <p className="text-xs text-[var(--text-secondary)]">Utkast</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{courses.length}</p>
              <p className="text-xs text-[var(--text-secondary)]">Totalt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-light)]">
        {[
          { key: 'all', label: 'Alla kurser', count: courses.length },
          { key: 'published', label: 'Publicerade', count: publishedCount },
          { key: 'drafts', label: 'Utkast', count: draftCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[var(--primary-green)] text-[var(--primary-green)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.key
                ? 'bg-[var(--primary-green)] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Course list */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-secondary)] mt-3">Laddar kurser...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">
              {activeTab === 'drafts' ? 'Inga utkast' : activeTab === 'published' ? 'Inga publicerade kurser' : 'Inga kurser ännu'}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Klicka på "Skapa ny kurs" för att börja
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-light)]">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-[var(--text-primary)]">
                        {course.title}
                      </h3>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        course.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {course.status === 'published' ? '✓ Publicerad' : '◐ Utkast'}
                      </span>
                    </div>
                    
                    {course.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {course.weeksCount} veckor
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="font-medium text-[var(--primary-green)]">
                        {course.price} kr
                      </span>
                      {course.status === 'draft' && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          Steg {course.currentStep}/5: {getStepLabel(course.currentStep)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/course-builder/${course.id}/step/1`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Redigera
                    </Link>
                    
                    {course.status === 'published' && (
                      <Link
                        href={`/utbildning/${course.title.toLowerCase().replace(/\s+/g, '-').replace(/[åä]/g, 'a').replace(/ö/g, 'o')}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] hover:text-[var(--primary-green)] transition-colors"
                        title="Visa på hemsidan"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    
                    {course.status === 'draft' && (
                      <button
                        onClick={() => deleteDraft(course.id, course.status)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Ta bort utkast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Hur redigering fungerar:</p>
            <div className="grid sm:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold">1</span>
                <span>Grundinfo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold">2</span>
                <span>Kursmål</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold">3</span>
                <span>Media</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold">4</span>
                <span>Kostscheman</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold">5</span>
                <span>Publicera</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-600">
              💡 Tips: Klicka på "Redigera" för att gå direkt till steg-för-steg-redigeringen. Alla ändringar synkas automatiskt när du publicerar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
