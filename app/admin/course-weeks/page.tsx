'use client';

import { useEffect, useState } from 'react';
import { Loader2, Edit, Save, Trash2, Plus } from 'lucide-react';

interface CourseWeekMeta {
  id?: string;
  course: 'basic' | 'flow' | 'energy';
  weekNumber: number;
  weekTitle?: string | null;
  weekSubtitle?: string | null;
  heroImage?: string | null;
  videoUrl?: string | null;
}

export default function AdminCourseWeeksPage() {
  const [weeks, setWeeks] = useState<CourseWeekMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState<'basic' | 'flow' | 'energy' | 'all'>('all');
  const [editing, setEditing] = useState<CourseWeekMeta | null>(null);

  const fetchWeeks = async () => {
    setLoading(true);
    try {
      const url = courseFilter === 'all' ? '/api/admin/course-weeks' : `/api/admin/course-weeks?course=${courseFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setWeeks(data.weeks || []);
    } catch (e) {
      console.error('Failed to load course weeks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeks();
  }, [courseFilter]);

  const saveWeek = async () => {
    if (!editing) return;
    const res = await fetch('/api/admin/course-weeks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    });
    if (res.ok) {
      setEditing(null);
      fetchWeeks();
    }
  };

  const deleteWeek = async (course: string, weekNumber: number) => {
    if (!confirm('Ta bort denna veckometa?')) return;
    await fetch(`/api/admin/course-weeks?course=${course}&week=${weekNumber}`, { method: 'DELETE' });
    fetchWeeks();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vecko‑metadata</h1>
          <p className="text-gray-600">Rubrik, underrubrik, hero‑bild och video per vecka</p>
        </div>
        <button
          onClick={() => setEditing({ course: 'basic', weekNumber: 1 } as CourseWeekMeta)}
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Underrubrik</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeks.map((w) => (
                <tr key={`${w.course}-${w.weekNumber}`}>
                  <td className="px-4 py-2 text-sm">{w.course}</td>
                  <td className="px-4 py-2 text-sm">{w.weekNumber}</td>
                  <td className="px-4 py-2 text-sm">{w.weekTitle || '-'}</td>
                  <td className="px-4 py-2 text-sm">{w.weekSubtitle || '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing(w)} className="text-blue-600 hover:text-blue-800 mr-3">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Titel</label>
                  <input type="text" value={editing.weekTitle || ''} onChange={(e) => setEditing({ ...editing, weekTitle: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Underrubrik</label>
                  <input type="text" value={editing.weekSubtitle || ''} onChange={(e) => setEditing({ ...editing, weekSubtitle: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Hero‑bild (URL)</label>
                  <input type="text" value={editing.heroImage || ''} onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="/path/to/image.jpg" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Video‑URL</label>
                  <input type="text" value={editing.videoUrl || ''} onChange={(e) => setEditing({ ...editing, videoUrl: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="https://..." />
                </div>
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