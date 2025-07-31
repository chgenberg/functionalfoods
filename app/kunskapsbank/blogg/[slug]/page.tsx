"use client";
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiClock, FiArrowLeft, FiUser, FiTag } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string;
  slug: string;
  author?: {
    name?: string;
    email: string;
  };
}

interface Props {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: Props) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/slug/${params.slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch blog post');
      }
      
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Kunde inte ladda artikeln');
    } finally {
      setLoading(false);
    }
  };

  // Calculate read time based on content length
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min`;
  };

  // Format content for display (convert markdown to proper HTML)
  const formatContent = (content: string) => {
    // Split content into sections
    const sections = content.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const trimmed = section.trim();
      
      // Handle h2 headers (## )
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-primary mt-8 mb-4">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      
      // Handle h3 headers (### )
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-primary mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      
      // Handle bullet points (- or * )
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems = trimmed.split('\n').filter(item => item.trim().startsWith('- ') || item.trim().startsWith('* '));
        return (
          <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item.replace(/^[-*]\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Handle numbered lists (1. )
      if (/^\d+\.\s/.test(trimmed)) {
        const listItems = trimmed.split('\n').filter(item => /^\d+\.\s/.test(item.trim()));
        return (
          <ol key={index} className="list-decimal pl-6 mb-4 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item.replace(/^\d+\.\s+/, '')}
              </li>
            ))}
          </ol>
        );
      }
      
      // Handle bold text (**text**)
      const formatBoldText = (text: string) => {
        return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };
      
      // Regular paragraph
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-700">
          {formatBoldText(trimmed)}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel hittades inte</h1>
          <p className="text-gray-600 mb-6">{error || 'Artikeln du letar efter existerar inte.'}</p>
          <Link
            href="/kunskapsbank/blogg"
            className="inline-flex items-center text-accent hover:text-accent-hover font-medium"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till bloggen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-background-secondary py-12">
        <div className="container-custom">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              href="/kunskapsbank/blogg" 
              className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors group"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Tillbaka till bloggen
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiTag className="w-4 h-4" />
              Functional Foods
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-text-secondary mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-text-secondary">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                <span>{post.author?.name || 'Ulrika Davidsson'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('sv-SE')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>{calculateReadTime(post.content)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="container-custom py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Featured Image */}
          {post.coverImage && (
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Body */}
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-text-primary leading-relaxed">
                {formatContent(post.content)}
              </div>
            </div>

            {/* Article Footer */}
            <div className="border-t border-gray-200 mt-12 pt-8">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-text-secondary">Dela artikeln:</span>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                    <FiTag className="w-4 h-4" />
                    Functional Foods
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                    <FiTag className="w-4 h-4" />
                    Hälsa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Navigation to other articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link
            href="/kunskapsbank/blogg"
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-full hover:bg-accent-hover transition-colors font-medium"
          >
            Läs fler artiklar
          </Link>
        </motion.div>
      </section>
    </div>
  );
} 