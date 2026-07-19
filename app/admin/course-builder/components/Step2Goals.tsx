'use client';

import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Loader2 } from 'lucide-react';
import type { CourseDraftData } from '../[id]/step/[stepNumber]/page';

interface Step2Props {
  draft: CourseDraftData;
  onUpdate: (updates: Partial<CourseDraftData>) => void;
  onSave: (updates: Partial<CourseDraftData>) => Promise<boolean>;
  saving: boolean;
}

const toEditableString = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';

  const candidate = value as Record<string, unknown>;
  for (const key of ['title', 'text', 'label', 'name', 'description']) {
    if (typeof candidate[key] === 'string') return candidate[key] as string;
  }

  return '';
};

const toEditableList = (value: unknown) => {
  const items = Array.isArray(value) ? value : [];
  const normalized = items.map(toEditableString).filter(item => item.trim() !== '');
  return normalized.length > 0 ? normalized : [''];
};

const filledItems = (items: unknown[]) =>
  items.map(toEditableString).filter(item => item.trim() !== '');

export default function Step2Goals({ draft, onUpdate, onSave, saving }: Step2Props) {
  const [objectives, setObjectives] = useState<string[]>(
    toEditableList(draft.objectives)
  );
  const [features, setFeatures] = useState<string[]>(
    toEditableList(draft.features)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate({
        objectives: filledItems(objectives),
        features: filledItems(features)
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [objectives, features]);

  const addObjective = () => setObjectives([...objectives, '']);
  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      setObjectives(objectives.filter((_, i) => i !== index));
    }
  };
  const updateObjective = (index: number, value: string) => {
    const updated = [...objectives];
    updated[index] = value;
    setObjectives(updated);
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };
  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleSave = async () => {
    await onSave({
      objectives: filledItems(objectives),
      features: filledItems(features)
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Kursmål & innehåll
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Beskriv vad deltagarna kommer att lära sig och vad som ingår
        </p>
      </div>

      {/* Objectives */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Kursmål
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Vad kommer deltagarna kunna eller förstå efter kursen?
        </p>
        
        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
              <input
                type="text"
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                placeholder={`Mål ${index + 1}, t.ex. "Förstå hur maten påverkar blodsockret"`}
                className="flex-1 px-4 py-2.5 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
              />
              <button
                type="button"
                onClick={() => removeObjective(index)}
                disabled={objectives.length === 1}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addObjective}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--primary-green)] hover:bg-[var(--primary-green)]/5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Lägg till mål
        </button>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Vad ingår i kursen
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Lista vad deltagarna får tillgång till
        </p>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder={`t.ex. "${index === 0 ? 'Kompletta kostscheman för varje dag' : index === 1 ? 'Över 50 unika recept' : 'Kunskapsdokument och artiklar'}"`}
                className="flex-1 px-4 py-2.5 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                disabled={features.length === 1}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFeature}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--primary-green)] hover:bg-[var(--primary-green)]/5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Lägg till innehåll
        </button>
      </div>

      {/* Common features suggestions */}
      <div className="bg-gray-50 border border-[var(--border-light)] rounded-xl p-4">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
          Förslag på innehåll att inkludera:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'Kompletta kostscheman',
            'Unika recept',
            'Inköpslistor',
            'Kunskapsdokument',
            'Community-tillgång',
            'Personlig coachning',
            'Video-lektioner',
            'Hälsoverktyg'
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                if (!features.includes(suggestion)) {
                  setFeatures([...filledItems(features), suggestion]);
                }
              }}
              className="px-3 py-1 text-xs bg-white border border-[var(--border-light)] rounded-full hover:border-[var(--primary-green)] transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)]">
          {filledItems(objectives).length} mål, {filledItems(features).length} innehållspunkter
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
