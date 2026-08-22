"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: { 
    id: string;
    name: string | null; 
    email: string 
  };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const normalizeSlug = (value: string) => {
    const decoded = decodeURIComponent(value || '').trim();
    const withoutDomain = decoded.replace(/^https?:\/\/[^/]+/i, '');
    const withoutKnownPrefix = withoutDomain
      .replace(/^\/?kunskapsbank\/blogg\//i, '')
      .replace(/^\/?blogg\//i, '');
    return withoutKnownPrefix.replace(/^\/+|\/+$/g, '');
  };
  
  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'published') params.append('published', 'true');
      else if (filter === 'draft') params.append('published', 'false');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/blog?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Är du säker på att du vill ta bort artikeln "${title}"?`)) return;

    try {
      const response = await fetch(`/api/admin/blog/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (response.ok) {
        setPosts(currentPosts => currentPosts.filter(post => post.id !== id));
        alert('Artikeln har tagits bort');
      } else {
        const data = await response.json().catch(() => null);
        alert(data?.error || 'Fel vid borttagning av artikel');
      }
    } catch (err) {
      alert('Fel vid borttagning av artikel');
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Laddar artiklar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)]">Blogg</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Hantera artiklar</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/admin/blog/auto-generator" 
            className="px-4 py-2 text-sm border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
          >
            AI Generator
          </Link>
          <Link 
            href="/admin/blog/new" 
            className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-colors text-sm"
          >
            Skapa artikel
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Totalt</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{posts.length}</p>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Publicerade</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{posts.filter(p => p.published).length}</p>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Utkast</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{posts.filter(p => !p.published).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Sök artiklar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
          />
          <div className="flex gap-2">
            {['all', 'published', 'draft'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  filter === f 
                    ? 'bg-[var(--primary-green)] text-white' 
                    : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Alla' : f === 'published' ? 'Publicerade' : 'Utkast'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="bg-gray-50 border-b border-[var(--border-light)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Artikel</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden md:table-cell">Författare</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase hidden lg:table-cell">Datum</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
              <th className="sticky right-0 z-10 bg-gray-50 text-right px-4 py-3 text-xs font-medium text-[var(--text-secondary)] uppercase">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-secondary)]">
                  {searchTerm ? 'Inga artiklar hittades' : 'Inga artiklar'}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-[var(--text-secondary)]">-</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                        {post.excerpt && <p className="text-xs text-[var(--text-secondary)] truncate">{post.excerpt}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-[var(--text-secondary)]">{post.author?.name || post.author?.email}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('sv-SE')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {post.published ? 'Publicerad' : 'Utkast'}
                    </span>
                  </td>
                  <td className="sticky right-0 z-10 bg-white px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end whitespace-nowrap">
                      {post.published && (
                        <Link
                          href={`/kunskapsbank/blogg/${normalizeSlug(post.slug)}`}
                          target="_blank"
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          Visa
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/${encodeURIComponent(normalizeSlug(post.slug))}/edit?id=${encodeURIComponent(post.id)}`}
                        className="px-3 py-1.5 text-xs border border-gray-300 text-gray-800 rounded hover:bg-gray-100 transition-colors"
                      >
                        Redigera
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Ta bort
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
