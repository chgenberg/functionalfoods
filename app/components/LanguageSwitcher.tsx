"use client";
import { useEffect, useState } from 'react';
import { useLanguage, Locale } from '../lib/i18n/LanguageProvider';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const options: { code: Locale; label: string }[] = [
    { code: 'sv', label: 'Svenska' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  useEffect(() => {
    const onDoc = () => setOpen(false);
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F3EFE3] hover:bg-[#e9e3d6] text-[#112A12]"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label="Byt språk"
      >
        <FiGlobe className="w-4 h-4" />
        <span className="text-sm font-medium uppercase">{locale}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-[#F3EFE3] z-50 overflow-hidden">
          {options.map(o => (
            <button
              key={o.code}
              onClick={() => setLocale(o.code)}
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