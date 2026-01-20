'use client';

import { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Loader2, Image as ImageIcon, Video, X } from 'lucide-react';
import type { CourseDraftData } from '../[id]/step/[stepNumber]/page';

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

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(formData);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create form data for upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('type', 'course');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadData
      });

      if (response.ok) {
        const data = await response.json();
        handleChange('coverImage', data.url);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
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
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          Omslagsbild
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          Denna bild visas på kurskortet och produktsidan
        </p>

        {formData.coverImage ? (
          <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-[var(--border-light)]">
            <img
              src={formData.coverImage}
              alt="Omslagsbild"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleChange('coverImage', '')}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed border-[var(--border-light)] rounded-xl cursor-pointer hover:border-[var(--primary-green)] hover:bg-[var(--primary-green)]/5 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-[var(--primary-green)] animate-spin" />
                <span className="text-sm text-[var(--text-secondary)] mt-2">Laddar upp...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-[var(--text-secondary)] mt-2">
                  Klicka för att ladda upp bild
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  JPG, PNG eller WebP (max 5MB)
                </span>
              </div>
            )}
          </label>
        )}

        {/* Or enter URL */}
        <div className="mt-3 flex items-center gap-2">
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
