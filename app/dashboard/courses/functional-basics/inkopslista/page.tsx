'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPrinter, FiDownload, FiCheck, FiSearch, FiShoppingCart, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';
import WeekHeroWithVideo from '@/app/dashboard/courses/components/WeekHeroWithVideo';

// Kategorier för ingredienser
const CATEGORIES = {
  'Mejeri': ['mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'kvarg', 'keso', 'crème fraiche', 'fetaost', 'mozzarella', 'parmesan'],
  'Kött & Fisk': ['kyckling', 'lax', 'torsk', 'nötkött', 'fläsk', 'kalkon', 'lamm', 'räkor', 'tonfisk'],
  'Frukt & Grönt': ['tomat', 'gurka', 'sallad', 'paprika', 'lök', 'vitlök', 'morötter', 'broccoli', 'spenat', 'äpple', 'banan', 'citron', 'lime', 'avokado'],
  'Skafferi': ['mjöl', 'pasta', 'ris', 'quinoa', 'bröd', 'havregryn', 'olivolja', 'salt', 'peppar', 'socker'],
  'Kryddor & Såser': ['basilika', 'oregano', 'timjan', 'persilja', 'soja', 'senap', 'vinäger'],
  'Övrigt': []
};

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  category: string;
  checked: boolean;
}

function ShoppingListContent() {
  const searchParams = useSearchParams();
  const week = parseInt(searchParams.get('week') || '1');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateShoppingList();
  }, [week]);

  const generateShoppingList = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/shopping-list/basics/${week}`);
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      } else {
        // Fallback to mock data if API fails
        const mockIngredients: Ingredient[] = [
          // Mejeri
          { name: 'Mjölk', amount: '2', unit: 'liter', category: 'Mejeri', checked: false },
          { name: 'Ägg', amount: '12', unit: 'st', category: 'Mejeri', checked: false },
          { name: 'Grekisk yoghurt', amount: '500', unit: 'g', category: 'Mejeri', checked: false },
          { name: 'Fetaost', amount: '200', unit: 'g', category: 'Mejeri', checked: false },
          
          // Kött & Fisk
          { name: 'Kycklingfilé', amount: '800', unit: 'g', category: 'Kött & Fisk', checked: false },
          { name: 'Laxfilé', amount: '600', unit: 'g', category: 'Kött & Fisk', checked: false },
          { name: 'Nötfärs', amount: '500', unit: 'g', category: 'Kött & Fisk', checked: false },
          
          // Frukt & Grönt
          { name: 'Tomater', amount: '8', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Gurka', amount: '2', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Gul lök', amount: '4', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Vitlök', amount: '2', unit: 'huvuden', category: 'Frukt & Grönt', checked: false },
          { name: 'Spenat', amount: '200', unit: 'g', category: 'Frukt & Grönt', checked: false },
          { name: 'Broccoli', amount: '2', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Paprika', amount: '3', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Morötter', amount: '500', unit: 'g', category: 'Frukt & Grönt', checked: false },
          { name: 'Citroner', amount: '3', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Avokado', amount: '4', unit: 'st', category: 'Frukt & Grönt', checked: false },
          
          // Skafferi
          { name: 'Quinoa', amount: '300', unit: 'g', category: 'Skafferi', checked: false },
          { name: 'Fullkornspasta', amount: '500', unit: 'g', category: 'Skafferi', checked: false },
          { name: 'Olivolja', amount: '1', unit: 'flaska', category: 'Skafferi', checked: false },
          { name: 'Kokosmjölk', amount: '400', unit: 'ml', category: 'Skafferi', checked: false },
          
          // Kryddor & Såser
          { name: 'Soja', amount: '1', unit: 'flaska', category: 'Kryddor & Såser', checked: false },
          { name: 'Honung', amount: '1', unit: 'burk', category: 'Kryddor & Såser', checked: false },
          { name: 'Dijonsenap', amount: '1', unit: 'burk', category: 'Kryddor & Såser', checked: false },
        ];

        setIngredients(mockIngredients);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].checked = !newIngredients[index].checked;
    setIngredients(newIngredients);
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const checkedCount = ingredients.filter(i => i.checked).length;
  const totalCount = ingredients.length;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const text = Object.entries(groupedIngredients)
      .map(([category, items]) => {
        const itemsList = items
          .map(item => `${item.checked ? '✓' : '○'} ${item.name} - ${item.amount} ${item.unit}`)
          .join('\n');
        return `${category}:\n${itemsList}`;
      })
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkopslista-vecka-${week}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={0}
        weekTitle="Inköpslista"
        weekSubtitle={`Vecka ${week} - Alla ingredienser för veckans recept`}
        heroImage="/Ulrika_portratt/udavidssondesktop.png"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />

      {/* Course Navigation - After Hero Section */}
      <div className="bg-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType="basics" currentWeek={week} />
        </div>
      </div>

      {/* Page Title and Actions */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/dashboard/courses/functional-basics/week/${week}`}
                className="flex items-center text-gray-600 hover:text-[#014421] transition-colors mb-2 text-sm"
              >
                <FiArrowLeft className="w-4 h-4 mr-1" />
                Tillbaka till vecka {week}
              </Link>
              <h1 className="text-3xl font-bold text-[#014421]">
                Handla smart
              </h1>
              <p className="text-gray-600 mt-1">Organiserad inköpslista för hela veckan</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Skriv ut"
              >
                <FiPrinter className="w-5 h-5" />
                <span className="hidden sm:inline">Skriv ut</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#014421] text-white hover:bg-[#112A12] transition-colors"
                title="Exportera"
              >
                <FiDownload className="w-5 h-5" />
                <span className="hidden sm:inline">Ladda ner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#F3EFE3] print:hidden sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiShoppingCart className="w-5 h-5 text-[#014421]" />
                <span className="font-medium text-gray-900">
                  {checkedCount} av {totalCount} ingredienser
                </span>
              </div>
              <span className="text-sm font-bold text-[#014421]">
                {Math.round((checkedCount / totalCount) * 100)}% klart
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#014421] to-[#FFB5A7] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(checkedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök ingrediens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:bg-white transition-colors"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:bg-white cursor-pointer transition-colors"
            >
              <option value="all">Alla kategorier</option>
              {Object.keys(CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shopping List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {Object.keys(groupedIngredients).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga ingredienser hittades</h3>
            <p className="text-gray-600">Försök söka med andra termer eller välj en annan kategori</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedIngredients).map(([category, items]) => {
            const isCollapsed = collapsedCategories.has(category);
            const checkedCount = items.filter(i => i.checked).length;
            const allChecked = checkedCount === items.length;
            
            return (
              <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full bg-[#F3EFE3] hover:bg-[#E8E0D4] transition-colors px-6 py-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
                      <FiChevronDown className="w-5 h-5 text-[#014421]" />
                    </div>
                    <h3 className="font-semibold text-[#014421] text-lg">{category}</h3>
                    {allChecked && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Klart!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {checkedCount}/{items.length}
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#014421] h-full rounded-full transition-all duration-300"
                        style={{ width: `${(checkedCount / items.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>
                
                {/* Ingredients List */}
                {!isCollapsed && (
                  <div className="divide-y divide-gray-100">
                    {items.map((ingredient, index) => {
                      const globalIndex = ingredients.findIndex(i => i === ingredient);
                      return (
                        <label
                          key={index}
                          className="flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all group"
                        >
                          <input
                            type="checkbox"
                            checked={ingredient.checked}
                            onChange={() => toggleIngredient(globalIndex)}
                            className="sr-only"
                          />
                          <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-all ${
                            ingredient.checked 
                              ? 'bg-[#014421] border-[#014421] scale-110' 
                              : 'border-gray-300 group-hover:border-[#014421]'
                          }`}>
                            {ingredient.checked && <FiCheck className="w-4 h-4 text-white" />}
                          </div>
                          <span className={`flex-1 transition-all ${
                            ingredient.checked 
                              ? 'line-through text-gray-400' 
                              : 'text-gray-900 group-hover:text-[#014421]'
                          }`}>
                            {ingredient.name}
                          </span>
                          <span className={`text-sm px-3 py-1 rounded-lg ${
                            ingredient.checked 
                              ? 'text-gray-400 bg-gray-50' 
                              : 'text-gray-600 bg-gray-100'
                          }`}>
                            {ingredient.amount} {ingredient.unit}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.rounded-xl, .bg-white.rounded-xl * {
            visibility: visible;
          }
          .bg-white.rounded-xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}      </style>
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    }>
      <ShoppingListContent />
    </Suspense>
  );
} 