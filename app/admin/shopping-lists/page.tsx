'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Save, Plus, Trash2, Edit2, Check, X, Download, Upload, Info } from 'lucide-react';

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
      // Load from database via admin API
      const response = await fetch(`/api/admin/shopping-lists/${courseType}/${weekNumber}`);
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data.items || []);
        setMessage({ 
          type: 'success', 
          text: `Inköpslista från databas laddad (${data.items?.length || 0} rader)` 
        });
      } else {
        setShoppingList([]);
        setMessage({ type: 'error', text: 'Inköpslista saknas i databasen för denna vecka' });
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
      setMessage({ type: 'error', text: 'Ett fel uppstod vid laddning från databas' });
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
          text: `Inköpslista sparad till databas! (${data.itemCount || 0} rader)` 
        });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Kunde inte spara inköpslista' });
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Hantera Inköpslistor</h1>
        <p className="text-[var(--text-secondary)] font-light">Redigera ingrediensmängder och namn för varje veckas inköpslista</p>
        <p className="text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span><strong>Tips:</strong> Inköpslistor genereras automatiskt från kostscheman. Du kan justera mängder och kategorier här.</span>
          </span>
        </p>
      </div>

      {/* Course and Week Selector */}
      <div className="admin-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Kurs</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as 'basics' | 'flow' | 'energy')}
              className="admin-select"
            >
              <option value="basics">Functional Basics</option>
              <option value="flow">Functional Flow</option>
              <option value="energy">Functional Insulin balance/Energy</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Vecka</label>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(parseInt(e.target.value))}
              className="admin-select"
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
          className={`mb-6 admin-alert ${
            message.type === 'success' ? 'admin-alert-success' : 'admin-alert-error'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Shopping List Editor */}
      <div className="admin-card">
        <div className="pb-6 border-b border-[var(--border-light)] mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--primary-green)]">
              Ingredienser ({shoppingList.length} st)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportList}
                className="admin-btn admin-btn-secondary"
              >
                <Download className="w-4 h-4" />
                Exportera
              </button>
              <button
                onClick={addItem}
                className="admin-btn admin-btn-secondary"
              >
                <Plus className="w-4 h-4" />
                Lägg till ingrediens
              </button>
              <button
                onClick={saveShoppingList}
                disabled={saving}
                className="admin-btn admin-btn-primary"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sparar...' : 'Spara lista'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-4 text-[var(--text-secondary)]">Laddar inköpslista...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shoppingList.map((item, index) => (
              <div key={index} className="p-4 hover:bg-[var(--primary-beige)] transition-colors rounded-lg">
                {editingIndex === index && editItem ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="admin-input"
                      placeholder="Ingrediens"
                    />
                    <input
                      type="text"
                      value={editItem.amount}
                      onChange={(e) => setEditItem({ ...editItem, amount: e.target.value })}
                      className="admin-input"
                      placeholder="Mängd"
                    />
                    <input
                      type="text"
                      value={editItem.unit}
                      onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                      className="admin-input"
                      placeholder="Enhet"
                    />
                    <select
                      value={editItem.category}
                      onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                      className="admin-select"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 admin-btn admin-btn-success justify-center"
                      >
                        <Check className="w-4 h-4" />
                        Spara
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 admin-btn admin-btn-secondary justify-center"
                      >
                        <X className="w-4 h-4" />
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
                      <div className="text-[var(--text-secondary)]">{item.amount} {item.unit}</div>
                      <div className="text-[var(--text-secondary)]">{item.category}</div>
                      <div></div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(index)}
                        className="p-2 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(index)}
                        className="p-2 text-[var(--coral-accent)] hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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
