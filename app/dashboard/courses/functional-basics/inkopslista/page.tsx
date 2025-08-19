'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiCheckSquare, FiSquare, FiPrinter, FiCopy } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';

interface ShoppingItem {
  ingredient: string;
  amount: number;
  unit: string;
  category: string;
}

interface ShoppingList {
  week: number;
  courseType: string;
  recipeCount: number;
  items: ShoppingItem[];
  generatedAt: string;
}

function ShoppingListContent() {
  const searchParams = useSearchParams();
  const weekNumber = parseInt(searchParams.get('week') || '1');
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShoppingList();
  }, [weekNumber]);

  const fetchShoppingList = async () => {
    try {
      const response = await fetch(`/api/shopping-list/basics/${weekNumber}`);
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemKey: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemKey)) {
      newChecked.delete(itemKey);
    } else {
      newChecked.add(itemKey);
    }
    setCheckedItems(newChecked);
  };

  const copyToClipboard = () => {
    if (!shoppingList) return;
    
    const text = shoppingList.items
      .map(item => `${item.amount} ${item.unit} ${item.ingredient}`)
      .join('\n');
    
    navigator.clipboard.writeText(text);
  };

  const print = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Ingen inköpslista tillgänglig för vecka {weekNumber}</p>
      </div>
    );
  }

  const groupedItems = shoppingList.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses/functional-basics" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#014421]">Inköpslista - Vecka {weekNumber}</h1>
            <p className="text-gray-600">{shoppingList.recipeCount} recept</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 bg-[#F3EFE3] text-[#014421] rounded-lg hover:bg-[#E8E0D4] transition-colors"
            title="Kopiera lista"
          >
            <FiCopy className="w-5 h-5" />
          </button>
          <button
            onClick={print}
            className="p-2 bg-[#F3EFE3] text-[#014421] rounded-lg hover:bg-[#E8E0D4] transition-colors"
            title="Skriv ut"
          >
            <FiPrinter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((week) => (
          <Link
            key={week}
            href={`/dashboard/courses/functional-basics/inkopslista?week=${week}`}
            className={`
              px-4 py-2 rounded-full text-sm transition-all
              ${week === weekNumber 
                ? 'bg-[#014421] text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            Vecka {week}
          </Link>
        ))}
      </div>

      {/* Shopping List */}
      <div className="space-y-8 print:space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:p-4"
          >
            <h2 className="text-lg font-bold text-[#014421] mb-4">{category}</h2>
            <div className="space-y-2">
              {items.map((item, index) => {
                const itemKey = `${category}-${index}`;
                const isChecked = checkedItems.has(itemKey);
                
                return (
                  <div
                    key={itemKey}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 print:py-1"
                  >
                    <button
                      onClick={() => toggleItem(itemKey)}
                      className="print:hidden"
                    >
                      {isChecked ? (
                        <FiCheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <FiSquare className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <span className={`flex-1 ${isChecked ? 'line-through text-gray-400' : ''}`}>
                      <span className="font-medium">{item.amount} {item.unit}</span> {item.ingredient}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    }>
      <ShoppingListContent />
    </Suspense>
  );
} 