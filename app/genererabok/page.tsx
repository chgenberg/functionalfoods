'use client';

import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, BookOpenIcon, PencilIcon, ClockIcon, SparklesIcon, CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface BookContent {
  type: 'table_of_contents' | 'chapter';
  content: string;
  currentChapter: number;
  totalChapters: number;
  isComplete?: boolean;
}

export default function GenerateBookPage() {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    chapters: 5
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [bookContent, setBookContent] = useState<string[]>([]);
  const [tableOfContents, setTableOfContents] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (formData.chapters) {
      setEstimatedTime(formData.chapters * 1.5); // 1.5 minuter per kapitel
    }
  }, [formData.chapters]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'chapters' ? parseInt(value) : value
    }));
  };

  const generateBook = async () => {
    if (!formData.title || !formData.topic) {
      alert('Vänligen fyll i alla fält');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setBookContent([]);
    setTableOfContents('');
    setIsComplete(false);
    setElapsedTime(0);

    try {
      // Steg 1: Generera innehållsförteckning
      setCurrentStep('Skapar innehållsförteckning...');
      setProgress(5);

      const tocResponse = await fetch('/api/generate-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          topic: formData.topic,
          chapters: formData.chapters,
          currentChapter: 1
        })
      });

      const tocData: BookContent = await tocResponse.json();
      if (tocData.type === 'table_of_contents') {
        setTableOfContents(tocData.content);
      }

      // Steg 2: Generera kapitel
      const chapters: string[] = [];
      for (let i = 1; i <= formData.chapters; i++) {
        setCurrentStep(`Skriver kapitel ${i} av ${formData.chapters}...`);
        setProgress(10 + (i / formData.chapters) * 85);

        const chapterResponse = await fetch('/api/generate-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            topic: formData.topic,
            chapters: formData.chapters,
            currentChapter: i
          })
        });

        const chapterData: BookContent = await chapterResponse.json();
        if (chapterData.type === 'chapter') {
          chapters.push(chapterData.content);
          setBookContent([...chapters]);
        }

        // Liten paus mellan kapitel för att inte överbelasta API:t
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProgress(100);
      setCurrentStep('Boken är klar!');
      setIsComplete(true);

    } catch (error) {
      console.error('Fel vid bokgenerering:', error);
      alert('Ett fel uppstod vid generering av boken. Försök igen.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBook = () => {
    const fullContent = [
      `# ${formData.title}\n\n`,
      `## Innehållsförteckning\n\n${tableOfContents}\n\n`,
      ...bookContent.map((chapter, index) => `## Kapitel ${index + 1}\n\n${chapter}\n\n`)
    ].join('');

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-20" style={{ 
      background: 'linear-gradient(135deg, #fffdf3 0%, #f8f5e8 50%, #fffdf3 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradient 15s ease infinite'
    }}>
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-6 w-6 md:h-8 md:w-8 text-primary mr-2 md:mr-3 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-primary text-center">
              Generera Din Bok
            </h1>
            <SparklesIcon className="h-6 w-6 md:h-8 md:w-8 text-primary ml-2 md:ml-3 animate-pulse" />
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Skapa en personlig bok om hälsa och funktionell kost med Ulrika Davidssons expertis och skrivstil. 
            Fyll i dina önskemål nedan så genererar vi en komplett bok åt dig.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Formulär */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-primary/10 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-3">
                  <PencilIcon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-primary">Bokinformation</h2>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Boktitel
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-gray-300"
                      placeholder="t.ex. 'Naturens Kraft för Optimal Hälsa'"
                      disabled={isGenerating}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <BookOpenIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    Ämne och innehåll
                  </label>
                  <div className="relative">
                    <textarea
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-gray-300 resize-none"
                      placeholder="Beskriv vad boken ska handla om. t.ex. 'En guide till antiinflammatorisk kost, stresshantering och naturliga näringsämnen för bättre energi och välbefinnande'"
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-3 right-3 pointer-events-none">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="chapters" className="block text-sm font-medium text-gray-700 mb-2">
                    Antal kapitel
                  </label>
                  <select
                    id="chapters"
                    name="chapters"
                    value={formData.chapters}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-gray-300 appearance-none bg-white"
                    disabled={isGenerating}
                  >
                    {[3, 4, 5, 6, 7, 8, 10].map(num => (
                      <option key={num} value={num}>{num} kapitel</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Uppskattad tid: ca {estimatedTime} minuter
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={generateBook}
                  disabled={isGenerating || !formData.title || !formData.topic}
                  className="w-full bg-primary text-white px-6 py-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                      Genererar bok...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Generera bok
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Status och förhandsvisning */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-primary/10 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-3">
                  <BookOpenIcon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-primary">Status</h2>
              </div>

              {!isGenerating && !isComplete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center py-12"
                >
                  <div className="relative">
                    <BookOpenIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full" />
                    </motion.div>
                  </div>
                  <p className="text-gray-500 text-lg">
                    Fyll i formuläret och klicka på "Generera bok" för att komma igång.
                  </p>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary">
                      <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                      <span className="font-medium">{currentStep}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTime(elapsedTime)} / ~{estimatedTime} min
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 font-medium">Progress</span>
                      <span className="text-sm text-gray-600 font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <p className="text-sm text-gray-700 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-2 text-primary" />
                      Varje kapitel tar ca 1-2 minuter att generera med AI
                    </p>
                  </div>

                  {bookContent.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-700 mb-2">Färdiga kapitel:</h3>
                      <div className="space-y-2">
                        {bookContent.map((_, index) => (
                          <div key={index} className="flex items-center text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Kapitel {index + 1} ✓
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                      <CheckCircleIcon className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                      Boken är klar!
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      Din bok "{formData.title}" med {formData.chapters} kapitel har genererats framgångsrikt.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadBook}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
                    Ladda ner bok (.txt)
                  </motion.button>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-primary" />
                      Bokstatistik
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{formData.chapters}</div>
                        <div className="text-xs text-gray-600">Kapitel</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{(formData.chapters * 1750).toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Ord</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{Math.round(formData.chapters * 1750 / 250)}</div>
                        <div className="text-xs text-gray-600">Sidor</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Förhandsvisning av innehåll */}
          <AnimatePresence>
            {(tableOfContents || bookContent.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary/10"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary/10 rounded-full mr-3">
                    <DocumentTextIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-primary">Förhandsvisning</h2>
                </div>
                
                {tableOfContents && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                  >
                    <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                      <BookOpenIcon className="h-5 w-5 mr-2 text-primary" />
                      Innehållsförteckning
                    </h3>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                        {tableOfContents}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {bookContent.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                      <PencilIcon className="h-5 w-5 mr-2 text-primary" />
                      Färdiga kapitel ({bookContent.length} av {formData.chapters})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {bookContent.map((chapter, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg p-4 border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                            <span className="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mr-2">
                              {index + 1}
                            </span>
                            Kapitel {index + 1}
                          </h4>
                          <div className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                            {chapter.substring(0, 200)}...
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 