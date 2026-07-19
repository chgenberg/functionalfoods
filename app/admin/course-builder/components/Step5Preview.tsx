'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Check, 
  AlertTriangle, 
  Loader2,
  Calendar,
  Target,
  Image as ImageIcon,
  Video,
  Users,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import type { CourseDraftData } from '../[id]/step/[stepNumber]/page';
import { isCourseSaleActive } from '@/app/lib/course-pricing';

interface Step5Props {
  draft: CourseDraftData;
  onUpdate: (updates: Partial<CourseDraftData>) => void;
  onSave: (updates: Partial<CourseDraftData>) => Promise<boolean>;
  saving: boolean;
}

export default function Step5Preview({ draft, onUpdate, onSave, saving }: Step5Props) {
  const [publishing, setPublishing] = useState(false);

  const getMealCount = () => {
    return draft.weeks?.reduce((total, week) => {
      return total + week.days.reduce((dayTotal, day) => {
        return dayTotal + Object.keys(day.meals).length;
      }, 0);
    }, 0) || 0;
  };

  const getCompletionStatus = () => {
    const checks = [
      { label: 'Kursnamn', ok: !!draft.title?.trim(), required: true },
      { label: 'Beskrivning', ok: !!draft.description?.trim(), required: true },
      { label: 'Pris', ok: draft.price !== undefined, required: true },
      { label: 'Kursmål', ok: (draft.objectives?.filter(o => o.trim()).length || 0) > 0, required: false },
      { label: 'Features', ok: (draft.features?.filter(f => f.trim()).length || 0) > 0, required: false },
      { label: 'Omslagsbild', ok: !!draft.coverImage, required: false },
      { label: 'Introduktionsvideo', ok: !!draft.introVideoUrl, required: false },
      { label: 'Välkomstmeddelande', ok: !!draft.welcomeMessage?.trim(), required: false },
      { label: 'Kostscheman', ok: getMealCount() > 0, required: true },
    ];

    const required = checks.filter(c => c.required);
    const optional = checks.filter(c => !c.required);
    const requiredOk = required.every(c => c.ok);
    const optionalOk = optional.filter(c => c.ok).length;

    return {
      checks,
      requiredOk,
      optionalOk,
      optionalTotal: optional.length,
      canPublish: requiredOk
    };
  };

  const status = getCompletionStatus();
  const saleActive = isCourseSaleActive(draft);

  const handlePublish = async () => {
    if (!status.canPublish) return;

    try {
      setPublishing(true);
      const success = await onSave({ ...draft, status: 'published' });
      
      if (success) {
        alert(`✅ Kursen "${draft.title}" har publicerats!\n\nKursen är nu tillgänglig för köp.`);
      }
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Förhandsgranska & publicera
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Granska din kurs innan publicering
        </p>
      </div>

      {/* Full preview button */}
      <div className="bg-gradient-to-r from-[#014421] to-[#016d3a] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Testa kursen som kund</h3>
            <p className="text-white/70 text-sm mt-1">
              Se produktsidan, dashboard och veckovyn precis som kunderna kommer se dem
            </p>
          </div>
          <Link
            href={`/admin/course-builder/${draft.id}/preview`}
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#014421] rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Öppna förhandsvisning
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Completion status */}
      <div className={`rounded-xl p-4 ${
        status.canPublish 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {status.canPublish ? (
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          )}
          <div>
            <p className={`font-medium ${status.canPublish ? 'text-green-800' : 'text-yellow-800'}`}>
              {status.canPublish 
                ? 'Kursen är redo att publiceras!' 
                : 'Några saker saknas innan publicering'}
            </p>
            <p className={`text-sm mt-1 ${status.canPublish ? 'text-green-700' : 'text-yellow-700'}`}>
              {status.optionalOk}/{status.optionalTotal} valfria fält ifyllda
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-[var(--border-light)] rounded-xl divide-y divide-[var(--border-light)]">
        {status.checks.map((check, index) => (
          <div key={index} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                check.ok 
                  ? 'bg-green-100 text-green-600' 
                  : check.required 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {check.ok ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span className={`text-sm ${check.ok ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {check.label}
              </span>
              {check.required && (
                <span className="text-xs text-red-500">*</span>
              )}
            </div>
            <span className={`text-xs ${check.ok ? 'text-green-600' : 'text-gray-400'}`}>
              {check.ok ? 'Klar' : check.required ? 'Krävs' : 'Valfri'}
            </span>
          </div>
        ))}
      </div>

      {/* Course preview */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
          Kursöversikt
        </h3>
        
        <div className="bg-gray-50 border border-[var(--border-light)] rounded-xl p-4 space-y-4">
          {/* Cover image */}
          {draft.coverImage ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
              <img 
                src={draft.coverImage} 
                alt={draft.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-gray-200 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Title and description */}
          <div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">
              {draft.title || 'Kursnamn saknas'}
            </h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {draft.description || 'Beskrivning saknas'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <Calendar className="w-5 h-5 text-[var(--primary-green)] mx-auto mb-1" />
              <p className="text-lg font-semibold">{draft.weeksCount || 0}</p>
              <p className="text-xs text-[var(--text-secondary)]">Veckor</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <BookOpen className="w-5 h-5 text-[var(--primary-green)] mx-auto mb-1" />
              <p className="text-lg font-semibold">{getMealCount()}</p>
              <p className="text-xs text-[var(--text-secondary)]">Måltider</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <Target className="w-5 h-5 text-[var(--primary-green)] mx-auto mb-1" />
              <p className="text-lg font-semibold">{draft.objectives?.filter(o => o.trim()).length || 0}</p>
              <p className="text-xs text-[var(--text-secondary)]">Kursmål</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <Video className="w-5 h-5 text-[var(--primary-green)] mx-auto mb-1" />
              <p className="text-lg font-semibold">{draft.introVideoUrl ? '1' : '0'}</p>
              <p className="text-xs text-[var(--text-secondary)]">Video</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between bg-white rounded-lg p-3">
            <span className="text-sm text-[var(--text-secondary)]">Pris</span>
            <div className="text-right">
              {saleActive ? (
                <>
                  <span className="text-lg font-semibold text-[var(--primary-green)]">
                    {draft.salePrice} kr
                  </span>
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {draft.price} kr
                  </span>
                </>
              ) : (
                <span className="text-lg font-semibold text-[var(--primary-green)]">
                  {draft.price || 0} kr
                </span>
              )}
            </div>
          </div>

          {/* Features */}
          {draft.features && draft.features.filter(f => f.trim()).length > 0 && (
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                Vad som ingår:
              </p>
              <ul className="space-y-1">
                {draft.features.filter(f => f.trim()).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Community */}
          {draft.enableCommunity && (
            <div className="flex items-center gap-2 bg-white rounded-lg p-3">
              <Users className="w-5 h-5 text-[var(--primary-green)]" />
              <span className="text-sm text-[var(--text-primary)]">Community ingår</span>
            </div>
          )}
        </div>
      </div>

      {/* Publish button */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)]">
          {draft.status === 'published' 
            ? '✓ Kursen är publicerad'
            : status.canPublish 
              ? 'Redo att publicera' 
              : 'Fyll i alla obligatoriska fält först'}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => onSave(draft)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Spara utkast'
            )}
          </button>

          <button
            onClick={handlePublish}
            disabled={!status.canPublish || publishing || draft.status === 'published'}
            className={`inline-flex items-center gap-2 px-6 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
              draft.status === 'published'
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-[var(--primary-green)] text-white hover:bg-[#012a14]'
            }`}
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publicerar...
              </>
            ) : draft.status === 'published' ? (
              <>
                <Check className="w-4 h-4" />
                Publicerad
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Publicera kurs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
