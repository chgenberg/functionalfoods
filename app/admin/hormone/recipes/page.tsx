'use client';

import { useEffect, useState } from 'react';

interface Recipe {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string | null;
  categories: string[];
  ingredients: string[];
  instructions: string;
}

export default function HormoneRecipesAdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/hormone/recipes/list', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setRecipes(data.recipes || []);
      else setError('Kunde inte hämta recept');
    } catch (e) {
      setError('Tekniskt fel');
    } finally {
      setLoading(false);
    }
  };

  const open = (r: Recipe) => setSelected({ ...r });

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/hormone/recipes/${selected.slug}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selected.title,
          imageUrl: selected.imageUrl,
          categories: selected.categories,
          ingredients: selected.ingredients,
          instructions: selected.instructions
        })
      });
      if (res.ok) {
        await load();
        alert('✅ Sparat');
        setSelected(null);
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Kunde inte spara');
      }
    } catch (e) {
      setError('Tekniskt fel');
    } finally {
      setSaving(false);
    }
  };

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) || r.slug.includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Hormonell Balans – Recept</h1>

      <div className="flex items-center gap-3 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Sök titel/slug" className="border px-3 py-2 rounded w-full" />
        <button onClick={load} className="px-3 py-2 border rounded">Uppdatera</button>
      </div>

      {loading ? <p>Laddar…</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="border rounded p-3 flex items-center gap-3">
              <img src={r.imageUrl || '/thumbnail.png'} alt={r.title} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-gray-500">{r.slug}</div>
              </div>
              <button onClick={()=>open(r)} className="px-3 py-2 bg-green-600 text-white rounded">Redigera</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded p-4 w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Redigera recept</h2>
              <button onClick={()=>setSelected(null)} className="px-2 py-1 border rounded">Stäng</button>
            </div>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            <label className="block mb-2 text-sm">Titel</label>
            <input value={selected.title} onChange={e=>setSelected({...selected!, title:e.target.value})} className="border px-3 py-2 rounded w-full mb-3" />

            <label className="block mb-2 text-sm">Bild-URL</label>
            <input value={selected.imageUrl || ''} onChange={e=>setSelected({...selected!, imageUrl:e.target.value})} className="border px-3 py-2 rounded w-full mb-3" />

            <label className="block mb-2 text-sm">Kategorier (kommaseparerade)</label>
            <input value={(selected.categories||[]).join(', ')} onChange={e=>setSelected({...selected!, categories:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="border px-3 py-2 rounded w-full mb-3" />

            <label className="block mb-2 text-sm">Ingredienser (en rad per ingrediens)</label>
            <textarea value={(selected.ingredients||[]).join('\n')} onChange={e=>setSelected({...selected!, ingredients:e.target.value.split('\n').map(s=>s.trim()).filter(Boolean)})} className="border px-3 py-2 rounded w-full h-40 mb-3" />

            <label className="block mb-2 text-sm">Instruktioner (numrerad text)</label>
            <textarea value={selected.instructions} onChange={e=>setSelected({...selected!, instructions:e.target.value})} className="border px-3 py-2 rounded w-full h-40 mb-4" />

            <div className="flex items-center justify-end gap-3">
              <button disabled={saving} onClick={save} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Spara</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


