"use client";
import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const defaultCategories = [
  'Frukost',
  'Lunch', 
  'Middag',
  'Mellanmål',
  'Efterrätt',
  'Drycker',
  'Smoothies',
  'Sallader',
  'Soppa'
];

export default function CategorySelector({ value, onChange, className = "" }: CategorySelectorProps) {
  const [categories, setCategories] = useState(defaultCategories);
  const [showCustom, setShowCustom] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()].sort();
      setCategories(updated);
      onChange(newCategory.trim());
      setNewCategory('');
      setShowCustom(false);
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (defaultCategories.includes(categoryToRemove)) {
      alert('Du kan inte ta bort standardkategorier');
      return;
    }
    
    const updated = categories.filter(cat => cat !== categoryToRemove);
    setCategories(updated);
    
    // If the removed category was selected, clear selection
    if (value === categoryToRemove) {
      onChange('');
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Kategori *
      </label>
      
      <div className="space-y-2">
        <div className="relative">
          <select
            value={value}
            onChange={(e) => {
              if (e.target.value === '_custom_') {
                setShowCustom(true);
              } else {
                onChange(e.target.value);
              }
            }}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 appearance-none"
          >
            <option value="">Välj kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
            <option value="_custom_">+ Lägg till ny kategori</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {showCustom && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Ange ny kategori"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustom(false);
                setNewCategory('');
              }}
              className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Show custom categories with remove option */}
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.filter(cat => !defaultCategories.includes(cat)).map(category => (
            <div key={category} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              <span>{category}</span>
              <button
                type="button"
                onClick={() => handleRemoveCategory(category)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
