"use client";
import { useEffect, useRef, useState } from 'react';
import { useLanguage, useT } from './LanguageProvider';

function getCache(locale: string): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(`autoT:${locale}`) || '{}');
  } catch { return {}; }
}

function setCache(locale: string, map: Record<string, string>) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(`autoT:${locale}`, JSON.stringify(map)); } catch {}
}

function collectTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const text = (node as Text).nodeValue || '';
      if (!text.trim()) return NodeFilter.FILTER_REJECT;
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (['SCRIPT','STYLE','NOSCRIPT'].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('code,pre')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('svg')) return NodeFilter.FILTER_REJECT;
      const compact = text.trim();
      if (compact.length < 2) return NodeFilter.FILTER_REJECT;
      if (/^[^A-Za-zÅÄÖåäöáéíóúñü\d]+$/.test(compact)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  } as unknown as NodeFilter);
  let current: Node | null = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

async function batchTranslate(texts: string[], target: 'en'|'es'): Promise<string[]> {
  const res = await fetch('/api/translate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, target })
  });
  if (!res.ok) throw new Error('translate failed');
  const data = await res.json();
  return data.translations as string[];
}

export function useAutoTranslate(enabled: boolean) {
  const { locale } = useLanguage();
  const applied = useRef(false);
  const originals = useRef<WeakMap<Text, string>>(new WeakMap());
  const [busy, setBusy] = useState(false);

  const restoreOriginals = () => {
    const root = document.querySelector('main') || document.body;
    if (!root) return;
    const nodes = collectTextNodes(root);
    nodes.forEach((n) => {
      const orig = originals.current.get(n);
      if (orig !== undefined) n.nodeValue = orig;
    });
    // clear after restore to avoid stale node refs
    originals.current = new WeakMap();
  };

  useEffect(() => {
    // Reset any prior mutations before applying new language
    if (applied.current) {
      restoreOriginals();
      applied.current = false;
    }

    // Only auto-translate for locales we support via API (en, es)
    if (!enabled || (locale !== 'en' && locale !== 'es')) {
      return;
    }

    const target = locale as 'en'|'es';
    const root = document.querySelector('main') || document.body;
    if (!root) return;

    const nodes = collectTextNodes(root);
    const unique = Array.from(new Set(nodes.map(n => (n.nodeValue || '').trim())));

    const cache = getCache(locale);
    const toTranslate = unique.filter(txt => !cache[txt]);

    const applyMap = (map: Record<string,string>) => {
      nodes.forEach(node => {
        const before = node.nodeValue || '';
        const orig = before.trim();
        if (!originals.current.get(node)) originals.current.set(node, before);
        const translated = map[orig];
        if (translated) node.nodeValue = before.replace(orig, translated);
      });
      applied.current = true;
    };

    if (toTranslate.length === 0) {
      applyMap(cache);
      return;
    }

    setBusy(true);
    const slices: string[][] = [];
    for (let i=0; i<toTranslate.length; i+=80) slices.push(toTranslate.slice(i, i+80));

    (async () => {
      const map: Record<string,string> = { ...cache };
      for (const slice of slices) {
        try {
          const translations = await batchTranslate(slice, target);
          slice.forEach((orig, idx) => { map[orig] = translations[idx] || orig; });
        } catch {
          slice.forEach(orig => { map[orig] = orig; });
        }
      }
      setCache(locale, map);
      applyMap(map);
      setBusy(false);
    })();
  }, [enabled, locale]);

  return { busy };
}

export default function AutoTranslate() {
  const { locale } = useLanguage();
  const t = useT();
  const { busy } = useAutoTranslate(locale !== 'sv');
  return (
    <div aria-hidden className="pointer-events-none fixed bottom-4 right-4 z-[9999]">
      {busy && (
        <div className="px-3 py-2 rounded-lg bg-[#F3EFE3] text-[#112A12] shadow">{t('auto.translating','Översätter…')}</div>
      )}
    </div>
  );
} 