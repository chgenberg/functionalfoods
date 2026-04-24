"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, ExternalLink, RefreshCw, Check, AlertCircle, Trash2 } from 'lucide-react';

interface PageInfo {
  pageId: string;
  name: string;
  description: string;
  path: string;
  content: any | null;
  updatedAt: string | null;
  hasCustomContent: boolean;
}

export default function ProductsAdminPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPageSlug, setNewPageSlug] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pages');
      if (!response.ok) throw new Error('Failed to fetch pages');
      const data = await response.json();
      setPages(data);
    } catch (err) {
      setError('Kunde inte hämta sidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeSlug = (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9- ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCreatePage = () => {
    const slug = normalizeSlug(newPageSlug);
    if (!slug) {
      setCreateError('Ange en giltig slug, t.ex. min-nya-ebok');
      return;
    }
    setCreateError(null);
    router.push(`/admin/products/${slug}`);
  };

  const handleDeletePage = async (page: PageInfo) => {
    const confirmed = confirm(
      `Ta bort anpassat innehåll för "${page.name}"?\n\nDetta återställer sidan till standardinnehåll.`,
    );
    if (!confirmed) return;

    try {
      setDeletingPageId(page.pageId);
      const response = await fetch(`/api/admin/pages/${encodeURIComponent(page.pageId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page content');
      }

      await fetchPages();
    } catch (err) {
      console.error(err);
      setError('Kunde inte ta bort sidinnehåll');
    } finally {
      setDeletingPageId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary-green)] mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] mt-4">Laddar produktsidor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Produktsidor</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Redigera text och bilder på produktsidor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newPageSlug}
            onChange={(e) => setNewPageSlug(e.target.value)}
            placeholder="ny-produkt-slug"
            className="px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
          />
          <button
            onClick={handleCreatePage}
            className="px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green-dark)] transition-colors"
          >
            Skapa
          </button>
          <button
            onClick={fetchPages}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Uppdatera
          </button>
        </div>
      </div>
      {createError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {createError}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Så här fungerar det</h3>
        <p className="text-sm text-blue-700">
          Klicka på "Redigera" för att ändra text och bilder på en produktsida. 
          Ändringar sparas i databasen och visas direkt på hemsidan. 
          Om du vill återställa till standardinnehållet kan du ta bort dina ändringar.
        </p>
      </div>

      {/* Pages list */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg overflow-hidden">
        <div className="divide-y divide-[var(--border-light)]">
          {pages.map((page) => (
            <div key={page.pageId} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">
                      {page.name}
                    </h3>
                    {page.hasCustomContent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        <Check className="w-3 h-3" />
                        Anpassad
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {page.description}
                  </p>
                  {page.updatedAt && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Senast uppdaterad: {new Date(page.updatedAt).toLocaleString('sv-SE')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={page.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] transition-colors"
                    title="Visa sida"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    href={`/admin/products/${page.pageId}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green-dark)] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Redigera
                  </Link>
                  <button
                    onClick={() => handleDeletePage(page)}
                    disabled={deletingPageId === page.pageId}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                      deletingPageId === page.pageId
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                    }`}
                    title="Ta bort anpassat innehåll"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingPageId === page.pageId ? 'Tar bort...' : 'Ta bort'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help section */}
      <div className="bg-[var(--primary-beige)] border border-[var(--border-light)] rounded-lg p-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Tips</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>• Bilder bör vara i JPG eller PNG-format, max 10MB</li>
          <li>• Rekommenderad bildstorlek: 800x800 pixlar eller större</li>
          <li>• Ändringar syns direkt på hemsidan efter att du sparat</li>
          <li>• Du kan alltid återställa till originalinnehållet</li>
        </ul>
      </div>
    </div>
  );
}
