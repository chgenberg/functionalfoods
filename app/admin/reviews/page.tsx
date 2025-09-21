"use client";
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Filter, Star, User, Calendar } from 'lucide-react';

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
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Recensioner</h1>
        <p className="text-[var(--text-secondary)] font-light">Hantera kursrecensioner och feedback från användare</p>
      </div>
      
      <div className="admin-card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">Filtrera</span>
          </div>
          <input 
            value={courseId} 
            onChange={e=>setCourseId(e.target.value)} 
            placeholder="Kurs-ID (t.ex. functional-basics)" 
            className="admin-input flex-1 max-w-sm" 
          />
          <select 
            value={status} 
            onChange={e=>setStatus(e.target.value)} 
            className="admin-select"
          >
            <option value="">Alla status</option>
            <option value="PENDING">Väntar på granskning</option>
            <option value="APPROVED">Godkända</option>
            <option value="REJECTED">Avvisade</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)]">Laddar recensioner...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">
                Inga recensioner hittades med valda filter.
              </p>
            </div>
          ) : items.map(r => (
            <div key={r.id} className="admin-card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[var(--primary-green)]" />
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{r.courseId}</div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4" />
                      {new Date(r.createdAt).toLocaleDateString('sv-SE')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`admin-badge ${
                    r.status==='APPROVED' ? 'admin-badge-success' : 
                    r.status==='REJECTED'? 'admin-badge-warning':
                    'admin-badge-info'
                  }`}>
                    {r.status === 'PENDING' ? 'Väntar' : 
                     r.status === 'APPROVED' ? 'Godkänd' : 'Avvisad'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--primary-light-green)]" />
                  <span className="font-medium text-[var(--text-primary)]">Betyg: {r.rating ?? '-'}/5</span>
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Samtycke: {r.consent ? 'Ja' : 'Nej'}
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                {(Array.isArray(r.answers)? r.answers: []).map((p: any, i: number)=> (
                  <div key={i} className="bg-[var(--primary-beige)] rounded-lg p-3">
                    <span className="font-medium text-[var(--text-primary)] block mb-1">{p.q}</span>
                    <span className="text-[var(--text-secondary)] text-sm">{p.a}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={async ()=>{ 
                    await fetch(`/api/reviews/${r.id}`, { 
                      method: 'PUT', 
                      headers: { 'Content-Type':'application/json' }, 
                      body: JSON.stringify({ status: 'APPROVED' }) 
                    }); 
                    fetchItems(); 
                  }} 
                  className="admin-btn admin-btn-success"
                >
                  <CheckCircle className="w-4 h-4" />
                  Godkänn
                </button>
                <button 
                  onClick={async ()=>{ 
                    await fetch(`/api/reviews/${r.id}`, { 
                      method: 'PUT', 
                      headers: { 'Content-Type':'application/json' }, 
                      body: JSON.stringify({ status: 'REJECTED' }) 
                    }); 
                    fetchItems(); 
                  }} 
                  className="admin-btn admin-btn-danger"
                >
                  <XCircle className="w-4 h-4" />
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