'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Loader2, Video } from 'lucide-react';
import type { CourseDraftData } from '../[id]/step/[stepNumber]/page';
import CloudinaryUpload from '@/app/components/CloudinaryUpload';

interface Step3Props {
  draft: CourseDraftData;
  onUpdate: (updates: Partial<CourseDraftData>) => void;
  onSave: (updates: Partial<CourseDraftData>) => Promise<boolean>;
  saving: boolean;
}

export default function Step3Media({ draft, onUpdate, onSave, saving }: Step3Props) {
  const [formData, setFormData] = useState({
    coverImage: draft.coverImage || '',
    introVideoUrl: draft.introVideoUrl || '',
    welcomeMessage: draft.welcomeMessage || '',
    enableCommunity: draft.enableCommunity || false,
    communityDescription: draft.communityDescription || '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(formData);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUploadComplete = (url: string) => {
    handleChange('coverImage', url);
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Media & välkomsttext
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Lägg till bilder, video och välkomstmeddelande
        </p>
      </div>

      {/* Cover image */}
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Denna bild visas på kurskortet och produktsidan
        </p>

        <div className="max-w-md">
          <CloudinaryUpload
            onUploadComplete={handleImageUploadComplete}
            folder="courses"
            currentImage={formData.coverImage}
            label="Omslagsbild"
            aspectRatio="16:9"
          />
        </div>

        {/* Or enter URL */}
        <div className="mt-3 flex items-center gap-2 max-w-md">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => handleChange('coverImage', e.target.value)}
            placeholder="Eller klistra in bild-URL"
            className="flex-1 px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
          />
        </div>
      </div>

      {/* Intro video */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Introduktionsvideo
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Vimeo eller YouTube-länk till en introduktionsvideo
        </p>

        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-gray-400" />
          <input
            type="url"
            value={formData.introVideoUrl}
            onChange={(e) => handleChange('introVideoUrl', e.target.value)}
            placeholder="https://vimeo.com/... eller https://youtube.com/..."
            className="flex-1 px-4 py-2.5 border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all"
          />
        </div>

        {formData.introVideoUrl && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-[var(--text-secondary)]">
              Video-URL: {formData.introVideoUrl}
            </p>
          </div>
        )}
      </div>

      {/* Welcome message */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Välkomstmeddelande
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Ett personligt meddelande från Ulrika som visas när deltagaren börjar kursen
        </p>

        <textarea
          value={formData.welcomeMessage}
          onChange={(e) => handleChange('welcomeMessage', e.target.value)}
          placeholder="Välkommen till kursen! Jag är så glad att du har bestämt dig för att ta det här steget mot bättre hälsa..."
          rows={6}
          className="w-full px-4 py-3 border border-[var(--border-light)] rounded-xl focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all resize-none"
        />
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {formData.welcomeMessage.length} tecken
        </p>
      </div>

      {/* Community */}
      <div className="bg-gray-50 border border-[var(--border-light)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Aktivera community
            </label>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ge deltagarna tillgång till kurscommunity
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('enableCommunity', !formData.enableCommunity)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              formData.enableCommunity ? 'bg-[var(--primary-green)]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                formData.enableCommunity ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {formData.enableCommunity && (
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              Community-beskrivning
            </label>
            <textarea
              value={formData.communityDescription}
              onChange={(e) => handleChange('communityDescription', e.target.value)}
              placeholder="Beskriv vad community-delen erbjuder..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all resize-none"
            />
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-secondary)]">
          {formData.coverImage ? '✓ Bild' : '○ Ingen bild'} • 
          {formData.introVideoUrl ? ' ✓ Video' : ' ○ Ingen video'} • 
          {formData.welcomeMessage ? ' ✓ Välkomsttext' : ' ○ Ingen välkomsttext'}
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
