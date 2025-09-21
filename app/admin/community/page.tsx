'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, TrendingUp, Search, Filter, 
  MoreVertical, Trash2, Lock, Unlock, Pin, X,
  Eye, ThumbsUp, Calendar, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ForumThread {
  id: string;
  title: string;
  content: string;
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
  views: number;
  replies: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommunityStats {
  totalThreads: number;
  totalUsers: number;
  activeThisWeek: number;
  totalReplies: number;
}

export default function AdminCommunityPage() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalThreads: 0,
    totalUsers: 0,
    activeThisWeek: 0,
    totalReplies: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const response = await fetch('/api/admin/community', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setStats(data.stats || {
          totalThreads: 0,
          totalUsers: 0,
          activeThisWeek: 0,
          totalReplies: 0
        });
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinThread = async (threadId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPinned: !isPinned })
      });

      if (response.ok) {
        loadCommunityData();
      }
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };

  const handleLockThread = async (threadId: string, isLocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isLocked: !isLocked })
      });

      if (response.ok) {
        loadCommunityData();
      }
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna tråd?')) return;

    try {
      const response = await fetch(`/api/admin/community/threads/${threadId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        loadCommunityData();
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.author.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || thread.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStyle = (color: string) => {
    const styles: Record<string, string> = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      pink: 'bg-pink-100 text-pink-800'
    };
    return styles[color] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Community</h1>
        <p className="text-gray-600">Hantera diskussioner och användaraktivitet</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-[#014421]" />
            <span className="text-sm text-gray-500">Totalt</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalThreads}</div>
          <div className="text-sm text-gray-600">Diskussioner</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-[#93C560]" />
            <span className="text-sm text-gray-500">Aktiva</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">Användare</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-[#FFB5A7]" />
            <span className="text-sm text-gray-500">Veckan</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeThisWeek}%</div>
          <div className="text-sm text-gray-600">Aktivitet</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-[#6B8DD6]" />
            <span className="text-sm text-gray-500">Svar</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalReplies}</div>
          <div className="text-sm text-gray-600">Kommentarer</div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök diskussioner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
          >
            <option value="all">Alla kategorier</option>
            <option value="recipes">Recept & Matlagning</option>
            <option value="health">Hälsa & Välmående</option>
            <option value="nutrition">Näring & Kosttillskott</option>
            <option value="motivation">Motivation & Support</option>
            <option value="lifestyle">Livsstil & Vanor</option>
            <option value="success">Framgångsberättelser</option>
          </select>
        </div>
      </div>

      {/* Threads Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diskussion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Författare
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredThreads.map((thread) => (
                <tr key={thread.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {thread.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {thread.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {thread.author.name || thread.author.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(thread.createdAt).toLocaleDateString('sv-SE')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      getCategoryStyle(thread.category.color)
                    }`}>
                      {thread.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{thread.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{thread.likes}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {thread.isPinned && (
                        <Pin className="w-4 h-4 text-[#014421]" />
                      )}
                      {thread.isLocked && (
                        <Lock className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === thread.id ? null : thread.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showActionMenu === thread.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border">
                          <button
                            onClick={() => {
                              handlePinThread(thread.id, thread.isPinned);
                              setShowActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pin className="w-4 h-4" />
                            {thread.isPinned ? 'Ta bort nåla' : 'Nåla fast'}
                          </button>
                          <button
                            onClick={() => {
                              handleLockThread(thread.id, thread.isLocked);
                              setShowActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {thread.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {thread.isLocked ? 'Lås upp' : 'Lås'}
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => {
                              handleDeleteThread(thread.id);
                              setShowActionMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Ta bort
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}