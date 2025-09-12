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
  const [form, setForm] = useState<any>({ code: '', type: 'percent', amount: 10, active: true });
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
    setForm({ code: '', type: 'percent', amount: 10, active: true }); 
    setError('');
  };
  
  const openEdit = (c: Coupon) => { 
    setEditing(c); 
    setForm({ 
      ...c, 
      startsAt: c.startsAt?.slice(0,10), 
      expiresAt: c.expiresAt?.slice(0,10) 
    }); 
    setError('');
  };

  const save = async () => {
    setError('');
    setSaving(true);
    
    try {
      const payload = { 
        ...form, 
        amount: Number(form.amount), 
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
    return date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const isExpired = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rabattkoder</h1>
          <p className="text-gray-600 mt-1">Hantera rabattkoder för kampanjer och erbjudanden</p>
        </div>
        <button 
          onClick={openNew} 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-[#014421] font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ny rabattkod
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="Sök rabattkod..." 
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coupons list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-gray-500">Laddar rabattkoder...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-12 text-center">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Inga rabattkoder hittades</p>
                <button 
                  onClick={openNew}
                  className="mt-4 text-primary hover:text-[#014421] font-medium"
                >
                  Skapa din första rabattkod
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Värde</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giltighet</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Användning</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-gray-900">{c.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5">
                            {c.type === 'percent' ? (
                              <>
                                <Percent className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">Procent</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">Fast belopp</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {c.type === 'percent' ? `${c.amount}%` : `${c.amount} kr`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{formatDate(c.startsAt)} – {formatDate(c.expiresAt)}</div>
                            {isExpired(c.expiresAt) && (
                              <span className="text-red-600 text-xs">Utgången</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {c.timesUsed} / {c.usageLimit || '∞'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.active && !isExpired(c.expiresAt)
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {c.active && !isExpired(c.expiresAt) ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => openEdit(c)} 
                            className="p-2 text-gray-500 hover:text-primary transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => remove(c.id)} 
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors ml-1"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            {editing ? 'Redigera rabattkod' : 'Ny rabattkod'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rabattkod</label>
              <input 
                value={form.code || ''} 
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                placeholder="T.ex. SOMMAR20" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="percent">Procent</option>
                  <option value="fixed">Fast belopp</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Värde</label>
                <input 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Värde" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giltighetstid</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={form.startsAt || ''} 
                  onChange={e => setForm({ ...form, startsAt: e.target.value })} 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" 
                />
                <input 
                  type="date" 
                  value={form.expiresAt || ''} 
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })} 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max användningar</label>
              <input 
                type="number" 
                min={0} 
                value={form.usageLimit || ''} 
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                placeholder="Lämna tomt för obegränsad" 
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="active"
                checked={!!form.active} 
                onChange={e => setForm({ ...form, active: e.target.checked })} 
                className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded" 
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Aktiv (kan användas av kunder)
              </label>
            </div>
            
            <div className="pt-4 space-y-2">
              <button 
                onClick={save} 
                disabled={saving || !form.code || !form.amount}
                className="w-full py-2.5 rounded-lg bg-primary text-white hover:bg-[#014421] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sparar...' : 'Spara rabattkod'}
              </button>
              
              {editing && (
                <button 
                  onClick={openNew}
                  className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
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