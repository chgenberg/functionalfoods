"use client";

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiCheck, FiAlertCircle, FiShoppingCart, FiDownload } from 'react-icons/fi';
import Link from 'next/link';

export default function BasicsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/user/update-profile', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setName(data.user?.name || '');
        setEmail(data.user?.email || '');
        setAddressLine1(data.user?.addressLine1 || '');
        setAddressLine2(data.user?.addressLine2 || '');
        setPostalCode(data.user?.postalCode || '');
        setCity(data.user?.city || '');
        setCountry(data.user?.country || '');
        // Hämta orders
        const or = await fetch('/api/user/purchases', { headers: { Authorization: `Bearer ${token}` } });
        const purchases = await or.json();
        // purchases saknar orderId i svaret, men vi kan visa kursnamn och datum; kvitto kräver orderId – lämna tom länk om saknas
        setOrders(Array.isArray(purchases) ? purchases : []);
      } catch (e) {
        setMessage({ type: 'error', text: 'Kunde inte hämta användardata' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Lösenorden matchar inte' });
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          email,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
          addressLine1,
          addressLine2,
          postalCode,
          city,
          country,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kunde inte spara');
      setMessage({ type: 'success', text: 'Inställningar uppdaterade' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Kunde inte spara' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Laddar...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Kontoinställningar</h1>
      <div className="bg-white rounded-xl shadow p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FiUser /> Profil</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Namn</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">E‑post</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">Leveransadress</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="Adressrad 1" className="px-3 py-2 border rounded-lg" value={addressLine1} onChange={e=>setAddressLine1(e.target.value)} />
              <input placeholder="Adressrad 2" className="px-3 py-2 border rounded-lg" value={addressLine2} onChange={e=>setAddressLine2(e.target.value)} />
              <input placeholder="Postnummer" className="px-3 py-2 border rounded-lg" value={postalCode} onChange={e=>setPostalCode(e.target.value)} />
              <input placeholder="Stad" className="px-3 py-2 border rounded-lg" value={city} onChange={e=>setCity(e.target.value)} />
              <input placeholder="Land" className="px-3 py-2 border rounded-lg md:col-span-2" value={country} onChange={e=>setCountry(e.target.value)} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FiLock /> Byt lösenord</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="password" placeholder="Nuvarande" className="px-3 py-2 border rounded-lg" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
              <input type="password" placeholder="Nytt lösenord" className="px-3 py-2 border rounded-lg" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
              <input type="password" placeholder="Bekräfta nytt" className="px-3 py-2 border rounded-lg" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.type==='success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type==='success' ? <FiCheck className="inline mr-2"/> : <FiAlertCircle className="inline mr-2"/>}{message.text}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-3">
              <Link href="/utbildning" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"><FiShoppingCart/> Köp fler kurser</Link>
              {/* Kvittolista */}
            </div>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-secondary disabled:opacity-60">
              <FiSave/> {saving ? 'Sparar...' : 'Spara'}
            </button>
          </div>
        </form>
      </div>

      {/* Kvitton */}
      <div className="bg-white rounded-xl shadow p-6 md:p-8 mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FiDownload/> Kvitton</h2>
        <div className="text-sm text-gray-600 mb-3">Ladda ned kvitto för dina köp (PDF).</div>
        <div className="divide-y">
          {orders.length === 0 && <div className="py-3 text-gray-500">Inga kvitton tillgängliga ännu.</div>}
          {orders.map((p: any) => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.course?.name || 'Kurs'}</div>
                <div className="text-gray-500 text-sm">Köpt: {new Date(p.createdAt).toLocaleDateString('sv-SE')}</div>
              </div>
              {p.orderId ? (
                <a href={`/api/orders/receipt?orderId=${p.orderId}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-background hover:bg-background-secondary text-secondary">
                  <FiDownload/> Ladda ned
                </a>
              ) : (
                <span className="text-gray-400 text-sm">Kvitto ej tillgängligt</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 