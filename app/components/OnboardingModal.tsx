"use client";
import { useEffect, useState } from 'react';

interface OnboardingData {
  diet?: string;
  allergies?: string;
  mealTimes?: string;
  goals?: string;
}

export default function OnboardingModal({ isOpen, onClose, storageKey = 'onboarding_v1' }: { isOpen: boolean; onClose: () => void; storageKey?: string; }) {
  const [data, setData] = useState<OnboardingData>({});

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e)=>e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Snabb onboarding (30–60 sek)</h3>
        <div className="space-y-3">
          <label className="block text-sm">Kostpreferenser
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={data.diet || ''} onChange={e=>setData(prev=>({...prev, diet:e.target.value}))} placeholder="t.ex. vegetariskt, pescetarian, allt" />
          </label>
          <label className="block text-sm">Allergier/intoleranser
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={data.allergies || ''} onChange={e=>setData(prev=>({...prev, allergies:e.target.value}))} placeholder="t.ex. laktos, nötter" />
          </label>
          <label className="block text-sm">Tider du oftast äter
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={data.mealTimes || ''} onChange={e=>setData(prev=>({...prev, mealTimes:e.target.value}))} placeholder="t.ex. 07:30, 12:00, 18:30" />
          </label>
          <label className="block text-sm">Ditt viktigaste mål
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={data.goals || ''} onChange={e=>setData(prev=>({...prev, goals:e.target.value}))} placeholder="t.ex. energi, sömn, vikt, maghälsa" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Senare</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary">Spara</button>
        </div>
      </div>
    </div>
  );
} 