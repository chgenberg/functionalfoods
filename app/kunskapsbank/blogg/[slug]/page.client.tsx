"use client";
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { motion } from 'framer-motion';
import { useT } from '@/app/lib/i18n/LanguageProvider';
import { Calendar, Clock, ArrowLeft, User, Tag } from 'lucide-react';

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

function normalizeImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '/images/blog-placeholder.jpg';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

export default function BlogPostPage({ params }: Props) {
  const t = useT();
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

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const renderContentHtml = (content: string) => {
    if (!content) return '';
    const hasHtmlTags = /<[^>]+>/.test(content);
    if (hasHtmlTags) return content;

    // Fallback for plain text/markdown-like content.
    const escaped = escapeHtml(content).replace(/\r\n/g, '\n');
    const withBreaks = escaped.replace(/\n/g, '<br />');
    return `<p>${withBreaks}</p>`;

    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('blog.post.loading','Laddar artikel...')}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('blog.post.notFoundTitle','Artikel hittades inte')}</h1>
          <p className="text-gray-600 mb-6">{error || t('blog.post.notFoundDesc','Artikeln du letar efter existerar inte.')}</p>
          <Link
            href="/kunskapsbank/blogg"
            className="inline-flex items-center text-accent hover:text-accent-hover font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.post.backToBlog','Tillbaka till bloggen')}
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
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('blog.post.backToBlog','Tillbaka till bloggen')}
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
              <Tag className="w-4 h-4" />
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
                <User className="w-4 h-4" />
                <span>{post.author?.name || 'Ulrika Davidsson'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('sv-SE')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
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
                src={normalizeImageUrl(post.coverImage)}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Body */}
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <div
              className="blog-rich-content text-gray-800"
              dangerouslySetInnerHTML={{ __html: renderContentHtml(post.content) }}
            />

            {/* Article Footer */}
            <div className="border-t border-gray-200 mt-12 pt-8">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-text-secondary">{t('blog.post.share','Dela artikeln:')}</span>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                    <Tag className="w-4 h-4" />
                    Functional Foods
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-background-secondary px-2 py-1 rounded">
                    <Tag className="w-4 h-4" />
                    Hälsa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        <style jsx global>{`
          .blog-rich-content {
            font-size: 1.125rem;
            line-height: 1.9;
          }

          .blog-rich-content p {
            margin: 0 0 1.25rem 0;
            color: #374151;
          }

          .blog-rich-content h1,
          .blog-rich-content h2,
          .blog-rich-content h3,
          .blog-rich-content h4 {
            color: #111827;
            font-weight: 700;
            line-height: 1.3;
            margin: 2rem 0 1rem;
          }

          .blog-rich-content h2 {
            font-size: 1.75rem;
          }

          .blog-rich-content h3 {
            font-size: 1.4rem;
          }

          .blog-rich-content a {
            color: #0b6bcb;
            text-decoration: underline;
            text-underline-offset: 2px;
            word-break: break-word;
          }

          .blog-rich-content ul,
          .blog-rich-content ol {
            margin: 0 0 1.25rem 0;
            padding-left: 1.5rem;
          }

          .blog-rich-content li {
            margin-bottom: 0.5rem;
          }

          .blog-rich-content blockquote {
            border-left: 4px solid #d1d5db;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #4b5563;
          }
        `}</style>

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
            {t('blog.post.readMoreArticles','Läs fler artiklar')}
          </Link>
        </motion.div>
      </section>
    </div>
  );
} 
