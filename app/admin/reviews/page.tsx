"use client";
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';

interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating?: number | null;
  answers: Array<{ q: string; a: string }> | any;
  consent: boolean;
  status: 'PENDING'|'APPROVED'|'REJECTED';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    const url = `/api/reviews?${new URLSearchParams({ courseId, status }).toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setItems(data.reviews || []);
    setLoading(false);
  };

  useEffect(()=>{ fetchItems(); },[]);
  useEffect(()=>{ const t = setTimeout(fetchItems, 300); return ()=>clearTimeout(t); }, [courseId, status]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Recensioner</h1>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <FiFilter className="text-gray-500" />
        <input value={courseId} onChange={e=>setCourseId(e.target.value)} placeholder="courseId (t.ex. functional-basics)" className="px-3 py-2 border rounded" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">Alla status</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>
      {loading ? (
        <div className="p-8 text-gray-500">Laddar...</div>
      ) : (
        <div className="space-y-4">
          {items.map(r => (
            <div key={r.id} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${r.status==='APPROVED' ? 'bg-green-100 text-green-700' : r.status==='REJECTED'? 'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                </div>
              </div>
              <div className="font-medium">{r.courseId} • Betyg: {r.rating ?? '-'} • Samtycke: {r.consent ? 'Ja' : 'Nej'}</div>
              <div className="mt-2 grid md:grid-cols-2 gap-3">
                {(Array.isArray(r.answers)? r.answers: []).map((p: any, i: number)=> (
                  <div key={i} className="text-sm"><span className="font-medium">{p.q}:</span> {p.a}</div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={async ()=>{ await fetch(`/api/reviews/${r.id}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) }); fetchItems(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"><FiCheckCircle/>Godkänn</button>
                <button onClick={async ()=>{ await fetch(`/api/reviews/${r.id}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) }); fetchItems(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"><FiXCircle/>Avvisa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 