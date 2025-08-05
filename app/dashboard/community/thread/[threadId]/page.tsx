'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiArrowLeft, FiThumbsUp, FiEye, FiClock, FiUser, FiMessageSquare,
  FiSend, FiEdit, FiTrash2, FiFlag, FiHeart, FiShare2
} from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
}

interface ForumCategory {
  id: string;
  name: string;
  color: string;
}

interface ForumReply {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  _count: {
    likes: number;
  };
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  views: number;
  createdAt: string;
  author: User;
  category: ForumCategory;
  replies: ForumReply[];
  _count: {
    likes: number;
  };
}

const getCategoryStyle = (color: string) => {
  const styles: Record<string, string> = {
    'red': 'bg-red-100 text-red-800',
    'blue': 'bg-blue-100 text-blue-800',
    'green': 'bg-background-secondary text-secondary',
    'yellow': 'bg-yellow-100 text-yellow-800',
    'purple': 'bg-purple-100 text-purple-800',
    'pink': 'bg-pink-100 text-pink-800',
    'indigo': 'bg-indigo-100 text-indigo-800',
    'gray': 'bg-gray-100 text-gray-800',
  };
  return styles[color] || styles.gray;
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Mindre än en timme sedan';
  if (diffInHours < 24) return `${diffInHours} timmar sedan`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} dagar sedan`;
  return date.toLocaleDateString('sv-SE');
};

const UserAvatar = ({ user }: { user: User }) => {
  const initial = user.name?.charAt(0) || user.email.charAt(0);
  const colors = [
    'from-purple-500 to-pink-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-teal-600',
    'from-yellow-500 to-orange-600',
    'from-red-500 to-pink-600',
    'from-indigo-500 to-purple-600'
  ];
  const colorIndex = user.id.charCodeAt(0) % colors.length;
  
  return (
    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base`}>
      {initial.toUpperCase()}
    </div>
  );
};

// Funktion för att konvertera markdown till HTML
const formatToHtml = (text: string): string => {
  // Normalisera radbrytningar
  let formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Konvertera **text** till <strong>text</strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Konvertera *text* till <em>text</em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Konvertera radbrytningar till <br>
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  return formattedText;
};

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.threadId as string;
  
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/forum/threads/${threadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Diskussionen kunde inte hittas');
        } else {
          setError('Ett fel uppstod när diskussionen skulle hämtas');
        }
        return;
      }
      
      const data = await response.json();
      setThread(data);
    } catch (error) {
      console.error('Error fetching thread:', error);
      setError('Ett fel uppstod när diskussionen skulle hämtas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newReply })
      });

      if (response.ok) {
        setNewReply('');
        fetchThread(); // Refresh to show new reply
      } else {
        alert('Kunde inte skicka svar');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Ett fel uppstod');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Loading skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Tillbaka</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {error || 'Diskussionen kunde inte hittas'}
            </h1>
            <p className="text-gray-600 mb-6">
              Den här diskussionen finns inte längre eller så har ett fel uppstått.
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Gå tillbaka
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-4 md:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Tillbaka till forum</span>
          </button>
        </div>

        {/* Thread Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6"
        >
          {/* Thread Header */}
          <div className="p-4 md:p-6 lg:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <UserAvatar user={thread.author} />
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyle(thread.category.color)}`}>
                    {thread.category.name}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(thread.createdAt)}</span>
                </div>
                
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {thread.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <FiUser className="w-4 h-4" />
                    <span>{thread.author.name || thread.author.email.split('@')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    <span>{thread.views} visningar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiThumbsUp className="w-4 h-4" />
                    <span>{thread._count.likes} gillningar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thread Content */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base" dangerouslySetInnerHTML={{ __html: formatToHtml(thread.content) }} />
            </div>
          </div>
        </motion.div>

        {/* Replies Section */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Svar ({thread.replies.length})
            </h2>
          </div>

          {/* Replies */}
          <AnimatePresence>
            {thread.replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
              >
                <div className="flex gap-3 md:gap-4">
                  <UserAvatar user={reply.author} />
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm md:text-base">
                          {reply.author.name || reply.author.email.split('@')[0]}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                          <FiThumbsUp className="w-4 h-4" />
                          <span>{reply._count.likes}</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base" dangerouslySetInnerHTML={{ __html: formatToHtml(reply.content) }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thread.replies.length === 0 && (
            <div className="text-center py-8 md:py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <FiMessageSquare className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga svar än</h3>
              <p className="text-gray-600">Var den första att svara på denna diskussion!</p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skriv ett svar</h3>
          
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <div>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Dela dina tankar..."
                className="w-full h-24 md:h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm md:text-base"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReply || !newReply.trim()}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium"
              >
                {submittingReply ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Skickar...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Skicka svar
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 