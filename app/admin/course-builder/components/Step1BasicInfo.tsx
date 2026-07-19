'use client';

import { useState, useEffect } from 'react';
import { Info, Loader2 } from 'lucide-react';
import type { CourseDraftData } from '../[id]/step/[stepNumber]/page';

interface Step1Props {
  draft: CourseDraftData;
  onUpdate: (updates: Partial<CourseDraftData>) => void;
  onSave: (updates: Partial<CourseDraftData>) => Promise<boolean>;
  saving: boolean;
}

const DURATION_PRESETS = [
  { value: 1, label: '1 vecka', description: 'Perfekt för provvecka eller introduktion' },
  { value: 2, label: '2 veckor', description: 'Kort intensivkurs' },
  { value: 4, label: '4 veckor', description: 'Standardkurs' },
  { value: 6, label: '6 veckor', description: 'Full kurs (rekommenderas)' },
  { value: 8, label: '8 veckor', description: 'Utökad kurs' },
  { value: 12, label: '12 veckor', description: 'Långkurs' },
];

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
  if (value.trim() === '') return null;
  return new Date(value).toISOString();
};

export default function Step1BasicInfo({ draft, onUpdate, onSave, saving }: Step1Props) {
  const [formData, setFormData] = useState({
    title: draft.title || '',
    description: draft.description || '',
    price: draft.price || 0,
    salePrice: draft.salePrice ?? null,
    saleStartsAt: draft.saleStartsAt ?? null,
    saleEndsAt: draft.saleEndsAt ?? null,
    weeksCount: draft.weeksCount || 6,
    level: draft.level || 'Beginner',
    targetAudience: draft.targetAudience || '',
  });

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      const duration = `${formData.weeksCount} ${formData.weeksCount === 1 ? 'vecka' : 'veckor'}`;
      onUpdate({ ...formData, duration });
    }, 500);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const duration = `${formData.weeksCount} ${formData.weeksCount === 1 ? 'vecka' : 'veckor'}`;
    await onSave({ ...formData, duration });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Grundläggande information
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Fyll i de grundläggande uppgifterna för din nya kurs
        </p>
      </div>

      {/* Course name */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Kursnamn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="t.ex. Functional Provvecka eller Functional Balance"
          className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
        />
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Detta namn visas för kunderna
        </p>
      </div>

      {/* Duration - IMPORTANT for trial week */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Kurslängd <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleChange('weeksCount', preset.value)}
              className={`p-4 border rounded-xl text-left transition-all ${
                formData.weeksCount === preset.value
                  ? 'border-[var(--primary-green)] bg-[var(--primary-green)]/5 ring-2 ring-[var(--primary-green)]/20'
                  : 'border-[var(--border-light)] hover:border-[var(--primary-green)]/50'
              }`}
            >
              <div className="font-medium text-[var(--text-primary)]">
                {preset.label}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
        
        {/* Custom duration */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">Eller ange antal veckor:</span>
          <input
            type="number"
            min="1"
            max="52"
            value={formData.weeksCount}
            onChange={(e) => handleChange('weeksCount', parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all text-center"
          />
          <span className="text-sm text-[var(--text-secondary)]">veckor</span>
        </div>

        {formData.weeksCount === 1 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Tips:</strong> 1 vecka är perfekt för en provvecka/smakprov som kan användas för att locka nya kunder!
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Beskrivning <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Beskriv vad kursen handlar om och vad deltagarna kommer att lära sig..."
          rows={4}
          className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all resize-none"
        />
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Ordinarie pris (SEK) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
              kr
            </span>
          </div>
          {formData.weeksCount === 1 && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Provveckor kan vara gratis (0 kr) eller till reducerat pris
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Kampanjpris (valfritt)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={formData.salePrice ?? ''}
              onChange={(e) => handleChange('salePrice', e.target.value.trim() === '' ? null : parseInt(e.target.value))}
              placeholder="Lämna tomt om inget kampanjpris"
              className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
              kr
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Kampanj start
              </label>
              <input
                type="datetime-local"
                value={toDateTimeLocal(formData.saleStartsAt)}
                onChange={(e) => handleChange('saleStartsAt', fromDateTimeLocal(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Kampanj slut
              </label>
              <input
                type="datetime-local"
                value={toDateTimeLocal(formData.saleEndsAt)}
                onChange={(e) => handleChange('saleEndsAt', fromDateTimeLocal(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Lämna datumen tomma om kampanjpriset ska gälla utan schemalagd period.
          </p>
        </div>
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Nivå
        </label>
        <div className="flex gap-3">
          {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleChange('level', level)}
              className={`px-4 py-2 border rounded-lg transition-all ${
                formData.level === level
                  ? 'border-[var(--primary-green)] bg-[var(--primary-green)]/5 text-[var(--primary-green)]'
                  : 'border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--primary-green)]/50'
              }`}
            >
              {level === 'Beginner' ? 'Nybörjare' : level === 'Intermediate' ? 'Medel' : 'Avancerad'}
            </button>
          ))}
        </div>
      </div>

      {/* Target audience */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Målgrupp
        </label>
        <input
          type="text"
          value={formData.targetAudience}
          onChange={(e) => handleChange('targetAudience', e.target.value)}
          placeholder="t.ex. Personer som vill förbättra sin energi och minska stress"
          className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
        />
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)]">
          Ändringar sparas automatiskt
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
