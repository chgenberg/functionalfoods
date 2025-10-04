"use client";
import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Search, Tag, Calendar, Percent, DollarSign, AlertCircle, Check, X, Clock, Users } from 'lucide-react';

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
  id: string; // e.g., 'functional-basics'
  name: string; // e.g., 'Functional Basics'
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<any>({ 
    code: '', 
    type: 'percent', 
    amount: 10, 
    active: true,
    startsAtDate: '',
    startsAtTime: '00:00',
    expiresAtDate: '',
    expiresAtTime: '23:59',
    applicableCourseIds: [] as string[]
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/functional-courses');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourseOptions(data.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch {}
  };

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

  useEffect(()=>{ fetchCoupons(); fetchCourses(); },[]);
  useEffect(()=>{ const t = setTimeout(fetchCoupons, 300); return ()=>clearTimeout(t); }, [q]);

  const toggleCourse = (courseId: string) => {
    const list: string[] = Array.isArray(form.applicableCourseIds) ? [...form.applicableCourseIds] : [];
    const idx = list.indexOf(courseId);
    if (idx >= 0) list.splice(idx, 1); else list.push(courseId);
    setForm({ ...form, applicableCourseIds: list });
  };

  const openNew = () => { 
    setEditing(null); 
    setShowForm(true);
    setForm({ 
      code: '', 
      type: 'percent', 
      amount: 10, 
      active: true,
      startsAtDate: '',
      startsAtTime: '00:00',
      expiresAtDate: '',
      expiresAtTime: '23:59',
      applicableCourseIds: [] as string[]
    }); 
    setError('');
  };
  
  const openEdit = (c: Coupon) => { 
    setEditing(c); 
    setShowForm(true);
    
    // Parse existing datetime strings
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

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
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
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        applicableCourseIds: Array.isArray(form.applicableCourseIds) ? form.applicableCourseIds : []
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
        closeForm(); 
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
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const renderAppliesTo = (c: Coupon) => {
    const ids = Array.isArray(c.applicableCourseIds) ? c.applicableCourseIds : [];
    if (ids.length === 0) return 'Alla kurser';
    const labels = ids.map(id => (courseOptions.find(co => co.id === id)?.name || id));
    return labels.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 flex items-center gap-3">
                <Tag className="w-8 h-8 text-[#014421]" />
                Rabattkoder
              </h1>
              <p className="mt-2 text-gray-600">Hantera kampanjer och erbjudanden</p>
              <p className="text-sm text-gray-500 mt-1">
                🎟️ <strong>Tips:</strong> Skapa tidsbegränsade kampanjer och följ användning i realtid
              </p>
            </div>
            <button 
              onClick={openNew}
              className="bg-[#014421] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1a5f3f] transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ny rabattkod
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Search and Stats */}
        <div className="mb-8 grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)} 
                placeholder="Sök rabattkod..." 
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] transition-all" 
              />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktiva koder</p>
              <p className="text-xl font-semibold text-gray-900">
                {coupons.filter(c => c.active && !isExpired(c.expiresAt)).length}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total användning</p>
              <p className="text-xl font-semibold text-gray-900">
                {coupons.reduce((sum, c) => sum + c.timesUsed, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-[#014421] rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Laddar rabattkoder...</span>
            </div>
          </div>
        ) : coupons.length === 0 && !q ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-sm mx-auto">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga rabattkoder än</h3>
              <p className="text-gray-600 mb-6">Skapa din första rabattkod för att komma igång</p>
              <button 
                onClick={openNew}
                className="bg-[#014421] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1a5f3f] transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Skapa rabattkod
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <div 
                key={coupon.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-mono font-semibold text-gray-900">{coupon.code}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          coupon.active && !isExpired(coupon.expiresAt)
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            coupon.active && !isExpired(coupon.expiresAt) ? 'bg-green-600' : 'bg-gray-500'
                          }`}></div>
                          {coupon.active && !isExpired(coupon.expiresAt) ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        {isExpired(coupon.expiresAt) && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <X className="w-3 h-3" />
                            Utgången
                          </span>
                        )}
                      </div>
                      
                      <div className="grid sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Rabatt</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            {coupon.type === 'percent' ? (
                              <>
                                <Percent className="w-4 h-4 text-gray-400" />
                                {coupon.amount}%
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                {coupon.amount} kr
                              </>
                            )}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Använd</p>
                          <p className="font-medium text-gray-900">
                            {coupon.timesUsed} / {coupon.usageLimit || '∞'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 mb-1">Gäller</p>
                          <p className="font-medium text-gray-900 text-xs">{renderAppliesTo(coupon)}</p>
                        </div>
                        
                        <div className="sm:col-span-1">
                          <p className="text-gray-500 mb-1 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Giltighetstid
                          </p>
                          <p className="font-medium text-gray-900 text-xs">
                            {formatDate(coupon.startsAt)} – {formatDate(coupon.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        onClick={() => openEdit(coupon)} 
                        className="p-2 text-gray-600 hover:text-[#014421] hover:bg-gray-100 rounded-lg transition-all"
                        title="Redigera"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => remove(coupon.id)} 
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Ta bort"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">
                {editing ? 'Redigera rabattkod' : 'Ny rabattkod'}
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rabattkod</label>
                    <input 
                      value={form.code || ''} 
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                      placeholder="T.ex. SOMMAR25" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421] font-mono" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rabatttyp & värde</label>
                    <div className="flex gap-2">
                      <select 
                        value={form.type} 
                        onChange={e => setForm({ ...form, type: e.target.value })} 
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]"
                      >
                        <option value="percent">Procent (%)</option>
                        <option value="fixed">Fast belopp (kr)</option>
                      </select>
                      <input 
                        type="number" 
                        value={form.amount} 
                        onChange={e => setForm({ ...form, amount: e.target.value })} 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]" 
                        placeholder="Värde" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                    <div className="flex gap-2">
                      <input 
                        type="date" 
                        value={form.startsAtDate || ''} 
                        onChange={e => setForm({ ...form, startsAtDate: e.target.value })} 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]" 
                      />
                      <input 
                        type="time" 
                        value={form.startsAtTime || '00:00'} 
                        onChange={e => setForm({ ...form, startsAtTime: e.target.value })} 
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slutdatum</label>
                    <div className="flex gap-2">
                      <input 
                        type="date" 
                        value={form.expiresAtDate || ''} 
                        onChange={e => setForm({ ...form, expiresAtDate: e.target.value })} 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]" 
                      />
                      <input 
                        type="time" 
                        value={form.expiresAtTime || '23:59'} 
                        onChange={e => setForm({ ...form, expiresAtTime: e.target.value })} 
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max användningar (valfritt)</label>
                    <input 
                      type="number" 
                      min={0} 
                      value={form.usageLimit || ''} 
                      onChange={e => setForm({ ...form, usageLimit: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]/20 focus:border-[#014421]" 
                      placeholder="Obegränsat" 
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!form.active} 
                        onChange={e => setForm({ ...form, active: e.target.checked })} 
                        className="w-4 h-4 text-[#014421] focus:ring-[#014421] border-gray-300 rounded" 
                      />
                      <span className="text-sm font-medium text-gray-700">Aktiv rabattkod</span>
                    </label>
                  </div>
                </div>

                {/* Course scope */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gäller för kurser</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">
                      Lämna tomt för att gälla alla kurser.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {courseOptions.map((c) => {
                        const selected = Array.isArray(form.applicableCourseIds) && form.applicableCourseIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCourse(c.id)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selected ? 'bg-[#014421] text-white border-[#014421]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#014421]'}`}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={closeForm}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Avbryt
              </button>
              <button 
                onClick={save} 
                disabled={saving || !form.code || !form.amount}
                className="bg-[#014421] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1a5f3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sparar...
                  </>
                ) : (
                  'Spara'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 