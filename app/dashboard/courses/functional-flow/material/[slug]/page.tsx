'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Heart, Share2, Printer, CheckCircle } from 'lucide-react';

interface ArticleData {
  title: string;
  content: string;
  readTime: string;
  category: string;
  color: string;
}

// Function to clean and format scraped content
function cleanContent(rawContent: string): string {
  // Remove the header information (URL, scraped date, etc.)
  const lines = rawContent.split('\n');
  const contentStartIndex = lines.findIndex(line => 
    line.includes('--------------------------------------------------------------------------------')
  );
  
  if (contentStartIndex === -1) return rawContent;
  
  // Take content after the separator
  const content = lines.slice(contentStartIndex + 1).join('\n');
  
  // Clean up common scraped artifacts
  return content
    .replace(/^Functional foods.*$/gm, '') // Remove site title
    .replace(/^Prenumerera$/gm, '')
    .replace(/^Logga in$/gm, '')
    .replace(/^Hem$/gm, '')
    .replace(/^Kursutbud$/gm, '')
    .replace(/^Artiklar$/gm, '')
    .replace(/^Recept$/gm, '')
    .replace(/^Kontakt$/gm, '')
    .replace(/^Om oss$/gm, '')
    .replace(/^0$/gm, '')
    .replace(/^Massor av matglädje - gratis!$/gm, '')
    .replace(/^Skriv upp dig på vårt nyhetsbrev.*$/gm, '')
    .replace(/^Jag har tagit del av informationen.*$/gm, '')
    .replace(/^Villkor och cookies$/gm, '')
    .replace(/^Följ oss på sociala medier$/gm, '')
    .replace(/^functionalfoods\.se$/gm, '')
    .replace(/^©2025.*$/gm, '')
    .replace(/^Vi använder cookies.*$/gm, '')
    .replace(/^Acceptera$/gm, '')
    .replace(/^Neka$/gm, '')
    .replace(/^Inställningar$/gm, '')
    .replace(/^Close GDPR Cookie Settings$/gm, '')
    .replace(/^Privacy Overview$/gm, '')
    .replace(/^Strictly Necessary Cookies$/gm, '')
    .replace(/^This website uses cookies.*$/gm, '')
    .replace(/^Strictly Necessary Cookie should be enabled.*$/gm, '')
    .replace(/^Enable or Disable Cookies$/gm, '')
    .replace(/^If you disable this cookie.*$/gm, '')
    .replace(/^Acceptera alla$/gm, '')
    .replace(/^Spara ändringar$/gm, '')
    .replace(/^\s*$/gm, '') // Remove empty lines
    .trim();
}

// Function to format content with proper paragraphs and styling
function formatContent(content: string): JSX.Element[] {
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  
  return paragraphs.map((paragraph, index) => {
    // Handle numbered lists
    if (/^\d+\./.test(paragraph.trim())) {
      return (
        <div key={index} className="mb-4 pl-4 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-r-lg">
          <p className="font-semibold text-blue-900">{paragraph}</p>
        </div>
      );
    }
    
    // Handle headers (all caps or ending with colon)
    if (paragraph === paragraph.toUpperCase() || paragraph.endsWith(':')) {
      return (
        <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-border pb-2">
          {paragraph}
        </h3>
      );
    }
    
    // Regular paragraphs
    return (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    );
  });
}

// Article metadata mapping
const articleMetadata: Record<string, ArticleData> = {
  'functional-foods-topplista': {
    title: 'Functional Foods Topplista',
    content: '',
    readTime: '8 min',
    category: 'Grundläggande',
    color: 'from-purple-500 to-pink-600'
  },
  'vad-ar-functional-foods-2': {
    title: 'Vad är Functional Foods?',
    content: '',
    readTime: '6 min',
    category: 'Grundläggande',
    color: 'from-green-500 to-teal-600'
  },
  'fordelarna-med-functional-foods': {
    title: 'Fördelarna med Functional Foods',
    content: '',
    readTime: '10 min',
    category: 'Hälsofördelar',
    color: 'from-red-500 to-pink-600'
  },
  'functional-foods-3-steg-till-ett-friskare-liv': {
    title: 'Functional Foods - 3 steg till ett friskare liv',
    content: '',
    readTime: '12 min',
    category: 'Praktisk guide',
    color: 'from-teal-500 to-green-600'
  },
  'att-valja-ratt-kolhydrater': {
    title: 'Att välja rätt kolhydrater',
    content: '',
    readTime: '10 min',
    category: 'Näringslära',
    color: 'from-yellow-500 to-orange-600'
  },
  'att-valja-ratt-proteiner': {
    title: 'Att välja rätt proteiner',
    content: '',
    readTime: '10 min',
    category: 'Näringslära',
    color: 'from-blue-500 to-indigo-600'
  },
  'dags-att-komma-igang': {
    title: 'Dags att komma igång',
    content: '',
    readTime: '12 min',
    category: 'Praktisk guide',
    color: 'from-orange-500 to-red-600'
  },
  'motivation-och-reflektion': {
    title: 'Motivation och reflektion',
    content: '',
    readTime: '15 min',
    category: 'Mindset',
    color: 'from-indigo-500 to-purple-600'
  },
  'benbuljong': {
    title: 'Benbuljong - Naturens healing elixir',
    content: '',
    readTime: '8 min',
    category: 'Recept & Tips',
    color: 'from-amber-500 to-orange-600'
  },
  'drycker': {
    title: 'Hälsosamma drycker',
    content: '',
    readTime: '6 min',
    category: 'Recept & Tips',
    color: 'from-cyan-500 to-blue-600'
  },
  'naturens-egna-halsobomber': {
    title: 'Naturens egna hälsobomber',
    content: '',
    readTime: '8 min',
    category: 'Superfoods',
    color: 'from-emerald-500 to-green-600'
  },
  'att-ata-ute-med-functional-foods': {
    title: 'Att äta ute med Functional Foods',
    content: '',
    readTime: '10 min',
    category: 'Praktisk guide',
    color: 'from-rose-500 to-pink-600'
  },
  'functional-foods-som-livsstil': {
    title: 'Functional Foods som livsstil',
    content: '',
    readTime: '6 min',
    category: 'Mindset',
    color: 'from-violet-500 to-purple-600'
  },
  'at-mer-functional-foods-pa-ett-enkelt-satt': {
    title: 'Ät mer Functional Foods på ett enkelt sätt',
    content: '',
    readTime: '8 min',
    category: 'Praktisk guide',
    color: 'from-lime-500 to-green-600'
  },
  'ersattningsguide-for-kolhydrater': {
    title: 'Ersättningsguide för kolhydrater',
    content: '',
    readTime: '6 min',
    category: 'Näringslära',
    color: 'from-amber-500 to-yellow-600'
  },
  'periodisk-fasta-ger-klarhet-och-energi': {
    title: 'Periodisk fasta ger klarhet och energi',
    content: '',
    readTime: '8 min',
    category: 'Hälsofördelar',
    color: 'from-sky-500 to-blue-600'
  },
  'reflektion-vecka-3': {
    title: 'Reflektion vecka 3',
    content: '',
    readTime: '5 min',
    category: 'Reflektion',
    color: 'from-teal-500 to-cyan-600'
  },
  'fragor-och-svars': {
    title: 'Frågor och svar',
    content: '',
    readTime: '15 min',
    category: 'FAQ',
    color: 'from-indigo-500 to-blue-600'
  },
  'maldokument-styrelsemote-1': {
    title: 'Målsättning och planering',
    content: '',
    readTime: '8 min',
    category: 'Planering',
    color: 'from-purple-500 to-indigo-600'
  },
  'maldokument-styrelsemote-2': {
    title: 'Utvärdering och nästa steg',
    content: '',
    readTime: '6 min',
    category: 'Planering',
    color: 'from-pink-500 to-purple-600'
  }
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/scraped_content_basic/${slug}.txt`);
        if (!response.ok) {
          throw new Error('Article not found');
        }
        
        const rawContent = await response.text();
        const cleanedContent = cleanContent(rawContent);
        
        const metadata = articleMetadata[slug];
        if (metadata) {
          setArticle({
            ...metadata,
            content: cleanedContent
          });
        }
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel hittades inte</h1>
          <Link href="/dashboard/courses/functional-flow/material" 
                className="text-blue-600 hover:text-blue-800">
            Tillbaka till kunskapsmaterial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard/courses/functional-flow/material"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Tillbaka till kunskapsmaterial
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FiBookmark className="w-5 h-5" />
              </button>
              
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => window.print()}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${article.color} mb-4`}>
            {article.category}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>{article.readTime} läsning</span>
            </div>
            
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              <span>Kunskapsmaterial</span>
            </div>
            
            <div className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              <span>Hälsa & Välbefinnande</span>
            </div>
          </div>
        </motion.div>

        {/* Article Body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
        >
          <div className="prose prose-lg max-w-none">
            {formatContent(article.content)}
          </div>
        </motion.div>

        {/* Completion Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105">
            <CheckCircle className="w-5 h-5 mr-2" />
            Markera som läst
          </button>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Utforska mer kunskap</h3>
          <p className="text-gray-700 mb-6">
            Fortsätt din resa mot bättre hälsa med fler artiklar och resurser
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/courses/functional-flow/material"
              className="px-6 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Alla artiklar
            </Link>
            
            <Link
              href="/dashboard/courses/functional-flow"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Tillbaka till kursen
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 