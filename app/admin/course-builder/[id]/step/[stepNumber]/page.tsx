'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check,
  Loader2,
  BookOpen,
  Target,
  Image,
  Calendar,
  Eye
} from 'lucide-react';

// Step components
import Step1BasicInfo from '../../../components/Step1BasicInfo';
import Step2Goals from '../../../components/Step2Goals';
import Step3Media from '../../../components/Step3Media';
import Step4Weeks from '../../../components/Step4Weeks';
import Step5Preview from '../../../components/Step5Preview';

const STEPS = [
  { number: 1, title: 'Grundinfo', icon: BookOpen, description: 'Namn, pris och längd' },
  { number: 2, title: 'Kursmål', icon: Target, description: 'Mål och features' },
  { number: 3, title: 'Media', icon: Image, description: 'Bilder och video' },
  { number: 4, title: 'Veckostruktur', icon: Calendar, description: 'Kostscheman' },
  { number: 5, title: 'Publicera', icon: Eye, description: 'Granska och publicera' },
];

export interface CourseDraftData {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number | null;
  duration: string;
  weeksCount: number;
  level: string;
  targetAudience: string;
  objectives: string[];
  features: string[];
  coverImage: string;
  introVideoUrl: string;
  welcomeMessage: string;
  enableCommunity: boolean;
  communityDescription: string;
  weeks: WeekData[];
  status: 'draft' | 'published';
  currentStep: number;
}

export interface WeekData {
  weekNumber: number;
  title: string;
  subtitle?: string;
  videoUrl?: string;
  welcomeMessage?: string;
  keyTakeaways: string[];
  knowledgeDocuments?: LinkedDocument[];
  days: DayData[];
}

export interface LinkedDocument {
  id: string;
  title: string;
  slug: string;
  type: 'knowledge';
}

export interface DayData {
  dayName: string;
  meals: {
    breakfast?: MealData;
    lunch?: MealData;
    dinner?: MealData;
    snack?: MealData;
    dessert?: MealData;
  };
}

export interface MealData {
  name: string;
  recipeId?: string;
  recipeLink?: string;
  note?: string;
}

export default function CourseBuilderStepPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const stepNumber = parseInt(params.stepNumber as string, 10);

  const [draft, setDraft] = useState<CourseDraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchDraft();
    }
  }, [courseId]);

  const fetchDraft = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/course-builder/drafts/${courseId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Kunde inte hämta kursutkastet');
      }

      const data = await response.json();
      setDraft(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (updates: Partial<CourseDraftData>) => {
    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/admin/course-builder/drafts/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...updates,
          currentStep: Math.max(stepNumber, draft?.currentStep || 1)
        })
      });

      if (!response.ok) {
        throw new Error('Kunde inte spara');
      }

      const data = await response.json();
      setDraft(data);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goToStep = async (step: number, saveFirst = true) => {
    if (saveFirst && draft) {
      // The step component should handle saving before navigation
    }
    router.push(`/admin/course-builder/${courseId}/step/${step}`);
  };

  const handleNext = async () => {
    if (stepNumber < 5) {
      goToStep(stepNumber + 1);
    }
  };

  const handlePrevious = () => {
    if (stepNumber > 1) {
      goToStep(stepNumber - 1, false);
    }
  };

  const updateDraft = (updates: Partial<CourseDraftData>) => {
    if (draft) {
      setDraft({ ...draft, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] mt-3">Laddar kurs...</p>
        </div>
      </div>
    );
  }

  if (error && !draft) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700">{error}</p>
        <Link
          href="/admin/course-builder"
          className="inline-flex items-center gap-2 mt-4 text-sm text-red-600 hover:text-red-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till Course Builder
        </Link>
      </div>
    );
  }

  if (!draft) return null;

  const currentStep = STEPS.find(s => s.number === stepNumber);

  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/course-builder"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {draft.title || 'Ny kurs'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Steg {stepNumber} av 5: {currentStep?.title}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(step.number, false)}
                className={`flex flex-col items-center flex-shrink-0 ${
                  step.number <= (draft.currentStep || 1) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={step.number > (draft.currentStep || 1) + 1}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-colors
                  ${step.number < stepNumber 
                    ? 'bg-green-500 text-white' 
                    : step.number === stepNumber 
                      ? 'bg-[var(--primary-green)] text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  {step.number < stepNumber ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${
                  step.number === stepNumber 
                    ? 'text-[var(--primary-green)] font-medium' 
                    : 'text-[var(--text-secondary)]'
                }`}>
                  {step.title}
                </span>
              </button>
              
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step.number < stepNumber 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl">
        {stepNumber === 1 && (
          <Step1BasicInfo
            draft={draft}
            onUpdate={updateDraft}
            onSave={saveDraft}
            saving={saving}
          />
        )}
        {stepNumber === 2 && (
          <Step2Goals
            draft={draft}
            onUpdate={updateDraft}
            onSave={saveDraft}
            saving={saving}
          />
        )}
        {stepNumber === 3 && (
          <Step3Media
            draft={draft}
            onUpdate={updateDraft}
            onSave={saveDraft}
            saving={saving}
          />
        )}
        {stepNumber === 4 && (
          <Step4Weeks
            draft={draft}
            onUpdate={updateDraft}
            onSave={saveDraft}
            saving={saving}
          />
        )}
        {stepNumber === 5 && (
          <Step5Preview
            draft={draft}
            onUpdate={updateDraft}
            onSave={saveDraft}
            saving={saving}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between bg-white border border-[var(--border-light)] rounded-xl p-4">
        <button
          onClick={handlePrevious}
          disabled={stepNumber === 1}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            stepNumber === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-[var(--text-secondary)] hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Föregående
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => saveDraft(draft)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Spara utkast
          </button>

          {stepNumber < 5 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors"
            >
              Nästa steg
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => saveDraft({ ...draft, status: 'published' })}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Publicera kurs
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
