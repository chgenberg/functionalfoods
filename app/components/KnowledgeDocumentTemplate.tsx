"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, ChevronDown, Heart, Share2, Download, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface KnowledgeDocumentProps {
  title: string;
  subtitle?: string;
  headerImage: string;
  headerImageAlt?: string;
  content: string;
  readTime?: number;
  course: 'basic' | 'flow';
  category?: string;
  relatedImages?: string[];
  keyTakeaways?: string[];
  nextDocument?: { title: string; href: string };
  previousDocument?: { title: string; href: string };
}

export default function KnowledgeDocumentTemplate({
  title,
  subtitle,
  headerImage,
  headerImageAlt,
  content,
  readTime = 5,
  course,
  category,
  relatedImages = [],
  keyTakeaways = [],
  nextDocument,
  previousDocument
}: KnowledgeDocumentProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const courseColors = {
    basic: {
      primary: '#93C560',
      secondary: '#7BA94D',
      light: '#F3EFE3',
      badge: 'bg-gradient-to-r from-[#93C560] to-[#7BA94D]'
    },
    flow: {
      primary: '#FF7E70',
      secondary: '#E85D4D',
      light: '#FFE8E5',
      badge: 'bg-gradient-to-r from-[#FF7E70] to-[#E85D4D]'
    }
  };

  const colors = courseColors[course];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: subtitle || `Läs om ${title} i Functional ${course === 'basic' ? 'Basics' : 'Flow'}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div 
          className={`h-full ${colors.badge}`}
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Hero Section with Parallax Effect */}
      <motion.div 
        className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <Image
            src={headerImage?.startsWith('/api/images/') ? headerImage : `/api/images${headerImage?.startsWith('/') ? '' : '/'}${headerImage}`}
            alt={headerImageAlt || title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
        </motion.div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 md:pb-16">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="max-w-4xl"
            >
              {/* Course Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`${colors.badge} text-white text-xs font-medium px-4 py-2 rounded-full`}>
                  Functional {course === 'basic' ? 'Basics' : 'Flow'}
                </span>
                {category && (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full">
                    {category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-light text-white mb-4 leading-tight">
                {title}
              </h1>
              
              {subtitle && (
                <p className="text-lg md:text-xl text-white/90 font-light mb-6">
                  {subtitle}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-white/80 text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {readTime} min läsning
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Kunskapsdokument
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="sticky top-24 space-y-4"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-medium text-[#014421] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#93C560]" />
                  Åtgärder
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                      isLiked 
                        ? `${colors.badge} text-white` 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Gillad' : 'Gilla'}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Dela
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all" onClick={() => {
                    const url = new URL(window.location.href);
                    url.pathname = url.pathname.replace('/knowledge/', '/knowledge/print/');
                    window.open(url.toString(), '_blank');
                  }}>
                    <Download className="w-5 h-5" />
                    Ladda ner PDF
                  </button>
                </div>
              </div>

              {/* Key Takeaways */}
              {keyTakeaways.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-medium text-[#014421] mb-4">Huvudpunkter</h3>
                  <ul className="space-y-2">
                    {keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#93C560] mt-1">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </aside>

          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-9"
          >
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Related Images Gallery */}
              {relatedImages.length > 0 && (
                <div className="mt-12 pt-12 border-t border-gray-200">
                  <h3 className="text-2xl font-light text-[#014421] mb-6">Relaterade bilder</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
                      >
                        <Image
                          src={image}
                          alt={`Relaterad bild ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {previousDocument && (
                <motion.a
                  href={previousDocument.href}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  whileHover={{ x: -4 }}
                >
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-[#93C560] transition-colors" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Föregående</p>
                      <p className="font-medium text-[#014421] group-hover:text-[#93C560] transition-colors">
                        {previousDocument.title}
                      </p>
                    </div>
                  </div>
                </motion.a>
              )}
              
              {nextDocument && (
                <motion.a
                  href={nextDocument.href}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all md:text-right"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3 md:flex-row-reverse">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#93C560] transition-colors" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nästa</p>
                      <p className="font-medium text-[#014421] group-hover:text-[#93C560] transition-colors">
                        {nextDocument.title}
                      </p>
                    </div>
                  </div>
                </motion.a>
              )}
            </div>
          </motion.article>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <AnimatePresence>
        {scrollProgress > 20 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#93C560] to-[#7BA94D] text-white rounded-full shadow-lg flex items-center justify-center z-40 lg:hidden"
          >
            <ChevronDown className="w-6 h-6 rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
} 