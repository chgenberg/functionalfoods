'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Heart, Send, Search, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

interface Post {
  id: string;
  author: string;
  authorRole?: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Ulrika Davidsson',
      authorRole: 'Grundare',
      content: 'Välkomna till vår nya community! Här kan vi dela erfarenheter, ställa frågor och stötta varandra på vår hälsoresa. Vad ser ni mest fram emot med kursen? 🌱',
      timestamp: new Date(Date.now() - 86400000),
      likes: 24,
      comments: [
        {
          id: '1-1',
          author: 'Anna S.',
          content: 'Så glad att vara här! Ser mest fram emot att lära mig om anti-inflammatorisk kost.',
          timestamp: new Date(Date.now() - 43200000)
        }
      ],
      isLiked: false
    },
    {
      id: '2',
      author: 'Maria L.',
      content: 'Just avslutat vecka 2 och känner redan så mycket mer energi! Någon annan som upplever samma sak? 💪',
      timestamp: new Date(Date.now() - 172800000),
      likes: 18,
      comments: [],
      isLiked: true
    }
  ]);
  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: user?.name || 'Anonym',
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: [],
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm"
          >
            <Users className="w-8 h-8 text-[#014421] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#014421]">234</div>
            <div className="text-sm text-gray-600">Medlemmar</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm"
          >
            <MessageSquare className="w-8 h-8 text-[#93C560] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#014421]">89</div>
            <div className="text-sm text-gray-600">Inlägg denna vecka</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm"
          >
            <TrendingUp className="w-8 h-8 text-[#FFB5A7] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#014421]">92%</div>
            <div className="text-sm text-gray-600">Aktiva denna månad</div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Sök i inlägg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent"
            />
          </div>
        </div>

        {/* New Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Dela dina tankar, frågor eller framsteg..."
              className="w-full p-4 border border-gray-200 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent"
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#014421] text-white px-6 py-2 rounded-lg hover:bg-[#112A12] transition-colors"
              >
                <Send className="w-4 h-4" />
                Publicera
              </button>
            </div>
          </form>
        </motion.div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#014421] rounded-full flex items-center justify-center text-white font-bold">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    {post.authorRole && (
                      <span className="bg-[#93C560] text-white text-xs px-2 py-1 rounded-full">
                        {post.authorRole}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 ${
                        post.isLiked ? 'text-red-500' : 'text-gray-500'
                      } hover:text-red-500 transition-colors`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#014421] transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm">{post.comments.length} kommentarer</span>
                    </button>
                  </div>
                  {post.comments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString('sv-SE')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}