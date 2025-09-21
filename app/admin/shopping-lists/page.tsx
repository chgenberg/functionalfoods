'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Save, Plus, Trash2, Edit2, Check, X, Download, Upload } from 'lucide-react';

interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
  category: string;
}

interface ShoppingList {
  week: number;
  courseType: string;
  items: ShoppingListItem[];
}

export default function AdminShoppingListsPage() {
  const [courseType, setCourseType] = useState<'basics' | 'flow' | 'energy'>('basics');
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
    loadShoppingList();
  }, [courseType, weekNumber]);

  const loadShoppingList = async () => {
    setLoading(true);
    try {
      // First try to load curated list
      const curatedResponse = await fetch(`/api/admin/shopping-lists/${courseType}/${weekNumber}`);
      if (curatedResponse.ok) {
        const data = await curatedResponse.json();
        setShoppingList(data.items || []);
        setMessage({ type: 'success', text: 'Manuellt redigerad lista laddad' });
      } else {
        // Fall back to generated list
        const response = await fetch(`/api/shopping-list/${courseType}/${weekNumber}?servings=4`);
        if (response.ok) {
          const data = await response.json();
          setShoppingList(data.ingredients || []);
          setMessage({ type: 'success', text: 'Genererad lista laddad' });
        } else {
          setShoppingList([]);
          setMessage({ type: 'error', text: 'Kunde inte ladda inköpslista' });
        }
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
      setMessage({ type: 'error', text: 'Ett fel uppstod vid laddning' });
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
        setMessage({ type: 'success', text: 'Inköpslista sparad!' });
      } else {
        setMessage({ type: 'error', text: 'Kunde inte spara inköpslista' });
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hantera Inköpslistor</h1>
        <p className="text-gray-600">Redigera ingrediensmängder och namn för varje veckas inköpslista</p>
      </div>

      {/* Course and Week Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kurs</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as 'basics' | 'flow' | 'energy')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
            >
              <option value="basics">Functional Basics</option>
              <option value="flow">Functional Flow</option>
              <option value="energy">Functional Insulin balance/Energy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vecka</label>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Shopping List Editor */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ingredienser ({shoppingList.length} st)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportList}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportera
              </button>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-[#014421] text-white rounded-lg hover:bg-[#112A12] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lägg till ingrediens
              </button>
              <button
                onClick={saveShoppingList}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#93C560] text-white rounded-lg hover:bg-[#7FBA3D] transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sparar...' : 'Spara lista'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar inköpslista...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shoppingList.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                {editingIndex === index && editItem ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                      placeholder="Ingrediens"
                    />
                    <input
                      type="text"
                      value={editItem.amount}
                      onChange={(e) => setEditItem({ ...editItem, amount: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                      placeholder="Mängd"
                    />
                    <input
                      type="text"
                      value={editItem.unit}
                      onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                      placeholder="Enhet"
                    />
                    <select
                      value={editItem.category}
                      onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Spara
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-gray-600">{item.amount} {item.unit}</div>
                      <div className="text-gray-600">{item.category}</div>
                      <div></div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(index)}
                        className="p-2 text-gray-600 hover:text-[#014421] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(index)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
