'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  category?: string;
}

export default function BlogCarousel() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog?published=true&limit=8');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const scrollTo = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = 320;
    const newScrollLeft = direction === 'left' 
      ? containerRef.current.scrollLeft - scrollAmount
      : containerRef.current.scrollLeft + scrollAmount;
    
    containerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4 bg-[#F9F7F2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[280px] h-72 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 px-4 bg-[#F9F7F2]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#014421]/10 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-[#014421]" />
            <span className="text-sm font-medium text-[#014421]">Kunskapsbank</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
            Senaste artiklarna
          </h2>
          <p className="text-gray-600">
            Utforska våra artiklar om functional foods och hälsa
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={() => scrollTo('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Föregående"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => scrollTo('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
            aria-label="Nästa"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Cards container */}
          <div
            ref={containerRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[280px] md:min-w-[300px] snap-start"
              >
                <Link href={`/kunskapsbank/blogg/${post.slug}`} className="block group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full">
                    {/* Image */}
                    <div className="relative h-40 md:h-44 overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="300px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#014421] to-[#026b38] flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#014421] text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#014421] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#014421] group-hover:gap-2 transition-all">
                        Läs mer
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            href="/kunskapsbank/blogg"
            className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-full font-medium hover:bg-[#013318] transition-colors shadow-lg hover:shadow-xl"
          >
            Se alla artiklar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
