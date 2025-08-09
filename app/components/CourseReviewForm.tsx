"use client";
import { useState } from 'react';

interface Props {
  courseId: string;
  userId: string;
}

const QUESTIONS = [
  'Levde kursen upp till dina förväntningar?',
  'Vad var det mest värdefulla du tog med dig från kursen?',
  'Hur har kursen påverkat dina matvanor, energi eller hälsa hittills?',
  'Hur upplevde du upplägget, innehållet och pedagogiken? Skulle du rekommendera kursen till andra – och i så fall, varför?'
];

export default function CourseReviewForm({ courseId, userId }: Props) {
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [rating, setRating] = useState<number | null>(null);
  const [consent, setConsent] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');

  const updateAnswer = (i: number, v: string) => {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  };

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId, rating, consent, source: 'IN_APP', answers: QUESTIONS.map((q, i)=>({ q, a: answers[i] })) })
      });
      if (res.ok) setStatus('saved'); else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-1">Dela din upplevelse</h2>
      <p className="text-gray-600 mb-6">Dina svar hjälper oss förbättra kursen och kan (om du vill) publiceras som recension.</p>

      <div className="mb-6">
        <div className="text-sm text-gray-700 mb-2">Betyg</div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n=> (
            <button key={n} onClick={()=>setRating(n)} className={`w-10 h-10 rounded-full border flex items-center justify-center ${rating===n? 'bg-primary text-white border-primary':'bg-white text-gray-700'}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q, i)=> (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{q}</label>
            <textarea value={answers[i]} onChange={e=>updateAnswer(i, e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2" />
          </div>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
        Jag ger tillåtelse att publicera min recension (förnamn + första bokstav av efternamn).
      </label>

      <div className="mt-6 flex gap-3">
        <button onClick={save} disabled={status==='saving'} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary disabled:opacity-60">{status==='saving' ? 'Sparar...' : 'Skicka in'}</button>
        {status==='saved' && <span className="text-green-600">Tack! Ditt omdöme är mottaget.</span>}
        {status==='error' && <span className="text-red-600">Kunde inte spara. Försök igen.</span>}
      </div>
    </div>
  );
} 