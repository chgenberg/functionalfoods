"use client";
import { useEffect, useState } from "react";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, Edit3, Eye, FileText, Plus, Search, Tag, Trash2, User, Zap, Check } from "lucide-react";;

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

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter === 'published') {
        params.append('published', 'true');
      } else if (filter === 'draft') {
        params.append('published', 'false');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/blog?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Är du säker på att du vill ta bort artikeln "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id));
        alert('Artikeln har tagits bort');
      } else {
        alert('Fel vid borttagning av artikel');
      }
    } catch (err) {
      alert('Fel vid borttagning av artikel');
      console.error('Error deleting post:', err);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#93C560] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar artiklar...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-light text-[var(--primary-green)] mb-1">
              Blogg
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-light">Hantera artiklar och innehåll</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link 
              href="/admin/blog/auto-generator" 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              <span>AI Generator</span>
            </Link>
            <Link 
              href="/admin/blog/new" 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[#012a14] transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Skapa artikel</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-[var(--primary-green)]" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Totalt</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">{posts.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
            <div className="flex items-center justify-between mb-2">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Publicerade</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">{posts.filter(p => p.published).length}</p>
          </div>

          <div className="bg-white rounded-lg border border-[var(--border-light)] p-4">
            <div className="flex items-center justify-between mb-2">
              <Edit3 className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-1">Utkast</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)]">{posts.filter(p => !p.published).length}</p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Sök artiklar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filter === 'all' 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'bg-white border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--primary-green)]'
              }`}
            >
              Alla
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filter === 'published' 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'bg-white border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--primary-green)]'
              }`}
            >
              Publicerade
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                filter === 'draft' 
                  ? 'bg-[var(--primary-green)] text-white' 
                  : 'bg-white border border-[var(--border-light)] text-[var(--text-primary)] hover:border-[var(--primary-green)]'
              }`}
            >
              Utkast
            </button>
          </div>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">
                  Artikel
                </th>
                <th className="text-left hidden md:table-cell">
                  Författare
                </th>
                <th className="text-left hidden lg:table-cell">
                  Datum
                </th>
                <th className="text-left">
                  Status
                </th>
                <th className="text-right">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]" />
                    <p className="text-[var(--text-secondary)] mb-4">
                      {searchTerm ? 'Inga artiklar hittades för din sökning.' : 'Inga artiklar hittades.'}
                    </p>
                    <Link
                      href="/admin/blog/new"
                      className="inline-flex items-center gap-2 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Skapa din första artikel
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-xl mr-4 border border-[var(--border-light)]"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[var(--primary-beige)] rounded-xl mr-4 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[var(--text-secondary)]" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{post.title}</h3>
                          {post.excerpt && (
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-1 mt-1">{post.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {post.author?.name || post.author?.email}
                        </span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        post.published 
                          ? 'admin-badge-success' 
                          : 'admin-badge-info'
                      }`}>
                        {post.published ? (
                          <><Check className="w-3 h-3 mr-1" /> Publicerad</>
                        ) : (
                          <><Edit3 className="w-3 h-3 mr-1" /> Utkast</>
                        )}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        {post.published && (
                          <Link
                            href={`/kunskapsbank/blogg/${post.slug}`}
                            target="_blank"
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-all"
                            title="Visa artikel"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.slug}/edit`}
                          className="p-2 text-[var(--primary-light-green)] hover:text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-all"
                          title="Redigera"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-2 text-[var(--coral-accent)] hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Ta bort"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 