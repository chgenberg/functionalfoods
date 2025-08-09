"use client";
import { useEffect, useRef, useState } from 'react';
import { useLanguage, Locale } from '../lib/i18n/LanguageProvider';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const options: { code: Locale; label: string }[] = [
    { code: 'sv', label: 'Svenska' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' }
  ];

  useEffect(() => {
    const onDoc = (e: Event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    // capture phase to ensure we see the event before bubbling side effects
    document.addEventListener('pointerdown', onDoc, true);
    return () => document.removeEventListener('pointerdown', onDoc, true);
  }, []);

  return (
    <div ref={rootRef} className="relative select-none">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F3EFE3] hover:bg-[#e9e3d6] text-[#112A12]"
        onClick={() => setOpen(o => !o)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label="Byt språk"
      >
        <FiGlobe className="w-4 h-4" />
        <span className="text-sm font-medium uppercase">{locale}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#F3EFE3] z-[1000] overflow-hidden"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {options.map(o => (
            <button
              key={o.code}
              onClick={() => { setLocale(o.code); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F3EFE3] ${locale===o.code? 'font-semibold text-[#112A12]' : 'text-[#112A12]/80'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 