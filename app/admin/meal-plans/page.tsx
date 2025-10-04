'use client';

import { useEffect, useState } from 'react';
import { Loader2, Edit, Save, Trash2, Plus } from 'lucide-react';

interface MealPlanWeek {
  id?: string;
  course: 'basic' | 'flow' | 'energy';
  weekNumber: number;
  title?: string | null;
  days: any;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminMealPlansPage() {
  const [weeks, setWeeks] = useState<MealPlanWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<'basic' | 'flow' | 'energy' | 'all'>('all');
  const [editing, setEditing] = useState<MealPlanWeek | null>(null);
  const [editorValue, setEditorValue] = useState('');

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const url = courseFilter === 'all' ? '/api/admin/meal-plans' : `/api/admin/meal-plans?course=${courseFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setWeeks(data.weeks || []);
    } catch (e) {
      console.error('Failed to load meal plans', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeks();
  }, [courseFilter]);

  const openEditor = (week?: MealPlanWeek) => {
    if (week) {
      setEditing(week);
      setEditorValue(JSON.stringify(week.days, null, 2));
    } else {
      const newWeek: MealPlanWeek = {
        course: 'basic',
        weekNumber: 1,
        title: '',
        days: { Måndag: {}, Tisdag: {}, Onsdag: {}, Torsdag: {}, Fredag: {}, Lördag: {}, Söndag: {} }
      } as any;
      setEditing(newWeek);
      setEditorValue(JSON.stringify(newWeek.days, null, 2));
    }
  };

  const saveWeek = async () => {
    if (!editing) return;
    try {
      const parsed = JSON.parse(editorValue);

      // Enkel schema-validering för "days"
      const dayKeys = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
      const missingDays = dayKeys.filter(k => !(parsed && typeof parsed === 'object' && k in parsed));
      if (missingDays.length > 0) {
        alert('Ogiltig struktur: saknar dag(ar): ' + missingDays.join(', '));
        return;
      }
      for (const k of dayKeys) {
        const d = parsed[k] || {};
        const hasAny = !!(d.breakfast || d.lunch || d.dinner || d.snack || d.dessert);
        if (!hasAny) {
          alert(`Ogiltig struktur: '${k}' måste innehålla minst en av breakfast/lunch/dinner/snack/dessert`);
          return;
        }
        for (const mt of ['breakfast','lunch','dinner','snack','dessert']) {
          if (d[mt] && typeof d[mt] !== 'object') {
            alert(`Ogiltig struktur: '${k}.${mt}' måste vara ett objekt { name, recipeLink? }`);
            return;
          }
          if (d[mt] && !d[mt].name) {
            alert(`Ogiltig struktur: '${k}.${mt}.name' saknas`);
            return;
          }
        }
      }

      const res = await fetch('/api/admin/meal-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editing, days: parsed })
      });
      if (res.ok) {
        setEditing(null);
        setEditorValue('');
        fetchWeeks();
      }
    } catch (e) {
      alert('Ogiltig JSON i "days"');
    }
  };

  const deleteWeek = async (course: string, weekNumber: number) => {
    if (!confirm('Ta bort detta veckoschema?')) return;
    await fetch(`/api/admin/meal-plans?course=${course}&week=${weekNumber}`, { method: 'DELETE' });
    fetchWeeks();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kostscheman</h1>
          <p className="text-gray-600">Hantera veckomenyer (Basics / Flow / Energy)</p>
        </div>
        <button
          onClick={() => openEditor()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ny vecka
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-4">
        <label className="text-sm text-gray-600">Kurs</label>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="all">Alla</option>
          <option value="basic">Basics</option>
          <option value="flow">Flow</option>
          <option value="energy">Energy</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kurs</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vecka</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeks.map((w) => (
                <tr key={`${w.course}-${w.weekNumber}`}>
                  <td className="px-4 py-2 text-sm">{w.course}</td>
                  <td className="px-4 py-2 text-sm">{w.weekNumber}</td>
                  <td className="px-4 py-2 text-sm">{w.title || '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => openEditor(w)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit className="h-4 w-4 inline" />
                    </button>
                    <button onClick={() => deleteWeek(w.course, w.weekNumber)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {weeks.length === 0 && (
            <div className="text-center py-12 text-gray-500">Inget hittades</div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? 'Redigera' : 'Ny'} vecka</h2>
              <button onClick={() => setEditing(null)} className="text-gray-600">Stäng</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Kurs</label>
                  <select value={editing.course} onChange={(e) => setEditing({ ...editing, course: e.target.value as any })} className="w-full border rounded px-3 py-2">
                    <option value="basic">Basics</option>
                    <option value="flow">Flow</option>
                    <option value="energy">Energy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Vecka</label>
                  <input type="number" value={editing.weekNumber} onChange={(e) => setEditing({ ...editing, weekNumber: parseInt(e.target.value, 10) })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Titel</label>
                  <input type="text" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Days (JSON)</label>
                <textarea value={editorValue} onChange={(e) => setEditorValue(e.target.value)} className="w-full border rounded px-3 py-2 font-mono text-sm h-72" />
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2">Avbryt</button>
              <button onClick={saveWeek} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Save className="h-4 w-4" /> Spara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 