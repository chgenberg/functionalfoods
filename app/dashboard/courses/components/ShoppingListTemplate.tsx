'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronDown, Download, FileText, Lightbulb, Minus, Plus, Printer, Search, Share, ShoppingCart, Smartphone } from "lucide-react";;

import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';

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
  courseType: 'basics' | 'flow' | 'energy';
  weekNumber: number;
}

export default function ShoppingListTemplate({ courseType, weekNumber }: ShoppingListTemplateProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [servings, setServings] = useState<number>(4);

  useEffect(() => {
    generateShoppingList();
  }, [weekNumber, courseType, servings]);

  const generateShoppingList = async () => {
    setLoading(true);
    
    try {
      console.log(`🛒 Fetching shopping list for ${courseType} week ${weekNumber}, servings ${servings}`);
      const response = await fetch(`/api/shopping-list/${courseType}/${weekNumber}?servings=${servings}`);
      console.log(`📡 API Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📦 API Data:`, data);
        setIngredients(data.ingredients || []);
        console.log(`✅ Set ${data.ingredients?.length || 0} ingredients`);
      } else {
        console.error(`❌ API Error: ${response.status} ${response.statusText}`);
        // Show empty state when API fails
        setIngredients([]);
        console.log('<FileText className="w-5 h-5 inline" /> API failed - showing empty state');
      }
    } catch (error) {
      console.error('🚨 Error fetching shopping list:', error);
      // Show empty state on error
      setIngredients([]);
      console.log('<FileText className="w-5 h-5 inline" /> Error occurred - showing empty state');
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
    const header = `Inköpslista • Vecka ${weekNumber} • ${courseType === 'basics' ? 'Basics' : 'Flow'} • ${servings} portioner`;
    const body = ingredients.map(i => `${i.name} — ${i.amount} ${i.unit}`.trim()).join("\n");
    return `${header}\n\n${body}`;
  };

  const handleShare = async () => {
    const text = buildListText();
    try {
      if (navigator.share) {
        await navigator.share({ title: `Inköpslista vecka ${weekNumber}`, text });
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
    const courseName = courseType === 'basics' ? 'Functional Basics' : 'Functional Gut Health/Flow';
    
    // Create the same beautiful HTML template for printing
    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inköpslista - ${courseName} Vecka ${weekNumber}</title>
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
        <div class="course-info">${courseName} • ${servings} portioner</div>
        <div class="date-info">Skapad ${today}</div>
        <div class="week-title">Inköpslista Vecka ${weekNumber}</div>
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
        <div class="tips-title"><Lightbulb className="w-5 h-5 inline" /> Shoppingtips</div>
        <div class="tips-list">
            • Börja med kött & fisk och mejeri för bästa kvalitet<br>
            • Köp frukt & grönt sist för att undvika skador<br>
            • Kontrollera bäst före-datum på mejeri och kött<br>
            • Ha denna lista på telefonen för enkel åtkomst i butiken
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-text">
            Genererad från ${courseName} - Vecka ${weekNumber}<br>
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
    const courseName = courseType === 'basics' ? 'Functional Basics' : 'Functional Gut Health/Flow';
    
    // Create beautiful HTML template for export/print
    const htmlContent = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inköpslista - ${courseName} Vecka ${weekNumber}</title>
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
        <div class="course-info">${courseName} • ${servings} portioner</div>
        <div class="date-info">Skapad ${today}</div>
        <div class="week-title">Inköpslista Vecka ${weekNumber}</div>
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
        <div class="tips-title"><Lightbulb className="w-5 h-5 inline" /> Shoppingtips</div>
        <div class="tips-list">
            • Börja med kött & fisk och mejeri för bästa kvalitet<br>
            • Köp frukt & grönt sist för att undvika skador<br>
            • Kontrollera bäst före-datum på mejeri och kött<br>
            • Ha denna lista på telefonen för enkel åtkomst i butiken
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-text">
            Genererad från ${courseName} - Vecka ${weekNumber}<br>
            © ${new Date().getFullYear()} Functional Foods med Ulrika Davidsson
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inköpslista-${courseType}-vecka-${weekNumber}.html`;
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
    <div className="min-h-screen bg-gray-50">
      {/* Course Navigation */}
      <div className="bg-white shadow-sm border-b print:hidden sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
          <CourseNavigation courseType={courseType} currentWeek={weekNumber} />
        </div>
      </div>

      {/* Page Title and Actions */}
      <div className="bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <Link
                href={`/dashboard/courses/functional-${courseType}/week/${weekNumber}`}
                className="inline-flex items-center text-gray-600 hover:text-[#014421] transition-colors mb-3 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till vecka {weekNumber}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#014421] mb-2">
                Inköpslista - Vecka {weekNumber}
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">Alla ingredienser för veckans recept</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Servings selector */}
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
                <span className="text-sm font-medium text-gray-700">Portioner:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServings(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Minska portioner"
                  >
                    <Minus className="w-4 h-4 text-[#014421]" />
                  </button>
                  <span className="min-w-[3ch] text-center font-bold text-[#014421] text-lg">{servings}</span>
                  <button
                    onClick={() => setServings(prev => prev + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    aria-label="Öka portioner"
                  >
                    <Plus className="w-4 h-4 text-[#014421]" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium"
                  title="Skriv ut"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Skriv ut</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#014421] text-white hover:bg-[#112A12] transition-colors text-sm font-medium"
                  title="Ladda ner"
                >
                  <Download className="w-4 h-4" />
                  <span>Ladda ner</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b print:hidden sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#014421] rounded-full p-2">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 text-lg">
                    {checkedCount} av {totalCount} ingredienser
                  </span>
                  <p className="text-sm text-gray-600">
                    {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}% av listan avklarad
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#014421] to-[#93C560] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Search and Filter */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-[180px]">
              <h3 className="font-semibold text-gray-900 mb-4">Filtrera</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Sök ingrediens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:bg-white transition-colors text-sm"
                  />
                </div>
                
                <div className="relative">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Kategori</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-[#014421] cursor-pointer transition-all text-sm font-medium appearance-none hover:border-[#014421] hover:shadow-md"
                    >
                      <option value="all">🛒 Alla kategorier</option>
                      {Object.keys(CATEGORIES).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-[#014421]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shopping List */}
          <div className="lg:col-span-3">
        {Object.keys(groupedIngredients).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                    className="w-full bg-gradient-to-r from-[#F3EFE3] to-[#F7F1E8] hover:from-[#E8E0D4] hover:to-[#EDE4D8] transition-all duration-300 px-6 py-5 flex items-center justify-between group border-l-4 border-[#014421] hover:border-l-6 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`transition-all duration-300 transform ${isCollapsed ? 'rotate-0' : 'rotate-90'} bg-[#014421] rounded-full p-2 group-hover:scale-110`}>
                        <ChevronDown className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold text-[#014421] text-xl group-hover:text-[#112A12] transition-colors">{category}</h3>
                      {allChecked && items.length > 0 && (
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md animate-pulse">
                          ✓ Klart!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-semibold text-[#014421] bg-white px-3 py-1 rounded-full shadow-sm">
                        {categoryCheckedCount}/{items.length}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-[#014421] to-[#93C560] h-full rounded-full transition-all duration-500 ease-out shadow-sm"
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
                              {ingredient.checked && <Check className="w-4 h-4 text-white" />}
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
      </div>
    </div>
  );
} 