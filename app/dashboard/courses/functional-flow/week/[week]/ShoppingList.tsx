'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiShoppingCart, FiDownload, FiShare2, FiTrash2, FiRefreshCw } from 'react-icons/fi';

interface ShoppingListItem {
  id: string;
  ingredient: string;
  isChecked: boolean;
}

interface ShoppingListProps {
  weekNumber: number;
  courseId: string;
}

export default function ShoppingList({ weekNumber, courseId }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchShoppingList();
  }, [weekNumber]);

  useEffect(() => {
    const checkedCount = items.filter(item => item.isChecked).length;
    const newProgress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;
    setProgress(newProgress);
  }, [items]);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/week/${weekNumber}/shopping-list`);
      const data = await response.json();
      setItems(data.shoppingList?.items || []);
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string, isChecked: boolean) => {
    // Optimistic update
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, isChecked } : item
      )
    );

    try {
      await fetch(`/api/courses/${courseId}/week/${weekNumber}/shopping-list`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isChecked })
      });
    } catch (error) {
      // Revert on error
      setItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, isChecked: !isChecked } : item
        )
      );
    }
  };

  const clearAll = () => {
    items.forEach(item => {
      if (item.isChecked) {
        toggleItem(item.id, false);
      }
    });
  };

  const shareList = () => {
    const text = `Inköpslista - Vecka ${weekNumber}\n\n` + 
      items.map(item => `${item.isChecked ? '✓' : '○'} ${item.ingredient}`).join('\n');
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Listan kopierad till urklipp!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-background-secondary rounded-xl">
            <FiShoppingCart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inköpslista</h2>
            <p className="text-sm text-gray-500">Vecka {weekNumber}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAll}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Rensa alla"
          >
            <FiRefreshCw className="w-5 h-5 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareList}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Dela lista"
          >
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{items.filter(item => item.isChecked).length} av {items.length} klara</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* Shopping list items */}
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer
                ${item.isChecked 
                  ? 'bg-background border-green-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                } border`}
              onClick={() => toggleItem(item.id, !item.isChecked)}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${item.isChecked 
                  ? 'bg-primary border-primary' 
                  : 'border-gray-300 group-hover:border-green-400'
                }
              `}>
                {item.isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <FiCheck className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
              
              <span className={`
                flex-1 select-none transition-all
                ${item.isChecked 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-900'
                }
              `}>
                {item.ingredient}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Ingen inköpslista för denna vecka ännu.</p>
          <p className="text-sm text-gray-400 mt-2">Kör sync-scriptet för att generera listan.</p>
        </div>
      )}
    </div>
  );
} 