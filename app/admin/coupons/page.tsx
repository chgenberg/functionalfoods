"use client";
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';

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

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/coupons?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  };

  useEffect(()=>{ fetchCoupons(); },[]);
  useEffect(()=>{ const t = setTimeout(fetchCoupons, 300); return ()=>clearTimeout(t); }, [q]);

  const openNew = () => { setEditing(null); setForm({ code: '', type: 'percent', amount: 10, active: true }); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ ...c, startsAt: c.startsAt?.slice(0,10), expiresAt: c.expiresAt?.slice(0,10) }); };

  const save = async () => {
    const payload = { ...form, amount: Number(form.amount), usageLimit: form.usageLimit? Number(form.usageLimit): null };
    const url = editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setEditing(null); openNew(); fetchCoupons(); }
    else alert('Kunde inte spara rabattkod');
  };
  const remove = async (id: string) => {
    if (!confirm('Ta bort rabattkod?')) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.ok) fetchCoupons();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rabattkoder</h1>
          <p className="text-gray-600">Hantera rabattkoder för kampanjer</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary"><FiPlus/>Ny kod</button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Sök kod..." className="w-full pl-9 pr-3 py-2 border rounded-lg" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Laddar...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 text-left">Kod</th>
                  <th className="text-left">Typ</th>
                  <th className="text-left">Värde</th>
                  <th className="text-left">Giltig</th>
                  <th className="text-left">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{c.code}</td>
                    <td>{c.type}</td>
                    <td>{c.type==='percent'? `${c.amount}%` : `${c.amount} kr`}</td>
                    <td>{c.startsAt? c.startsAt.slice(0,10): '—'} – {c.expiresAt? c.expiresAt.slice(0,10): '—'}</td>
                    <td>{c.active? 'Aktiv' : 'Inaktiv'}</td>
                    <td className="text-right">
                      <button onClick={()=>openEdit(c)} className="p-2 text-blue-600"><FiEdit3/></button>
                      <button onClick={()=>remove(c.id)} className="p-2 text-red-600"><FiTrash2/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FiTag/> {editing? 'Redigera rabattkod' : 'Ny rabattkod'}</h3>
          <div className="space-y-3">
            <input value={form.code||''} onChange={e=>setForm({ ...form, code: e.target.value })} placeholder="Kod (t.ex. SOMMAR20)" className="w-full px-3 py-2 border rounded" />
            <div className="flex gap-2">
              <select value={form.type} onChange={e=>setForm({ ...form, type: e.target.value })} className="px-3 py-2 border rounded">
                <option value="percent">Procent</option>
                <option value="fixed">Fast belopp</option>
              </select>
              <input type="number" value={form.amount} onChange={e=>setForm({ ...form, amount: e.target.value })} className="flex-1 px-3 py-2 border rounded" placeholder="Värde" />
            </div>
            <div className="flex gap-2">
              <input type="date" value={form.startsAt||''} onChange={e=>setForm({ ...form, startsAt: e.target.value })} className="px-3 py-2 border rounded flex-1" />
              <input type="date" value={form.expiresAt||''} onChange={e=>setForm({ ...form, expiresAt: e.target.value })} className="px-3 py-2 border rounded flex-1" />
            </div>
            <div className="flex gap-2">
              <input type="number" min={0} value={form.usageLimit||''} onChange={e=>setForm({ ...form, usageLimit: e.target.value })} className="px-3 py-2 border rounded flex-1" placeholder="Max användningar (valfritt)" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={e=>setForm({ ...form, active: e.target.checked })} /> Aktiv</label>
            </div>
            <button onClick={save} className="w-full py-2 rounded bg-primary text-white hover:bg-secondary">Spara</button>
          </div>
        </div>
      </div>
    </div>
  );
} 