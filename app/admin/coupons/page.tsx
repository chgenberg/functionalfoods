"use client";
import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Search, Tag, Calendar, Percent, DollarSign, AlertCircle } from 'lucide-react';

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
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<any>({ 
    code: '', 
    type: 'percent', 
    amount: 10, 
    active: true,
    startsAtDate: '',
    startsAtTime: '00:00',
    expiresAtDate: '',
    expiresAtTime: '23:59'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
      } else {
        setError(data.error || 'Kunde inte hämta rabattkoder');
      }
    } catch (e) {
      setError('Ett fel uppstod vid hämtning av rabattkoder');
    }
    setLoading(false);
  };

  useEffect(()=>{ fetchCoupons(); },[]);
  useEffect(()=>{ const t = setTimeout(fetchCoupons, 300); return ()=>clearTimeout(t); }, [q]);

  const openNew = () => { 
    setEditing(null); 
    setForm({ 
      code: '', 
      type: 'percent', 
      amount: 10, 
      active: true,
      startsAtDate: '',
      startsAtTime: '00:00',
      expiresAtDate: '',
      expiresAtTime: '23:59'
    }); 
    setError('');
  };
  
  const openEdit = (c: Coupon) => { 
    setEditing(c); 
    
    // Parse existing datetime strings
    const startsAtDate = c.startsAt ? new Date(c.startsAt) : null;
    const expiresAtDate = c.expiresAt ? new Date(c.expiresAt) : null;
    
    setForm({ 
      ...c, 
      startsAtDate: startsAtDate ? startsAtDate.toISOString().slice(0,10) : '',
      startsAtTime: startsAtDate ? startsAtDate.toTimeString().slice(0,5) : '00:00',
      expiresAtDate: expiresAtDate ? expiresAtDate.toISOString().slice(0,10) : '',
      expiresAtTime: expiresAtDate ? expiresAtDate.toTimeString().slice(0,5) : '23:59'
    }); 
    setError('');
  };

  const save = async () => {
    setError('');
    setSaving(true);
    
    try {
      // Combine date and time for startsAt and expiresAt
      let startsAt = null;
      let expiresAt = null;
      
      if (form.startsAtDate) {
        startsAt = new Date(`${form.startsAtDate}T${form.startsAtTime || '00:00'}:00`).toISOString();
      }
      
      if (form.expiresAtDate) {
        expiresAt = new Date(`${form.expiresAtDate}T${form.expiresAtTime || '23:59'}:00`).toISOString();
      }
      
      const payload = { 
        code: form.code,
        type: form.type,
        amount: Number(form.amount), 
        active: form.active,
        startsAt,
        expiresAt,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null 
      };
      
      const url = editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type':'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        setEditing(null); 
        openNew(); 
        fetchCoupons(); 
      } else {
        setError(data.error || 'Kunde inte spara rabattkod');
      }
    } catch (e) {
      setError('Ett fel uppstod vid sparande');
    }
    
    setSaving(false);
  };
  
  const remove = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna rabattkod?')) return;
    
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCoupons();
      else setError('Kunde inte ta bort rabattkod');
    } catch (e) {
      setError('Ett fel uppstod vid borttagning');
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Rabattkoder</h1>
          <p className="text-[var(--text-secondary)] font-light">Hantera rabattkoder för kampanjer och erbjudanden</p>
        </div>
        <button 
          onClick={openNew} 
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Ny rabattkod
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 admin-alert admin-alert-error flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
        <input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="Sök rabattkod..." 
          className="admin-input pl-10" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coupons list */}
        <div className="lg:col-span-2">
          <div className="admin-table">
            {loading ? (
              <div className="p-12 text-center">
                <div className="relative mx-auto w-16 h-16">
                  <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-4 text-[var(--text-secondary)]">Laddar rabattkoder...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center">
                <Tag className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)]">Inga rabattkoder hittades</p>
                <button 
                  onClick={openNew}
                  className="mt-4 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] font-medium transition-colors"
                >
                  Skapa din första rabattkod
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Kod</th>
                      <th className="text-left">Typ</th>
                      <th className="text-left">Värde</th>
                      <th className="text-left">Giltighet</th>
                      <th className="text-left">Användning</th>
                      <th className="text-left">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td>
                          <span className="font-mono font-semibold text-[var(--text-primary)]">{c.code}</span>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1.5">
                            {c.type === 'percent' ? (
                              <>
                                <Percent className="w-4 h-4 text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-secondary)]">Procent</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 text-[var(--text-secondary)]" />
                                <span className="text-[var(--text-secondary)]">Fast belopp</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-[var(--text-primary)]">
                            {c.type === 'percent' ? `${c.amount}%` : `${c.amount} kr`}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div className="text-[var(--text-primary)]">{formatDate(c.startsAt)} – {formatDate(c.expiresAt)}</div>
                            {isExpired(c.expiresAt) && (
                              <span className="text-[var(--coral-accent)] text-xs">Utgången</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {c.timesUsed} / {c.usageLimit || '∞'}
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${
                            c.active && !isExpired(c.expiresAt)
                              ? 'admin-badge-success' 
                              : 'admin-badge-info'
                          }`}>
                            {c.active && !isExpired(c.expiresAt) ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => openEdit(c)} 
                            className="p-2 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => remove(c.id)} 
                            className="p-2 text-[var(--coral-accent)] hover:text-red-700 hover:bg-red-50 rounded-lg transition-all ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="admin-card">
          <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--primary-green)]" />
            {editing ? 'Redigera rabattkod' : 'Ny rabattkod'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="admin-label">Rabattkod</label>
              <input 
                value={form.code || ''} 
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                placeholder="T.ex. SOMMAR20" 
                className="admin-input" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Typ</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value })} 
                  className="admin-select"
                >
                  <option value="percent">Procent</option>
                  <option value="fixed">Fast belopp</option>
                </select>
              </div>
              
              <div>
                <label className="admin-label">Värde</label>
                <input 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: e.target.value })} 
                  className="admin-input" 
                  placeholder="Värde" 
                />
              </div>
            </div>
            
            <div>
              <label className="admin-label">Giltighetstid</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={form.startsAt || ''} 
                  onChange={e => setForm({ ...form, startsAt: e.target.value })} 
                  className="admin-input" 
                />
                <input 
                  type="date" 
                  value={form.expiresAt || ''} 
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })} 
                  className="admin-input" 
                />
              </div>
            </div>
            
            <div>
              <label className="admin-label">Max användningar</label>
              <input 
                type="number" 
                min={0} 
                value={form.usageLimit || ''} 
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} 
                className="admin-input" 
                placeholder="Lämna tomt för obegränsad" 
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="active"
                checked={!!form.active} 
                onChange={e => setForm({ ...form, active: e.target.checked })} 
                className="h-4 w-4 text-[var(--primary-green)] focus:ring-[var(--primary-light-green)] border-[var(--border-light)] rounded" 
              />
              <label htmlFor="active" className="ml-2 text-sm text-[var(--text-primary)]">
                Aktiv (kan användas av kunder)
              </label>
            </div>
            
            <div className="pt-4 space-y-2">
              <button 
                onClick={save} 
                disabled={saving || !form.code || !form.amount}
                className="w-full admin-btn admin-btn-primary justify-center"
              >
                {saving ? 'Sparar...' : 'Spara rabattkod'}
              </button>
              
              {editing && (
                <button 
                  onClick={openNew}
                  className="w-full admin-btn admin-btn-secondary justify-center"
                >
                  Avbryt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 