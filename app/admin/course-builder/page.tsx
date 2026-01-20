'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Clock, 
  Users, 
  ChevronRight,
  FileText,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface CourseDraft {
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
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<CourseDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/course-builder/drafts', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
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

  const deleteDraft = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta utkast?')) return;
    
    try {
      const response = await fetch(`/api/admin/course-builder/drafts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setDrafts(drafts.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const getStepLabel = (step: number) => {
    const steps = [
      'Grundinfo',
      'Kursmål',
      'Media',
      'Veckostruktur',
      'Förhandsvisning'
    ];
    return steps[step - 1] || 'Okänt steg';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Course Builder
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Skapa nya kurser steg för steg
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

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Hur Course Builder fungerar:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Fyll i grundläggande information om kursen</li>
              <li>Ange kursmål och vad som ingår</li>
              <li>Lägg till bilder och videor</li>
              <li>Bygg veckostrukturen med kostscheman</li>
              <li>Förhandsgranska och publicera</li>
            </ol>
            <p className="mt-2 text-xs">
              <strong>OBS:</strong> Befintliga kurser påverkas INTE. Detta skapar helt nya kurser.
            </p>
          </div>
        </div>
      </div>

      {/* Drafts list */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl">
        <div className="p-4 border-b border-[var(--border-light)]">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">
            Kursutkast
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Fortsätt arbeta med påbörjade kurser
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-secondary)] mt-3">Laddar utkast...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">Inga kursutkast ännu</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Klicka på "Skapa ny kurs" för att börja
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-light)]">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">
                        {draft.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        draft.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {draft.status === 'published' ? 'Publicerad' : 'Utkast'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {draft.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {draft.weeksCount} veckor
                      </span>
                      <span>
                        Steg {draft.currentStep}/5: {getStepLabel(draft.currentStep)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/course-builder/${draft.id}/step/${draft.currentStep}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Fortsätt
                    </Link>
                    {draft.status === 'published' && (
                      <Link
                        href={`/utbildning/${draft.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visa
                      </Link>
                    )}
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Ta bort utkast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick link to existing courses */}
      <div className="bg-gray-50 border border-[var(--border-light)] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Hantera befintliga kurser
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Redigera publicerade kurser (Functional Basics, Flow, Energy, Hormonell Balans)
            </p>
          </div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
          >
            Gå till kurser
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
