'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FiMessageSquare, FiThumbsUp, FiEye, FiSearch, FiEdit, FiFilter,
  FiPlus, FiClock, FiUser, FiTag, FiTrendingUp, FiStar, FiChevronRight
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
      className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {thread.author.name?.charAt(0) || thread.author.email.charAt(0)}
        </div>
        
        <div className="flex-grow min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
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
          
          <Link href={`/dashboard/courses/functional-flow/community/thread/${thread.id}`}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors group-hover:text-green-600 mb-2 break-words">
              {thread.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words">
            {thread.content.substring(0, 150)}...
          </p>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-0">
            <div className="flex items-center gap-1">
              <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate max-w-[120px] sm:max-w-none">{thread.author.name || thread.author.email.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 text-xs sm:text-sm text-gray-600 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-4 sm:gap-2 sm:flex-col sm:text-right">
            <div className="flex items-center gap-1 sm:gap-2" title="Svar">
              <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"/>
              <span className="font-medium">{thread._count.replies}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2" title="Gillningar">
              <FiThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"/>
              <span className="font-medium">{thread._count.likes}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2" title="Visningar">
              <FiEye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"/>
              <span className="font-medium">{thread.views}</span>
            </div>
          </div>
          
          {lastReply && (
            <div className="text-right hidden sm:block">
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

export default function FunctionalBasicsCommunityPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadData, setNewThreadData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadData.title || !newThreadData.content || !newThreadData.categoryId) {
      alert('Vänligen fyll i alla fält');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newThreadData)
      });

      if (response.ok) {
        setShowNewThreadModal(false);
        setNewThreadData({ title: '', content: '', categoryId: '' });
        fetchThreads(); // Refresh threads list
        alert('Diskussion skapad!');
      } else {
        alert('Kunde inte skapa diskussion');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Ett fel uppstod');
    } finally {
      setSubmitting(false);
    }
  };

  const totalThreads = categories.reduce((sum, cat) => sum + cat._count.threads, 0);

  return (
    <div className="space-y-8">
      {/* Header with brand colors */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-4 sm:p-6 lg:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Functional Basics Community</h1>
            <p className="text-white/90 text-base sm:text-lg break-words">
              Diskutera kursen och dela erfarenheter med andra deltagare
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">{totalThreads} diskussioner</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">{threads.length} aktiva</span>
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewThreadModal(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-accent text-white rounded-xl hover:bg-primary-light transition-all duration-200 shadow-lg font-semibold text-sm sm:text-base whitespace-nowrap flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Starta diskussion</span>
            <span className="sm:hidden">Ny diskussion</span>
          </motion.button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Categories with improved design */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-secondary rounded-2xl shadow-sm border border-border p-6"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FiTag className="w-5 h-5 text-accent" />
          Kategorier
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* All categories button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory('all')}
            className={`relative p-4 rounded-xl transition-all duration-200 text-left group ${
              selectedCategory === 'all'
                ? 'bg-accent text-white shadow-lg'
                : 'bg-background hover:bg-background/70 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Alla kategorier</span>
              <span className={`text-2xl font-bold ${
                selectedCategory === 'all' ? 'text-white' : 'text-accent'
              }`}>{totalThreads}</span>
            </div>
            <div className={`text-sm mt-1 ${
              selectedCategory === 'all' ? 'text-white/80' : 'text-text-secondary'
            }`}>
              diskussioner totalt
            </div>
          </motion.button>
          
          {/* Category buttons */}
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`relative p-4 rounded-xl transition-all duration-200 text-left group ${
                selectedCategory === category.id
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-background hover:bg-background/70 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <span className={`text-2xl font-bold ${
                  selectedCategory === category.id ? 'text-white' : 'text-accent'
                }`}>{category._count.threads}</span>
              </div>
              <div className={`text-sm mt-1 ${
                selectedCategory === category.id ? 'text-white/80' : 'text-text-secondary'
              }`}>
                {category._count.threads === 1 ? 'diskussion' : 'diskussioner'}
              </div>
              {/* Category color indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl ${getCategoryStyle(category.color).split(' ')[0]}`}></div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Search and Filter with better styling */}
      <div className="flex flex-col md:flex-row gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative flex-grow"
        >
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Sök diskussioner..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none shadow-sm cursor-pointer"
          >
            <option value="latest">Senaste</option>
            <option value="popular">Mest populära</option>
            <option value="replies">Mest svar</option>
          </select>
        </motion.div>
      </div>
      
      {/* Threads */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : threads.length > 0 ? (
          <AnimatePresence>
            {threads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ThreadItem thread={thread} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga diskussioner hittades</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Prova att ändra din sökning' : 'Var den första att starta en diskussion och dela dina tankar med gruppen!'}
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewThreadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <FiPlus className="w-5 h-5" />
              Starta första diskussionen
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Community Stats with better design */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-secondary rounded-2xl p-8 border border-border"
      >
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-background rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-primary mb-1">{totalThreads}</div>
            <div className="text-text-secondary">Diskussioner</div>
          </div>
          <div className="bg-background rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-accent mb-1">
              {threads.reduce((sum, t) => sum + t._count.replies, 0)}
            </div>
            <div className="text-text-secondary">Svar</div>
          </div>
          <div className="bg-background rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-secondary mb-1">{categories.length}</div>
            <div className="text-text-secondary">Kategorier</div>
          </div>
        </div>
      </motion.div>

      {/* New Thread Modal */}
      <AnimatePresence>
        {showNewThreadModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowNewThreadModal(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative bg-primary p-6 text-white">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Starta ny diskussion</h2>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNewThreadModal(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                    <p className="text-white/90 mt-2">Dela dina tankar och frågor med gruppen</p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                  <form onSubmit={handleCreateThread} className="space-y-6">
                    {/* Category Selection */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Välj kategori *
                      </label>
                      <div className="relative">
                        <select
                          value={newThreadData.categoryId}
                          onChange={(e) => setNewThreadData(prev => ({ ...prev, categoryId: e.target.value }))}
                          className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none bg-gray-50 cursor-pointer"
                          required
                        >
                          <option value="">Välj en kategori för din diskussion</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rubrik *
                      </label>
                      <input
                        type="text"
                        value={newThreadData.title}
                        onChange={(e) => setNewThreadData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                        placeholder="En kort och beskrivande rubrik..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Max 100 tecken</p>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Meddelande *
                      </label>
                      <textarea
                        value={newThreadData.content}
                        onChange={(e) => setNewThreadData(prev => ({ ...prev, content: e.target.value }))}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200 bg-gray-50"
                        placeholder="Beskriv din fråga eller diskussion i detalj..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Minst 20 tecken</p>
                    </motion.div>

                    {/* Tips Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-4"
                    >
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <FiStar className="w-4 h-4" />
                        Tips för en bra diskussion
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Var tydlig och specifik i din fråga</li>
                        <li>• Använd en beskrivande rubrik</li>
                        <li>• Respektera andras åsikter</li>
                      </ul>
                    </motion.div>

                    {/* Submit buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNewThreadModal(false)}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                      >
                        Avbryt
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={submitting || !newThreadData.title || !newThreadData.content || !newThreadData.categoryId}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                      >
                        {submitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Publicerar...
                          </>
                        ) : (
                          <>
                            <FiPlus className="w-5 h-5" />
                            Publicera diskussion
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 