'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Calendar, Eye, Heart, Reply, Lock, Pin, Trash2, Edit, Search, Filter, Plus, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  _count: {
    threads: number;
  };
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  isSticky: boolean;
  isLocked: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  _count: {
    replies: number;
    likes: number;
  };
}

interface ForumReply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    likes: number;
  };
}

export default function AdminCommunityPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#014421'
  });

  useEffect(() => {
    fetchCategories();
    fetchThreads();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      params.append('includeAll', 'true'); // Include all threads for admin

      const response = await fetch(`/api/forum/threads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSticky = async (threadId: string, isSticky: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isSticky: !isSticky })
      });

      if (response.ok) {
        fetchThreads();
      }
    } catch (error) {
      console.error('Error toggling sticky:', error);
    }
  };

  const handleToggleLock = async (threadId: string, isLocked: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLocked: !isLocked })
      });

      if (response.ok) {
        fetchThreads();
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna tråd?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchThreads();
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCategory 
        ? `/api/admin/community/categories/${editingCategory.id}`
        : '/api/admin/community/categories';
      
      const response = await fetch(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '', color: '#014421' });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna kategori?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/community/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const totalReplies = threads.reduce((sum, thread) => sum + thread._count.replies, 0);
  const totalLikes = threads.reduce((sum, thread) => sum + thread._count.likes, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Community</h1>
        <p className="text-gray-600">Hantera forum, diskussioner och användarinteraktioner</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Diskussioner</p>
              <p className="text-2xl font-bold text-gray-800">{threads.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-[#014421]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Svar</p>
              <p className="text-2xl font-bold text-gray-800">{totalReplies}</p>
            </div>
            <Reply className="h-8 w-8 text-[#93C560]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Likes</p>
              <p className="text-2xl font-bold text-gray-800">{totalLikes}</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kategorier</p>
              <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Categories Management */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Kategorier</h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', description: '', color: '#014421' });
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#014421] text-white rounded-lg hover:bg-[#116530] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Ny kategori
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: category.color }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold" style={{ color: category.color }}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {category._count.threads} diskussioner
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryForm({
                        name: category.name,
                        description: category.description || '',
                        color: category.color
                      });
                      setShowCategoryModal(true);
                    }}
                    className="text-gray-600 hover:text-[#014421]"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Diskussioner</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Sök diskussioner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
            >
              <option value="all">Alla kategorier</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Inga diskussioner hittades</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Titel</th>
                  <th className="text-left py-3 px-4">Författare</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-center py-3 px-4">Svar</th>
                  <th className="text-center py-3 px-4">Visningar</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((thread) => (
                  <tr key={thread.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800">{thread.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(thread.createdAt).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{thread.author.name}</p>
                      <p className="text-sm text-gray-500">{thread.author.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${thread.category.color}20`,
                          color: thread.category.color
                        }}
                      >
                        {thread.category.name}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {thread._count.replies}
                    </td>
                    <td className="text-center py-3 px-4">
                      {thread.views}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex justify-center gap-2">
                        {thread.isSticky && (
                          <Pin className="h-4 w-4 text-green-600" />
                        )}
                        {thread.isLocked && (
                          <Lock className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/community/thread/${thread.id}`)}
                          className="text-gray-600 hover:text-[#014421]"
                          title="Visa tråd"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleSticky(thread.id, thread.isSticky)}
                          className={`${thread.isSticky ? 'text-green-600' : 'text-gray-600'} hover:text-green-700`}
                          title="Fäst tråd"
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleLock(thread.id, thread.isLocked)}
                          className={`${thread.isLocked ? 'text-red-600' : 'text-gray-600'} hover:text-red-700`}
                          title="Lås tråd"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteThread(thread.id)}
                          className="text-gray-600 hover:text-red-600"
                          title="Ta bort tråd"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Redigera kategori' : 'Ny kategori'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Namn
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivning
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Färg
                </label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Avbryt
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-[#014421] text-white rounded-lg hover:bg-[#116530]"
              >
                Spara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 