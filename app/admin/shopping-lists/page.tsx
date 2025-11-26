'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

export default function AdminShoppingListsPage() {
  const searchParams = useSearchParams();
  const [courseType, setCourseType] = useState<'basics' | 'flow' | 'energy' | 'hormone'>('basics');
  const [weekNumber, setWeekNumber] = useState(1);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<ShoppingListItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'Mejeri',
    'Kött & Fisk',
    'Frukt & Grönt',
    'Skafferi',
    'Kryddor & Såser',
    'Fryst',
    'Övrigt'
  ];

  useEffect(() => {
    const q = searchParams?.get('course');
    if (q) {
      const map: Record<string, 'basics' | 'flow' | 'energy' | 'hormone'> = {
        'functional-basics': 'basics',
        'functional-flow': 'flow',
        'functional-energy': 'energy',
        'hormonell-balans': 'hormone',
        'basics': 'basics',
        'flow': 'flow',
        'energy': 'energy',
        'hormone': 'hormone'
      };
      const mapped = map[q];
      if (mapped && mapped !== courseType) setCourseType(mapped);
    }
  }, [searchParams]);

  useEffect(() => {
    loadShoppingList();
  }, [courseType, weekNumber]);

  const loadShoppingList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/shopping-lists/${courseType}/${weekNumber}`);
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data.items || []);
        setMessage({ 
          type: 'success', 
          text: `Laddad (${data.items?.length || 0} rader)` 
        });
      } else {
        setShoppingList([]);
        setMessage({ type: 'error', text: 'Inköpslista saknas för denna vecka' });
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
      setMessage({ type: 'error', text: 'Ett fel uppstod vid laddning' });
      setShoppingList([]);
    } finally {
      setLoading(false);
    }
  };

  const saveShoppingList = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/shopping-lists/${courseType}/${weekNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ items: shoppingList })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Sparad (${data.itemCount || 0} rader)` 
        });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Kunde inte spara' });
      }
    } catch (error) {
      console.error('Error saving shopping list:', error);
      setMessage({ type: 'error', text: 'Ett fel uppstod vid sparning' });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    const newItem: ShoppingListItem = {
      name: 'Ny ingrediens',
      amount: '1',
      unit: 'st',
      category: 'Övrigt'
    };
    setShoppingList([...shoppingList, newItem]);
    setEditingIndex(shoppingList.length);
    setEditItem(newItem);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditItem({ ...shoppingList[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editItem) {
      const newList = [...shoppingList];
      newList[editingIndex] = editItem;
      setShoppingList(newList);
      setEditingIndex(null);
      setEditItem(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditItem(null);
  };

  const deleteItem = (index: number) => {
    setShoppingList(shoppingList.filter((_, i) => i !== index));
  };

  const exportList = () => {
    const data = {
      week: weekNumber,
      courseType,
      items: shoppingList,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curated-${courseType}-week${weekNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-[var(--text-primary)]">Inköpslistor</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Redigera ingredienser för varje veckas inköpslista
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Kurs</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
              disabled={Boolean(searchParams?.get('course'))}
            >
              <option value="basics">Functional Basics</option>
              <option value="flow">Functional Flow</option>
              <option value="energy">Functional Energy</option>
              <option value="hormone">Hormonell Balans</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Vecka</label>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
            >
              {[1, 2, 3, 4, 5, 6].map(week => (
                <option key={week} value={week}>Vecka {week}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Shopping List Editor */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg">
        <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            Ingredienser ({shoppingList.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={exportList}
              className="px-3 py-1.5 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 transition-colors"
            >
              Exportera
            </button>
            <button
              onClick={addItem}
              className="px-3 py-1.5 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 transition-colors"
            >
              Lägg till
            </button>
            <button
              onClick={saveShoppingList}
              disabled={saving}
              className="px-3 py-1.5 text-xs bg-[var(--primary-green)] text-white rounded hover:bg-[#012a14] transition-colors disabled:opacity-50"
            >
              {saving ? 'Sparar...' : 'Spara'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">Laddar...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {shoppingList.map((item, index) => (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                {editingIndex === index && editItem ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                      placeholder="Ingrediens"
                    />
                    <input
                      type="text"
                      value={editItem.amount}
                      onChange={(e) => setEditItem({ ...editItem, amount: e.target.value })}
                      className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                      placeholder="Mängd"
                    />
                    <input
                      type="text"
                      value={editItem.unit}
                      onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                      className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                      placeholder="Enhet"
                    />
                    <select
                      value={editItem.category}
                      onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                      className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Spara
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-3 py-2 text-xs bg-gray-100 text-[var(--text-secondary)] rounded hover:bg-gray-200 transition-colors"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      <div className="text-sm text-[var(--text-primary)]">{item.name}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{item.amount} {item.unit}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{item.category}</div>
                      <div></div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(index)}
                        className="px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-gray-100 rounded transition-colors"
                      >
                        Redigera
                      </button>
                      <button
                        onClick={() => deleteItem(index)}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Ta bort
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {shoppingList.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                Inga ingredienser. Klicka på "Lägg till" för att börja.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
