"use client";
import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percent'|'fixed';
  amount: number;
  active: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  timesUsed: number;
  applicableCourseIds?: string[] | null;
}

interface CourseOption {
  id: string;
  name: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<any>({ 
    code: '', type: 'percent', amount: 10, active: true,
    startsAtDate: '', startsAtTime: '00:00',
    expiresAtDate: '', expiresAtTime: '23:59',
    applicableCourseIds: [] as string[]
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/functional-courses');
      const data = await res.json();
      if (Array.isArray(data)) setCourseOptions(data.map((c: any) => ({ id: c.id, name: c.name })));
    } catch {}
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons || []);
      else setError(data.error || 'Kunde inte hämta rabattkoder');
    } catch {
      setError('Ett fel uppstod');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); fetchCourses(); }, []);
  useEffect(() => { const t = setTimeout(fetchCoupons, 300); return () => clearTimeout(t); }, [q]);

  const toggleCourse = (courseId: string) => {
    const list: string[] = Array.isArray(form.applicableCourseIds) ? [...form.applicableCourseIds] : [];
    const idx = list.indexOf(courseId);
    if (idx >= 0) list.splice(idx, 1); else list.push(courseId);
    setForm({ ...form, applicableCourseIds: list });
  };

  const openNew = () => { 
    setEditing(null); setShowForm(true);
    setForm({ code: '', type: 'percent', amount: 10, active: true, startsAtDate: '', startsAtTime: '00:00', expiresAtDate: '', expiresAtTime: '23:59', applicableCourseIds: [] }); 
    setError('');
  };
  
  const openEdit = (c: Coupon) => { 
    setEditing(c); setShowForm(true);
    const startsAtDate = c.startsAt ? new Date(c.startsAt) : null;
    const expiresAtDate = c.expiresAt ? new Date(c.expiresAt) : null;
    setForm({ 
      ...c, 
      startsAtDate: startsAtDate ? startsAtDate.toISOString().slice(0,10) : '',
      startsAtTime: startsAtDate ? startsAtDate.toTimeString().slice(0,5) : '00:00',
      expiresAtDate: expiresAtDate ? expiresAtDate.toISOString().slice(0,10) : '',
      expiresAtTime: expiresAtDate ? expiresAtDate.toTimeString().slice(0,5) : '23:59',
      applicableCourseIds: Array.isArray(c.applicableCourseIds) ? c.applicableCourseIds : []
    }); 
    setError('');
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setError(''); };

  const save = async () => {
    setError(''); setSaving(true);
    try {
      let startsAt = form.startsAtDate ? new Date(`${form.startsAtDate}T${form.startsAtTime || '00:00'}:00`).toISOString() : null;
      let expiresAt = form.expiresAtDate ? new Date(`${form.expiresAtDate}T${form.expiresAtTime || '23:59'}:00`).toISOString() : null;
      
      const payload = { 
        code: form.code, type: form.type, amount: Number(form.amount), active: form.active,
        startsAt, expiresAt, usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        applicableCourseIds: Array.isArray(form.applicableCourseIds) ? form.applicableCourseIds : []
      };
      
      const url = editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (res.ok) { closeForm(); fetchCoupons(); } 
      else setError(data.error || 'Kunde inte spara');
    } catch { setError('Ett fel uppstod'); }
    setSaving(false);
  };
  
  const remove = async (id: string) => {
    if (!confirm('Är du säker?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCoupons();
      else setError('Kunde inte ta bort');
    } catch { setError('Ett fel uppstod'); }
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isExpired = (d: string | null | undefined) => d ? new Date(d) < new Date() : false;

  const exportToCSV = () => {
    const headers = ['Kod', 'Typ', 'Värde', 'Status', 'Startdatum', 'Slutdatum', 'Användningar', 'Max användningar', 'Gäller för'];
    const rows = coupons.map(coupon => [
      coupon.code,
      coupon.type === 'percent' ? 'Procent' : 'Fast belopp',
      coupon.type === 'percent' ? `${coupon.amount}%` : `${coupon.amount} kr`,
      coupon.active && !isExpired(coupon.expiresAt) ? 'Aktiv' : isExpired(coupon.expiresAt) ? 'Utgången' : 'Inaktiv',
      formatDate(coupon.startsAt),
      formatDate(coupon.expiresAt),
      coupon.timesUsed.toString(),
      coupon.usageLimit?.toString() || 'Obegränsat',
      renderAppliesTo(coupon)
    ]);
    
    const csv = [headers.join(';'), ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rabattkoder-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderAppliesTo = (c: Coupon) => {
    const ids = Array.isArray(c.applicableCourseIds) ? c.applicableCourseIds : [];
    if (ids.length === 0) return 'Alla kurser';
    return ids.map(id => courseOptions.find(co => co.id === id)?.name || id).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar rabattkoder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Rabattkoder</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera kampanjer</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            disabled={coupons.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportera
          </button>
          <button 
            onClick={openNew}
            className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors text-sm"
          >
            Ny rabattkod
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <input 
          value={q} onChange={e => setQ(e.target.value)} placeholder="Sök rabattkod..." 
          className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]" 
        />
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Aktiva koder</p>
          <p className="text-xl font-semibold mt-1">{coupons.filter(c => c.active && !isExpired(c.expiresAt)).length}</p>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Total användning</p>
          <p className="text-xl font-semibold mt-1">{coupons.reduce((sum, c) => sum + c.timesUsed, 0)}</p>
        </div>
      </div>

      {/* Coupons list */}
      {coupons.length === 0 ? (
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-12 text-center">
          <p className="text-[var(--text-secondary)]">Inga rabattkoder</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg text-sm">
            Skapa rabattkod
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border-light)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--border-light)]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Kod</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Rabatt</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Använd</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-medium">{coupon.code}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{renderAppliesTo(coupon)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm">{coupon.type === 'percent' ? `${coupon.amount}%` : `${coupon.amount} kr`}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm">{coupon.timesUsed} / {coupon.usageLimit || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      coupon.active && !isExpired(coupon.expiresAt) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {coupon.active && !isExpired(coupon.expiresAt) ? 'Aktiv' : isExpired(coupon.expiresAt) ? 'Utgången' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(coupon)} className="px-3 py-1.5 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                        Redigera
                      </button>
                      <button onClick={() => remove(coupon.id)} className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors">
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[var(--border-light)]">
              <h2 className="text-lg font-medium">{editing ? 'Redigera rabattkod' : 'Ny rabattkod'}</h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] uppercase mb-1">Rabattkod</label>
                <input 
                  value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                  placeholder="T.ex. SOMMAR25" 
                  className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)] font-mono" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] uppercase mb-1">Typ</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg">
                    <option value="percent">Procent (%)</option>
                    <option value="fixed">Fast belopp (kr)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] uppercase mb-1">Värde</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] uppercase mb-1">Startdatum</label>
                  <input type="date" value={form.startsAtDate || ''} onChange={e => setForm({ ...form, startsAtDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] uppercase mb-1">Slutdatum</label>
                  <input type="date" value={form.expiresAtDate || ''} onChange={e => setForm({ ...form, expiresAtDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-[var(--text-secondary)] uppercase mb-1">Max användningar</label>
                <input type="number" min={0} value={form.usageLimit || ''} onChange={e => setForm({ ...form, usageLimit: e.target.value })} placeholder="Obegränsat" className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg" />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-secondary)] uppercase mb-2">Gäller för kurser</label>
                <div className="flex flex-wrap gap-2">
                  {courseOptions.map(c => {
                    const selected = Array.isArray(form.applicableCourseIds) && form.applicableCourseIds.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCourse(c.id)}
                        className={`px-3 py-1.5 rounded text-xs border transition-colors ${selected ? 'bg-[var(--primary-green)] text-white border-[var(--primary-green)]' : 'bg-white border-[var(--border-light)] hover:border-[var(--primary-green)]'}`}>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Lämna tomt för alla kurser</p>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Aktiv rabattkod</span>
              </label>
            </div>
            
            <div className="p-5 border-t border-[var(--border-light)] flex justify-end gap-2">
              <button onClick={closeForm} className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-100 rounded-lg">Avbryt</button>
              <button onClick={save} disabled={saving || !form.code || !form.amount} className="px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] disabled:opacity-50">
                {saving ? 'Sparar...' : 'Spara'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
