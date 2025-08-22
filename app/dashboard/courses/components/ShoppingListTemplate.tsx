'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPrinter, FiDownload, FiCheck, FiSearch, FiShoppingCart, FiChevronDown } from 'react-icons/fi';
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

interface ShoppingListTemplateProps {
  courseType: 'basics' | 'flow';
  week: number;
}

export default function ShoppingListTemplate({ courseType, week }: ShoppingListTemplateProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateShoppingList();
  }, [week, courseType]);

  const generateShoppingList = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/shopping-list/${courseType}/${week}`);
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      } else {
        // Fallback to mock data if API fails
        const mockIngredients: Ingredient[] = [
          { name: 'Mjölk', amount: '2', unit: 'liter', category: 'Mejeri', checked: false },
          { name: 'Ägg', amount: '12', unit: 'st', category: 'Mejeri', checked: false },
          { name: 'Lax', amount: '600', unit: 'g', category: 'Kött & Fisk', checked: false },
          { name: 'Avokado', amount: '4', unit: 'st', category: 'Frukt & Grönt', checked: false },
          { name: 'Olivolja', amount: '1', unit: 'flaska', category: 'Skafferi', checked: false }
        ];
        setIngredients(mockIngredients);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      // Use mock data as fallback
      const mockIngredients: Ingredient[] = [
        { name: 'Mjölk', amount: '2', unit: 'liter', category: 'Mejeri', checked: false },
        { name: 'Ägg', amount: '12', unit: 'st', category: 'Mejeri', checked: false }
      ];
      setIngredients(mockIngredients);
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

  const groupedIngredients = filteredIngredients.reduce((groups, ingredient) => {
    const category = ingredient.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(ingredient);
    return groups;
  }, {} as Record<string, Ingredient[]>);

  const checkedCount = ingredients.filter(i => i.checked).length;
  const totalCount = ingredients.length;

  const buildListText = () => {
    return ingredients.map(i => `${i.name} — ${i.amount} ${i.unit}`.trim()).join("\n");
  };

  const handleShare = async () => {
    const text = buildListText();
    try {
      if (navigator.share) {
        await navigator.share({ title: `Inköpslista vecka ${week}`, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('Listan kopierades till urklipp. Klistra in den i valfri inköpsapp.');
      }
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  const handleiOSShortcuts = () => {
    // Requires a Shortcut named "Ulrika Inköpslista" that takes Text input and creates Reminders from each line
    const text = buildListText();
    const url = `shortcuts://run-shortcut?name=${encodeURIComponent('Ulrika Inköpslista')}&input=${encodeURIComponent(text)}`;
    window.location.href = url;
  };

  const handlePrint = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    const courseName = courseType === 'basics' ? 'Functional Basics' : 'Functional Flow';
    
    // Create the same beautiful HTML template for printing
    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inköpslista - ${courseName} Vecka ${week}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #014421;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #014421;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .course-info {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .date-info {
            font-size: 14px;
            color: #9ca3af;
            font-weight: 400;
        }
        
        .week-title {
            font-size: 24px;
            font-weight: 600;
            color: #014421;
            margin: 20px 0 8px 0;
        }
        
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        
        .category {
            margin-bottom: 32px;
            break-inside: avoid;
        }
        
        .category-header {
            background: linear-gradient(135deg, #f3efe3 0%, #e8e0d4 100%);
            padding: 16px 20px;
            border-radius: 12px 12px 0 0;
            border-left: 4px solid #014421;
        }
        
        .category-title {
            font-size: 18px;
            font-weight: 600;
            color: #014421;
            margin-bottom: 4px;
        }
        
        .category-count {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .ingredients-list {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 12px 12px;
        }
        
        .ingredient-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .ingredient-item:last-child {
            border-bottom: none;
        }
        
        .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            margin-right: 16px;
            flex-shrink: 0;
            position: relative;
        }
        
        .checkbox.checked {
            background-color: #014421;
            border-color: #014421;
        }
        
        .checkbox.checked::after {
            content: '✓';
            position: absolute;
            top: -2px;
            left: 2px;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        .ingredient-name {
            flex: 1;
            font-size: 15px;
            font-weight: 500;
            color: #374151;
        }
        
        .ingredient-amount {
            font-size: 13px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer-text {
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.4;
        }
        
        .tips-section {
            margin-top: 40px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
        }
        
        .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .tips-list {
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .category {
                break-inside: avoid;
            }
            
            .tips-section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Functional Foods</div>
        <div class="course-info">${courseName}</div>
        <div class="date-info">Skapad ${today}</div>
        <div class="week-title">Inköpslista Vecka ${week}</div>
        <div class="subtitle">Organiserad efter kategori för enkel shopping</div>
    </div>
    
    ${Object.entries(groupedIngredients).map(([category, items]) => `
        <div class="category">
            <div class="category-header">
                <div class="category-title">${category}</div>
                <div class="category-count">${items.length} ${items.length === 1 ? 'ingrediens' : 'ingredienser'}</div>
            </div>
            <div class="ingredients-list">
                ${items.map(ingredient => `
                    <div class="ingredient-item">
                        <div class="checkbox ${ingredient.checked ? 'checked' : ''}"></div>
                        <div class="ingredient-name">${ingredient.name}</div>
                        <div class="ingredient-amount">${ingredient.amount} ${ingredient.unit}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
    
    <div class="tips-section">
        <div class="tips-title">💡 Shoppingtips</div>
        <div class="tips-list">
            • Börja med kött & fisk och mejeri för bästa kvalitet<br>
            • Köp frukt & grönt sist för att undvika skador<br>
            • Kontrollera bäst före-datum på mejeri och kött<br>
            • Ha denna lista på telefonen för enkel åtkomst i butiken
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-text">
            Genererad från ${courseName} - Vecka ${week}<br>
            © ${new Date().getFullYear()} Functional Foods med Ulrika Davidsson
        </div>
    </div>
</body>
</html>`;

    // Open print window with beautiful template
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleExport = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    const courseName = courseType === 'basics' ? 'Functional Basics' : 'Functional Flow';
    
    // Create beautiful HTML template for export/print
    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inköpslista - ${courseName} Vecka ${week}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #014421;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #014421;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .course-info {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .date-info {
            font-size: 14px;
            color: #9ca3af;
            font-weight: 400;
        }
        
        .week-title {
            font-size: 24px;
            font-weight: 600;
            color: #014421;
            margin: 20px 0 8px 0;
        }
        
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        
        .category {
            margin-bottom: 32px;
            break-inside: avoid;
        }
        
        .category-header {
            background: linear-gradient(135deg, #f3efe3 0%, #e8e0d4 100%);
            padding: 16px 20px;
            border-radius: 12px 12px 0 0;
            border-left: 4px solid #014421;
        }
        
        .category-title {
            font-size: 18px;
            font-weight: 600;
            color: #014421;
            margin-bottom: 4px;
        }
        
        .category-count {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .ingredients-list {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 12px 12px;
        }
        
        .ingredient-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            border-bottom: 1px solid #f3f4f6;
            transition: all 0.2s ease;
        }
        
        .ingredient-item:last-child {
            border-bottom: none;
        }
        
        .ingredient-item:hover {
            background-color: #f9fafb;
        }
        
        .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            margin-right: 16px;
            flex-shrink: 0;
            position: relative;
        }
        
        .checkbox.checked {
            background-color: #014421;
            border-color: #014421;
        }
        
        .checkbox.checked::after {
            content: '✓';
            position: absolute;
            top: -2px;
            left: 2px;
            color: white;
            font-size: 12px;
            font-weight: bold;
        }
        
        .ingredient-name {
            flex: 1;
            font-size: 15px;
            font-weight: 500;
            color: #374151;
        }
        
        .ingredient-amount {
            font-size: 13px;
            color: #6b7280;
            background: #f3f4f6;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer-text {
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.4;
        }
        
        .tips-section {
            margin-top: 40px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
        }
        
        .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .tips-list {
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .category {
                break-inside: avoid;
            }
            
            .tips-section {
                break-inside: avoid;
            }
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 16px;
            }
            
            .logo {
                font-size: 24px;
            }
            
            .week-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Functional Foods</div>
        <div class="course-info">${courseName}</div>
        <div class="date-info">Skapad ${today}</div>
        <div class="week-title">Inköpslista Vecka ${week}</div>
        <div class="subtitle">Organiserad efter kategori för enkel shopping</div>
    </div>
    
    ${Object.entries(groupedIngredients).map(([category, items]) => `
        <div class="category">
            <div class="category-header">
                <div class="category-title">${category}</div>
                <div class="category-count">${items.length} ${items.length === 1 ? 'ingrediens' : 'ingredienser'}</div>
            </div>
            <div class="ingredients-list">
                ${items.map(ingredient => `
                    <div class="ingredient-item">
                        <div class="checkbox ${ingredient.checked ? 'checked' : ''}"></div>
                        <div class="ingredient-name">${ingredient.name}</div>
                        <div class="ingredient-amount">${ingredient.amount} ${ingredient.unit}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
    
    <div class="tips-section">
        <div class="tips-title">💡 Shoppingtips</div>
        <div class="tips-list">
            • Börja med kött & fisk och mejeri för bästa kvalitet<br>
            • Köp frukt & grönt sist för att undvika skador<br>
            • Kontrollera bäst före-datum på mejeri och kött<br>
            • Ha denna lista på telefonen för enkel åtkomst i butiken
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-text">
            Genererad från ${courseName} - Vecka ${week}<br>
            © ${new Date().getFullYear()} Functional Foods med Ulrika Davidsson
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inköpslista-${courseType}-vecka-${week}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
          <CourseNavigation courseType={courseType} currentWeek={week} />
        </div>
      </div>

      {/* Page Title and Actions */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/dashboard/courses/functional-${courseType}/week/${week}`}
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
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Dela/Kopiera"
              >
                <FiDownload className="w-5 h-5" />
                <span className="hidden sm:inline">Dela</span>
              </button>
              <button
                onClick={handleiOSShortcuts}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Skicka till iPhone Påminnelser (genom Genvägar)"
              >
                <FiDownload className="w-5 h-5" />
                <span className="hidden sm:inline">iPhone</span>
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
                {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}% klart
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#014421] to-[#FFB5A7] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
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
            <p className="text-gray-600">
              {ingredients.length === 0 
                ? 'Inköpslistan kunde inte laddas. Försök igen senare.' 
                : 'Försök söka med andra termer eller välj en annan kategori'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedIngredients).map(([category, items]) => {
              const isCollapsed = collapsedCategories.has(category);
              const categoryCheckedCount = items.filter(i => i.checked).length;
              const allChecked = categoryCheckedCount === items.length;
              
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
                      {allChecked && items.length > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Klart!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {categoryCheckedCount}/{items.length}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#014421] h-full rounded-full transition-all duration-300"
                          style={{ width: `${items.length > 0 ? (categoryCheckedCount / items.length) * 100 : 0}%` }}
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
                            key={`${category}-${index}`}
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


    </div>
  );
} 