'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';

// Category icons and colors for visual organization
const categoryInfo: Record<string, { icon: string; color: string }> = {
  'Mejeri': { icon: '🥛', color: '#3B82F6' },
  'Kött & Fisk': { icon: '🥩', color: '#EF4444' },
  'Frukt & Grönt': { icon: '🥬', color: '#22C55E' },
  'Skafferi': { icon: '🌾', color: '#F59E0B' },
  'Kryddor & Såser': { icon: '🧂', color: '#8B5CF6' },
  'Övrigt': { icon: '📦', color: '#6B7280' }
};

export default function Client() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<any>(null);

  const week = searchParams.get('week') || '1';
  const course = (searchParams.get('course') || 'basics') as 'basics' | 'flow' | 'energy' | 'hormone';

  const courseName = course === 'basics' ? 'Functional Basics'
    : course === 'flow' ? 'Functional Flow'
    : course === 'hormone' ? 'Hormonell Balans'
    : 'Functional Energy';

  useEffect(() => {
    async function fetchShoppingList() {
      try {
        const response = await fetch(`/api/shopping-list/${course}/${week}`);
        if (response.ok) {
          const data = await response.json();
          // Normalize to category -> items[] for print component
          const grouped: Record<string, Array<{ name: string; amount: string }>> = {};
          const items = Array.isArray(data.ingredients) ? data.ingredients : [];
          items.forEach((it: any) => {
            const amount = [it.amount, it.unit].filter(Boolean).join(' ');
            const cat = it.category || 'Övrigt';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({ name: it.name, amount });
          });
          setShoppingList({ categories: grouped, totalItems: items.length });
        } else {
          setShoppingList(null);
        }
      } catch (error) {
        console.error('Failed to fetch shopping list:', error);
        setShoppingList(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShoppingList();
  }, [week, course]);

  useEffect(() => {
    if (!isLoading && shoppingList) {
      setTimeout(() => window.print(), 600);
    }
  }, [isLoading, shoppingList]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F1E8] to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#014421]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#014421] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-[#014421] font-medium text-lg">Förbereder inköpslista...</p>
          <p className="text-gray-500 text-sm mt-2">Samlar ihop alla ingredienser</p>
        </div>
      </div>
    );
  }

  // Order categories for consistent display
  const categoryOrder = ['Frukt & Grönt', 'Kött & Fisk', 'Mejeri', 'Skafferi', 'Kryddor & Såser', 'Övrigt'];
  const sortedCategories = shoppingList?.categories 
    ? categoryOrder.filter(cat => shoppingList.categories[cat]?.length > 0)
    : [];

  return (
    <div className="min-h-screen bg-white print-document">
      {/* Screen-only header */}
      <div className="no-print sticky top-0 z-50 bg-gradient-to-r from-[#014421] to-[#116530] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Tillbaka</span>
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">{courseName}</h1>
            <p className="text-white/80 text-sm">Vecka {week} • {shoppingList?.totalItems || 0} ingredienser</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="font-medium">Skriv ut</span>
          </button>
        </div>
      </div>

      {/* Print content */}
      <div className="print-content">
        {/* Header */}
        <div className="shopping-header">
          <div className="header-decoration"></div>
          <div className="header-content">
            <div className="logo-section">
              <span className="logo-icon">🌿</span>
              <h1 className="logo-text">Functional Foods</h1>
            </div>
            <div className="title-section">
              <h2 className="main-title">Inköpslista</h2>
              <div className="title-divider"></div>
              <h3 className="subtitle">{courseName} • Vecka {week}</h3>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-icon">🛒</span>
                <span className="stat-value">{shoppingList?.totalItems || 0}</span>
                <span className="stat-label">ingredienser</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📦</span>
                <span className="stat-value">{sortedCategories.length}</span>
                <span className="stat-label">kategorier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shopping list */}
        {shoppingList?.categories ? (
          <div className="categories-grid">
            {sortedCategories.map((category) => {
              const items = shoppingList.categories[category];
              const catInfo = categoryInfo[category] || categoryInfo['Övrigt'];
              
              return (
                <div key={category} className="category-card">
                  <div className="category-header">
                    <span className="category-icon">{catInfo.icon}</span>
                    <h2 className="category-name">{category}</h2>
                    <span className="category-count">{items.length}</span>
                  </div>
                  <div className="items-list">
                    {items.map((item: { name: string; amount: string }, index: number) => (
                      <div key={index} className="item-row">
                        <div className="checkbox"></div>
                        <span className="item-name">{item.name}</span>
                        {item.amount && <span className="item-amount">{item.amount}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-items">
            <p>Ingen inköpslista tillgänglig för denna vecka.</p>
          </div>
        )}

        {/* Tips section */}
        <div className="tips-section">
          <div className="tips-header">
            <span className="tips-icon">💡</span>
            <h3>Handla smart</h3>
          </div>
          <div className="tips-content">
            <div className="tip-item">
              <span className="tip-bullet">•</span>
              <span>Kolla vad du redan har hemma innan du handlar</span>
            </div>
            <div className="tip-item">
              <span className="tip-bullet">•</span>
              <span>Välj ekologiskt och närproducerat när det är möjligt</span>
            </div>
            <div className="tip-item">
              <span className="tip-bullet">•</span>
              <span>Frysta grönsaker är ett bra alternativ till färska</span>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="notes-section">
          <h3 className="notes-title">📝 Egna anteckningar</h3>
          <div className="notes-lines">
            <div className="note-line"></div>
            <div className="note-line"></div>
            <div className="note-line"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="shopping-footer">
          <div className="footer-logo">
            <span>🌿</span>
            <span>Functional Foods</span>
          </div>
          <p className="footer-url">www.functionalfoods.se</p>
          <p className="footer-copyright">© {new Date().getFullYear()} Alla rättigheter förbehållna</p>
        </div>
      </div>

      <style jsx>{`
        .print-document {
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* Screen styles */
        .print-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .shopping-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          border-radius: 20px;
          padding: 2rem 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header-decoration {
          position: absolute;
          top: -80px;
          right: -80px;
          width: 250px;
          height: 250px;
          background: rgba(147, 197, 96, 0.15);
          border-radius: 50%;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .logo-text {
          font-size: 1.1rem;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0;
        }

        .title-section {
          margin-bottom: 1.5rem;
        }

        .main-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
        }

        .title-divider {
          width: 50px;
          height: 3px;
          background: #93C560;
          margin: 0 auto 0.75rem;
        }

        .subtitle {
          font-size: 1.1rem;
          font-weight: 400;
          opacity: 0.9;
          margin: 0;
        }

        .header-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.15);
          padding: 0.5rem 1rem;
          border-radius: 100px;
        }

        .stat-icon {
          font-size: 1rem;
        }

        .stat-value {
          font-weight: 700;
          font-size: 1rem;
        }

        .stat-label {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .category-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid #e5e5e5;
        }

        .category-header {
          background: #F7F1E8;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 2px solid #93C560;
        }

        .category-icon {
          font-size: 1.5rem;
        }

        .category-name {
          font-size: 1rem;
          font-weight: 700;
          color: #014421;
          margin: 0;
          flex: 1;
        }

        .category-count {
          background: #014421;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 100px;
        }

        .items-list {
          padding: 0.75rem;
        }

        .item-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.5rem;
          border-bottom: 1px dashed #eee;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid #93C560;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .item-name {
          flex: 1;
          font-size: 0.9rem;
          color: #333;
        }

        .item-amount {
          font-size: 0.8rem;
          color: #666;
          background: #f5f5f5;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
        }

        .tips-section {
          background: linear-gradient(135deg, #F7F1E8 0%, #faf6f0 100%);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          margin-top: 2rem;
          border: 1px solid #e5ddd0;
        }

        .tips-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .tips-icon {
          font-size: 1.25rem;
        }

        .tips-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #014421;
          margin: 0;
        }

        .tips-content {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1.5rem;
        }

        .tip-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #555;
        }

        .tip-bullet {
          color: #93C560;
          font-weight: 700;
        }

        .notes-section {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: #fafafa;
          border-radius: 12px;
          border: 1px dashed #ddd;
        }

        .notes-title {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 1rem;
        }

        .notes-lines {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .note-line {
          height: 1px;
          background: #ddd;
        }

        .shopping-footer {
          text-align: center;
          padding: 2rem 0;
          margin-top: 2rem;
          border-top: 2px solid #eee;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: #014421;
          margin-bottom: 0.5rem;
        }

        .footer-url {
          color: #93C560;
          font-size: 0.9rem;
          margin: 0 0 0.25rem;
        }

        .footer-copyright {
          color: #999;
          font-size: 0.8rem;
          margin: 0;
        }

        .no-items {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-content {
            max-width: none;
            padding: 1rem;
            margin: 0;
          }

          .shopping-header {
            background: linear-gradient(135deg, #014421 0%, #116530 100%) !important;
            -webkit-print-color-adjust: exact !important;
            border-radius: 0;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1rem;
          }

          .header-decoration {
            display: none;
          }

          .main-title {
            font-size: 1.75rem;
          }

          .header-stats {
            gap: 1rem;
          }

          .stat-item {
            background: rgba(255,255,255,0.15) !important;
            -webkit-print-color-adjust: exact !important;
            padding: 0.35rem 0.75rem;
          }

          .categories-grid {
            gap: 1rem;
          }

          .category-card {
            page-break-inside: avoid;
            border-radius: 8px;
          }

          .category-header {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            border-bottom-color: #93C560 !important;
            padding: 0.75rem 1rem;
          }

          .category-count {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .items-list {
            padding: 0.5rem;
          }

          .item-row {
            padding: 0.4rem 0.25rem;
          }

          .checkbox {
            border-color: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .item-amount {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .tips-section {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            page-break-inside: avoid;
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 8px;
          }

          .tip-bullet {
            color: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .notes-section {
            page-break-inside: avoid;
            margin-top: 1rem;
            padding: 1rem;
          }

          .shopping-footer {
            padding: 1rem 0;
            margin-top: 1rem;
          }

          .footer-logo {
            color: #014421 !important;
          }

          .footer-url {
            color: #93C560 !important;
          }
        }

        @page {
          size: A4;
          margin: 10mm;
        }
      `}</style>
    </div>
  );
}
