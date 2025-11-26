"use client";
import { useEffect, useState } from 'react';

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

  useEffect(() => { fetchItems(); }, []);
  useEffect(() => { const t = setTimeout(fetchItems, 300); return () => clearTimeout(t); }, [courseId, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar recensioner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Recensioner</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera kursrecensioner</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            value={courseId} 
            onChange={e => setCourseId(e.target.value)} 
            placeholder="Kurs-ID (t.ex. functional-basics)" 
            className="flex-1 px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]" 
          />
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
          >
            <option value="">Alla status</option>
            <option value="PENDING">Väntar</option>
            <option value="APPROVED">Godkända</option>
            <option value="REJECTED">Avvisade</option>
          </select>
        </div>
      </div>

      {/* Reviews list */}
      {items.length === 0 ? (
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-12 text-center">
          <p className="text-[var(--text-secondary)]">Inga recensioner</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(r => (
            <div key={r.id} className="bg-white border border-[var(--border-light)] rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{r.courseId}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(r.createdAt).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                  r.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {r.status === 'PENDING' ? 'Väntar' : r.status === 'APPROVED' ? 'Godkänd' : 'Avvisad'}
                </span>
              </div>
              
              <div className="flex gap-4 mb-4 text-sm">
                <span>Betyg: {r.rating ?? '-'}/5</span>
                <span className="text-[var(--text-secondary)]">Samtycke: {r.consent ? 'Ja' : 'Nej'}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                {(Array.isArray(r.answers) ? r.answers : []).map((p: any, i: number) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{p.q}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{p.a}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={async () => { 
                    await fetch(`/api/reviews/${r.id}`, { 
                      method: 'PUT', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ status: 'APPROVED' }) 
                    }); 
                    fetchItems(); 
                  }} 
                  className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  Godkänn
                </button>
                <button 
                  onClick={async () => { 
                    await fetch(`/api/reviews/${r.id}`, { 
                      method: 'PUT', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ status: 'REJECTED' }) 
                    }); 
                    fetchItems(); 
                  }} 
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Avvisa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
