'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShoppingItem {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked?: boolean;
}

export default function ProvaPaVeckaInkopslista() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const res = await fetch('/api/admin/shopping-lists/prova-pa-vecka/1');
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch shopping list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();

    // Load checked items from localStorage
    const saved = localStorage.getItem('provaPaVecka_shoppingChecked');
    if (saved) {
      setCheckedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleItem = (itemName: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      localStorage.setItem('provaPaVecka_shoppingChecked', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const clearAll = () => {
    setCheckedItems(new Set());
    localStorage.removeItem('provaPaVecka_shoppingChecked');
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Övrigt';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const categoryOrder = [
    'Grönsaker',
    'Frukt & bär',
    'Kött & fisk',
    'Mejeri',
    'Torrvaror',
    'Kryddor',
    'Övrigt'
  ];

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#014421] border-t-transparent"></div>
      </div>
    );
  }

  const checkedCount = checkedItems.size;
  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/prova-pa-vecka/oversikt" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ChevronLeft className="w-5 h-5" /> Tillbaka
              </Link>
            </div>
            <span className="text-[#014421] font-bold">Inköpslista</span>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#014421] flex items-center gap-3">
                <ShoppingCart className="w-8 h-8" />
                Inköpslista
              </h1>
              <p className="text-gray-600 mt-2">
                Prova på-veckan • {checkedCount} av {totalCount} avprickade
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearAll}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Rensa alla
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
              >
                <Download className="w-5 h-5" />
                Skriv ut
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#014421] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shopping List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ingen inköpslista hittades</h3>
            <p className="text-gray-600">
              Inköpslistan genereras automatiskt från veckans recept.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCategories.map((category) => (
              <div key={category} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#014421] text-white px-6 py-3">
                  <h2 className="font-bold">{category}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupedItems[category].map((item, index) => {
                    const isChecked = checkedItems.has(item.name);
                    return (
                      <motion.div
                        key={`${item.name}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => toggleItem(item.name)}
                        className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${
                          isChecked ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-[#014421]'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span
                            className={`font-medium transition-all ${
                              isChecked ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {item.quantity} {item.unit}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}