"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Search, Tag, Calendar, Percent, DollarSign, AlertCircle, Clock, CheckCircle } from 'lucide-react';

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
  description?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ 
    code: '', 
    type: 'percent', 
    amount: 10, 
    active: true,
    description: '',
    startsAt: '',
    expiresAt: '',
    usageLimit: ''
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

  useEffect(() => { fetchCoupons(); }, []);
  useEffect(() => { 
    const t = setTimeout(fetchCoupons, 300); 
    return () => clearTimeout(t); 
  }, [q]);

  const openNew = () => { 
    setEditing(null); 
    setForm({ 
      code: '', 
      type: 'percent', 
      amount: 10, 
      active: true,
      description: '',
      startsAt: '',
      expiresAt: '',
      usageLimit: ''
    }); 
    setError('');
    setShowForm(true);
  };
  
  const openEdit = (c: Coupon) => { 
    setEditing(c); 
    setForm({ 
      ...c, 
      startsAt: c.startsAt?.slice(0,10) || '', 
      expiresAt: c.expiresAt?.slice(0,10) || '',
      usageLimit: c.usageLimit?.toString() || ''
    }); 
    setError('');
    setShowForm(true);
  };

  const save = async () => {
    setError('');
    setSaving(true);
    
    try {
      const payload = { 
        ...form, 
        amount: Number(form.amount), 
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
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
        setShowForm(false);
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
      if (res.ok) {
        fetchCoupons();
      } else {
        const data = await res.json();
        setError(data.error || 'Kunde inte ta bort rabattkod');
      }
    } catch (e) {
      setError('Ett fel uppstod vid borttagning');
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const startDate = coupon.startsAt ? new Date(coupon.startsAt) : null;
    const endDate = coupon.expiresAt ? new Date(coupon.expiresAt) : null;

    if (!coupon.active) return { status: 'Inaktiv', color: 'admin-badge-info' };
    if (startDate && now < startDate) return { status: 'Schemalagd', color: 'admin-badge-warning' };
    if (endDate && now > endDate) return { status: 'Utgången', color: 'admin-badge-info' };
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) return { status: 'Förbrukad', color: 'admin-badge-info' };
    
    return { status: 'Aktiv', color: 'admin-badge-success' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar rabattkoder...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Rabattkoder</h1>
          <p className="text-[var(--text-secondary)]">Hantera schemalagda rabattkoder och kampanjer</p>
        </div>
        
        <button
          onClick={openNew}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Ny rabattkod
        </button>
      </div>

      {/* Search */}
      <div className="admin-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Sök rabattkoder..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
      </div>

      {/* Coupons Table */}
      {coupons.length > 0 ? (
        <div className="admin-table">
          <table className="w-full">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Rabatt</th>
                <th>Schemaläggning</th>
                <th>Användning</th>
                <th>Status</th>
                <th>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const statusInfo = getCouponStatus(coupon);
                
                return (
                  <tr key={coupon.id}>
                    <td>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{coupon.code}</p>
                        {coupon.description && (
                          <p className="text-sm text-[var(--text-secondary)]">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="flex items-center gap-2">
                        {coupon.type === 'percent' ? (
                          <Percent className="w-4 h-4 text-[var(--primary-green)]" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-[var(--primary-green)]" />
                        )}
                        <span className="font-medium">
                          {coupon.amount}{coupon.type === 'percent' ? '%' : ' kr'}
                        </span>
                      </div>
                    </td>
                    
                    <td>
                      <div className="text-sm">
                        {coupon.startsAt && (
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3 text-green-500" />
                            <span>Från: {new Date(coupon.startsAt).toLocaleDateString('sv-SE')}</span>
                          </div>
                        )}
                        {coupon.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-500" />
                            <span>Till: {new Date(coupon.expiresAt).toLocaleDateString('sv-SE')}</span>
                          </div>
                        )}
                        {!coupon.startsAt && !coupon.expiresAt && (
                          <span className="text-[var(--text-secondary)]">Ingen begränsning</span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="text-sm">
                        <p className="font-medium">{coupon.timesUsed}</p>
                        <p className="text-[var(--text-secondary)]">
                          {coupon.usageLimit ? `av ${coupon.usageLimit}` : 'obegränsat'}
                        </p>
                      </div>
                    </td>
                    
                    <td>
                      <span className={`admin-badge ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </td>
                    
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="admin-btn admin-btn-secondary text-xs"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => remove(coupon.id)}
                          className="admin-btn admin-btn-danger text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card text-center py-12">
          <Tag className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            {q ? 'Inga rabattkoder matchar sökningen' : 'Inga rabattkoder skapade än'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            {q ? 'Prova att ändra sökterm' : 'Skapa din första rabattkod för att komma igång'}
          </p>
          <button
            onClick={openNew}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="w-4 h-4" />
            Skapa rabattkod
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="admin-modal max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-[var(--primary-green)]">
                {editing ? 'Redigera rabattkod' : 'Skapa ny rabattkod'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="admin-alert admin-alert-error mb-4">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Rabattkod *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="admin-input"
                    placeholder="SUMMER2025"
                  />
                </div>

                <div>
                  <label className="admin-label">Beskrivning</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="admin-input"
                    placeholder="Sommarkampanj 2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Rabattyp *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="percent">Procent (%)</option>
                    <option value="fixed">Fast belopp (kr)</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">
                    Rabatt {form.type === 'percent' ? '(%)' : '(kr)'} *
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="admin-input"
                    min="0"
                    max={form.type === 'percent' ? '100' : undefined}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schemaläggning
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Startdatum</label>
                    <input
                      type="date"
                      value={form.startsAt}
                      onChange={(e) => setForm(prev => ({ ...prev, startsAt: e.target.value }))}
                      className="admin-input"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Lämna tom för omedelbar aktivering
                    </p>
                  </div>

                  <div>
                    <label className="admin-label">Slutdatum</label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => setForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="admin-input"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Lämna tom för ingen utgång
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-[var(--primary-green)] mb-4">Begränsningar</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Användningsgräns</label>
                    <input
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) => setForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                      className="admin-input"
                      placeholder="Obegränsat"
                      min="1"
                    />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Max antal gånger koden kan användas
                    </p>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))}
                        className="w-4 h-4 text-[var(--primary-green)] rounded"
                      />
                      <span className="text-sm text-[var(--text-primary)]">Aktivera rabattkod</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="admin-btn admin-btn-secondary"
              >
                Avbryt
              </button>
              
              <button
                onClick={save}
                disabled={saving || !form.code || !form.amount}
                className="admin-btn admin-btn-primary"
              >
                {saving ? 'Sparar...' : (editing ? 'Uppdatera' : 'Skapa')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
