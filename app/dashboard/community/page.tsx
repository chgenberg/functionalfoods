'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FiMessageSquare, FiThumbsUp, FiEye, FiSearch, FiEdit, FiFilter,
  FiPlus, FiClock, FiUser, FiTag, FiTrendingUp, FiStar
} from 'react-icons/fi';

interface ForumCategory {
  id: string;
  name: string;
  color: string;
  _count: { threads: number };
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  views: number;
  createdAt: string;
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
  replies: Array<{
    id: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
    };
  }>;
}

const getCategoryStyle = (color: string) => {
  const styles = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  return styles[color as keyof typeof styles] || styles.gray;
};

const ThreadItem = ({ thread }: { thread: ForumThread }) => {
  const lastReply = thread.replies[0];
  const timeAgo = new Date(thread.createdAt).toLocaleDateString('sv-SE');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
          {thread.author.name?.charAt(0) || thread.author.email.charAt(0)}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryStyle(thread.category.color)}`}>
              {thread.category.name}
            </span>
            {thread._count.likes > 5 && (
              <span className="flex items-center gap-1 text-xs text-yellow-600">
                <FiStar className="w-3 h-3" />
                Populär
              </span>
            )}
          </div>
          
          <Link href={`/dashboard/community/thread/${thread.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors group-hover:text-orange-600 mb-2">
              {thread.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {thread.content.substring(0, 150)}...
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FiUser className="w-4 h-4" />
              <span>{thread.author.name || thread.author.email.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2" title="Svar">
            <FiMessageSquare className="w-4 h-4 text-gray-400"/>
            <span className="font-medium">{thread._count.replies}</span>
          </div>
          <div className="flex items-center gap-2" title="Gillningar">
            <FiThumbsUp className="w-4 h-4 text-gray-400"/>
            <span className="font-medium">{thread._count.likes}</span>
          </div>
          <div className="flex items-center gap-2" title="Visningar">
            <FiEye className="w-4 h-4 text-gray-400"/>
            <span className="font-medium">{thread.views}</span>
          </div>
          
          {lastReply && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Senaste svar</p>
              <p className="font-medium text-xs">
                {new Date(lastReply.createdAt).toLocaleDateString('sv-SE')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunityPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchThreads();
  }, [selectedCategory, searchTerm, sortBy]);

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
      if (sortBy) params.append('sort', sortBy);

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

  const totalThreads = categories.reduce((sum, cat) => sum + cat._count.threads, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">
            Dela erfarenheter och lär av andra medlemmar • {totalThreads} diskussioner
          </p>
        </div>
        <button 
          onClick={() => setShowNewThreadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          <FiPlus className="w-4 h-4" />
          <span>Starta diskussion</span>
        </button>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategorier</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alla kategorier ({totalThreads})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-600 text-white'
                  : `${getCategoryStyle(category.color)} hover:opacity-80`
              }`}
            >
              {category.name} ({category._count.threads})
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Sök diskussioner..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
          />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
          >
            <option value="latest">Senaste</option>
            <option value="popular">Mest populära</option>
            <option value="replies">Mest svar</option>
          </select>
        </div>
      </div>
      
      {/* Threads */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : threads.length > 0 ? (
          <AnimatePresence>
            {threads.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga diskussioner hittades</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Prova att ändra din sökning' : 'Var den första att starta en diskussion!'}
            </p>
            <button 
              onClick={() => setShowNewThreadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Starta diskussion
            </button>
          </div>
        )}
      </div>

      {/* Community Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-1">{totalThreads}</div>
            <div className="text-purple-100">Diskussioner</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">
              {threads.reduce((sum, t) => sum + t._count.replies, 0)}
            </div>
            <div className="text-purple-100">Svar</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">{categories.length}</div>
            <div className="text-purple-100">Kategorier</div>
          </div>
        </div>
      </div>
    </div>
  );
} 