"use client";
import { useEffect, useState } from 'react';
import { FiStar, FiQuoteLeft, FiX } from 'react-icons/fi';

interface Review {
  id: string;
  courseId: string;
  rating?: number | null;
  answers: Array<{ q: string; a: string }>;
  createdAt: string;
}

export default function CourseReviews({ courseId }: { courseId: string }) {
  const [items, setItems] = useState<Review[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/reviews?courseId=${courseId}&status=APPROVED`);
      const data = await res.json();
      setItems((data.reviews || []).slice(0, 6));
    };
    load();
  }, [courseId]);

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vad säger våra deltagare?</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map(r => (
          <button key={r.id} onClick={()=>setOpenId(r.id)} className="text-left bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-1 text-yellow-400 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} className={`w-5 h-5 ${i < (r.rating || 5) ? 'fill-yellow-400' : ''}`} />
              ))}
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <FiQuoteLeft className="w-5 h-5 text-primary mt-1" />
              <p className="line-clamp-4">
                {(r.answers?.[1]?.a || r.answers?.[0]?.a || '').slice(0, 220)}
              </p>
            </div>
            <div className="mt-3 text-sm text-gray-500">Klicka för att läsa mer</div>
          </button>
        ))}
      </div>

      {openId && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4" onClick={()=>setOpenId(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">Kundrecension</h3>
              <button onClick={()=>setOpenId(null)} className="p-2 rounded hover:bg-gray-100"><FiX className="w-5 h-5"/></button>
            </div>
            {items.filter(i=>i.id===openId).map(r=> (
              <div key={r.id}>
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} className={`w-5 h-5 ${i < (r.rating || 5) ? 'fill-yellow-400' : ''}`} />
                  ))}
                </div>
                <div className="space-y-3">
                  {r.answers?.map((p, idx)=> (
                    <div key={idx}>
                      <div className="text-sm font-medium text-gray-800">{p.q}</div>
                      <div className="text-gray-700">{p.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
} 