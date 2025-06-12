'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiLoader, FiZap, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

// Definiera typen för ett blogginlägg baserat på Prisma-schemat
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  status: string;
  scheduledAt: string; // Kommer som ISO-sträng
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export default function NewBlogPostPage() {
  const [generatorTopic, setGeneratorTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedPost, setGeneratedPost] = useState<BlogPost | null>(null);
  
  const handleGenerate = async () => {
    if (!generatorTopic) {
      setError('Du måste ange ett ämne.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setGeneratedPost(null);

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: generatorTopic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel med genereringen.');
      }
      
      setGeneratedPost(data);
      setGeneratorTopic('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleReset = () => {
    setGeneratedPost(null);
    setGeneratorTopic('');
    setError('');
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/blog" className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-medium uppercase text-sm tracking-wider">
            <FiChevronLeft className="w-5 h-5" />
            <span>Tillbaka till blogginlägg</span>
          </Link>
        </div>

        {/* Generator Section */}
        {!generatedPost && (
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FiZap className="w-6 h-6 text-primary"/>
                  </div>
                  <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">ARTIKELGENERATOR</h2>
              </div>
              <p className="text-text-secondary mb-6">Ange ett ämne så skapar AI:n en komplett, SEO-optimerad artikel med bild, och schemalägger den för publicering under den kommande veckan.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                      type="text" 
                      value={generatorTopic}
                      onChange={e => setGeneratorTopic(e.target.value)}
                      placeholder="T.ex. 'Fördelarna med fermenterad mat'"
                      className="flex-grow px-4 py-3 bg-background border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      disabled={isGenerating}
                  />
                  <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !generatorTopic} 
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed uppercase text-sm tracking-wider group"
                  >
                      {isGenerating ? (
                        <>
                          <FiLoader className="animate-spin w-5 h-5"/> 
                          <span>Bearbetar...</span>
                        </>
                      ) : (
                        <>
                          <FiZap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>Generera & Schemalägg</span>
                        </>
                      )}
                  </button>
              </div>
              {error && 
                <div className="mt-6 flex items-center gap-3 text-error bg-error/10 p-4 rounded-xl">
                  <FiAlertTriangle className="w-5 h-5 flex-shrink-0"/>
                  <p className="font-medium">{error}</p>
                </div>
              }
          </div>
        )}

        {/* Result Section */}
        {generatedPost && (
           <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-primary/10 p-8 text-center animate-fade-in">
              <div className="p-4 bg-success/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FiCheckCircle className="w-10 h-10 text-success"/>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-3 uppercase tracking-wider">ARTIKEL SKAPAD!</h2>
              <p className="text-text-secondary mb-8">Följande artikel har genererats och schemalagts för publicering.</p>

              <div className="border border-primary/10 rounded-xl p-6 text-left bg-background/50">
                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-6">
                    <Image src={generatedPost.imageUrl} alt={generatedPost.imageAlt} layout="fill" objectFit="cover" />
                </div>
                <h3 className="font-bold text-xl text-primary mb-2">{generatedPost.title}</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <p className="text-text-secondary">
                    Status: <span className="font-bold text-warning uppercase tracking-wider">{generatedPost.status}</span>
                  </p>
                  <p className="text-text-secondary">
                    Publiceras: <span className="font-bold text-primary">{format(new Date(generatedPost.scheduledAt), "eeee d MMMM, 'ca.' HH:mm", { locale: sv })}</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                 <button 
                    onClick={handleReset} 
                    className="flex items-center justify-center gap-2 bg-background hover:bg-primary/10 text-primary font-semibold px-6 py-3 rounded-xl transition-all duration-200 uppercase text-sm tracking-wider"
                 >
                    Skapa en ny artikel
                </button>
                <Link 
                  href="/admin/blog" 
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 uppercase text-sm tracking-wider"
                >
                    Se alla blogginlägg
                </Link>
              </div>
          </div>
        )}
      </div>
       <style jsx global>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 