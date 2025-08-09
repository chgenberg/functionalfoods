'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './messages/en.json';
import es from './messages/es.json';
import sv from './messages/sv.json';
import de from './messages/de.json';
import fr from './messages/fr.json';

export type Locale = 'sv' | 'en' | 'es' | 'de' | 'fr';

type Messages = Record<string, string>;

const DICTS: Record<Locale, Messages> = { sv, en, es, de, fr };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('sv');

  useEffect(() => {
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) as Locale | null;
    const cookie = readCookie('lang') as Locale | null;
    const initial = stored || cookie;
    if (initial && ['sv','en','es','de','fr'].includes(initial)) setLocaleState(initial);
  }, []);

  useEffect(() => {
    // Sync <html lang> with current locale for a11y/SEO and built-ins (dates)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
    }
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof localStorage !== 'undefined') localStorage.setItem('lang', l);
    writeCookie('lang', l);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', l);
    }
  };

  const t = (key: string, fallback?: string) => {
    const dict = DICTS[locale] || {};
    return dict[key] ?? fallback ?? key;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {React.createElement(React.Fragment, { key: locale }, children)}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useT() {
  return useLanguage().t;
} 