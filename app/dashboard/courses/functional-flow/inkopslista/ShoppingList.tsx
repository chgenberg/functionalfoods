'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { FaCarrot, FaFish, FaCheese, FaBreadSlice, FaSeedling } from 'react-icons/fa';
import { Check, Loader, AlertTriangle, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
}

interface ShoppingListProps {
  weekNumber: number;
  courseId: string;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  'Grönsaker & Frukt': FaCarrot,
  'Protein': FaFish,
  'Mejeri & Ägg': FaCheese,
  'Skafferi': FaBreadSlice,
  'Övrigt': FaSeedling,
};

const ShoppingList: React.FC<ShoppingListProps> = ({ weekNumber, courseId }) => {
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchList = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        const url = `/api/shopping-list?courseId=${courseId}&week=${weekNumber}`;
        console.log('🛒 Fetching shopping list from:', url);
        
        const response = await fetch(url);
        console.log('🛒 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Inköpslistan kunde inte hämtas.');
        }
        const data = await response.json();
        console.log('🛒 Shopping list data:', data);
        
        const items: ShoppingListItem[] = data.items || [];
        setList(items);

        // Automatically open all categories that have items
        const initialOpen = new Set(items.map((item) => item.category).filter(Boolean));
        setOpenCategories(initialOpen);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod.');
        console.error(`Error fetching shopping list for week ${weekNumber}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [weekNumber, courseId]);

  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const toggleCategory = (category: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(category)) {
      newOpenCategories.delete(category);
    } else {
      newOpenCategories.add(category);
    }
    setOpenCategories(newOpenCategories);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 gap-2 text-gray-500">
        <Loader className="animate-spin mr-2" />
        <span>Laddar inköpslista...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 gap-2 text-red-600 bg-red-50 rounded-lg">
        <AlertTriangle />
        <span>{error}</span>
      </div>
    );
  }
  
  if (list.length === 0) {
    return <p className="text-gray-500 p-6 text-center">Ingen inköpslista tillgänglig för denna vecka.</p>;
  }

  const groupedList = list.reduce((acc, item) => {
    const category = item.category || 'Övrigt';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const sortedCategories = Object.keys(groupedList).sort();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {sortedCategories.map(category => (
        <div key={category} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
          <button 
            onClick={() => toggleCategory(category)}
            className="w-full flex justify-between items-center py-2 text-left"
          >
            <div className="flex items-center gap-3">
              {categoryIcons[category] && React.createElement(categoryIcons[category], { className: "w-6 h-6 text-primary" })}
              <h3 className="font-bold text-lg text-gray-800">{category}</h3>
            </div>
            {openCategories.has(category) ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
          </button>

          <AnimatePresence>
            {openCategories.has(category) && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 pl-9"
              >
                {groupedList[category].map(item => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${checkedItems.has(item.id) ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${checkedItems.has(item.id) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                      {checkedItems.has(item.id) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`${checkedItems.has(item.id) ? 'line-through' : ''}`}>
                      {item.name} - <span className="text-gray-500">{item.quantity}</span>
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ShoppingList; 