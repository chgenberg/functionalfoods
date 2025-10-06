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

  // Format content for display (convert markdown to proper HTML)
  const formatContent = (content: string) => {
    // Check if content contains HTML tags
    const hasHtmlTags = /<[^>]+>/.test(content);
    
    if (hasHtmlTags) {
      // Content is HTML - strip tags and convert to plain text with basic formatting
      let cleanContent = content
        // Convert HTML headings to markdown style
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n#### $1\n\n')
        // Convert strong/bold to markdown
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        // Convert emphasis to markdown
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        // Convert paragraphs to double newlines
        .replace(/<p[^>]*>/gi, '\n\n')
        .replace(/<\/p>/gi, '')
        // Convert line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        // Convert lists
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '\n')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1')
        // Remove all remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      content = cleanContent;
    }
    
    // Clean up content gently - avoid aggressive text manipulation
    let cleanContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/gm, '') // Remove trailing spaces only
      // Fix broken dashes that appear at start of lines (not real list items)
      .replace(/\n-\s+([a-zåäöé])/g, ' – $1') // Convert line-starting dashes to em-dashes in text
      .trim();

    // Check if content has very few line breaks (likely one big text block)
    const lineBreakCount = (cleanContent.match(/\n/g) || []).length;
    const hasMinimalBreaks = lineBreakCount < 3 && cleanContent.length > 1000;

    if (hasMinimalBreaks) {
      // Auto-split long text blocks at sentence boundaries
      cleanContent = cleanContent
        .replace(/([.!?])\s+([A-ZÅÄÖ])/g, '$1\n\n$2') // Add line breaks after sentences
        .replace(/([a-zåäöé]:\s*)([A-ZÅÄÖ])/g, '$1\n\n$2') // Break after category labels
        .replace(/(Livsmedelsverket noterar att)/g, '\n\n$1') // Break before specific phrases
        .replace(/(Det är dock viktigt att)/g, '\n\n$1')
        .replace(/(En spännande aspekt är)/g, '\n\n$1')
        .replace(/(Forskning tyder på att)/g, '\n\n$1');
    }

    // Split into lines and process them intelligently
    const lines = cleanContent.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const smartParagraphBreak = (text: string) => {
      // Check if text should start a new paragraph
      const indicators = [
        /^[A-ZÅÄÖ][a-zåäöé]+:/,           // Category labels like "Flavonoider:"
        /^Det finns/,                     // Common paragraph starters
        /^Till exempel/,
        /^Dessa/,
        /^Studier/,
        /^Forskning/,
        /^I tillägg/,
        /^Däremot/,
        /^Samtidigt/,
        /^Därför/,
        /^En annan/,
        /^Enligt/,
        /^Livsmedelsverket/,
        /^Nordiska näringsrekommendationerna/,
        /^Att få sig/,
        /^En spännande aspekt/,
        /^Effekten kan/,
        /^Polyfenolerna/,
        /^Summan av kardemumman/,
        /^De flesta polyfenroller/,
        /^Grönta polyfenroller/
      ];
      return indicators.some(pattern => pattern.test(text));
    };

    const cleanParagraphText = (text: string) => {
      // Clean up paragraph text to fix common issues
      return text
        .replace(/([a-zåäöé])\s*-\s*([a-zåäöé])/g, '$1 $2') // Fix broken words with hyphens
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/\s*([.!?])\s*([A-ZÅÄÖ])/g, '$1 $2') // Fix spacing around punctuation
        .trim();
    };

    const splitLongParagraph = (text: string): string[] => {
      // If paragraph is shorter than 600 characters, keep as is
      if (text.length <= 600) {
        return [text];
      }

      // Split into sentences
      const sentences = text.split(/([.!?]+\s+)/);
      const paragraphs: string[] = [];
      let currentChunk = '';

      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        
        // If adding this sentence would make the chunk too long, start a new paragraph
        if (currentChunk.length > 0 && (currentChunk + sentence).length > 500) {
          paragraphs.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }

      // Add the last chunk if it exists
      if (currentChunk.trim()) {
        paragraphs.push(currentChunk.trim());
      }

      return paragraphs.filter(p => p.length > 10);
    };

    const pushCurrentParagraph = () => {
      if (currentParagraph.length > 0) {
        const rawText = currentParagraph.join(' ');
        const paragraphText = cleanParagraphText(rawText);
        if (paragraphText && paragraphText.length > 10) {
          // Split long paragraphs into smaller ones
          const paragraphs = splitLongParagraph(paragraphText);
          
          paragraphs.forEach(para => {
            elements.push(
              <p key={elements.length} className="mb-4 leading-loose text-gray-700 text-lg max-w-none">
                {formatInlineElements(para)}
              </p>
            );
          });
        }
        currentParagraph = [];
      }
    };

    const pushCurrentList = () => {
      if (currentList.length > 0 && listType) {
        const ListTag = listType === 'ul' ? 'ul' : 'ol';
        const listClass = listType === 'ul' ? 'list-disc' : 'list-decimal';
        elements.push(
          <ListTag key={elements.length} className={`${listClass} pl-8 mb-4 space-y-2`}>
            {currentList.map((item, i) => (
              <li key={i} className="leading-loose text-gray-700 text-lg pl-2">
                {formatInlineElements(item)}
              </li>
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        continue;
      }

      // Handle main title (# )
      if (line.startsWith('# ')) {
        pushCurrentParagraph();
        pushCurrentList();
        elements.push(
          <h1 key={elements.length} className="text-3xl md:text-4xl font-bold text-primary mt-8 mb-4 leading-tight">
            {formatInlineElements(line.replace('# ', ''))}
          </h1>
        );
        continue;
      }

      // Handle h2 headers (## )
      if (line.startsWith('## ')) {
        pushCurrentParagraph();
        pushCurrentList();
        elements.push(
          <h2 key={elements.length} className="text-2xl md:text-3xl font-bold text-primary mt-8 mb-4 leading-tight border-b-2 border-orange-100 pb-3">
            {formatInlineElements(line.replace('## ', ''))}
          </h2>
        );
        continue;
      }
      
      // Handle h3 headers (### )
      if (line.startsWith('### ')) {
        pushCurrentParagraph();
        pushCurrentList();
        elements.push(
          <h3 key={elements.length} className="text-xl md:text-2xl font-bold text-primary mt-6 mb-3 leading-tight">
            {formatInlineElements(line.replace('### ', ''))}
          </h3>
        );
        continue;
      }

      // Handle h4 headers (#### )
      if (line.startsWith('#### ')) {
        pushCurrentParagraph();
        pushCurrentList();
        elements.push(
          <h4 key={elements.length} className="text-lg md:text-xl font-semibold text-primary mt-6 mb-3 leading-tight">
            {formatInlineElements(line.replace('#### ', ''))}
          </h4>
        );
        continue;
      }
      
      // Handle unordered list items (- or * ) - but be more selective
      if (line.startsWith('* ') || 
          (line.startsWith('- ') && 
           // Only treat as list if it looks like an actual list item
           (line.match(/^-\s+[A-ZÅÄÖ]/) || // Starts with capital letter
            line.match(/^-\s+\d/) || // Starts with number
            line.match(/^-\s+[a-zåäö]{1,15}\s/) || // Short word followed by space (real list items)
            line.length < 100))) { // Or it's short (likely a list item)
        pushCurrentParagraph();
        if (listType !== 'ul') {
          pushCurrentList();
          listType = 'ul';
        }
        currentList.push(line.replace(/^[-*]\s+/, ''));
        continue;
      }
      
      // Handle ordered list items (1. , 2. , etc.)
      if (/^\d+\.\s/.test(line)) {
        pushCurrentParagraph();
        if (listType !== 'ol') {
          pushCurrentList();
          listType = 'ol';
        }
        currentList.push(line.replace(/^\d+\.\s+/, ''));
        continue;
      }

      // Handle blockquotes (> )
      if (line.startsWith('> ')) {
        pushCurrentParagraph();
        pushCurrentList();
        elements.push(
          <blockquote key={elements.length} className="border-l-4 border-orange-300 pl-6 py-4 mb-4 bg-orange-50 italic text-gray-700 text-lg leading-loose">
            {formatInlineElements(line.replace('> ', ''))}
          </blockquote>
        );
        continue;
      }

      // Regular text - add to current paragraph with smart breaking
      if (line.length > 0) {
        pushCurrentList(); // Close any open list
        
        // Check if this line should start a new paragraph
        if (currentParagraph.length > 0 && smartParagraphBreak(line)) {
          pushCurrentParagraph();
        }
        
        currentParagraph.push(line);
      }
    }

    // Push any remaining content
    pushCurrentParagraph();
    pushCurrentList();

    return elements;
  };

  // Format inline elements like bold, italic, links
  const formatInlineElements = (text: string): (string | JSX.Element)[] => {
    // First, handle category labels and make them bold
    let processedText = text
      .replace(/([A-ZÅÄÖ][a-zåäöé]+):/g, '**$1:**') // Make category labels bold
      .replace(/\s{2,}/g, ' ') // Remove extra spaces
      .replace(/([a-zåäöé])\s*\.\s*([A-ZÅÄÖ])/g, '$1. $2'); // Fix spacing after periods

    // Handle bold text (**text** or __text__)
    let parts = processedText.split(/(\*\*.*?\*\*|__.*?__)/);
    
    return parts.map((part, i) => {
      // Bold text
      if ((part.startsWith('**') && part.endsWith('**')) || 
          (part.startsWith('__') && part.endsWith('__'))) {
        const boldText = part.startsWith('**') ? part.slice(2, -2) : part.slice(2, -2);
        return <strong key={i} className="font-bold text-gray-900">{boldText}</strong>;
      }
      
      // Handle italic text (*text* or _text_)
      if ((part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) ||
          (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__'))) {
        const italicText = part.slice(1, -1);
        return <em key={i} className="italic">{italicText}</em>;
      }
      
      return part;
    });
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
              <div className="text-gray-800 leading-loose space-y-6">
                {formatContent(post.content)}
              </div>
            </div>

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