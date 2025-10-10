'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrintShoppingListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<any>(null);
  
  const week = searchParams.get('week') || '1';
  const course = searchParams.get('course') || 'basics';
  
  const courseName = course === 'basics' ? 'Functional Basics' : 
                     course === 'flow' ? 'Functional Flow' : 
                     'Functional Energy';

  useEffect(() => {
    async function fetchShoppingList() {
      try {
        const response = await fetch(`/api/shopping-list?week=${week}&course=${course}`);
        if (response.ok) {
          const data = await response.json();
          setShoppingList(data);
        }
      } catch (error) {
        console.error('Failed to fetch shopping list:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchShoppingList();
  }, [week, course]);

  useEffect(() => {
    if (!isLoading && shoppingList) {
      // Wait a bit for content to render
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isLoading, shoppingList]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto mb-4"></div>
          <p className="text-gray-600">Förbereder inköpslista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* No-print header */}
      <div className="no-print bg-[#F3EFE3] border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tillbaka till kursen</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#116530] transition-all"
          >
            Skriv ut
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-content max-w-4xl mx-auto p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inköpslista</h1>
          <p className="text-lg text-gray-600">{courseName} - Vecka {week}</p>
        </div>

        {shoppingList?.categories ? (
          <div className="space-y-6">
            {Object.entries(shoppingList.categories).map(([category, items]: [string, any]) => (
              <div key={category} className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                  {category}
                </h2>
                <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 border border-gray-400 rounded mt-0.5 flex-shrink-0 print:border-gray-600"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Ingen inköpslista tillgänglig för denna vecka.</p>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Functional Foods. Alla rättigheter förbehållna.</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-content {
            max-width: 100%;
            padding: 20px;
          }
          
          h1, h2 {
            color: #1a1a1a !important;
          }
          
          .border-gray-200 {
            border-color: #e5e5e5 !important;
          }
        }
      `}</style>
    </div>
  );
}
