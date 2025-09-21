'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, MessageSquare, TrendingUp, Search, Plus, Filter, 
  ChevronRight, Eye, ThumbsUp, Tag, Clock, Sparkles,
  Heart, Coffee, Utensils, Brain, Zap, Smile
} from 'lucide-react';
import Link from 'next/link';
import CourseNavigation from '../courses/components/CourseNavigation';
import { useAuth } from '@/app/hooks/useAuth';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  postCount: number;
  latestPost?: {
    title: string;
    author: string;
    timestamp: Date;
  };
}

interface ForumThread {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: ForumCategory;
  content: string;
  views: number;
  replies: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastReply?: {
    author: string;
    timestamp: Date;
  };
}

const categories: ForumCategory[] = [
  {
    id: 'recipes',
    name: 'Recept & Matlagning',
    description: 'Dela dina favoritrecept och få inspiration',
    icon: Utensils,
    color: 'green',
    postCount: 0
  },
  {
    id: 'health',
    name: 'Hälsa & Välmående',
    description: 'Diskutera hälsofrågor och dela erfarenheter',
    icon: Heart,
    color: 'red',
    postCount: 0
  },
  {
    id: 'nutrition',
    name: 'Näring & Kosttillskott',
    description: 'Frågor om näringsämnen och kosttillskott',
    icon: Brain,
    color: 'purple',
    postCount: 0
  },
  {
    id: 'motivation',
    name: 'Motivation & Support',
    description: 'Stötta och inspirera varandra',
    icon: Sparkles,
    color: 'yellow',
    postCount: 0
  },
  {
    id: 'lifestyle',
    name: 'Livsstil & Vanor',
    description: 'Tips för en hälsosam livsstil',
    icon: Coffee,
    color: 'blue',
    postCount: 0
  },
  {
    id: 'success',
    name: 'Framgångsberättelser',
    description: 'Dela dina framgångar och milstolpar',
    icon: Smile,
    color: 'pink',
    postCount: 0
  }
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'active'>('latest');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalThreads: 0,
    activeThisWeek: 0
  });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      // Hämta trådar från API
      const response = await fetch('/api/community/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setStats({
          totalMembers: data.stats?.totalMembers || 0,
          totalThreads: data.stats?.totalThreads || 0,
          activeThisWeek: data.stats?.activeThisWeek || 0
        });
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesCategory = selectedCategory === 'all' || thread.category.id === selectedCategory;
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.views - a.views;
      case 'active':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />
      
      {/* Navigation */}
      <CourseNavigation courseType="basics" currentWeek={1} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#014421] mb-2">Community</h1>
          <p className="text-gray-600">Dela erfarenheter och få stöd från andra kursdeltagare</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 text-center shadow-sm"
          >
            <Users className="w-8 h-8 text-[#014421] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[#014421]">{stats.totalMembers}</div>
            <div className="text-sm text-gray-600">Medlemmar</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 text-center shadow-sm"
          >
            <MessageSquare className="w-8 h-8 text-[#93C560] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[#014421]">{stats.totalThreads}</div>
            <div className="text-sm text-gray-600">Diskussioner</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 text-center shadow-sm"
          >
            <TrendingUp className="w-8 h-8 text-[#FFB5A7] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[#014421]">{stats.activeThisWeek}%</div>
            <div className="text-sm text-gray-600">Aktiva denna vecka</div>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#014421] mb-4">Ämnen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const categoryThreads = threads.filter(t => t.category.id === category.id);
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`bg-white rounded-xl p-6 cursor-pointer transition-all ${
                    selectedCategory === category.id ? 'ring-2 ring-[#014421]' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getCategoryStyle(category.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-gray-500">{categoryThreads.length} inlägg</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  {category.latestPost && (
                    <div className="text-xs text-gray-500">
                      <p className="truncate">Senaste: {category.latestPost.title}</p>
                      <p>av {category.latestPost.author}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-[#014421] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Alla ämnen
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421]"
              >
                <option value="latest">Senaste</option>
                <option value="popular">Populära</option>
                <option value="active">Mest aktiva</option>
              </select>
              <Link
                href="/dashboard/community/new"
                className="flex items-center gap-2 bg-[#014421] text-white px-4 py-2 rounded-lg hover:bg-[#112A12] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ny diskussion
              </Link>
            </div>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
            </div>
          ) : sortedThreads.length > 0 ? (
            sortedThreads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/dashboard/community/thread/${thread.id}`}>
                  <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {thread.isPinned && (
                            <Tag className="w-4 h-4 text-[#014421]" />
                          )}
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            getCategoryStyle(thread.category.color)
                          }`}>
                            {thread.category.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(thread.createdAt).toLocaleDateString('sv-SE')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#014421] transition-colors">
                          {thread.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mb-4">{thread.content}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{thread.author.name || thread.author.email.split('@')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{thread.views} visningar</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{thread.replies} svar</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{thread.likes}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 mt-6" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Inga diskussioner hittades</p>
              <Link
                href="/dashboard/community/new"
                className="inline-flex items-center gap-2 mt-4 text-[#014421] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Starta första diskussionen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}