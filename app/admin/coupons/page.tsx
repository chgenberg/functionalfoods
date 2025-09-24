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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-12">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-[#014421] mb-4 flex items-center gap-4">
                <div className="bg-[#014421] p-4 rounded-2xl">
                  <Tag className="w-10 h-10 text-white" />
                </div>
                Rabattkoder
              </h1>
              <p className="text-gray-600 text-xl max-w-2xl leading-relaxed">Hantera rabattkoder för kampanjer och erbjudanden. Skapa, redigera och övervaka användningen av dina rabattkoder.</p>
            </div>
            <button 
              onClick={openNew}
              className="bg-[#014421] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#112A12] transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              Ny rabattkod
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">

      {/* Error message */}
      {error && (
        <div className="mb-6 admin-alert admin-alert-error flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-12">
        <div className="relative max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Sök rabattkod efter kod eller typ..." 
            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 text-xl font-medium placeholder-gray-500 shadow-sm hover:shadow-lg" 
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Coupons list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            {loading ? (
              <div className="p-20 text-center">
                <div className="relative mx-auto w-24 h-24">
                  <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 border-4 border-[#014421] rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-8 text-gray-700 text-xl font-semibold">Laddar rabattkoder...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="p-20 text-center">
                <div className="bg-[#014421] p-8 rounded-full w-32 h-32 mx-auto mb-8">
                  <Tag className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Inga rabattkoder hittades</h3>
                <p className="text-gray-600 mb-8 text-xl max-w-md mx-auto leading-relaxed">Skapa din första rabattkod för att komma igång med kampanjer och erbjudanden</p>
                <button 
                  onClick={openNew}
                  className="bg-[#014421] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#112A12] transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
                >
                  <Plus className="w-6 h-6" />
                  Skapa rabattkod
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left px-8 py-6 font-bold text-[#014421] text-base uppercase tracking-wide">Kod</th>
                      <th className="text-left px-8 py-6 font-bold text-[#014421] text-base uppercase tracking-wide">Typ</th>
                      <th className="text-left px-8 py-6 font-bold text-[#014421] text-base uppercase tracking-wide">Värde</th>
                      <th className="text-left px-8 py-6 font-bold text-[#014421] text-base uppercase tracking-wide">Giltighet</th>
                      <th className="text-left px-8 py-6 font-bold text-[#014421] text-base uppercase tracking-wide">Användning</th>
                      <th className="text-left px-8 py-6 font-bold text-[#014421] text-base uppercase tracking-wide">Status</th>
                      <th className="px-8 py-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c, index) => (
                      <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-8 py-6">
                          <span className="font-mono font-bold text-[#014421] bg-gray-100 px-4 py-2 rounded-xl text-lg">{c.code}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center gap-3">
                            {c.type === 'percent' ? (
                              <>
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                                  <Percent className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-gray-800 font-semibold text-lg">Procent</span>
                              </>
                            ) : (
                              <>
                                <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-gray-800 font-semibold text-lg">Fast belopp</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-3xl text-[#014421]">
                            {c.type === 'percent' ? `${c.amount}%` : `${c.amount} kr`}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="text-gray-900 font-semibold text-base">{formatDate(c.startsAt)} – {formatDate(c.expiresAt)}</div>
                            {isExpired(c.expiresAt) && (
                              <span className="inline-flex items-center gap-2 text-red-700 text-sm font-bold bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                <AlertCircle className="w-4 h-4" />
                                Utgången
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-[#014421]">{c.timesUsed}</span>
                            <span className="text-gray-400 text-xl">/</span>
                            <span className="text-gray-700 font-semibold text-lg">{c.usageLimit || '∞'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-base ${
                            c.active && !isExpired(c.expiresAt)
                              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                              : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                          }`}>
                            <div className={`w-3 h-3 rounded-full ${
                              c.active && !isExpired(c.expiresAt) ? 'bg-green-600' : 'bg-gray-500'
                            }`}></div>
                            {c.active && !isExpired(c.expiresAt) ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button 
                              onClick={() => openEdit(c)} 
                              className="p-4 text-[#014421] hover:text-white hover:bg-[#014421] rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                              title="Redigera"
                            >
                              <Edit3 className="w-6 h-6" />
                            </button>
                            <button 
                              onClick={() => remove(c.id)} 
                              className="p-4 text-red-500 hover:text-white hover:bg-red-500 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                              title="Ta bort"
                            >
                              <Trash2 className="w-6 h-6" />
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
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200 sticky top-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#014421] p-4 rounded-2xl">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-[#014421]">
              {editing ? 'Redigera rabattkod' : 'Ny rabattkod'}
            </h3>
          </div>
          
          <div className="space-y-8">
            <div>
              <label className="block text-base font-bold text-[#014421] mb-4">Rabattkod</label>
              <input 
                value={form.code || ''} 
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                placeholder="T.ex. SOMMAR20" 
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 text-xl font-mono font-bold placeholder-gray-500 hover:bg-white hover:shadow-md" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-[#014421] mb-4">Typ</label>
                <div className="relative">
                  <select 
                    value={form.type} 
                    onChange={e => setForm({ ...form, type: e.target.value })} 
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 text-xl font-semibold appearance-none cursor-pointer hover:bg-white hover:shadow-md"
                  >
                    <option value="percent">📊 Procent</option>
                    <option value="fixed">💰 Fast belopp</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#014421] pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-base font-bold text-[#014421] mb-4">Värde</label>
                <input 
                  type="number" 
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: e.target.value })} 
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 text-xl font-bold placeholder-gray-500 hover:bg-white hover:shadow-md" 
                  placeholder="Värde" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-bold text-[#014421] mb-4 flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                Giltighetstid
              </label>
              <div className="space-y-6 bg-gray-50 p-8 rounded-2xl border-2 border-gray-200">
                <div>
                  <label className="text-base font-bold text-gray-800 mb-3 block">🚀 Startdatum och tid</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="date" 
                      value={form.startsAtDate || ''} 
                      onChange={e => setForm({ ...form, startsAtDate: e.target.value })} 
                      className="px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 font-semibold text-lg hover:shadow-md" 
                    />
                    <input 
                      type="time" 
                      value={form.startsAtTime || '00:00'} 
                      onChange={e => setForm({ ...form, startsAtTime: e.target.value })} 
                      className="px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 font-semibold text-lg hover:shadow-md" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-base font-bold text-gray-800 mb-3 block">⏰ Slutdatum och tid</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="date" 
                      value={form.expiresAtDate || ''} 
                      onChange={e => setForm({ ...form, expiresAtDate: e.target.value })} 
                      className="px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 font-semibold text-lg hover:shadow-md" 
                    />
                    <input 
                      type="time" 
                      value={form.expiresAtTime || '23:59'} 
                      onChange={e => setForm({ ...form, expiresAtTime: e.target.value })} 
                      className="px-5 py-4 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 font-semibold text-lg hover:shadow-md" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-base font-bold text-[#014421] mb-4">Max användningar</label>
              <input 
                type="number" 
                min={0} 
                value={form.usageLimit || ''} 
                onChange={e => setForm({ ...form, usageLimit: e.target.value })} 
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#014421]/20 focus:border-[#014421] transition-all duration-300 text-xl font-semibold placeholder-gray-500 hover:bg-white hover:shadow-md" 
                placeholder="Lämna tomt för obegränsad" 
              />
            </div>
            
            <div className="flex items-center gap-5 bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
              <input 
                type="checkbox" 
                id="active"
                checked={!!form.active} 
                onChange={e => setForm({ ...form, active: e.target.checked })} 
                className="h-7 w-7 text-[#014421] focus:ring-[#014421] border-gray-400 rounded-xl transition-all duration-300" 
              />
              <label htmlFor="active" className="text-xl font-bold text-gray-900 cursor-pointer">
                ✨ Aktiv (kan användas av kunder)
              </label>
            </div>
            
            <div className="pt-8 space-y-4">
              <button 
                onClick={save} 
                disabled={saving || !form.code || !form.amount}
                className="w-full bg-[#014421] text-white px-8 py-5 rounded-2xl font-bold text-xl hover:bg-[#112A12] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Tag className="w-6 h-6" />
                    Spara rabattkod
                  </>
                )}
              </button>
              
              {editing && (
                <button 
                  onClick={openNew}
                  className="w-full bg-gray-200 text-gray-800 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Avbryt redigering
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