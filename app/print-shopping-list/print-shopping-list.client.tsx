'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';

const categoryIcons: Record<string, string> = {
  'Mejeri': '🥛',
  'Kött & Fisk': '🥩',
  'Frukt & Grönt': '🥬',
  'Skafferi': '🌾',
  'Kryddor & Såser': '🧂',
  'Övrigt': '📦'
};

export default function Client() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<any>(null);

  const week = searchParams.get('week') || '1';
  const course = (searchParams.get('course') || 'basics') as 'basics' | 'flow' | 'energy' | 'hormone' | 'prova-pa-vecka';

  const courseName = course === 'basics' ? 'Functional Basics'
    : course === 'flow' ? 'Functional Flow'
    : course === 'hormone' ? 'Hormonell Balans'
    : course === 'prova-pa-vecka' ? 'Prova på vecka'
    : 'Functional Energy';

  useEffect(() => {
    async function fetchShoppingList() {
      try {
        const response = await fetch(`/api/shopping-list/${course}/${week}`);
        if (response.ok) {
          const data = await response.json();
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
      <div className="loading">
        <div className="spinner"></div>
        <p>Laddar inköpslista...</p>
      </div>
    );
  }

  const categoryOrder = ['Frukt & Grönt', 'Kött & Fisk', 'Mejeri', 'Skafferi', 'Kryddor & Såser', 'Övrigt'];
  const sortedCategories = shoppingList?.categories 
    ? categoryOrder.filter(cat => shoppingList.categories[cat]?.length > 0)
    : [];

  return (
    <div className="print-wrapper">
      {/* Screen header */}
      <div className="screen-header no-print">
        <div className="header-content">
          <button onClick={() => router.back()} className="back-btn">
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
          <div className="header-title">
            <strong>{courseName}</strong>
            <span>Vecka {week} • {shoppingList?.totalItems || 0} ingredienser</span>
          </div>
          <button onClick={() => window.print()} className="print-btn">
            <Printer className="w-4 h-4" />
            <span>Skriv ut</span>
          </button>
        </div>
      </div>

      {/* Print content */}
      <div className="print-content">
        {/* Header */}
        <div className="page-header">
          <div className="brand">
            <span className="brand-icon">🌿</span>
            <span className="brand-name">Functional Foods</span>
          </div>
          <h1 className="main-title">Inköpslista</h1>
          <p className="subtitle">{courseName} • Vecka {week} • {shoppingList?.totalItems || 0} ingredienser</p>
        </div>

        {/* Categories grid */}
        {shoppingList?.categories ? (
          <div className="categories-grid">
            {sortedCategories.map((category) => {
              const items = shoppingList.categories[category];
              const icon = categoryIcons[category] || '📦';
              
              return (
                <div key={category} className="category-card">
                  <div className="category-header">
                    <span className="category-icon">{icon}</span>
                    <span className="category-name">{category}</span>
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
          <p className="no-items">Ingen inköpslista tillgänglig.</p>
        )}

        {/* Notes */}
        <div className="notes-section">
          <h3>📝 Anteckningar</h3>
          <div className="note-lines">
            <div className="note-line"></div>
            <div className="note-line"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="page-footer">
          <span>www.functionalfoods.se</span>
          <span>© {new Date().getFullYear()} Functional Foods</span>
        </div>
      </div>

      <style jsx>{`
        .loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F7F1E8;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #014421;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .print-wrapper {
          background: white;
          min-height: 100vh;
        }

        /* Screen header */
        .screen-header {
          background: linear-gradient(135deg, #014421 0%, #116530 100%);
          color: white;
          padding: 1rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .header-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Print content */
        .print-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .page-header {
          background: #014421;
          color: white;
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .brand-name {
          font-size: 0.9rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .main-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .subtitle {
          font-size: 0.95rem;
          opacity: 0.9;
          margin: 0;
        }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .category-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          overflow: hidden;
        }

        .category-header {
          background: #F7F1E8;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid #93C560;
        }

        .category-icon {
          font-size: 1.25rem;
        }

        .category-name {
          flex: 1;
          font-weight: 700;
          color: #014421;
          font-size: 0.95rem;
        }

        .category-count {
          background: #014421;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 100px;
        }

        .items-list {
          padding: 0.5rem;
        }

        .item-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.5rem;
          border-bottom: 1px dashed #eee;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #93C560;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .item-name {
          flex: 1;
          font-size: 0.85rem;
          color: #333;
        }

        .item-amount {
          font-size: 0.75rem;
          color: #666;
          background: #f5f5f5;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        /* Notes */
        .notes-section {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fafafa;
          border-radius: 10px;
          border: 1px dashed #ddd;
        }

        .notes-section h3 {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 0.75rem;
        }

        .note-lines {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .note-line {
          height: 1px;
          background: #ddd;
        }

        /* Footer */
        .page-footer {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          margin-top: 1.5rem;
          border-top: 1px solid #eee;
          font-size: 0.8rem;
          color: #888;
        }

        .no-items {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          body, html {
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-wrapper {
            background: white;
          }

          .print-content {
            max-width: none;
            padding: 10mm;
            margin: 0;
          }

          .page-header {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-radius: 0;
            margin-bottom: 1rem;
            padding: 1rem;
          }

          .categories-grid {
            gap: 0.75rem;
          }

          .category-card {
            page-break-inside: avoid;
            border-radius: 0;
          }

          .category-header {
            background: #F7F1E8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-bottom: 2px solid #93C560 !important;
            padding: 0.5rem 0.75rem;
          }

          .category-count {
            background: #014421 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .checkbox {
            border-color: #93C560 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .item-amount {
            background: #f5f5f5 !important;
            -webkit-print-color-adjust: exact !important;
          }

          .notes-section {
            page-break-inside: avoid;
            margin-top: 1rem;
          }

          .page-footer {
            margin-top: 1rem;
            padding-top: 0.75rem;
          }
        }

        @page {
          size: A4;
          margin: 8mm;
        }
      `}</style>
    </div>
  );
}
