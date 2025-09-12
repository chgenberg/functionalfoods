"use client";
import { useEffect, useState } from "react";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, Eye, Tag, User, Calendar, FileText, Clock, Zap } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-[#014421] mb-2">
              Blogghantering
            </h1>
            <p className="text-gray-600">Hantera artiklar och innehåll</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link 
              href="/admin/blog/auto-generator" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-[#93C560] to-[#84b351] text-white px-5 py-3 rounded-xl hover:from-[#84b351] hover:to-[#93C560] transition-all shadow-md hover:shadow-lg"
            >
              <Zap className="w-5 h-5" />
              <span className="hidden sm:inline">AI Generator</span>
              <span className="sm:hidden">AI</span>
            </Link>
            <Link 
              href="/admin/blog/new" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7E70] to-[#ff6b5a] text-white px-5 py-3 rounded-xl hover:from-[#ff6b5a] hover:to-[#FF7E70] transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Skapa ny artikel</span>
              <span className="sm:hidden">Ny</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#F3EFE3]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Totalt antal</p>
                <p className="text-2xl font-bold text-[#014421]">{posts.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#FF7E70]/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#FF7E70]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#F3EFE3]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Publicerade</p>
                <p className="text-2xl font-bold text-[#014421]">
                  {posts.filter(p => p.published).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#93C560]/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-[#F3EFE3]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utkast</p>
                <p className="text-2xl font-bold text-[#014421]">
                  {posts.filter(p => !p.published).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sök artiklar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-3 rounded-xl font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-[#93C560] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Alla
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-5 py-3 rounded-xl font-medium transition-all ${
                filter === 'published' 
                  ? 'bg-[#93C560] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Publicerade
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-5 py-3 rounded-xl font-medium transition-all ${
                filter === 'draft' 
                  ? 'bg-[#93C560] text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Utkast
            </button>
          </div>
        </div>
      </div>

      {/* Blog Posts List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F3EFE3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F1E8] border-b border-[#F3EFE3]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Artikel
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Författare
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Datum
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EFE3]">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <span className="text-5xl mb-4 block">📝</span>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Inga artiklar hittades för din sökning.' : 'Inga artiklar hittades.'}
                    </p>
                    <Link
                      href="/admin/blog/new"
                      className="inline-flex items-center gap-2 text-[#93C560] hover:text-[#84b351] font-medium transition-colors"
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
                    className="hover:bg-[#F7F1E8]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-xl mr-4 border border-[#F3EFE3]"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-[#FF7E70]/20 to-[#FF7E70]/10 rounded-xl mr-4 flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-[#014421] truncate">{post.title}</h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{post.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">👤</span>
                        <span className="text-sm text-gray-600">
                          {post.author?.name || post.author?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📅</span>
                        <span className="text-sm text-gray-600">
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-[#93C560]/20 text-[#014421]' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {post.published ? (
                          <><span className="mr-1">✅</span> Publicerad</>
                        ) : (
                          <><span className="mr-1">📋</span> Utkast</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {post.published && (
                          <Link
                            href={`/kunskapsbank/blogg/${post.slug}`}
                            target="_blank"
                            className="p-2 text-gray-600 hover:text-[#014421] hover:bg-[#93C560]/10 rounded-lg transition-all"
                            title="Visa artikel"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 text-[#93C560] hover:text-[#84b351] hover:bg-[#93C560]/10 rounded-lg transition-all"
                          title="Redigera"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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