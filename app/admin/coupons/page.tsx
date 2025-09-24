"use client";
import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Search, Tag, Calendar, Percent, DollarSign, AlertCircle, ChevronDown } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#F3EFE3]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#014421] mb-3 flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#014421] to-[#93C560] p-3 rounded-xl">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                Rabattkoder
              </h1>
              <p className="text-gray-600 text-lg">Hantera rabattkoder för kampanjer och erbjudanden</p>
            </div>
            <button 
              onClick={openNew}
              className="bg-gradient-to-r from-[#014421] to-[#93C560] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Ny rabattkod
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

      {/* Error message */}
      {error && (
        <div className="mb-6 admin-alert admin-alert-error flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Sök rabattkod..." 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 text-lg font-medium placeholder-gray-400 shadow-sm hover:shadow-md" 
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coupons list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {loading ? (
              <div className="p-16 text-center">
                <div className="relative mx-auto w-20 h-20">
                  <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#014421] rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-6 text-gray-600 text-lg font-medium">Laddar rabattkoder...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-16 text-center">
                <div className="bg-gradient-to-r from-[#014421] to-[#93C560] p-6 rounded-full w-24 h-24 mx-auto mb-6">
                  <Tag className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Inga rabattkoder hittades</h3>
                <p className="text-gray-600 mb-6 text-lg">Skapa din första rabattkod för att komma igång</p>
                <button 
                  onClick={openNew}
                  className="bg-gradient-to-r from-[#014421] to-[#93C560] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Skapa rabattkod
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#F3EFE3] to-[#F7F1E8] border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-[#014421] text-sm uppercase tracking-wider">Kod</th>
                      <th className="text-left px-6 py-4 font-bold text-[#014421] text-sm uppercase tracking-wider">Typ</th>
                      <th className="text-left px-6 py-4 font-bold text-[#014421] text-sm uppercase tracking-wider">Värde</th>
                      <th className="text-left px-6 py-4 font-bold text-[#014421] text-sm uppercase tracking-wider">Giltighet</th>
                      <th className="text-left px-6 py-4 font-bold text-[#014421] text-sm uppercase tracking-wider">Användning</th>
                      <th className="text-left px-6 py-4 font-bold text-[#014421] text-sm uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c, index) => (
                      <tr key={c.id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#F8F5F0] hover:to-[#F3EFE3] transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-5">
                          <span className="font-mono font-bold text-[#014421] bg-gray-100 px-3 py-1 rounded-lg text-sm">{c.code}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2">
                            {c.type === 'percent' ? (
                              <>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Percent className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Procent</span>
                              </>
                            ) : (
                              <>
                                <div className="bg-green-100 p-2 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Fast belopp</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-2xl text-[#014421]">
                            {c.type === 'percent' ? `${c.amount}%` : `${c.amount} kr`}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm space-y-1">
                            <div className="text-gray-900 font-medium">{formatDate(c.startsAt)} – {formatDate(c.expiresAt)}</div>
                            {isExpired(c.expiresAt) && (
                              <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                Utgången
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#014421]">{c.timesUsed}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-600 font-medium">{c.usageLimit || '∞'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
                            c.active && !isExpired(c.expiresAt)
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              c.active && !isExpired(c.expiresAt) ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            {c.active && !isExpired(c.expiresAt) ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEdit(c)} 
                              className="p-3 text-[#014421] hover:text-white hover:bg-[#014421] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                              title="Redigera"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => remove(c.id)} 
                              className="p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                              title="Ta bort"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
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
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-[#014421] to-[#93C560] p-3 rounded-xl">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#014421]">
              {editing ? 'Redigera rabattkod' : 'Ny rabattkod'}
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#014421] mb-3">Rabattkod</label>
              <input 
                value={form.code || ''} 
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                placeholder="T.ex. SOMMAR20" 
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 text-lg font-mono font-bold placeholder-gray-400 hover:bg-white" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#014421] mb-3">Typ</label>
                <div className="relative">
                  <select 
                    value={form.type} 
                    onChange={e => setForm({ ...form, type: e.target.value })} 
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 text-lg font-medium appearance-none cursor-pointer hover:bg-white"
                  >
                    <option value="percent">📊 Procent</option>
                    <option value="fixed">💰 Fast belopp</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#014421] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#014421] mb-3">Värde</label>
                <input 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: e.target.value })} 
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 text-lg font-bold placeholder-gray-400 hover:bg-white" 
                  placeholder="Värde" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#014421] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Giltighetstid
              </label>
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">🚀 Startdatum och tid</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      value={form.startsAtDate || ''} 
                      onChange={e => setForm({ ...form, startsAtDate: e.target.value })} 
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 font-medium" 
                    />
                    <input 
                      type="time" 
                      value={form.startsAtTime || '00:00'} 
                      onChange={e => setForm({ ...form, startsAtTime: e.target.value })} 
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 font-medium" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">⏰ Slutdatum och tid</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="date" 
                      value={form.expiresAtDate || ''} 
                      onChange={e => setForm({ ...form, expiresAtDate: e.target.value })} 
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 font-medium" 
                    />
                    <input 
                      type="time" 
                      value={form.expiresAtTime || '23:59'} 
                      onChange={e => setForm({ ...form, expiresAtTime: e.target.value })} 
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 font-medium" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#014421] mb-3">Max användningar</label>
              <input 
                type="number" 
                min={0} 
                value={form.usageLimit || ''} 
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} 
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] transition-all duration-300 text-lg font-medium placeholder-gray-400 hover:bg-white" 
                placeholder="Lämna tomt för obegränsad" 
              />
            </div>
            
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input 
                type="checkbox" 
                id="active"
                checked={!!form.active} 
                onChange={e => setForm({ ...form, active: e.target.checked })} 
                className="h-6 w-6 text-[#014421] focus:ring-[#014421] border-gray-300 rounded-lg transition-all duration-300" 
              />
              <label htmlFor="active" className="text-lg font-semibold text-gray-900 cursor-pointer">
                ✨ Aktiv (kan användas av kunder)
              </label>
            </div>
            
            <div className="pt-6 space-y-3">
              <button 
                onClick={save} 
                disabled={saving || !form.code || !form.amount}
                className="w-full bg-gradient-to-r from-[#014421] to-[#93C560] text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Tag className="w-5 h-5" />
                    Spara rabattkod
                  </>
                )}
              </button>
              
              {editing && (
                <button 
                  onClick={openNew}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105"
                >
                  Avbryt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
} 